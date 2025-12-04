import { TABLES } from '../DatabaseConstants';
import { URL } from '../../constants/url';
import { getDatabase } from '../DatabaseService';
import { GET_DATA } from '../../services/ApiClient';
import { getAccessToken, getBaseUrl } from '../../session/SessionManager';
import type { AdminNote } from './subScreenDAO';
import {
  insertInspectionRecord,
  storeAttachedItems,
  syncAdminNotesWithDatabase,
  syncCaseSettingsWithDatabase,
  syncContactItemWithDatabase,
  updateAttachedItems,
  updateInspectionRecord,
  updateLicenseDetailsIfExist,
  updateLicenseOwnerIfExist,
  updateLocationListIfExist,
} from './subScreenDAO';
import { updateContractorListIfExist, updatePaymentsIfIDExist } from '../sub-screens/subScreenDAO';
import { contactService } from '../../screens/sub-screens/contact-contract/ContactAndContractService';
import { updateAttachedDocsIfIDExist } from './attached-docs/attachedDocsDAO';
import type { InspectionData } from '../types/inpection';
import { OwnerService } from '../../screens/sub-screens/owner/OwnerService';
import { LicenseDetailsService } from '../../screens/sub-screens/license-details/LicenseDetailsService';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { isNetworkAvailable } from '../../utils/checkNetwork';

// Custom error class for sync operations
class SyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncError';
  }
}

export const syncSubScreenData = async (contentItemId: string): Promise<void> => {
  try {
    if (!isNetworkAvailable) {
      throw new SyncError('No internet connection or offline mode.');
    }

    const url = getBaseUrl();
    const token = getAccessToken();
    if (!url || !token) {
      throw new SyncError('Missing base URL or access token.');
    }

    const newURL = `${url}${URL.SUB_SCREEN_DATA_BY_CASEID}${contentItemId}`;
    const subScreensDetails = await GET_DATA({ url: newURL });

    if (!subScreensDetails?.status) {
      throw new SyncError(`API returned unsuccessful status: ${JSON.stringify(subScreensDetails)}`);
    }

    const adminComments = subScreensDetails?.data?.data?.screenModel?.adminComments;
    if (adminComments?.length > 0) {
      await syncAdminNotesWithDatabase(adminComments, true, contentItemId, false);
    }
    // Public Comments
    const publicComments = subScreensDetails?.data?.data?.screenModel?.publicComments;
    if (publicComments?.length > 0) {
      await syncAdminNotesWithDatabase(publicComments, true, contentItemId, false);
    }
    const attachedItems = subScreensDetails?.data?.data?.screenModel?.attachedItems;
    if (attachedItems?.length > 0) {
      await syncAttachedItemWithDatabase(
        attachedItems,
        true,
        contentItemId,
        //  false
      );
    }
    // For contact
    const contactItems = subScreensDetails?.data?.data?.screenModel?.responsibleParty;
    if (contactItems?.length > 0) {
      await syncContactItemWithDatabase(contactItems, true, contentItemId, false);
    }
    const caseSetting = subScreensDetails?.data?.data?.screenModel?.setting;
    if (caseSetting) {
      await syncCaseSettingsWithDatabase(caseSetting, contentItemId, false, false, false, true);
    }
    const caseAttachedDocs = subScreensDetails?.data?.data?.screenModel?.attachedDocs;
    if (caseAttachedDocs) {
      await updateAttachedDocsIfIDExist(caseAttachedDocs, true, contentItemId);
    }
  } catch (error) {
    recordCrashlyticsError('Error syncing admin notes:', error);
    throw new SyncError(
      `Error syncing admin notes: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const syncLicenseSubScreenData = async (contentItemId: string): Promise<void> => {
  try {
    if (!isNetworkAvailable) {
      throw new SyncError('No internet connection or offline mode.');
    }
    const url = getBaseUrl();
    const token = getAccessToken();
    if (!url || !token) {
      throw new SyncError('Missing base URL or access token.');
    }
    const newURL = `${url}${URL.SUB_SCREEN_DATA_BY_LICENSE_ID}${contentItemId}`;
    const subScreensDetails = await GET_DATA({ url: newURL });
    if (!subScreensDetails?.status) {
      throw new SyncError(`API returned unsuccessful status: ${JSON.stringify(subScreensDetails)}`);
    }
    // For contact
    const contactItems = subScreensDetails?.data?.data?.screenModel?.contactDetail;
    if (contactItems?.length > 0) {
      await syncContactItemWithDatabase(contactItems, false, contentItemId, false);
      // Fetch existing contacts from the database for this license
      // const localContacts = await getContactsByContentItemId(contentItemId);
      // const serverContactIds = contactItems
      //   .map((item) => item?.id)
      //   .filter(Boolean);
      // const localContactIds = localContacts
      //   .map((item) => item?.id)
      //   .filter(Boolean);
      // for (const localId of localContactIds) {
      //   if (!serverContactIds.includes(localId)) {
      //     await deleteContactById(localId);
      //   }
      // }
    }

    //For Attached docs
    const caseAttachedDocs = subScreensDetails?.data?.data?.screenModel?.attachedDocs;
    if (caseAttachedDocs) {
      await updateAttachedDocsIfIDExist(caseAttachedDocs, false, contentItemId);
    }

    //For Admin notes
    const adminComments = subScreensDetails?.data?.data?.screenModel?.adminComments;
    if (adminComments?.length > 0) {
      await syncAdminNotesWithDatabase(adminComments, false, contentItemId, false);
    }

    // For public Comments
    const publicComments = subScreensDetails?.data?.data?.screenModel?.publicComments;
    if (publicComments?.length > 0) {
      await syncAdminNotesWithDatabase(publicComments, false, contentItemId, false);
    }

    // For attached item
    const attachedItems = subScreensDetails?.data?.data?.screenModel?.attachedItems;
    if (attachedItems?.length > 0) {
      await syncAttachedItemWithDatabase(
        attachedItems,
        false,
        contentItemId,
        // false
      );
    }
  } catch (error) {
    recordCrashlyticsError('Error syncing admin notes:', error);
    throw new SyncError(
      `Error syncing admin notes: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchAdminAndPublicCommentsFromOffline = async (
  contentItemId: string,
  isPublic: boolean,
): Promise<AdminNote[]> => {
  const db = getDatabase();
  try {
    const comments = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      WHERE isPublic = ? AND id = ?`,
      [isPublic ? 1 : 0, contentItemId],
    );
    return comments as AdminNote[];
  } catch (error) {
    recordCrashlyticsError('Error fetching offline comments:', error);
    throw new SyncError(
      `Error fetching offline comments: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

//For the Attached Items

export const syncAttachedItemWithDatabase = async (
  data: any,
  isCase: boolean,
  id: string,
  //  isEdited: boolean
) => {
  try {
    const db = getDatabase();

    for (const item of data) {
      const result = await db.getAllAsync(
        `
        SELECT * FROM ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} 
        WHERE id = ?
      `,
        [item.contentItemId],
      );
      //   console.log("Existing attached item result:", result);
      if (result.length === 0) {
        await storeAttachedItems(item, isCase, id);
      } else {
        // const row = result[0] as { isEdited?: number };
        // if (!isEdited && row?.isEdited === 0) {
        await updateAttachedItems(item);
        // }
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error updating attached items:', error);
    console.error('Error updating attached items:', error);
    // Logging the error but not throwing it to avoid disrupting the flow
    return false;
  }
};

export const fetchAttachedItemsBYId = async (attachId: string) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} WHERE contentItemId = ?`,
      [attachId],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchAttachedItemsBYId :', error);
    console.log('Error fetching case data from DB fetchAttachedItemsBYId :', error);
  }
};

export const fetchAttachedItemsFromDB = async (caseId: any) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} WHERE contentItemId = ? AND isSync = ?`,
      [caseId, 0],
    );
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchAttachedItemsFromDB :', error);
    console.log('Error fetching case data from DB fetchAttachedItemsFromDB :', error);
  }
};
// sync contractor with data base
export const syncContractorWithDatabase = async (
  contentItemId: string,
  type: 'Case' | 'License',
): Promise<void> => {
  try {
    const data = await contactService.fetchContractors(contentItemId, type, isNetworkAvailable);
    for (const item of data) {
      await updateContractorListIfExist(item, type === 'Case', contentItemId);
    }
  } catch (error: unknown) {
    recordCrashlyticsError('Error in contractorDataAPICall for', error);
    console.error(`Error in contractorDataAPICall for ${type} ID ${contentItemId}:`, error);
  }
};

export const syncLicenseOwnerWithDatabase = async (
  contentItemId: string,
  type: 'Case' | 'License',
): Promise<void> => {
  try {
    const data = await OwnerService.fetchOwnerData(contentItemId, isNetworkAvailable);
    await updateLicenseOwnerIfExist(data, 'License', contentItemId);
  } catch (error: unknown) {
    console.error(`Error in syncLicenseOwnerWithDatabase for ${type} ID ${contentItemId}:`, error);
  }
};

export const syncLicenseDetailsDataWithDatabase = async (contentItemId: string): Promise<void> => {
  try {
    const data = await LicenseDetailsService.fetchLicenseData(contentItemId, isNetworkAvailable);
    await updateLicenseDetailsIfExist(data, 'License', contentItemId);
  } catch (error: unknown) {
    console.error(
      `Error in syncLicenseDetailsDataWithDatabase for License ID ${contentItemId}:`,
      error,
    );
  }
};

// sync Payment with data base
export const syncPaymentsWithDatabase = async (
  contentItemId: string,
  type: 'Case' | 'License',
): Promise<void> => {
  const url = getBaseUrl();
  const endpoint = `${url}${URL.PAYMENT_LIST}${
    type === 'Case' ? 'caseId=' : 'licenseId='
  }${contentItemId}`;
  const response = await GET_DATA({ url: endpoint });
  if (response?.status) {
    const { orders = [] } = response?.data?.data || {};
    for (const order of orders) {
      try {
        await updatePaymentsIfIDExist(order, true, contentItemId);
      } catch (orderError) {
        recordCrashlyticsError('Error updating payment for order', orderError);
        console.error(`Error updating payment for order ${order?.id || 'unknown'}:`, orderError);
      }
    }
  }
};

// sync Inspection with data base
export const syncInspectionWithDatabase = async (
  contentItemId: string,
  type: 'Case' | 'License',
): Promise<void> => {
  const url = getBaseUrl();
  const endpoint =
    type === 'Case'
      ? `${url}${URL.SYNC_CASE_INSPECTION_API}${contentItemId}`
      : `${url}${URL.SYNC_LICENSE_INSPECTION_API}${contentItemId}`;
  try {
    const response = await GET_DATA({ url: endpoint });
    if (response?.status) {
      const inspectionList = response?.data?.data || [];
      for (const inspection of inspectionList) {
        try {
          await upsertInspection(inspection);
        } catch (error) {
          recordCrashlyticsError(
            `Inspection update failed for inspection ID ${inspection?.id ?? 'unknown'}`,
            error,
          );
          console.error(
            `Inspection update failed for inspection ID ${inspection?.id ?? 'unknown'}`,
            error,
          );
        }
      }
    }
  } catch (err) {
    recordCrashlyticsError('Failed to sync inspection data:', err);
    console.error('Failed to sync inspection data:', err);
  }
};

export const syncLocationWithDatabase = async (
  contentItemId: string,
  type?: 'Case' | 'License',
): Promise<void> => {
  console.log(type);
  const url = getBaseUrl();
  try {
    const response = await GET_DATA({
      url: `${url}${URL.MULTI_LOCATION_LIST}${contentItemId}`,
    });
    if (response?.status) {
      const responseData = response?.data?.data || [];
      for (const item of responseData) {
        await updateLocationListIfExist(item);
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error in LocationDataAPI:---->>>', error);
    console.error('Error in LocationDataAPI:---->>>', error);
  }
};

export const upsertInspection = async (data: InspectionData) => {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync(
      `SELECT * FROM ${TABLES.INSPECTION_TABLE} WHERE contentItemId = ?`,
      data.contentItemId,
    );

    if (results.length === 0) {
      await insertInspectionRecord(data);
    } else {
      await updateInspectionRecord(data);
    }
  } catch (error) {
    recordCrashlyticsError('Failed to upsert inspection:', error);
    console.error('Failed to upsert inspection:', error);
  }
};

export const fetchAdminPublicComment = async (commentId: string) => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE contentItemId = ?`,
      [commentId],
    );
    if (rows.length !== 0) {
      return rows;
    }
  } catch (error) {
    recordCrashlyticsError('Failed to fetch admin public comment:', error);
    console.error('Failed to fetch admin public comment:', error);
  }
};

export const fetchAlertAdminNotes = async (caseLicenseId: string) => {
  try {
    const db = getDatabase();
    const _array = await db.getAllAsync(
      `SELECT * FROM  ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME}  WHERE comment_isAlert = ? AND isPublic = ? AND id = ? `,
      [1, 0, caseLicenseId],
    );
    return _array;
  } catch (error) {
    recordCrashlyticsError('Failed to fetch alert admin notes:', error);
    console.error('Failed to fetch alert admin notes:', error);
  }
};
