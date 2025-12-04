import { isNetworkAvailable } from './../utils/checkNetwork';
import { handleError } from './../utils/handleError';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { ToastService } from '../components/common/GlobalSnackbar';
import qs from 'qs';
import { getAccessToken } from '../session/SessionManager';
import { COLORS } from '../theme/colors';
import { TokenRefreshGlobal } from '../session/TokenRefresh';
import { recordCrashlyticsError } from './CrashlyticsService';

const axiosInstance = axios.create();

const executeRequest = async <T>(
  config: AxiosRequestConfig,
  retry: boolean = true,
): Promise<AxiosResponse<T> | null> => {
  const state = isNetworkAvailable();
  try {
    config.headers = config.headers || {};
    // Add access token if not present
    if (!config.headers.Authorization) {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    const response = await axiosInstance.request<T>(config);
    return response;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    recordCrashlyticsError('API request failed:------>>>>>>', error);
    console.error('API request failed:------>>>>>>', {
      url: config.url,
      error: axiosError.message,
      status: axiosError?.response,
      Problem: axiosError?.response?.data?.errors,
    });
    if (axiosError.message === 'Network Error') {
      ToastService.show('Network error detected. Retrying...', COLORS.WARNING_ORANGE);
      if (state && retry) {
        // Optional: Add delay before retry
        await new Promise((res) => setTimeout(res, 2000));
        return executeRequest<T>(config, false);
      }
      // ToastService.show("Network unavailable. Please try again.", COLORS.ERROR);
      return null;
    }
    if (axiosError.response?.status === 401 && retry) {
      const refreshed = await TokenRefreshGlobal();
      if (refreshed) {
        const newAccessToken = getAccessToken();
        if (newAccessToken && newAccessToken !== config.headers?.Authorization?.split(' ')[1]) {
          console.log('newAccessToken--->', newAccessToken);

          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
          return executeRequest<T>(config, false);
        }
        throw new Error('Token refresh failed');
      }
    } else if (axiosError?.response?.status === 403) {
      ToastService.show('You do not have permission to view this content.', COLORS.ERROR);
      return null;
    }
    if (
      Object.prototype.hasOwnProperty.call(axiosError?.response, 'statusCode') &&
      axiosError.response?.status === 403
    ) {
      ToastService.show('You do not have permission to view this content.', COLORS.ERROR);
      return null;
    }
    handleError(axiosError);
    return null;
  }
};

// API Methods
export const GET_DATA_WITHOUT_TOKEN = async (payload: { url: string }) => {
  return executeRequest({
    method: 'get',
    url: payload.url,
    headers: {},
  });
};

export const GET_DATA_WITH_TOKEN = async (payload: { url: string; token?: string }) => {
  return executeRequest({
    method: 'get',
    url: payload?.url,
    headers: {
      Authorization: payload.token ? `Bearer ${payload.token}` : undefined,
    },
  });
};

export const POST_DATA_WITHOUT_TOKEN = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'post',
    url: payload.url,
    data: payload.body,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const POST_DATA_WITH_TOKEN = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'post',
    url: payload.url,
    data: payload.body,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
  });
};
export const GET_DATA = async (payload: { url: string }) => {
  return executeRequest({
    method: 'get',
    url: payload.url,
  });
};

export const PostData = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'post',
    url: payload.url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    data: payload.body,
  });
};

export const PostDataWithHeader = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'post',
    url: payload.url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(payload.body),
  });
};

export const PostProfileImage = async (payload: { url: string; body: FormData }) => {
  return executeRequest({
    method: 'post',
    url: payload.url,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: payload.body,
  });
};

export const PatchData = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'patch',
    url: payload.url,
    data: payload.body,
  });
};

export const PutData = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'put',
    url: payload.url,
    data: payload.body,
  });
};

export const PutDataMultiPart = async (payload: { url: string; body: FormData }) => {
  return executeRequest({
    method: 'put',
    url: payload.url,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: payload.body,
  });
};

export const DELETE_API = async (payload: { url: string; body: any }) => {
  return executeRequest({
    method: 'delete',
    url: payload.url,

    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: payload.body,
  });
};

export const UPLOAD_API = async (payload: { url: string; body: FormData }): Promise<any> => {
  try {
    const formData = payload.body;

    const filePart = formData?._parts?.find((part) => part[0] === 'file');
    if (filePart) {
      const file = filePart[1];
      if (file?.name) {
        const encodedName = encodeURIComponent(file.name);
        file.name = encodedName;

        const updatedParts = formData._parts.map((part) =>
          part[0] === 'file' ? ['file', file] : part,
        );
        formData._parts = updatedParts;
      }
    }

    const response = await executeRequest({
      method: 'post',
      url: payload.url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    });

    if (response?.data?.filename) {
      return {
        url: decodeURIComponent(response.data.filename),
        ...response.data,
      };
    }

    if (response?.error_description) {
      ToastService.show(response.error_description, COLORS.ERROR);
    }

    return null;
  } catch (error: any) {
    if (
      error?.response?.status === 413 ||
      error?.message === 'File size exceeds the server limit.'
    ) {
      ToastService.show('The file is too large to upload.', COLORS.ERROR);
    } else {
      recordCrashlyticsError('Upload error:', error);
      console.error('Upload error:', error?.message || error);
    }

    throw error;
  }
};

export const GETAPI_FOR_DOWNLOAD = async (url: string, token: string) => {
  try {
    const response = await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'text',
    });

    return response.data; // csv string
  } catch (error) {
    recordCrashlyticsError('Error downloading CSV:', error);
    console.error('Error downloading CSV:', error);
    throw error;
  }
};
