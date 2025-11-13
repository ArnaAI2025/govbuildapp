import { SettingsFormData, SettingsModel, TeamMember } from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
import { sortByKey } from '../../../utils/helper/helpers';
import { URL } from '../../../constants/url';
import { goBack } from '../../../navigation/Index';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import { fetchTeamMembers } from '../../../database/drop-down-list/dropDownlistDAO';
import {
  fetchCaseSettingsDataFromDB,
  syncCaseSettingsWithDatabase,
} from '../../../database/sub-screens/subScreenDAO';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const SettingsService = {
  async fetchSettings(
    contentItemId: string,
    isNetworkAvailable: boolean,
  ): Promise<SettingsModel | null> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const myURL = `${url}${URL.GET_SETTING}${contentItemId}`;
        const response = await GET_DATA({
          url: myURL,
        });
        return response?.data?.data || null;
      } else {
        const settings = await fetchCaseSettingsDataFromDB(contentItemId);
        return settings || null;
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching settings:', error);
      console.error('Error fetching settings:', error);
      return null;
    }
  },
  async fetchTeamMembers(
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<TeamMember[]> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_TEAM_MEMBER}`,
        });
        setLoading(false);
        return sortByKey(response?.data?.data || [], 'firstName', 'lastName');
      } else {
        const result = await fetchTeamMembers();
        return sortByKey(result || [], 'firstName', 'lastName');
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching team members:', error);
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
      recordCrashlyticsError('Error searching case owner:', error);
      console.error('Error searching case owner:', error);
      return [];
    }
  },
  async saveSettings(
    formData: SettingsFormData,
    contentItemId: string,
    userId: string,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();

        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_SETTING}`,
          body: formData,
        });

        setLoading(false);
        if (response?.status && response?.data?.status) {
          const assignedUsers = formData.AssignedUsers.split(',').filter(Boolean);
          const userExists = assignedUsers.includes(userId);
          ToastService.show('Setting updated Successfully', COLORS.SUCCESS_GREEN);
          if (userExists) {
            goBack();
          } else {
            goBack();
            goBack();
          }

          return true;
        }
        return false;
      } else {
        const settings = await fetchCaseSettingsDataFromDB(contentItemId);
        if (settings) {
          const data = {
            permitIssuedDate: formData?.PermitIssuedDate,
            permitExpirationDate: formData?.PermitExpirationDate,
            viewOnlyAssignUsers: formData?.ViewOnlyAssignUsers,
            assignedUsers: formData?.AssignedUsers,
            assignAccess: formData?.AssignAccess,
            contentItemId: contentItemId,
            isCase: 1,
            isEdited: 1,
            projectValuation: formData?.ProjectValuation,
            caseOwner: formData.CaseOwner,
          };
          await syncCaseSettingsWithDatabase(data, contentItemId, true, false, false, true);
          ToastService.show('Setting updated Successfully in offline', COLORS.SUCCESS_GREEN);
          const assignedUsers = formData.AssignedUsers.split(',').filter(Boolean);
          const userExists = assignedUsers.includes(userId);
          if (userExists) {
            goBack();
          } else {
            goBack();
            goBack();
          }
          return true;
        }
        ToastService.show('Error', 'No offline settings found.', COLORS.ERROR);
        return false;
      }
    } catch (error) {
      setLoading(false);
      ToastService.show(`Error saving settings`, COLORS.SUCCESS_GREEN);
      recordCrashlyticsError('Error saving settings:', error);
      console.error('Error saving settings:', error);
      return false;
    }
  },
};
