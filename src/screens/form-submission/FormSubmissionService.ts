import type { FormStatus } from '../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import {
  fetchFormStatusData,
  fetchSubmissionData,
} from '../../database/form-submission/formSubmissionDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { TEXTS } from '../../constants/strings';

export const FormSubmissionService = {
  async fetchFormStatus(isNetworkAvailable: boolean): Promise<FormStatus[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();

        const response = await GET_DATA({
          url: `${url}${URL.GET_ADVANCED_FORM_STATUS}`,
        });

        if (response?.status && response?.data?.data) {
          const filteredData = response.data?.data?.filter(
            (item: FormStatus) => item.displayText && item.displayText !== '',
          );
          return [
            { id: '', displayText: TEXTS.subScreens.advanceFormSubmission.placeholder.dropdown },
            ...filteredData,
          ];
        }
        return [
          { id: '', displayText: TEXTS.subScreens.advanceFormSubmission.placeholder.dropdown },
        ];
      } else {
        const localData = await fetchFormStatusData();
        const filteredData = localData?.filter(
          (item: FormStatus) => item?.displayText && item?.displayText !== '',
        );
        return [
          { id: '', displayText: TEXTS.subScreens.advanceFormSubmission.placeholder.dropdown },
          ...filteredData,
        ];
      }
    } catch (error) {
      // setLoading(false);
      recordCrashlyticsError('Error in fetchFormStatus:', error);
      console.error('Error in fetchFormStatus:', error);
      return [{ id: '', displayText: TEXTS.subScreens.advanceFormSubmission.placeholder.dropdown }];
    }
  },

  async fetchSubmissions(
    isNetworkAvailable: boolean,
    page: number,
    searchText: string,
    statusId: string,
    mySubmission: boolean,
  ) {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const params = new URLSearchParams({
          pagenum: page.toString(),
          displayText: searchText,
          statusId,
          mySubmission: String(mySubmission),
        });

        const payload = `${url}${URL.GET_SUBMISSIONS_ONLINE}?${params.toString()}`;
        const response = await GET_DATA({
          url: payload,
        });
        return response?.status ? response?.data?.data?.contentItemSummaries || [] : [];
      } else {
        const localData = await fetchSubmissionData(statusId);
        return localData || [];
      }
    } catch (error) {
      recordCrashlyticsError('Error in fetchSubmissions:', error);
      console.error('Error in fetchSubmissions:', error);
      return [];
    }
  },
};
