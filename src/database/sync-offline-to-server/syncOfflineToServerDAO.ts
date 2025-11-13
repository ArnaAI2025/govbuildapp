import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { logDbError, SyncError } from '../../utils/syncUtils';
import { AdminNoteSyncData, SettingsSyncData } from '../types/commonSyncModels';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
// Fetch cash count
// 1. Fetch Edited Cases Count
export const fetchCaseDataCount = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(`SELECT * FROM ${TABLES.CASES} WHERE isEdited = ?`, [1]);
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetchCaseDataCount:', error);

    logDbError('fetchCaseDataCount', error);
    return [];
  }
};

// fetchCaseToForceSync
export const fetchCaseToForceSync = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.CASES} WHERE isForceSync = ?`, [1]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error etching case data from DB fetchCaseToForceSync :------>:', error);

    console.log('Error fetching case data from DB fetchCaseToForceSync :------>', error);
    return [];
  }
};

export const fetchSettingToForceSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE isEdited = ? OR isForceSync = ?`,
      [1, 1],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchSettingToForceSync:', error);

    logDbError('fetchSettingToForceSync', error);
    return 0;
  }
};

export const fetchPermissionSyncFailCase = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE isEdited = ? AND isPermission = ? AND isForceSync = ?`,
      [1, 1, 0],
    );
    return row.length;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchPermissionSyncFailCase :', error);

    console.log('Error fetching case data from DB fetchPermissionSyncFailCase :', error);
  }
};

export const fetchPermissionSyncFailLicense = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LICENSE} WHERE isEdited = ? AND isPermission = ? AND isForceSync = ?`,
      [1, 1, 0],
    );
    return row.length;
  } catch (error) {
    recordCrashlyticsError(
      'Error fetching case data from DB fetchPermissionSyncFailLicense :',
      error,
    );

    console.log('Error fetching case data from DB fetchPermissionSyncFailLicense :', error);
  }
};

export const fetchPermissionSyncFailSetting = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE isEdited = ? AND isPermission=? AND isSync=?`,
      [1, 1, 0],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError(
      'Error fetching case data from DB fetchPermissionSyncFailSetting',
      error,
    );

    console.log('Error fetching case data from DB fetchPermissionSyncFailSetting :', error);
  }
};

// 2. Fetch Cases to Sync
export const fetchCaseSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE isEdited = ? AND isForceSync = ? AND isSync = ?`,
      [1, 0, 0],
    );
    console.log('Cases to sync:---->', rows);
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetchCaseSync:', error);

    logDbError('fetchCaseSync', error);
    return [];
  }
};

// 3. Fetch Case Sync Screen Count
export const fetchCaseForSyncScreenCount = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE isEdited = ? OR isForceSync = ?`,
      [1, 1],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchCaseForSyncScreenCount:', error);

    logDbError('fetchCaseForSyncScreenCount', error);
    return 0;
  }
};

// 5. Fetch Settings Count
export const fetchSettingSyncCount = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE isSync = ? AND isEdited = ? OR isForceSync = ?`,
      [0, 1, 1],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchSettingSyncCount:', error);

    logDbError('fetchSettingSyncCount', error);
    return 0;
  }
};

// 6. Fetch Comments Count
export const fetchAllCommentToSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE (isNewData = ? AND isSync = ?) OR isForceSync = ? OR isEdited > ?`,
      [1, 0, 1, 0],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchAllCommentToSync:', error);
    logDbError('fetchAllCommentToSync', error);
    return 0;
  }
};

// 7. Fetch Attachments Count
export const fetchEditAttachSyncCount = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} WHERE isSync = ? AND isUpdate = ?`,
      [0, 1],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchEditAttachSyncCount', error);
    logDbError('fetchEditAttachSyncCount', error);
    return 0;
  }
};

// Fetch All Contacts Count
export const fetchAllContactToSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE isEdited = ? AND isSync = ? OR isNew = ?`,
      [1, 0, 1],
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetchAllContactToSync', error);
    logDbError('fetchAllContactToSync', error);
    return 0;
  }
};

// 9. Fetch Contacts to Sync (Edited/New)
export const fetchContactsToSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE isEdited = ? OR isNew = ? AND isSync = ?`,
      [1, 1, 0],
    );
    console.log('contact offline--->>>>', rows);

    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetchContactsToSync:', error);
    logDbError('fetchContactsToSync', error);
    return [];
  }
};

// Fetch Contact Rows for Sync
// export const fetchContactsSync = async () => {
//   try {
//     const db = getDatabase();
//     const rows = await db.getAllAsync(
//       `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE isEdited = ? AND isForceSync = ? AND isSync = ?`,
//       [1, 0, 0]
//     );
//     console.log("Contacts to sync:", rows);
//     return rows;
//   } catch (error) {
//     logDbError("fetchContactsSync", error);
//     return [];
//   }
// };

// 9. Fetch Contacts to Sync count
export const fetchAllDocCountToSync = async () => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME}`);
    return row.length;
  } catch (error) {
    recordCrashlyticsError('Error fetching all doc count to sync:', error);
    console.error('Error fetching all doc count to sync:', error);
    return 0;
  }
};
export const fetchAttachmentDataForSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE isSync = ?`,
      [0],
    );

    // Group records by caseContentItemId or licenseContentItemId
    const groupedData: { [key: string]: any[] } = {};
    for (const row of rows) {
      const key = row?.caseContentItemId || row?.licenseContentItemId || '';
      if (key) {
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(row);
      }
    }

    // Create one task per case/license
    const tasks = Object.entries(groupedData).map(([key, records]) => ({
      caseId: key,
      isCase: records[0].caseContentItemId !== '',
      records,
    }));

    console.log('Grouped attachments to sync:', tasks);
    return tasks;
  } catch (error) {
    recordCrashlyticsError('Error fetchAttachmentDataForSync', error);
    logDbError('fetchAttachmentDataForSync', error);
    return [];
  }
};

export const fetchFormForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ?`,
      0,
    );
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchFormForSyncScreen :', error);
    console.log('Error fetching case data from DB fetchFormForSyncScreen :', error);
  }
};

export const fetchFormForSyncScreenCount = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ?`,
      0,
    );
    return rows.length;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchFormForSyncScreenCount :', error);
    console.log('Error fetching case data from DB fetchFormForSyncScreenCount :', error);
  }
};

// Fetch settings to sync
export const fetchSettingsToSync = async (): Promise<SettingsSyncData[]> => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE isEdited = ? AND isSync = ?`,
      [1, 0],
    );
    console.log('Settings to sync:', rows);
    return rows as SettingsSyncData[];
  } catch (error) {
    recordCrashlyticsError('Error fetching settings: ', error);
    console.error('Error fetching settings: ', error);
    throw new SyncError(
      `Error fetching settings: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchCaseAdminNotesToSync = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE isEdited > ? AND isSync = ? AND  isNewData = ?`,
      [0, 0, 1],
    );
    return rows;
  } catch (error) {
    recordCrashlyticsError('Admin notes to sync error::', error);
    console.log('Admin notes to sync error:', error);
  }
};

// Fetch admin notes to sync
// export const fetchAdminNotesToSync = async (): Promise<AdminNoteSyncData[]> => {
//   try {
//     const db = getDatabase();
//     const rows = await db.getAllAsync(
//       `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE isEdited = ? AND isSync = ?`,
//       [1, 0]
//     );
//     const notes = (rows as AdminNoteSyncData[]).map((row) =>
//       typeof row === "object" && row !== null
//         ? {
//             ...row,
//             isCase: !!row.isCase,
//             published: !!row.published,
//             latest: !!row.latest,
//             isPublic: !!row.isPublic,
//             comment_isAlert: !!row.comment_isAlert,
//             isEdited: !!row.isEdited,
//             isSync: !!row.isSync,
//             isForceSync: !!row.isForceSync,
//           }
//         : row
//     );
//     return notes;
//   } catch (error) {
//     console.error("Error fetching admin notes to sync:--->", error);
//     throw new SyncError(
//       `Error fetching admin notes: ${
//         error instanceof Error ? error.message : String(error)
//       }`
//     );
//   }
// };
export const fetchAdminNotesToSync = async (): Promise<AdminNoteSyncData[]> => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT n.*, f.attachment, f.fileName, f.localID
       FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} n
       LEFT JOIN ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} f
       ON n.contentItemId = f.localID
       WHERE n.isEdited = ? OR n.isNewData = ? AND n.isSync = ?`,
      [1, 1, 0],
    );
    const notes = (rows as AdminNoteSyncData[]).map((row) =>
      typeof row === 'object' && row !== null
        ? {
            ...row,
            isCase: !!row.isCase,
            published: !!row.published,
            latest: !!row.latest,
            isPublic: !!row.isPublic,
            comment_isAlert: !!row?.comment_isAlert,
            isEdited: !!row.isEdited,
            isSync: !!row.isSync,
            isForceSync: !!row.isForceSync,
          }
        : row,
    );
    console.log('Admin notes to sync:---->', notes);
    return notes;
  } catch (error) {
    recordCrashlyticsError('Error fetching admin notes: ', error);
    console.error('Error fetching admin notes: ', error);
    throw new SyncError(
      `Error fetching admin notes: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchSetAlertCommentToSync = async (): Promise<any> => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE isEdited = 1 AND isPublic = 0 AND comment_isAlert = 1`,
    );
    console.log('Raw rows count:', rows?.length);
    console.log('Alert comments to sync:', JSON.stringify(rows, null, 2));
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetching case data from DB fetchSetAlertCommentToSync :', error);
    console.log('Error fetching case data from DB fetchSetAlertCommentToSync :', error);
    return undefined;
  }
};

export const checkIfAlreadySynced = async (commentId: string): Promise<any> => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE isEdited = ? AND contentItemId = ?`,
      [0, commentId],
    );
    console.log('Comment already Synced:', rows);
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetching admin notes: ', error);
    console.error('Error fetching admin notes: ', error);
    throw new SyncError(
      `Error fetching admin notes: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Update settings sync status
export const updateSettingsSyncStatus = async (
  contentItemId: string,
  isEdited: boolean,
  isSync: boolean,
  isForceSync: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_SETTINGS_TABLE_NAME}
         SET isEdited = ?, isSync = ?, isForceSync = ?
         WHERE contentItemId = ?`,
      [isEdited ? 1 : 0, isSync ? 1 : 0, isForceSync ? 1 : 0, contentItemId],
    );
    // Update CASE_TABLE_NAME for consistency
    await db.runAsync(
      `UPDATE ${TABLES.CASES}
         SET isSubScreenEdited = ?
         WHERE contentItemId = ?`,
      [isEdited ? 1 : 0, contentItemId],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating settings status: ', error);
    throw new SyncError(
      `Error updating settings status: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Update admin notes sync status
export const updateAdminNotesSyncStatus = async (
  contentItemId: string,
  offlineId: string,
  caseAndLicenseId: string,
  isEdited: boolean,
  isSync: boolean,
  isForceSync: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME}
           SET contentItemId=?, isEdited = ?, isSync = ?, isForceSync = ?, isNewData=?
           WHERE contentItemId = ?`,
      [contentItemId, isEdited ? 1 : 0, isSync ? 1 : 0, isForceSync ? 1 : 0, 0, offlineId],
    );
    await db.runAsync(
      `UPDATE ${TABLES.CASES}
           SET isSubScreenEdited = ?
           WHERE contentItemId = ?`,
      [isEdited ? 1 : 0, caseAndLicenseId],
    );
    console.log(`Admin note sync status updated for id: ${offlineId}`);
  } catch (error) {
    recordCrashlyticsError('Error updating admin notes status: ', error);
    console.log(`Admin note NOTE sync status updated for id: ${offlineId}`);
    throw new SyncError(
      `Error updating admin notes status: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const updateAdminNotesAfterSetAsAlert = async (
  contentItemId: string,
  caseAndLicenseId: string,
  isEdited: boolean,
  isSync: boolean,
  isForceSync: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME}
           SET isEdited = ?, isSync = ?, isForceSync = ?
           WHERE contentItemId = ?`,
      [isEdited ? 1 : 0, isSync ? 1 : 0, isForceSync ? 1 : 0, contentItemId],
    );
    await db.runAsync(
      `UPDATE ${TABLES.CASES}
           SET isSubScreenEdited = ?
           WHERE contentItemId = ?`,
      [isEdited ? 1 : 0, caseAndLicenseId],
    );
    console.log(`Admin note sync status updated for id: ${contentItemId}`);
  } catch (error) {
    recordCrashlyticsError('Error updating admin notes status: ', error);
    console.log(`Admin note NOTE sync status updated for id: ${contentItemId}`);
    throw new SyncError(
      `Error updating admin notes status: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const deleteNotInOfflineAdminNotes = async (id: string): Promise<boolean> => {
  const db = getDatabase();

  try {
    const result = await db.runAsync(
      `DELETE FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE id = ? AND notInOffline = 1`,
      [id],
    );

    if (result?.changes && result.changes > 0) {
      console.log(`Admin note with ID ${id} deleted successfully.`);
      return true;
    } else {
      console.warn(`No admin note deleted for ID ${id} — it may not exist or notInOffline != 1.`);
      return false;
    }
  } catch (error) {
    recordCrashlyticsError(`Error deleting admin note with ID ${id}:`, error);
    console.error(
      `Error deleting admin note with ID ${id}:`,
      error instanceof Error ? error.message : String(error),
    );
    return false; // Explicit failure return
  }
};

// LICENSE
//1. Fetch license data to sync
export const fetchLicenseSync = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LICENSE} 
        WHERE isEdited=? AND isForceSync=? AND isSync=?`,
      [1, 0, 0],
    );
    console.log('License to sync:---->', row);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetchLicenseSync', error);
    logDbError('fetchLicenseSync', error);
    return [];
  }
};

// Fetch License that requires force sync
export const fetchLicenseToForceSync = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.LICENSE} WHERE isForceSync = ?`, [1]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching licenses to force sync:--->', error);
    console.error('Error fetching licenses to force sync:--->', error);
  }
};

// Count for license edit
export const fetchLicenseForSyncScreenCount = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LICENSE} WHERE isEdited = ? OR isForceSync = ?`,
      [1, 1],
    );
    // console.log("fetch license count----->>>>", row);
    return row.length;
  } catch (error) {
    recordCrashlyticsError(
      'Error fetching case data from DB fetchLicenseForSyncScreenCount :',
      error,
    );
    logDbError('fetchlicenseDataCount', error);
    console.log('Error fetching case data from DB fetchLicenseForSyncScreenCount :', error);
  }
};

// Attached Docs

export const fetchAttachmentSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE localUrl != ? AND Isfolder = ? AND isReadyToSync = ? AND isSync = ?`,
      ['', 0, 0, 0],
    );
    console.log('Attachments to sync:---->', rows);
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetchAttachmentSync', error);
    logDbError('fetchAttachmentSync', error);
    return [];
  }
};

export const fetchDocDataToSync = async () => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_DOC_IMG_TABLE_NAME} WHERE url != ? AND isSync = ? AND readyToSync = ?`,
      ['', 0, 1],
    );
    console.log('Attached documents to sync:---->', row);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching doc data to sync:', error);
    console.error('Error fetching doc data to sync:', error);
    logDbError('fetchDocDataToSync', error);
    return [];
  }
};

//Admin notes with the File

export const commentWithFileToUpload = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} WHERE localUrl != ? AND isSync = ?`,
      ['', 0],
    );
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetching comment files to upload:', error);
    console.error('Error fetching comment files to upload:', error);
    return [];
  }
};

export const updateCommentFileURL = async (url: string, id: string) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} SET attachment = ?, isSync = ? WHERE localID = ?`,
      [url, 1, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating comment file URL:', error);
    console.error('Error updating comment file URL:', error);
  }
};

export const updateCommentURLReady = async (isReady: boolean, id: string) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} SET readyToSync = ? WHERE localID = ?`,
      [isReady ? 1 : 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating comment URL ready status:', error);
    console.error('Error updating comment URL ready status:', error);
  }
};

export const deleteNotInOfflineAdminNotesFile = async (id: string) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `DELETE FROM ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} WHERE localID = ? AND notInOffline = 1`,
      [id],
    );
    console.log(`Admin note file with ID ${id} deleted successfully.`);
  } catch (error) {
    recordCrashlyticsError(`Error deleting admin note file with ID ${id}:`, error);
    console.error(`Error deleting admin note file with ID ${id}:`, error);
  }
};
