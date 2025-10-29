import NetInfo from '@react-native-community/netinfo';
import { FormStatus } from '../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import {
  fetchFormStatusData,
  fetchSubmissionData,
} from '../../database/form-submission/formSubmissionDAO';

export const FormSubmissionService = {
  async fetchFormStatus() {
    try {
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        const url = getBaseUrl();

        const response = await GET_DATA({
          url: `${url}${URL.GET_ADVANCED_FORM_STATUS}`,
        });

        if (response?.status && response?.data?.data) {
          const filteredData = response.data?.data?.filter(
            (item: FormStatus) => item.displayText && item.displayText !== '',
          );
          return [{ id: '', displayText: 'All Advanced Form Status' }, ...filteredData];
        }
        return [{ id: '', displayText: 'All Advanced Form Status' }];
      } else {
        const localData = await fetchFormStatusData();
        const filteredData = localData?.filter(
          (item: FormStatus) => item?.displayText && item?.displayText !== '',
        );
        return [{ id: '', displayText: 'All Advanced Form Status' }, ...filteredData];
      }
    } catch (error) {
      // setLoading(false);
      console.error('Error in fetchFormStatus:', error);
      return [{ id: '', displayText: 'All Advanced Form Status' }];
    }
  },

  async fetchSubmissions(
    page: number,
    searchText: string,
    statusId: string,
    mySubmission: boolean,
  ) {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const url = getBaseUrl();
        const payload = `${url}${URL.GET_SUBMISSIONS_ONLINE}?pagenum=${page}&displayText=${searchText}&statusId=${statusId}&mySubmission=${mySubmission}`;
        const response = await GET_DATA({
          url: payload,
        });
        return response?.status ? response?.data?.data?.contentItemSummaries || [] : [];
      } else {
        const localData = await fetchSubmissionData(statusId);
        return localData || [];
      }
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      return [];
    }
  },
};
