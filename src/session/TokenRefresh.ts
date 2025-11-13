import { getAuthToken } from '@mcci/govbuilt-client';
import { useBiometricStore } from '../store/biometricStore';
import useAuthStore from '../store/useAuthStore';
import { saveAccessToken } from './SessionManager';
import { AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { recordCrashlyticsError } from '../services/CrashlyticsService';

let refreshPromise: Promise<boolean> | null = null;

export const isTokenTimeOut = async (): Promise<boolean> => {
  const authData = useAuthStore.getState().authData;

  if (!authData?.expireTime || !authData?.access_token) {
    console.log('Missing token or expiry');
    return true;
  }

  const currentTime = Date.now();
  let remainingTime = authData.expireTime - currentTime;

  if (remainingTime > 0) {
    const secondsLeft = Math.floor(remainingTime / 1000);
    const minutesLeft = Math.floor(secondsLeft / 60);
    const remainingSeconds = secondsLeft % 60;
    console.log(
      `\x1b[32mToken will expire in: ${minutesLeft} minutes and ${remainingSeconds} seconds\x1b[0m`,
    );
    return false;
  }
  try {
    if (refreshPromise) {
      const result = await refreshPromise;
      console.log('Awaited existing refreshPromise result:', result);
      return !result;
    }

    refreshPromise = TokenRefreshGlobal();
    const result = await refreshPromise;
    console.log('New refreshPromise result:', result);

    refreshPromise = null;

    const newAuthData = useAuthStore.getState().authData;
    if (!newAuthData?.expireTime || newAuthData.expireTime <= Date.now()) {
      return true;
    }

    return !result;
  } catch (error) {
    recordCrashlyticsError('Token refresh failed:', error);
    console.error('Token refresh failed:', error);
    refreshPromise = null;
    return true;
  }
};

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000; // Initial delay, will use exponential backoff

// Singleton lock for token refresh
let isRefreshing = false;
export const TokenRefreshGlobal = async (retryCount: number = 0): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    if (isRefreshing) {
      return refreshPromise || false; // Wait for ongoing refresh
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const authData = useAuthStore.getState().authData;
        const value = authData?.value;
        const username = authData?.username;
        const password = authData?.password;

        if (!value?.uRL?.url || !username || !password) {
          console.error('Missing auth config for token refresh:---->', {
            authData,
          });
          useAuthStore.getState().logout();
          return false;
        }

        const payload = {
          baseUrl: value.uRL.url,
          body: {
            client_id: value.clientID,
            client_secret: value.clientSecret,
            username,
            password,
            grant_type: 'password',
            scope: 'offline_access',
          },
        };

        const response = await getAuthToken(payload.baseUrl, payload.body);

        if (response?.statusCode === 200 && response.data?.access_token) {
          const data = response.data;
          const expiresIn = data.expires_in ?? 60; // Fallback to 60 seconds
          if (expiresIn === 60) {
            console.warn('expires_in missing, using default of 60 seconds');
          }
          const newExpireTime = Date.now() + expiresIn * 1000;

          useAuthStore.getState().setAuthData({
            ...authData,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            token_type: data.token_type,
            expireTime: newExpireTime,
          });
          saveAccessToken(data.access_token);
          console.debug('Token refreshed successfully:', {
            access_token: data.access_token,
          });
          return true;
        }

        // Handle retryable errors
        const errorMsg =
          response?.rawResponseBody?.error_description ||
          response?.rawResponseBody?.message ||
          'Token refresh failed';
        console.error('Token refresh failed:', {
          statusCode: response?.statusCode,
          errorMsg,
        });

        if (
          retryCount < MAX_RETRIES &&
          (!response || [429, 503].includes(response?.statusCode) || !response?.rawResponseBody)
        ) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
          console.debug(
            `Retrying token refresh (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return TokenRefreshGlobal(retryCount + 1);
        }
        console.log('TOKEN REFRESH ERROR MESSAGE----->>>', errorMsg);
        useAuthStore.getState().logout();
        return false;
      } catch (error) {
        recordCrashlyticsError('Token refresh error:', error);
        console.error('Token refresh error:', error);
        const axiosError = error as AxiosError;

        // Handle retryable errors
        if (
          retryCount < MAX_RETRIES &&
          (!axiosError.response || [429, 503].includes(axiosError.response?.status))
        ) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
          console.debug(
            `Retrying token refresh (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return TokenRefreshGlobal(retryCount + 1);
        }

        const errorMsg =
          axiosError.response?.data?.error_description ||
          axiosError.response?.data?.message ||
          'An error occurred during token refresh';
        console.log('ERROR MESSAGE----->>>', errorMsg);

        useAuthStore.getState().logout();
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  } else {
    console.log('App active but offline, skipping token refresh.');
    return false; // ensures return type always matches Promise<boolean>
  }
};

export const checkSessionTimeOut = async (): Promise<boolean> => {
  const isBiometricEnabled = useBiometricStore.getState().isBiometricEnabled;
  const authData = useAuthStore.getState().authData;
  if (isBiometricEnabled && authData?.expireTime) {
    const differenceInMilliseconds = authData.expireTime - Date.now();
    const differenceInSeconds = differenceInMilliseconds / 1000;
    if (differenceInSeconds < 15) {
      useAuthStore.getState().setSessionTimeout(true);
      return true;
    }
  }
  useAuthStore.getState().setSessionTimeout(false);
  return false;
};
