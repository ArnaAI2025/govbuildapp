import { TABLES } from '../../DatabaseConstants';
import { getDatabase } from '../../DatabaseService';
import { getNewUTCDate } from '../../../utils/helper/helpers';

export const fetchAttachedDocsFromDB = async (caseId: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} WHERE contentItemId = ?`,
      [caseId],
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchAttachedDocsFromDB :', error);
  }
};

export const fetchAttachedDocsFolderFilesFromDB = async (
  caseLicenseId: string,
  isCase: boolean,
) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCSFOLDER_FILES_TABLE_NAME} WHERE contentItemId = ? AND isCase = ?`,
      [caseLicenseId, isCase],
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchAttachedDocsFolderFilesFromDB :', error);
  }
};

export const fetchAttachedDocsOfflineFromDB = async (id: string, isCase: boolean) => {
  try {
    const db = await getDatabase();
    const column = isCase ? 'caseContentItemId' : 'licenseContentItemId';
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE ${column} = ? AND isCase = ?`,
      [id, isCase],
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchAttachedDocsOfflineFromDB:', error);
  }
};

export const fetchAttachedDocsByFolderID = async (
  caseLicenseId: string,
  isCase: boolean,
  folderId: number,
) => {
  try {
    console.log('fetchAttachedDocsByFolderID is Case ->', isCase);
    const idKey = isCase ? 'caseContentItemId' : 'licenseContentItemId';
    const db = await getDatabase();

    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE ${idKey} = ? AND isCase = ? AND parentFolderID = ?`,
      [caseLicenseId, isCase, folderId],
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchAttachedDocsByFolderID :', error);
  }
};

export const storeAttachedDocsFolderData = async (
  data: any,
  isCase: boolean,
  id: string,
  isNew: boolean,
) => {
  const db = await getDatabase();
  try {
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_DOCSFOLDER_FILES_TABLE_NAME}
            (contentItemId, isCase, AllFilesFoldersJSON, isSync, isForceSync, createdUtc, modifiedUtc, isNew, isEdited)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      id,
      isCase ?? 0,
      JSON.stringify(data),
      0, // isSync defaults to 0
      0, // isForceSync defaults to 0
      Date.now(), // createdUtc
      Date.now(), // modifiedUtc
      isNew ?? 0, // Check if isNew is undefined, default to 0
      0, // isEdited defaults to 0
    );
  } catch (error) {
    console.error('Error storing attached document folder data:', error?.message);
  }
};
export const updateAttachedDocsFoldersData = async (data: any, caseId: string) => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE  ${TABLES.CASE_DOCSFOLDER_FILES_TABLE_NAME}
            SET 
                AllFilesFoldersJSON = ?, 
                modifiedUtc = ? 
            WHERE contentItemId = ?`,
      [
        JSON.stringify(data ?? {}), // Default to an empty object if data is null or undefined
        Date.now(), // Always using the current timestamp
        caseId ?? '', // Ensure caseId is not null or undefined, default to empty string
      ],
    );
    console.log('Attched Docs folder file Updated');
  } catch (error) {
    console.error('Error updating attached document folders data:', error);
  }
};

export const storeDocToSync = async (
  data: any,
  isCase: boolean,
  caseID: string,
  id: string,
  dirPath: string,
  notInOffline: boolean,
  caseData: any,
) => {
  const db = await getDatabase();

  try {
    const utcDate = getNewUTCDate();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME}
            (caseContentItemId, id, isCase, parentFolderID, Isfolder, name, fileName, URL, details, documentType, 
            shortDescription, isShowonFE, caseStatus, createdUtc, modifiedUtc, localUrl, fileType, statusName, 
            documentTypeId, licenseContentItemId, DirPath, notInOffline) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      isCase ? caseID : '',
      id,
      isCase,
      data?.parentFolderID,
      data?.Isfolder,
      data?.name,
      data?.fileName,
      '',
      data?.details,
      data?.documentType,
      data?.shortDescription,
      data?.isShowonFE,
      data?.caseStatus,
      Date.now(),
      utcDate,
      data?.localUrl,
      data?.fileType,
      data?.statusName,
      data?.documentTypeId,
      isCase ? '' : caseID,
      dirPath,
      notInOffline,
    );

    if (notInOffline) {
      addCaseLicenseData(caseData, isCase);
    } else {
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      const timer = setTimeout(async () => {
        try {
          const result = await db.runAsync(
            `Update ${tableName} SET isSubScreenEdited=? WHERE contentItemId=?`,
            [1, caseID],
          );
          clearTimeout(timer);
          console.log('attached doc resukt', result);
        } catch (updateError) {
          console.error('Update error:', updateError);
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Error inserting document to sync:', error);
  }
};
export const addCaseLicenseData = async (caseData: any, isCase: boolean) => {
  try {
    const db = await getDatabase();
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    const statement = await db.prepareAsync(
      `INSERT INTO ${tableName} (caseName, number, displayText, contentItemId, isSubScreenEdited, notInOffline, isEdited) 
        VALUES (?,?,?,?,?,?,?)`,
    );
    await statement.executeAsync(
      caseData.caseName || caseData.licenseDescriptor,
      caseData.number || caseData.licenseNumber,
      caseData.displayText,
      caseData.contentItemId,
      1,
      1,
      1,
    );
  } catch (error) {
    console.log('Error fetching case data from DB addCaseLicenseData :', error);
  }
};

export const updateFileExtensionIfIDExist = async (data: any) => {
  try {
    const db = getDatabase();

    const resultSet = await db.getAllAsync(`SELECT * FROM ${TABLES.FILE_EXTENSION_TABLE_NAME}`);

    if (resultSet.length === 0) {
      await storeFileExtensionData(data);
    } else {
      await deleteFileExtension(data);
    }
  } catch (error) {
    console.error('Error updating file extension:', error);
  }
};

export const storeFileExtensionData = async (data: any) => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FILE_EXTENSION_TABLE_NAME} (data) VALUES (?)`,
    );

    await statement.executeAsync(data);
    console.log('File extension data stored successfully.');
  } catch (error) {
    console.error('Error storing file extension data:', error);
  }
};

export const deleteFileExtension = async (data: any) => {
  const db = getDatabase();
  db.runAsync(`DELETE FROM ${TABLES.FILE_EXTENSION_TABLE_NAME}`).then(() => {
    storeFileExtensionData(data);
  });
};

export const fetchFileExtensionData = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.FILE_EXTENSION_TABLE_NAME}`);
    return row;
  } catch (error) {
    console.error('Error fetching file extension data:', error);
    return [];
  }
};

//for the syncing
export const fetchAllDocDataToSync = async (caseID: string, isCase: boolean) => {
  try {
    const key = isCase ? 'caseContentItemId' : 'licenseContentItemId';
    const db = getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE ${key} = ? AND isSync = ?`,
      [caseID, 0],
    );
    return row;
  } catch (error) {
    console.error('Error fetching all doc data to sync:', error);
    return [];
  }
};

export const fetchDocByParentID = async (id: string) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE parentFolderID = ? AND isSync = ?`,
      [id, 0],
    );
    return row;
  } catch (error) {
    console.error('Error fetching doc by parent ID:', error);
    return [];
  }
};

export const deleteRowsByCaseID = async (caseID: string, isCase: boolean) => {
  try {
    const key = isCase ? 'caseContentItemId' : 'licenseContentItemId';
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    const db = getDatabase();
    await db.runAsync(`DELETE FROM ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} WHERE ${key} = ?`, [
      caseID,
    ]);
    await db.runAsync(`UPDATE ${tableName} SET isSubScreenEdited = ? WHERE contentItemId = ?`, [
      0,
      caseID,
    ]);
    console.log('Deleted attached docs after sync');
  } catch (error) {
    console.error('Error deleting rows by case ID:', error);
  }
};

export const updateSyncDocURL = async (url: string, id: string) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} SET URL = ? WHERE id = ?`,
      url,
      id,
    );
  } catch (error) {
    console.log('Error fetching case data from DB updateSyncDocURL :', error);
  }
};

export const updateSyncDocURLReady = async (isReady: boolean, id: string) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} SET isReadyToSync = ? WHERE id = ?`,
      [isReady === true ? 1 : 0, id],
    );
  } catch (error) {
    console.log('Error fetching case data from DB updateSyncDocURLReady :', error);
  }
};

export const updateDocURL = async (url: string, id: string) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_DOC_IMG_TABLE_NAME} SET url = ? WHERE id = ?`,
      url,
      id,
    );
  } catch (error) {
    console.log('Error fetching case data from DB updateDocURL :', error);
  }
};

export const updateDocURLReady = async (isReady: boolean, id: string) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_DOC_IMG_TABLE_NAME}  SET readyToSync = ? WHERE id = ?`,
      [isReady === true ? 1 : 0, id],
    );
  } catch (error) {
    console.log('Error fetching case data from DB updateDocURLReady :', error);
  }
};

export const updateAttachedDocsSyncStatus = async (
  isSync: boolean,
  isForceSync: boolean,
  id: string,
  isEdited: boolean,
) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_DOC_IMG_TABLE_NAME} SET isSync=?, isEdited=? WHERE id=?`,
      [isSync === true ? 1 : 0, isEdited === true ? 1 : 0, id],
    );
  } catch (error) {
    console.log('Error fetching case data from DB updateAttachedDocsSyncStatus :', error);
  }
};

export const updateAttachedisNewStatus = async (id: string, isNew: boolean, newID: string) => {
  try {
    const db = await getDatabase();

    const result = await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} 
             SET isNew = ?, id = ? 
             WHERE id = ?`,
      isNew === true ? 1 : 0, // New status
      newID, // New ID
      id, // Original ID
    );

    if (result.changes === 1) {
      console.log(`Record with ID ${id} updated successfully.`);
    } else {
      console.log(`No changes made for record with ID ${id}.`);
    }
  } catch (error) {
    console.error('Error updating attached status:', error);
  }
};

export const updateAttachedDocsIfIDExist = async (data: any, isCase: boolean, id: string) => {
  try {
    const db = await getDatabase();
    for (let i = 0; i < data?.length; i++) {
      const resultSet = await db.getAllAsync(
        `SELECT * FROM ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} WHERE id = ?`,
        [data[i]?.contentItemId],
      );

      if (resultSet?.length === 0) {
        await storeAttachedDocsData(data[i], isCase, id);
      } else {
        await updateAttachedDocsData(data[i], id);
      }
    }
  } catch (error) {
    console.error('Error updating attached documents:', error);
    // Logging the error to avoid disruptions
    return false;
  }
};

export const storeAttachedDocsData = async (data: any, isCase: boolean, id: string) => {
  const db = await getDatabase();
  try {
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} 
            (contentItemId, id, isCase, ePlanSoftDocumentId, url, fileName, isShowonFE, documentTypeId, documentType, caseStatus, details, isEdited, isNew)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      id,
      data?.contentItemId ?? null,
      isCase ?? 0,
      data?.ePlanSoftDocumentId ?? null,
      data?.url ?? null,
      data?.fileName ?? null,
      data?.isShowonFE ?? 0,
      data?.documentTypeId ?? null,
      data?.documentType ?? null,
      data?.caseStatus ?? null,
      data?.details ?? null,
      0, // isEdited defaults to 0
      0, // Check if isNew is null or undefined, set to 1 if not
    );
  } catch (error) {
    console.error('Error storing attached document data:', error.message);
  }
};

export const updateAttachedDocsData = async (data: any, id: string) => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} 
            SET 
                ePlanSoftDocumentId = ?, 
                url = ?, 
                fileName = ?, 
                isShowonFE = ?,  
                documentTypeId = ?, 
                documentType = ?, 
                caseStatus = ?, 
                details = ?, 
                isEdited = ? 
            WHERE id = ?`,
      [
        data?.ePlanSoftDocumentId ?? '', // Default to empty string if null or undefined
        data?.url ?? '',
        data?.fileName ?? '',
        data?.isShowonFE ?? 0, // Assuming 0 as a default value for boolean or number fields
        data?.documentTypeId ?? 0,
        data?.documentType ?? '',
        data?.caseStatus ?? '',
        data?.details ?? '',
        0, // Always setting isEdited to 0 as per your code
        id,
      ],
    );
  } catch (error) {
    console.error('Error updating attached document data:', error);
  }
};
