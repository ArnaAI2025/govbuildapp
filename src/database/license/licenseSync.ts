import { URL } from '../../constants/url';
import { GET_DATA } from '../../services/ApiClient';
import { getBaseUrl } from '../../session/SessionManager';
import { generateUniqueID, logBlue } from '../../utils/helper/helpers';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import type { LicenseData } from '../../utils/interfaces/zustand/ILicense';
import {
  deleteLicenseFromDBIfNotFormTheApi,
  fetchAllLicenseFromDB,
  storeLicenseData,
  updateFatchLicenseData,
  updateLicenseData,
  updateLicensePermission,
  updateOnlyLicenseData,
} from './licenseDAO';
import type { License } from '../types/license';
import {
  syncContractorWithDatabase,
  syncInspectionWithDatabase,
  syncLicenseDetailsDataWithDatabase,
  syncLicenseOwnerWithDatabase,
  syncLicenseSubScreenData,
  syncPaymentsWithDatabase,
} from '../sub-screens/subScreensSync';
import { syncAllCaseFoldersFilesAPI } from '../sub-screens/attached-docs/attachedDocsSync';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { isNetworkAvailable } from '../../utils/checkNetwork';

// Sync All license data on home screen
export const licenseAPICall = async (): Promise<void> => {
  const url = await getBaseUrl();
  let pageNo = 1;
  try {
    console.log('LICENSE API PAGE NUMBER:', pageNo);
    if (!isNetworkAvailable) {
      console.log('No internet connection or offline mode.');
      return;
    }
    let currentPage = pageNo;
    const newLicenseIds: string[] = [];
    let hasMoreData = true;

    while (hasMoreData) {
      let newURL = `${url}${URL.LICENSE_LIST_BY_DATE}pagenum=${pageNo}`;
      const Response = await GET_DATA({ url: newURL });
      if (!Response?.status) {
        console.warn('LICENSE API returned unsuccessful status:', Response);
        return;
      }
      const license = Response?.data?.data;
      // const totalLicense = license?.licenseCount || 0;
      const licenseData = license?.contentItemSummaries || [];
      const uniqueLicenseTypeIds: string[] = [];
      for (const summary of licenseData) {
        try {
          console.log('-----------------------------------------------');
          console.log('license number ---->', summary.licenseNumber);
          console.log('FirstName-->>', summary?.applicantFirstName);
          console.log('license licenseDescriptor--->', summary.licenseDescriptor);
          console.log('license displayText--->', summary.displayText);

          await updateLicenseIfIdExist(
            summary,
            null,
            true,
            false,
            false,
            false,
            false,
            Response?.data?.permissions?.isAllowEditCase,
            Response?.data?.permissions?.isAllowViewInspection,
            false,
            Response?.data?.permissions?.isAllowAddAdminNotes,
          );
          const licenseTypeId = summary?.contentItemId;
          if (licenseTypeId && !uniqueLicenseTypeIds.includes(licenseTypeId)) {
            uniqueLicenseTypeIds.push(licenseTypeId);
          }
        } catch (error) {
          recordCrashlyticsError('Error updating only license data:--->', error);
          console.error(`Failed to update license ${summary?.contentItemId}:`, error);
        }
      }
      // Define type if not already available
      interface ContentItemSummary {
        contentItemId: string;
      }

      const summaries: ContentItemSummary[] = licenseData;
      const syncTasks: Array<Promise<void>> = summaries.map(async (summary: ContentItemSummary) => {
        const contentItemId: string | undefined = summary?.contentItemId;
        newLicenseIds.push(contentItemId);
        try {
          await syncPaymentsWithDatabase(contentItemId, 'License');
        } catch (error) {
          console.error(`Error syncing Payments for ID ${contentItemId}:`, error);
        }
        try {
          await syncLicenseSubScreenData(contentItemId);
          await syncContractorWithDatabase(contentItemId, 'License');
          await syncInspectionWithDatabase(contentItemId, 'License');
          await syncAllCaseFoldersFilesAPI(contentItemId, false);
          await syncLicenseDetailsDataWithDatabase(contentItemId);
          await syncLicenseOwnerWithDatabase(contentItemId, 'License');
          // await syncLocationWithDatabase(contentItemId, "Case");
        } catch (error) {
          recordCrashlyticsError('Error updating only license data:--->', error);
          console.error(`Error syncing data for Case ID ${contentItemId}:`, error);
        }
      });
      // Wait for all tasks to finish
      await Promise.allSettled(syncTasks);
      // Check if more data is available
      hasMoreData = summaries.length > 0;
      if (hasMoreData) {
        currentPage += 1;
        pageNo = currentPage;
        console.log(`Incremented to page ${currentPage}`);
      } else if (newLicenseIds.length > 0) {
        const rows = await fetchAllLicenseFromDB();
        for (const row of rows || []) {
          if (!newLicenseIds?.includes(row?.contentItemId)) {
            await deleteLicenseFromDBIfNotFormTheApi(row?.contentItemId);
          }
        }
      } else {
        console.log('No more data to sync.');
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error updating only license data:--->', error);
    console.error('Critical error in licenseAPICall:', error);
  }
};

// Update License if ID exists
export const updateLicenseIfIdExist = async (
  data: Partial<License>,
  licenceData: any,
  firstTime: boolean,
  isSync: boolean,
  isForceSync: boolean,
  shouldUpdateOnlyLicenseData: boolean,
  isEdited: boolean,
  isAllowEditLicense: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
  correlationId: string = '',
  apiChangeDateUtc: string = '',
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    if (!data?.contentItemId) {
      console.warn('Missing contentItemId for license update.');
      return false;
    }
    const resultSet = (await db.getAllAsync(
      `SELECT * FROM ${TABLES.LICENSE} WHERE contentItemId = ?`,
      [data?.contentItemId],
    )) as LicenseData[];

    if (resultSet.length === 0) {
      console.log('No existing license found. Storing new license...');

      await storeLicenseData(data, isAllowEditLicense, isAllowViewInspection, isAllowAddAdminNotes);
      return true;
    } else {
      const result = resultSet[0]; //existingLicense data Present
      if (firstTime) {
        if (result?.isEdited === 0 && result?.isForceSync === 0) {
          const serverTime = new Date(data?.modifiedUtc).getTime();
          console.log('serverTime----->>>', serverTime);

          const localTime = new Date(result?.modifiedUtc).getTime();
          console.log('localTime----->>>', localTime);

          const modifiedDateCondition = serverTime > localTime;
          logBlue('modifiedDateCondition--->', modifiedDateCondition);

          if (modifiedDateCondition) {
            console.log('Updating license based on modified date');
            await updateFatchLicenseData(
              data,
              licenceData,
              isSync,
              false,
              isForceSync,
              null,
              isAllowEditLicense,
              isAllowViewInspection,
              isPermission,
              isAllowAddAdminNotes,
              apiChangeDateUtc,
              isForceSync ? generateUniqueID() : correlationId,
            );
            return true;
          } else {
            console.log('Already synced');
          }
        } else if (isPermission) {
          await db.runAsync(`UPDATE ${TABLES.LICENSE} SET isPermission=? WHERE contentItemId=?`, [
            1,
            data.contentItemId,
          ]);
          return true;
        } else {
          await updateLicensePermission(
            data,
            isAllowEditLicense,
            isAllowViewInspection,
            isAllowAddAdminNotes,
          );
          return true;
        }
      } else if (shouldUpdateOnlyLicenseData) {
        await updateOnlyLicenseData(
          data,
          licenceData,
          isAllowEditLicense,
          isAllowViewInspection,
          isPermission,
          isAllowAddAdminNotes,
          apiChangeDateUtc,
          isForceSync ? generateUniqueID() : correlationId,
        );
        return true;
      } else {
        await updateLicenseData(
          data,
          licenceData,
          isSync,
          isEdited,
          isForceSync,
          null,
          isAllowEditLicense,
          isAllowViewInspection,
          isPermission,
          isAllowAddAdminNotes,
          apiChangeDateUtc,
          isForceSync ? generateUniqueID() : correlationId,
        );
        return true;
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error updating only license data:--->', error);
    console.error('Error updating or inserting license: ---->', error);
    return false;
  }
  return false;
};

// Fetch All license data and search license data from db
export const fetchMyLicenseDataFromDB = async (
  userId?: string,
  page = 1,
  limit = 10,
  searchText?: string,
) => {
  try {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    // Safe search param
    const safeSearch = `%${searchText?.toLowerCase()}%`;

    const query =
      `SELECT * FROM ${TABLES.LICENSE} ` +
      (searchText ? `WHERE LOWER(displayText) LIKE ? ` : ``) +
      `LIMIT ? OFFSET ?`;

    const params = searchText ? [safeSearch, limit, offset] : [limit, offset];

    const rows = await db.getAllAsync(query, params);

    return rows.filter(
      (row) =>
        (row?.viewOnlyAssignUsers && row?.assignedUsers?.includes(userId)) ||
        !row?.viewOnlyAssignUsers,
    );
  } catch (error) {
    recordCrashlyticsError('Error updating only license data:--->', error);
    console.error('Offline DB fetch error:--->', error);
    return [];
  }
};

// Fetch license data by ID
export const fetchLocalLicenseById = async (licenseId: string) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.LICENSE} WHERE contentItemId = ?`, [
      licenseId,
    ]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error updating only license data:--->', error);
    console.error(`Error fetching license by ID:----> ${licenseId}`, error);
    return null;
  }
};

// Force sync
export const fetchLicenseForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LICENSE} WHERE isEdited = ? OR isForceSync = ?`,
      [1, 1],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchLicenseForSyncScreen :', error);
    console.log('Error fetching case data from DB fetchLicenseForSyncScreen :', error);
  }
};
