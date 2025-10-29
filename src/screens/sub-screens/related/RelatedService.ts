import { URL } from '../../../constants/url';
import { GET_DATA } from '../../../services/ApiClient';
import { RelatedCasesResponse } from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';

export const fetchRelatedCases = async (
  contentItemId: string,
  type: 'Case' | 'License',
  isNetworkAvailable: boolean,
): Promise<RelatedCasesResponse> => {
  const url = getBaseUrl();
  if (isNetworkAvailable) {
    try {
      const endpoint =
        type === 'Case'
          ? `${url}${URL.RELATED_LIST_BY_CASEID}${contentItemId}`
          : `${url}${URL.GET_ALL_PARENT_CHILD_CONTRACTOR_BY_LICENSE_ID}${contentItemId}`;
      const response = await GET_DATA({ url: endpoint });

      const res = response?.data?.data;
      if (response?.status && response?.data) {
        return {
          allChildCase: type === 'Case' ? res?.allChildCase || [] : res?.allChildLicense || [],
          allParentCase: type === 'Case' ? res?.allParentCase || [] : res?.allParentLicense || [],
        };
      } else {
        return { allChildCase: [], allParentCase: [] };
      }
    } catch (error) {
      console.error('Error fetching ---:', error);
    }
  }
  return {
    allChildCase: [],
    allParentCase: [],
  };
};
