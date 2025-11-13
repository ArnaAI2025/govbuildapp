import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getAccessToken, getBaseUrl } from '../session/SessionManager';
import { constructWebViewUrl } from '../utils/params/webViewParams';
import { URL } from '../constants/url';
import { GET_DATA } from './ApiClient';
import { WebViewContent } from '../utils/interfaces/IComponent';
import { NavigationProp, StackActions } from '@react-navigation/native';
import { ToastService } from '../components/common/GlobalSnackbar';
import { COLORS } from '../theme/colors';
import { recordCrashlyticsError } from './CrashlyticsService';

export const loadWebViewContent = async (path: string): Promise<WebViewContent | null> => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return null;
    }

    const baseUrl = getBaseUrl();
    const accessToken = getAccessToken();
    if (!baseUrl) {
      throw new Error('Missing base URL ');
    }

    const url = constructWebViewUrl({ baseUrl, path });
    return { url, accessToken };
  } catch (error) {
    recordCrashlyticsError('Error loading WebView content:', error);
    console.error('Error loading WebView content:', error);
    return null;
  }
};

export const checkConnectionQuality = async (): Promise<boolean> => {
  const testUrl = getBaseUrl() || 'https://www.google.com/favicon.ico'; // Fallback to Google if baseUrl is unavailable
  const maxAttempts = 3;
  const timeout = 3000; // Increase timeout to 3 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const startTime = Date.now();
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Connection test failed');
      const duration = Date.now() - startTime;
      return duration <= timeout;
    } catch (error) {
      console.warn(`Connection quality check attempt ${attempts + 1} failed:`, error);
      attempts++;
      if (attempts === maxAttempts) {
        return false;
      }
    }
  }
  return false;
};

export const fetchCaseOrLicenseById = async (
  contentId: string,
  type: 'Case' | 'License',
  navigation: NavigationProp<any>,
  isNotSkipScreen?: boolean,
): Promise<void> => {
  try {
    const [url, token] = await Promise.all([getBaseUrl(), getAccessToken()]);
    if (!url || !token) {
      throw new Error('Missing base URL or access token');
    }
    ToastService.show('Form successfully submitted', COLORS.SUCCESS_GREEN);

    // If using license then this cindition is help
    const urlEndPoint = type === 'Case' ? URL.GET_CASE_BY_ID : URL.GET_LICENSE_BY_CONTENT;

    //const urlEndPoint = URL.GET_CASE_BY_ID;
    const apiUrl = `${url}${urlEndPoint}${contentId}`;
    const response = await GET_DATA({ url: apiUrl });

    if (response?.status && response.data) {
      if (type === 'Case') {
        if (!isNotSkipScreen) {
          navigation.dispatch(StackActions.pop(1));
          navigation.dispatch(
            StackActions.replace('EditCaseScreen', {
              caseId: response?.data?.data?.contentItemId ?? '',
              myCaseData: response?.data?.data,
              refreshAttechedItems: true,
            }),
          );
        } else {
          navigation.navigate('EditCaseScreen', {
            caseId: response?.data?.data?.contentItemId ?? '',
            myCaseData: response?.data?.data,
            refreshAttechedItems: true,
          });
        }
      } else {
        if (!isNotSkipScreen) {
          navigation.dispatch(StackActions.pop(1));
          navigation.dispatch(
            StackActions.replace('EditLicenseScreen', {
              contentItemId: response?.data?.data?.contentItemId ?? '',
              licenseData: response?.data?.data,
              refreshAttechedItems: true,
            }),
          );
        } else {
          navigation.navigate('EditLicenseScreen', {
            contentItemId: response?.data?.data?.contentItemId ?? '',
            licenseData: response?.data?.data,
            refreshAttechedItems: true,
          });
        }
      }
    } else {
      throw new Error('Failed to fetch data from API');
    }
  } catch (error) {
    recordCrashlyticsError(`Error fetching ${type} data:`, error);
    console.error(`Error fetching ${type} data:`, error);
  }
};

export const setupNetworkListener = (
  onConnectionChange: (isConnected: boolean, isGoodQuality: boolean) => void,
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    if (isConnected) {
      checkConnectionQuality().then((isGoodQuality) => {
        onConnectionChange(isConnected, isGoodQuality);
      });
    } else {
      onConnectionChange(isConnected, false);
    }
  });
  return unsubscribe;
};
