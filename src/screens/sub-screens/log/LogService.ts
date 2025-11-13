import { URL } from '../../../constants/url';
import NetInfo from '@react-native-community/netinfo';
import { StatusChangeLog } from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA } from '../../../services/ApiClient';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const LogService = {
  async fetchStatusChangeLog(
    contentItemId: string,
    type: 'BillingStatus' | 'Status' | 'AssignedUsers' | 'TaskStatus',
    setLoading: (loading: boolean) => void,
  ): Promise<StatusChangeLog[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const urlPath = {
          url: `${url}${URL.CASE_CHANGE_LOG_STATUS}${contentItemId}&type=${type}`,
        };
        const response = await GET_DATA(urlPath);
        setLoading(false);
        return response.status ? response?.data?.data || [] : [];
      }
      console.warn('No internet connection');
      return [];
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        recordCrashlyticsError(`Error in fetchStatusChangeLog (${type}):`, error);
        console.error(`Error in fetchStatusChangeLog (${type}):`, error.message);
      } else {
        recordCrashlyticsError(`Error in fetchStatusChangeLog (${type}):`, error);
        console.error(`Error in fetchStatusChangeLog (${type}):`, error);
      }
      return [];
    }
  },
  async fetchInspectionHistory(
    contentItemId: string,
    isCase: boolean,
    setLoading: (loading: boolean) => void,
  ): Promise<StatusChangeLog[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const caseOrLicenseId = isCase ? `?caseId=${contentItemId}` : `?licenseId=${contentItemId}`;
        const urlPath = {
          url: `${url}${URL.INSPECTION_CHANGE_LOG}${caseOrLicenseId}`,
        };
        const response = await GET_DATA(urlPath);
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      }
      console.warn('No internet connection');
      return [];
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        recordCrashlyticsError('Error in fetchInspectionHistory:', error);
        console.error('Error in fetchInspectionHistory:', error.message);
      } else {
        recordCrashlyticsError('Error in fetchInspectionHistory:', error);
        console.error('Error in fetchInspectionHistory:', error);
      }
      return [];
    }
  },
  async fetchPaymentHistory(
    contentItemId: string,
    isCase: boolean,
    setLoading: (loading: boolean) => void,
  ): Promise<StatusChangeLog[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const urlPath = {
          url: isCase
            ? `${url}${URL.CASE_PAYMENT_HISTORY_LOG}${contentItemId}`
            : `${url}${URL.LICENSE_PAYMENT_HISTORY_LOG}${contentItemId}`,
        };
        const response = await GET_DATA(urlPath);
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      }
      console.warn('No internet connection');
      return [];
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        recordCrashlyticsError('Error in fetchPaymentHistory:', error);
        console.error('Error in fetchPaymentHistory:', error.message);
      } else {
        recordCrashlyticsError('Error in fetchPaymentHistory:', error);
        console.error('Error in fetchPaymentHistory:', error);
      }
      return [];
    }
  },
  async fetchLicenseStatus(
    contentItemId: string,
    setLoading: (loading: boolean) => void,
  ): Promise<StatusChangeLog[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const urlPath = {
          url: `${url}${URL.LICENSE_CHANGE_LOG_STATUS}${contentItemId}`,
        };
        const response = await GET_DATA(urlPath);
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      }
      console.warn('No internet connection');
      return [];
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        recordCrashlyticsError('Error in fetchLicenseStatus:', error);
        console.error('Error in fetchLicenseStatus:', error.message);
      } else {
        recordCrashlyticsError('Error in fetchLicenseStatus:', error);
        console.error('Error in fetchLicenseStatus:', error);
      }
      return [];
    }
  },
};
