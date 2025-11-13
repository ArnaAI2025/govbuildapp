import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../DatabaseService';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { TeamMemberData } from '../../utils/interfaces/offline/IOffllineCase';
import {
  insertBillingStatus,
  insertDepartmentMemberList,
  insertDocumentTypes,
  insertRenewalStatus,
  insertStatus,
  insertSubCaseType,
  insertTags,
  insertTeamMembers,
  insertType,
  updateFormFilterDataIfExists,
} from './dropDownlistDAO';
import { TABLES } from '../DatabaseConstants';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

export const syncDropdownListData = async (): Promise<void> => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('Offline: Skipping dropdown list sync');
      return;
    }
    const url = getBaseUrl();

    // Get case tags
    const allCaseTagListData = await GET_DATA({
      url: `${url}${URL.CASE_TAG_LIST}`,
    });
    if (allCaseTagListData?.data?.status) {
      if (allCaseTagListData?.data?.data?.length > 0) {
        allCaseTagListData?.data?.data?.forEach((item) => insertTags(item, true));
      }
    }

    // Get license tags
    const allLicenseTagListData = await GET_DATA({
      url: `${url}${URL.GET_LICENSE_TAGS}`,
    });

    if (allLicenseTagListData?.data?.status) {
      if (allLicenseTagListData?.data?.data?.length > 0) {
        allLicenseTagListData?.data?.data?.forEach((item) => insertTags(item, false));
      }
    }
    // License renewal status API
    try {
      const licenseRenewalData = await GET_DATA({
        url: `${url}${URL.GET_LICENSE_RENEWAL_STATUS}`,
      });
      if (licenseRenewalData?.data?.status) {
        licenseRenewalData?.data?.data?.forEach((object) => insertRenewalStatus(object, false));
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching license renewal statuses:-->', error);
      console.error('Error fetching license renewal statuses:-->', error);
    }
    // Daily inpection inpectors API
    try {
      const departmentMemberData = await GET_DATA({
        url: `${url}${URL.DEPARTMENT_MEMBER_LIST}`,
      });
      if (departmentMemberData?.data?.status) {
        departmentMemberData?.data?.data?.forEach((object) => insertDepartmentMemberList(object));
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching department Member Data:-->', error);
      console.error('Error fetching department Member Data:-->', error);
    }

    //Advanced Form Types API
    try {
      const formTypeData = await GET_DATA({
        url: `${url}${URL.GET_ADVANCEFORM_TYPE_API}`,
      });
      if (formTypeData?.data?.status) {
        formTypeData?.data?.data?.forEach((object) =>
          updateFormFilterDataIfExists(object?.displayText, object?.id, TABLES.FORM_TYPES_TABLE),
        );
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching advanced form type data:-->', error);
      console.error('Error fetching advanced form type data:-->', error);
    }

    //Advanced Form Tags API
    try {
      const formTagData = await GET_DATA({
        url: `${url}${URL.GET_ADVANCEFORM_TAG_API}`,
      });
      if (formTagData?.data?.status) {
        formTagData?.data?.data?.forEach((object) =>
          updateFormFilterDataIfExists(object?.displayText, object?.id, TABLES.FORM_TAGS_TABLE),
        );
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching advanced form tag data:-->', error);
      console.error('Error fetching advanced form tag data:-->', error);
    }

    // Get all section
    const allSelectionListData = await GET_DATA({
      url: `${url}${URL.ALL_OFFLINE_DROPDOWN_API}`,
    });

    if (allSelectionListData?.status) {
      const {
        billingStatus,
        caseStatus,
        caseSubType,
        caseType,
        documentTypes,
        licenseDocumentType,
        licenseStatus,
        licenseSubType,
        licenseType,
        teamMember,
        // user,
      } = allSelectionListData?.data?.data;

      // For team member dropdown data for both case and license
      if (teamMember?.length > 0) {
        teamMember?.forEach(async (teamMemberObject: TeamMemberData) => {
          if (teamMemberObject?.userId) await insertTeamMembers(teamMemberObject, true);
        });
      }

      //For Case and license type dropdown data
      if (caseType?.length > 0) {
        caseType.forEach((item) => insertType(item, true));
      }
      if (licenseType?.length > 0) {
        licenseType.forEach((item) => insertType(item, false));
      }
      //For Case sub type dropdown data
      if (caseSubType?.length > 0) {
        caseSubType.forEach((item) => insertSubCaseType(item, true));
      }
      if (licenseSubType?.length > 0) {
        licenseSubType.forEach((item) => insertSubCaseType(item, false));
      }
      //For Case and license status dropdown data
      if (caseStatus?.length > 0) {
        caseStatus.forEach((item) => insertStatus(item, true)); //true for case status
      }
      if (licenseStatus?.length > 0) {
        licenseStatus.forEach((item) => insertStatus(item, false)); //false for license status
      }

      // billingStatus dropdown data
      if (billingStatus?.length > 0) {
        billingStatus.forEach((item) => insertBillingStatus(item, true));
      }
      if (documentTypes?.length > 0) {
        documentTypes.forEach((item) => insertDocumentTypes(item, true));
      }
      if (licenseDocumentType?.length > 0) {
        licenseDocumentType.forEach((item) => insertDocumentTypes(item, false));
      }
    }

    console.log('Dropdown list data synced successfully');
  } catch (error) {
    recordCrashlyticsError('Error syncing dropdown list data:', error);
    console.error('Error syncing dropdown list data:', error);
    throw error;
  }
};

export const markForSync = async (tableName: string, id: string): Promise<void> => {
  // Requires adding isSync BOOLEAN DEFAULT 0 to schema if needed
  const db = getDatabase();
  try {
    await db.runAsync(`UPDATE ${tableName} SET isSync = 0 WHERE id = ?`, [id]);
  } catch (error) {
    recordCrashlyticsError(`Error marking ${tableName} for sync:`, error);
    console.error(`Error marking ${tableName} for sync:`, error);
    throw error;
  }
};

export const fetchTeamMembers = async () => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.TEAM_MEMBER_TABLE_NAME}`);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching team members:', error);
    console.error('Error fetching team members:', error);
  }
};
