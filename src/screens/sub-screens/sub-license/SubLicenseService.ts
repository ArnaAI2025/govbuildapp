import { URL } from '../../../constants/url';
import { GET_DATA } from '../../../services/ApiClient';
import { SubLicenseResponse } from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const fetchRelatedLicense = async (
  contentItemId: string,
  isNetworkAvailable: boolean,
): Promise<SubLicenseResponse> => {
  const url = getBaseUrl();
  if (isNetworkAvailable) {
    try {
      const endpoint = `${url}${URL.GET_ALL_PARENT_CHILD_CONTRACTOR_BY_LICENSE_ID}${contentItemId}`;
      const response = await GET_DATA({ url: endpoint });
      const res = response?.data?.data;
      if (response?.status && response?.data) {
        return {
          allChildLicense: res?.allChildLicense || [],
          allParentLicense: res?.allParentLicense || [],
        };
      } else {
        return { allChildLicense: [], allParentLicense: [] };
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching ---:', error);
      console.error('Error fetching ---:', error);
    }
  }
  return {
    allChildLicense: [],
    allParentLicense: [],
  };
};
