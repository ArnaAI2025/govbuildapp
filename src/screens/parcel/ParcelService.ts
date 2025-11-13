import NetInfo from '@react-native-community/netinfo';
import { ParcelModel } from '../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

export const ParcelService = {
  async fetchParcels(
    parcelNumber: string,
    address: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ParcelModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${
            URL.GET_ALL_PARCEL
          }ParcelNumber=${parcelNumber}&Address=${encodeURIComponent(address)}`,
        });
        setLoading(false);
        if (response?.status && Array.isArray(response?.data?.data)) {
          const parcels = response.data.data;
          const sortedParcels = parcels.sort((a, b) => {
            const dateA = new Date(a.key || a.modifiedUtc || a.timestamp || 0).getTime();
            const dateB = new Date(b.key || b.modifiedUtc || b.timestamp || 0).getTime();
            return dateB - dateA;
          });

          return sortedParcels;
        }
      } else {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching parcels', error);
      ToastService.show('Error fetching parcels', COLORS.ERROR);
      console.error('Error in fetchParcels:', error);
      return [];
    }
  },

  async fetchParcelDetails(
    parcelNumber: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ParcelModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_PARCEL_DETAILS}${parcelNumber}`,
        });
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      } else {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching parcels details', error);
      ToastService.show('Error fetching parcels details', COLORS.ERROR);
      console.error('Error in fetchParcelDetails:', error);
      return [];
    }
  },

  async fetchCaseParcels(
    parcelNumber: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ParcelModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_CASE_BY_PARCEL_NUMBER}${parcelNumber}`,
        });
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      } else {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching case parcels', error);
      ToastService.show('Error fetching case parcels', COLORS.ERROR);
      console.error('Error in fetchCaseParcels:', error);
      return [];
    }
  },
  async fetchChildParcels(
    parcelNumber: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ParcelModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_CHILD_PARCELS}${parcelNumber}`,
        });
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      } else {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching child parcels', error);
      ToastService.show('Error fetching child parcels', COLORS.ERROR);
      console.error('Error in fetchChildParcels:', error);
      return [];
    }
  },

  async fetchSubmissionParcels(
    parcelNumber: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ParcelModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_SUBMMISSION_BY_PARCEL_NUMBER}${parcelNumber}`,
        });
        setLoading(false);
        return response?.status ? response?.data?.data || [] : [];
      } else {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching submission for parcel', error);
      ToastService.show('Error fetching submission for parcel', COLORS.ERROR);
      console.error('Error in fetchSubmissionParcels:', error);
      return [];
    }
  },
};
