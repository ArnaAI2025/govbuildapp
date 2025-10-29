import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { URL } from '../../../constants/url';
import { fetchTeamMembers } from '../../../database/drop-down-list/dropDownlistDAO';
import { goBack } from '../../../navigation/Index';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
import { getBaseUrl } from '../../../session/SessionManager';
import { COLORS } from '../../../theme/colors';
import { formatToTwoDecimals, sortByKey } from '../../../utils/helper/helpers';
import { TeamMember } from '../../../utils/interfaces/ISubScreens';
import { licenseDetailsFormData } from '../../../utils/params/commonParams';

export const LicenseDetailsService = {
  async fetchLicenseData(contentItemId: string, isNetworkAvailable: boolean) {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.LICENSE_DETAILS_API}${contentItemId}`,
        });
        return response?.data?.status ? response?.data?.data : [];
      } else {
      }
    } catch (error) {
      console.error('Error fetching:--->', error);
      return [];
    }
  },

  async saveLicenseData(
    formData: any,
    contentItemId: string,
    ownerName?: string,
    isNetworkAvailable?: boolean,
  ) {
    try {
      const licenseFee = formatToTwoDecimals(formData.licenseFee)
        ? String(formatToTwoDecimals(formData.licenseFee))
        : '';
      const payload = licenseDetailsFormData(
        formData.testScore || '',
        licenseFee || '',
        formData.liabilityDate || '',
        formData.workerCompDate || '',
        formData.issueDate || '',
        formData.effectiveDate || '',
        contentItemId || '',
        formData.licenseOwner == '' ? ownerName : formData.licenseOwner,
        formData.assignTeamMembers.join(',') || '',
        formData.isAllowAssigned || false,
      );

      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_LICENSE_DETAILS_API}`,
          body: payload,
        });

        if (response?.data?.status) {
          ToastService.show(TEXTS.subScreens.licenseDetails.saveSuccess, COLORS.SUCCESS_GREEN);
          goBack();
        } else {
          ToastService.show(response?.data?.message, COLORS.ERROR);
        }
        return response?.data;
      }
    } catch (error) {
      console.error('Error fetching:--->', error);
    }
  },

  async fetchTeamMember(isNetworkAvailable: boolean): Promise<TeamMember[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_TEAM_MEMBER}`,
        });
        return sortByKey(response?.data?.data || [], 'firstName', 'lastName');
      } else {
        const result = await fetchTeamMembers();
        return sortByKey(result || [], 'firstName', 'lastName');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },

  async searchCaseOwner(searchString: string, isNetworkAvailable: boolean): Promise<TeamMember[]> {
    try {
      if (isNetworkAvailable && searchString.length > 1) {
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.USERNAME_SEARCH_LIST}${searchString}`,
        });
        return response?.data?.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching case owner:', error);
      return [];
    }
  },
};
