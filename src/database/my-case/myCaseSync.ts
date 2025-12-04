import {
  storeCaseData,
  updateCaseData,
  updateOnlyCaseData,
  updateFatchCaseData,
  updateCasePermission,
  fetchAllCasesFromDB,
  deleteCaseFromDBIfNotFormTheApi,
  updateCaseTypeSettingsIfExists,
} from './myCaseDAO';
import { URL } from '../../constants/url';

import type { Case } from '../types/case';
import { getAccessToken, getBaseUrl, getUserRole } from '../../session/SessionManager';
import { TABLES } from '../DatabaseConstants';
import { GET_DATA } from '../../services/ApiClient';
import { getDatabase } from '../DatabaseService';
import {
  syncContractorWithDatabase,
  syncInspectionWithDatabase,
  syncLocationWithDatabase,
  syncPaymentsWithDatabase,
  syncSubScreenData,
} from '../sub-screens/subScreensSync';
import type { DefaultAdvancedFiltersInterface } from '../../utils/interfaces/IComponent';
import { useUnifiedCaseStore } from '../../store/caseStore';
import { syncAllCaseFoldersFilesAPI } from '../sub-screens/attached-docs/attachedDocsSync';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { isNetworkAvailable } from '../../utils/checkNetwork';

export const myCaseAPICall = async (): Promise<void> => {
  const { setTotalCaseCount } = useUnifiedCaseStore.getState();
  let pageNo = 1;
  try {
    console.log('Case api PAGE NUMBER:', pageNo);
    if (!isNetworkAvailable) {
      console.log('No internet connection or offline mode.');
      return;
    }

    let currentPage = pageNo;
    const newCaseIds: string[] = [];
    let hasMoreData = true;
    while (hasMoreData) {
      const url = getBaseUrl();
      const token = getAccessToken();
      if (!url || !token) {
        throw new Error('Missing base URL or access token');
      }
      // Apply filters only when online
      let newURL = `${url}${URL.CASELIST_BY_DATE}pagenum=${pageNo}`;
      const data1 = await GET_DATA({ url: newURL });
      if (!data1?.status) {
        console.warn('Case API returned unsuccessful status:', data1);
        return;
      }
      const totalCases = data1?.data?.data?.caseCount || 0;
      setTotalCaseCount(totalCases);
      const caseData = data1?.data?.data?.contentItemSummaries || [];
      const uniqueCaseTypeIds: string[] = [];
      for (const summary of caseData) {
        try {
          console.log('case number--->', summary.number);
          console.log('case caseName--->', summary.caseName);
          console.log('case displayText--->', summary.displayText);
          console.log('-----------------------------------------------');
          await updateCaseIfIdExist(
            summary,
            null,
            true,
            false,
            false,
            true,
            false,
            data1?.data?.data?.isEnableMultiline,
            data1?.data?.permissions?.isAllowEditCase,
            data1?.data?.permissions?.isAllowViewInspection,
            false,
            data1?.data?.permissions?.isAllowAddAdminNotes,
          );
          const caseTypeId = summary?.caseTypeId;
          if (caseTypeId && !uniqueCaseTypeIds.includes(caseTypeId)) {
            uniqueCaseTypeIds.push(caseTypeId);
          }
        } catch (error) {
          recordCrashlyticsError(`Failed to update case ${summary?.contentItemId}:`, error);
          console.error(`Failed to update case ${summary?.contentItemId}:`, error);
        }
      }

      // Fetch & store settings for each unique caseTypeId
      for (const caseTypeId of uniqueCaseTypeIds) {
        try {
          const caseTypeFieldSetting = await GET_DATA({
            url: `${url}${URL.GET_CASE_TYPE_FIELDS_SETTING}${caseTypeId}`,
          });
          if (!caseTypeFieldSetting?.status) {
            console.warn(`Invalid setting response for ${caseTypeId}`);
            continue;
          }
          const serverData = caseTypeFieldSetting?.data?.data;
          // console.log("caseSetting --->", serverData);

          await updateCaseTypeSettingsIfExists(serverData, caseTypeId);
          // console.log(`Stored setting for caseTypeId: ${caseTypeId}`);
        } catch (error) {
          recordCrashlyticsError(`Failed to store setting for caseTypeId ${caseTypeId}`, error);
          console.error(`Failed to store setting for caseTypeId ${caseTypeId}`, error);
        }
      }

      // Define type if not already available
      interface ContentItemSummary {
        contentItemId: string;
      }

      const summaries: ContentItemSummary[] = data1?.data?.data?.contentItemSummaries ?? [];
      const syncTasks: Array<Promise<void>> = summaries.map(async (summary: ContentItemSummary) => {
        const contentItemId: string | undefined = summary?.contentItemId;
        newCaseIds.push(contentItemId);
        try {
          await syncSubScreenData(contentItemId);
          await syncContractorWithDatabase(contentItemId, 'Case');
          await syncPaymentsWithDatabase(contentItemId, 'Case');
          await syncInspectionWithDatabase(contentItemId, 'Case');
          await syncLocationWithDatabase(contentItemId, 'Case');
          await syncAllCaseFoldersFilesAPI(contentItemId, true);
        } catch (error) {
          recordCrashlyticsError(`Error syncing data for Case ID ${contentItemId}:`, error);
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
      } else if (newCaseIds.length > 0) {
        const rows = await fetchAllCasesFromDB();
        for (const row of rows || []) {
          if (!newCaseIds?.includes(row?.contentItemId)) {
            await deleteCaseFromDBIfNotFormTheApi(row?.contentItemId);
          }
        }
      } else {
        console.log('No more data to sync.');
      }
    }
  } catch (error) {
    recordCrashlyticsError('Critical error in myCaseAPICall:', error);
    console.error('Critical error in myCaseAPICall:', error);
  }
};
export const updateCaseIfIdExist = async (
  data: Partial<Case>,
  caseData: any,
  firstTime: boolean,
  isSync: boolean,
  isForceSync: boolean,
  shouldUpdateOnlyCaseData: boolean,
  isEdited: boolean,
  isEnableMultiline: boolean,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
  correlationId: string = '',
  apiChangeDateUtc: string = '',
): Promise<boolean> => {
  const { setFirstSync, setAllDataSync } = useUnifiedCaseStore.getState();
  try {
    if (!data.contentItemId) {
      console.warn('Missing contentItemId for case update.');
      return false;
    }

    const db = getDatabase();
    const resultSet = (await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE contentItemId = ?`,
      [data.contentItemId],
    )) as Case[];
    if (resultSet.length === 0) {
      console.log('No existing case found. Storing new case...');
      await storeCaseData(
        data,
        isEnableMultiline,
        isAllowEditCase,
        isAllowViewInspection,
        isPermission,
        isAllowAddAdminNotes,
      );
      return true;
    }

    const result = resultSet[0];

    if (firstTime) {
      if (result?.isEdited === 0 && result?.isForceSync === 0) {
        const resultDate = result?.modifiedUtc ? new Date(result.modifiedUtc) : null;
        const dataDate = data.modifiedUtc ? new Date(data.modifiedUtc) : null;

        const modifiedDateCondition =
          resultDate && dataDate && resultDate.getTime() < dataDate.getTime();
        const multilineCondition = result?.isEnableMultiline !== isEnableMultiline;
        if (modifiedDateCondition || multilineCondition) {
          console.log('Updating case based on modified date or multiline flag...');
          setFirstSync(true);
          setAllDataSync(1);

          await updateFatchCaseData(
            data,
            caseData,
            isSync,
            false,
            isForceSync,
            isEnableMultiline,
            isAllowEditCase,
            isAllowViewInspection,
            isPermission,
            isAllowAddAdminNotes,
          );
          return true;
        } else {
          console.log('Already synced');
        }
      } else if (isPermission) {
        await db.runAsync(`UPDATE ${TABLES.CASES} SET isPermission = ? WHERE contentItemId = ?`, [
          1,
          data.contentItemId,
        ]);
        return true;
      } else {
        await updateCasePermission(
          data,
          isAllowEditCase,
          isAllowViewInspection,
          isAllowAddAdminNotes,
        );
        return true;
      }
    } else if (shouldUpdateOnlyCaseData) {
      await updateOnlyCaseData(
        data,
        caseData,
        isEnableMultiline,
        isAllowEditCase,
        isAllowViewInspection,
        isPermission,
        isAllowAddAdminNotes,
        correlationId,
        apiChangeDateUtc,
      );
      return true;
    } else {
      await updateCaseData(
        data,
        isSync,
        isEdited,
        isForceSync,
        isEnableMultiline,
        isAllowEditCase,
        isAllowViewInspection,
        isPermission,
        isAllowAddAdminNotes,
        correlationId,
        apiChangeDateUtc,
        caseData,
      );

      return true;
    }
  } catch (error) {
    recordCrashlyticsError('Error updating case:', error);
    console.error('Error updating case:', error);
    return false;
  }
  // Ensure a boolean is always returned
  return false;
};

export const fetchCasesFromDB = async (
  filters?: DefaultAdvancedFiltersInterface,
  isSearch?: boolean,
): Promise<Case[]> => {
  const db = getDatabase();
  const userId = getUserRole();
  try {
    let query = `SELECT * FROM ${TABLES.CASES}`;
    const queryParams: any[] = [];

    if (isSearch && filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query += ` WHERE LOWER(displayText) LIKE ?`;
      queryParams.push(searchTerm);
    }

    const rows = (await db.getAllAsync(query, queryParams)) as Case[];

    const filteredRows = rows.filter(
      (row) =>
        (row.viewOnlyAssignUsers && row.assignedUsers?.includes(userId)) ||
        (!row.viewOnlyAssignUsers && row.assignedUsers?.includes(userId)),
    );

    return filteredRows;
  } catch (error) {
    recordCrashlyticsError('Error fetching cases:', error);
    console.error('Error fetching cases:', error);
    return [];
  }
};

export const fetchLocalCasebyId = async (caseId: string) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.CASES} WHERE contentItemId = ?`, [
      caseId,
    ]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case by ID:', error);
    console.error('Error fetching case by ID:', error);
    return null;
  }
};

export const fetchCaseSettingById = async (contentItemId: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE contentItemId = ?`,
      [contentItemId],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchCaseSettingById :', error);
    console.log('Error fetching case data from DB fetchCaseSettingById :', error);
    return [];
  }
};

// Force syncing concept

export const fetchCaseForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE isEdited = ? OR isForceSync = ? `,
      [1, 1],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchCaseForSyncScreen :', error);

    console.log('Error fetching case data from DB fetchCaseForSyncScreen :', error);
    return [];
  }
};

// Force sync Concept for setting sub screen
export const fetchCaseSettingForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE isEdited = ? OR isForceSync = ?`,
      [1, 1],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchCaseForSyncScreen :', error);

    console.log('Error fetching case data from DB fetchCaseForSyncScreen :', error);
    return [];
  }
};

// Force sync Concept for contact screen
export const fetchContactForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE isEdited = ? OR isForceSync = ? OR isNew = ?`,
      [1, 1, 1],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching data from DB fetchContactForSyncScreen :', error);

    console.log('Error fetching data from DB fetchContactForSyncScreen :', error);
    return [];
  }
};

export const fetchContactForSyncCaseLicense = async (isCase: 0 | 1) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} 
       WHERE (isEdited = ? OR isForceSync = ? OR isNew = ?) 
       AND isCase = ?`,
      [1, 1, 1, isCase],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching data from DB fetchContactForSyncScreen :', error);

    console.log('Error fetching data from DB fetchContactForSyncScreen :', error);
    return [];
  }
};

// Force sync Concept for contact screen
export const fetchAttachedDocsForSyncScreen = async (isCase: 0 | 1) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE isSync = ? AND isCase = ?`,
      [0, isCase],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching data from DB fetchAttachedDocsForSyncScreen :', error);

    console.log('Error fetching data from DB fetchAttachedDocsForSyncScreen :', error);
    return [];
  }
};

export const fetchAdminNotesItemForSyncScreen = async (isCase: 0 | 1) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
       WHERE (isEdited = ? OR isForceSync = ? OR isNewData = ?) 
       AND isCase = ? 
       AND isPublic = ?`,
      [1, 1, 1, isCase, 0],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchCaseSettingById :', error);

    console.log('Error fetching data from DB fetchAdminNotesItemForSyncScreen :', error);
    return [];
  }
};

export const fetchPublicCommentItemForSyncScreen = async (isCase: 0 | 1) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
       WHERE (isEdited = ? OR isForceSync = ? OR isNewData = ?) 
       AND isCase = ? 
       AND isPublic = ?`,
      [1, 1, 1, isCase, 1],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchCaseSettingById :', error);

    console.log('Error fetching data from DB fetchAdminNotesItemForSyncScreen :', error);
    return [];
  }
};
