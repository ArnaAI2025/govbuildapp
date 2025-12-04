import { AUTH_CONFIG, TENANT_BASE_URL, URL } from '../../constants/url';
import {
  GET_DATA_WITH_TOKEN,
  GET_DATA_WITHOUT_TOKEN,
  PostDataWithHeader,
} from '../../services/ApiClient';
import { getAuthToken, GovbuiltClientCaseService } from '@mcci/govbuilt-client';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { TEXTS } from '../../constants/strings';
import type {
  AuthPayload,
  HandleLoginNavigationParams,
  Tenant,
  TenantData,
} from '../../utils/interfaces/IAuth';
import { COLORS } from '../../theme/colors';
import {
  saveAccessToken,
  saveBaseUrl,
  saveLicenseUserRole,
  saveLoggedInUserId,
  saveUserRole,
} from '../../session/SessionManager';
import { navigate } from '../../navigation/Index';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { getLoginCredentials } from '../../utils/secureStorage';

export const fetchTenantList = async (): Promise<Tenant[]> => {
  try {
    let response = null;

    if (TENANT_BASE_URL?.includes?.('.com')) {
      const tokenPayload = {
        url: URL.GET_SEQURE_TOKEN,
        body: AUTH_CONFIG,
      };
      const tokenResponse = await PostDataWithHeader(tokenPayload);

      if (tokenResponse?.status === 200) {
        const accessToken = tokenResponse?.data?.access_token;
        const payload = {
          url: URL.GET_TENANT_LIST_SECURE,
          token: accessToken,
        };
        response = await GET_DATA_WITH_TOKEN(payload);
      }
    } else if (TENANT_BASE_URL) {
      const payload = {
        url: URL.GET_TENANT_LIST,
      };
      response = await GET_DATA_WITHOUT_TOKEN(payload);
    }

    const tenantsResponse = response?.data?.data?.offlineAppTenants;

    // if (tenantsResponse && Array.isArray(tenantsResponse)) {
    //   const array = [];
    //   for (let element of tenantsResponse) {
    //     if (element?.isActive) {
    //       array.push(element);
    //       // setSelectedTenant((prev) => prev ?? element);
    //     }
    //   }
    //   setItems(array);
    if (Array.isArray(tenantsResponse)) {
      // Filter only active tenants
      const activeTenants = tenantsResponse.filter((tenant: Tenant) => tenant.isActive);
      return activeTenants;
    }
    return [];
  } catch (error) {
    recordCrashlyticsError(TEXTS.biometric.errorFetching, error);
    console.error(TEXTS.biometric.errorFetching, error);
    return [];
  }
};

export const handleOfflineLogin = async (
  email: string,
  password: string,
  offlineAuthData: AuthPayload | null,
): Promise<{ success: boolean; authData?: AuthPayload; message?: string }> => {
  if (!offlineAuthData || !offlineAuthData.username || !offlineAuthData.password) {
    return {
      success: false,
      message: TEXTS.apiServiceFile.noOfflineDataFound,
    };
  }
  const keychainData = await getLoginCredentials();

  if (
    keychainData &&
    keychainData.username.toUpperCase() === email.trim().toUpperCase() &&
    keychainData.password === password
  ) {
    return { success: true, authData: offlineAuthData };

    // setAuthData({
    //           access_token: offlineAuthData?.access_token,
    //           refresh_token: offlineAuthData?.refresh_token,
    //           token_type: offlineAuthData?.token_type,
    //           expireTime: offlineAuthData?.expireTime,
    //           value: offlineAuthData?.value,
    //           username: offlineAuthData?.username,
    //           password: offlineAuthData?.password,
    //           isLoggedIn: offlineAuthData?.isLoggedIn,
    //           adminRole: offlineAuthData?.adminRole,
    //         });
    //         navigate("DashboardDrawerScreen");
  }
  return { success: false, message: TEXTS.apiServiceFile.invalidCredentials };
};

export const fetchAndValidateUserRole = async ({
  accessToken,
  value,
}: {
  accessToken: string;
  value: TenantData;
}): Promise<TenantData | null> => {
  try {
    let payload = {
      // url: value.uRL.url + URL.GET_ADMIN_ROLE,
      baseUrl: value.uRL.url,
      token: accessToken,
    };

    const client = new GovbuiltClientCaseService({
      baseUrl: payload.baseUrl,
      headers: () => ({
        Authorization: `Bearer ${payload.token}`,
      }),
    });

    const response = await client.getAdminRole.get();
    if (response?.statusCode === 200) {
      const role = response?.data;
      return role;
    } else {
      ToastService.show(TEXTS.apiServiceFile.unableUserRole, COLORS.ERROR);
    }
  } catch (error) {
    console.log('error->>>>>', error);
    recordCrashlyticsError('Error initializing fetchAndValidateUserRole:', error);
    ToastService.show(TEXTS.apiServiceFile.somethingWentWrong, COLORS.ERROR);
  }

  return null;
};

// Online login service
export const callLoginAPIService = async (
  type: number,
  email: string,
  password: string,
  tenantData: TenantData,
  biometricEnabled: boolean,
  setLoading: (isLoading: boolean) => void,
  setLoginDataFn: (data: AuthPayload) => void,
  setAuthDataFn: (data: AuthPayload) => void,
  setOfflineAuthDataFn: (data: AuthPayload) => void,
): Promise<{
  success: boolean;
  needsBiometricPrompt?: boolean;
}> => {
  setLoading(true);
  const response = await loginAndFetchToken(email.trim(), password, tenantData, biometricEnabled);
  if (response.success && response.data) {
    const { accessToken, tokenType, refreshToken, expireTime, username, password, value } =
      response.data;
    if (value?.uRL?.url && typeof value.uRL.url === 'string' && !value.uRL.url.endsWith('/')) {
      value.uRL.url += '/';
    }

    const role = await fetchAndValidateUserRole({ accessToken, value });

    if (role?.isAdmin && role?.isTeamMember) {
      saveBaseUrl(value?.uRL?.url);
      saveAccessToken(accessToken);
      saveUserRole(role?.teamMember?.userId);
      saveLoggedInUserId(role?.teamMember?.contentItemId);
      saveLicenseUserRole(role?.teamMember?.userId);
      const loginPayload = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: tokenType,
        expireTime,
        value,
        username,
        password,
        isLoggedIn: true,
        adminRole: role,
      };
      setLoginDataFn(loginPayload);
      if (biometricEnabled) {
        setAuthDataFn(loginPayload);
        setOfflineAuthDataFn(loginPayload);
        return { success: true };
      } else {
        return {
          success: true,
          needsBiometricPrompt: true,
        };
      }
    } else if (role?.isAdmin && !role?.isTeamMember) {
      ToastService.show(TEXTS.alertMessages.teamMemberAlert, COLORS.ERROR);
    } else {
      ToastService.show(TEXTS.alertMessages.accessMobileApplicationAlert, COLORS.ERROR);
    }
  } else {
    ToastService.show(response?.message, COLORS.ERROR);
  }
  setLoading(false);
  return { success: false };
};

export const loginAndFetchToken = async (
  username: string,
  password: string,
  value: TenantData,
): Promise<{
  success: boolean;
  data?: AuthPayload;
  message?: string;
}> => {
  try {
    const payload = {
      baseUrl: value?.uRL?.url,
      body: {
        client_id: value?.clientID,
        client_secret: value?.clientSecret,
        username,
        password,
        grant_type: 'password',
        scope: 'offline_access',
      },
    };

    const response = await getAuthToken(payload.baseUrl, payload.body);

    if (response?.statusCode === 200 && response?.data?.access_token) {
      const { access_token, refresh_token, token_type, expires_in } = response.data;
      const expireTime = Date.now() + expires_in * 1000;

      return {
        success: true,
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenType: token_type,
          expireTime,
          username,
          password,
          value,
        },
      };
    } else {
      // if (response?.statusCode === 200 && biometricEnabled===true) {
      //   alert(
      //     'Your login information has been updated. Please login manually to access your account.'
      //   );
      // }
      // else{
      return {
        success: false,
        message:
          response?.rawResponseBody?.error_description ||
          TEXTS.apiServiceFile.invalidLoginCredentials,
      };
    }
  } catch (error) {
    console.log('Error-->', error);
    recordCrashlyticsError('Error initializing loginAndFetchToken:', error);
    return {
      success: false,
      message: TEXTS.apiServiceFile.loginFailedAlert,
    };
  }
};

export const handleLoginNavigation = ({
  loginData,
  setAuthData,
  setOfflineAuthData,
  setShowBiometricDialog,
}: HandleLoginNavigationParams): void => {
  try {
    const {
      access_token,
      refresh_token,
      token_type,
      expireTime,
      value,
      username,
      password,
      adminRole,
    } = loginData;

    const payload = {
      access_token,
      refresh_token,
      token_type,
      expireTime,
      value,
      username,
      password,
      isLoggedIn: true,
      adminRole,
    };

    // Save session
    setAuthData(payload);
    saveBaseUrl(value?.uRL?.url);
    saveAccessToken(access_token);
    saveUserRole(adminRole?.teamMember?.userId);
    saveLoggedInUserId(adminRole?.teamMember?.contentItemId);
    setOfflineAuthData(payload);
    setShowBiometricDialog(false);
    navigate('DashboardDrawerScreen');
  } catch (error) {
    recordCrashlyticsError('Error navigating to dashboard:', error);
    console.error('Error navigating to dashboard:', error);
    ToastService.show(TEXTS.apiServiceFile.loginSetupFailed, COLORS.ERROR);
  }
};
