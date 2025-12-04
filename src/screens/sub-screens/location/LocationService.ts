import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { formatDate, getNewUTCDate } from '../../../utils/helper/helpers';
import {
  saveUpdateMultipleLocationFormData,
  SyncModelParam,
} from '../../../utils/params/commonParams';
import { URL } from '../../../constants/url';
import type { AdressModel } from '../../../utils/interfaces/ISubScreens';
import { fetchLocationData } from '../../../database/sub-screens/subScreenDAO';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const LocationService = {
  async fetchLocations(
    contentItemId: string,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<AdressModel[]> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.MULTI_LOCATION_LIST}${contentItemId}`,
        });
        return response.status ? response?.data?.data || [] : [];
      } else {
        const localData = await fetchLocationData(contentItemId);
        return localData || [];
      }
    } catch (error) {
      if (error instanceof Error) {
        recordCrashlyticsError('Error in fetchLocations:', error);
        console.error('Error in fetchLocations:', error.message);
      } else {
        recordCrashlyticsError('Error in fetchLocations:', error);
        console.error('Error in fetchLocations:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  },

  async deleteLocation(
    contentItemId: string,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.DELETE_MULTIPLE_LOCATION}${contentItemId}`,
          body: {
            contentItemId: contentItemId,
          },
        });
        return true;
      }
      console.warn('No internet connection');
      return false;
    } catch (error) {
      if (error instanceof Error) {
        recordCrashlyticsError('Error in deleteLocation:', error);
        console.error('Error in deleteLocation:', error.message);
      } else {
        recordCrashlyticsError('Error in deleteLocation:', error);
        console.error('Error in deleteLocation:', error);
      }
      return false;
    } finally {
      setLoading(false);
    }
  },

  async saveOrUpdateLocation(
    isEdit: boolean,
    parcelId: string,
    address: string,
    endDate: string,
    contentId: string,
    latitude: string,
    longitude: string,
    existingContentItemId: string,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const newId = '';
        const newURL = isEdit
          ? `${url}${URL.UPDATE_MULTIPLE_LOCATION}`
          : `${url}${URL.ADD_MULTIPLE_LOCATION}`;
        const formData = saveUpdateMultipleLocationFormData(
          isEdit,
          parcelId,
          address,
          endDate ? formatDate(endDate) : null,
          contentId,
          latitude?.toString(),
          longitude?.toString(),
          existingContentItemId,
          SyncModelParam(
            false,
            false,
            getNewUTCDate(),
            newId,
            isEdit ? existingContentItemId : '',
            null,
          ),
        );
        console.log('location data -->', formData);
        const response = await POST_DATA_WITH_TOKEN({
          url: newURL,
          body: formData,
        });
        if (response?.status) {
          return true;
        } else {
          ToastService.show(response?.message);
          return false;
        }
      }
      console.warn('No internet connection');
      return false;
    } catch (error) {
      if (error instanceof Error) {
        recordCrashlyticsError('Error in saveOrUpdateLocation:', error);
        console.error('Error in saveOrUpdateLocation:', error.message);
      } else {
        recordCrashlyticsError('Error in saveOrUpdateLocation:', error);
        console.error('Error in saveOrUpdateLocation:', error);
      }
      return false;
    } finally {
      setLoading(false);
    }
  },
};
