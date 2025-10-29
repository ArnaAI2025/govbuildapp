import { getNewUTCDate } from '../../../utils/helper/helpers';
import { TABLES } from '../../DatabaseConstants';
import { getDatabase } from '../../DatabaseService';

export const fetchAddFormListFromDB = async () => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.ADDFORM_TABLE_NAME}`);
    return row;
  } catch (error) {
    console.error('Error fetching AddForm list from DB:', error);
    return [];
  }
};

export const storeAddFormDataNew = async (
  data: any,
  Submission: any,
  owner: string,
  imgIds,
  caseId,
  licenseId,
  isDraft,
  gridIds,
  CaseName,
  localId,
  fileArray,
) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.ADDFORM_DATA_TABLE_NAME} 
            (id, DisplayText, title, ContentType, Submission, CreatedUtc, Owner, isEdited, isSync, isForceSync, 
            imageids, caseId, licenseId, isDraft, readyToSync, gridIds, caseNumber, localId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const result = await statement.executeAsync(
      data.id,
      data.DisplayText,
      data.DisplayText,
      data.ContentType,
      Submission,
      getNewUTCDate(),
      owner,
      0, // isEdited
      0, // isSync
      0, // isForceSync
      imgIds,
      caseId,
      licenseId,
      isDraft,
      imgIds !== '' ? 0 : 1, // readyToSync
      gridIds,
      CaseName,
      localId,
    );

    if (result.changes === 1) {
      if (fileArray && fileArray.length > 0) {
        for (const element of fileArray) {
          await storeFormIOImageDataNew(element, localId);
        }
      }
      return true;
    } else {
      console.error('Data save failed.');
      return false;
    }
  } catch (error) {
    console.error('Error saving form data:', error);
    return false;
  }
};

export const storeFormIOImageDataNew = async (data, formId) => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FORMIO_IMAGE_DATA} 
            (id, FormId, key, label, validate_required, localUrl, assureUrl, isSync, isForceSync, isDataGrid, gridKey, count, condition, isCustomCondition, isMultiple, filePattern) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const result = await statement.executeAsync(
      data.id,
      formId,
      data.key,
      data.label,
      data.validate_required,
      '',
      '',
      0,
      0,
      data.isDataGrid,
      data.gridKey,
      data.count,
      data.condition || '',
      data.customConditional !== undefined ? data.customConditional : false,
      data.isMultiple,
      data.filePattern,
    );

    if (result.changes !== 1) {
      console.error('Data save failed, please try again..');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error storing FormIO image data:', error);
  }
};

export const storeItemToAttachTable = async (
  data,
  id,
  owner,
  imgIds,
  caseId,
  licenseId,
  isDraft,
  customJSON,
  submission,
) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME}
            (contentItemId, id, title, isCase, author, contentType, createdUtc, displayText, status, 
            isEdited, isSync, isForceSync, modifiedUtc, submission, container) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      caseId !== '' ? caseId : licenseId,
      id,
      data.DisplayText,
      caseId !== '' ? 1 : 0, // isCase
      owner,
      '', // contentType is empty
      getNewUTCDate(), // createdUtc
      data.DisplayText,
      '', // status is empty
      1, // isEdited
      0, // isSync
      0, // isForceSync
      getNewUTCDate(), // modifiedUtc
      submission,
      customJSON,
    );

    const tableName = caseId !== '' ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(
      `
      UPDATE ${tableName} 
      SET isSubScreenEdited = ? 
      WHERE contentItemId = ?
    `,
      [1, data?.caseAndLicenseId],
    );
  } catch (error) {
    console.error('Error inserting into Case_Attached_Items_TABLE_NAME:', error);
  }
};

//Releted to the form IO
export const fetchFormioImgswithLocalID = async (id: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORMIO_IMAGE_DATA} WHERE FormId = ?`,
      id,
    );
    return row;
  } catch (error) {
    console.error('Error fetching FormIO images with local ID:', error);
    return [];
  }
};

export const fetchFromFileById = async (id: string) => {
  try {
    const db = await getDatabase();

    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_FILE_TABLE} WHERE fileId = ?`, [
      id,
    ]);

    return row; // Return the fetched row
  } catch (error) {
    console.error('Error fetching form file by ID:', error?.message);
  }
};

export const updateIsDraftAddFormData = async (id: string) => {
  try {
    const db = await getDatabase();

    const result = await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET isDraft=? WHERE localId=?`,
      true,
      id,
    );

    if (result.changes !== 1) {
      console.error('Failed to update draft status.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating draft status:', error);
    return false;
  }
};

export const storeFormFiles = async (data: any) => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FORM_FILE_TABLE} (fileId, localFilePath, formId, mimeType, name) VALUES (?, ?, ?, ?, ?)`,
    );

    if (!statement) {
      throw new Error('Failed to prepare SQL statement.');
    }

    await statement.executeAsync(
      data?.fileId ?? null,
      data?.localUrl ?? null,
      data?.formId ?? null,
      data?.mimeType ?? null,
      data?.name ?? null,
    );
  } catch (error) {
    console.error('Error storing form file:', error.message);
  }
};

export const storeFormFilesForSync = async (data: any) => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FORM_FILE_TABLE} (fileId, localFilePath, formId, mimeType, name, isSync) VALUES (?, ?, ?, ?, ?, ?)`,
    );

    if (!statement) {
      throw new Error('Failed to prepare SQL statement.');
    }

    await statement.executeAsync(
      data?.fileId ?? null,
      data?.localUrl ?? null,
      data?.formId ?? null,
      data?.mimeType ?? null,
      data?.name ?? null,
      1, // isSync is set to 1 if isSync is true
    );
  } catch (error) {
    console.error('Error storing form file:', error.message);
  }
};
export const fetchForIoImgsWithLocalKey = async (key: any, id: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORMIO_IMAGE_DATA} WHERE key = ? AND FormId = ?`,
      key,
      id,
    );
    return row;
  } catch (error) {
    console.error('Error fetching FormIO images with local key:', error);
    return [];
  }
};
export const updateFormFileIfExist = async (id: string, object: any) => {
  try {
    const db = await getDatabase();
    const resultSet = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORM_FILE_TABLE} WHERE fileId = ?`,
      id,
    );

    if (resultSet.length === 0) {
      await storeFormFiles(object);
    } else {
      await updateFormFile(object);
    }
  } catch (err) {
    console.error('Error updating or storing form file:', err);
  }
};

export const updateFormFile = async (data: any) => {
  try {
    const db = await getDatabase();

    const result = await db.runAsync(
      `UPDATE ${TABLES.FORM_FILE_TABLE}
             SET localFilePath = ?, mimeType = ?, name = ?, isSync = ? 
             WHERE fileId = ?`,
      [
        data?.localUrl ?? null,
        data?.mimeType ?? null,
        data?.name ?? null,
        0, // Assuming isSync is always set to 0
        data?.fileId ?? null,
      ],
    );

    return result;
  } catch (error) {
    console.error('Error updating form file:', error.message);
  }
};

// Syncing

export const fetchFromFileDB = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_FILE_TABLE} WHERE isSync = ?`, [
      0,
    ]);
    return rows;
  } catch (error) {
    console.error('Error fetching from file DB:', error);
    return [];
  }
};

export const fetchAllFormData1 = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ? AND readyToSync = ? AND startSyncing = ?`,
      [0, 1, 0],
    );
    for (const row of rows) {
      await updateAddFormStartSync(true, row?.localId);
    }
    return rows;
  } catch (error) {
    console.error('Error fetching form data:', error);
    return [];
  }
};

export const fetchAllFormDataJSON = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ?`,
      [0],
    );
    console.log('form sync data---->', rows);
    return rows;
  } catch (error) {
    console.error('Error fetching form data from DB fetchAllFormDataJSON:', error);

    return [];
  }
};
export const fetchFormDataJSONById = async (localId: string) => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ? AND readyToSync = ? AND localId = ?`,
      [0, 1, localId],
    );
    console.log('form sync data---->', rows);
    return rows;
  } catch (error) {
    console.error('Error fetching form data from DB fetchAllFormDataJSON:', error);

    return [];
  }
};

export const fetchAllEditedFormData = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} WHERE isUpdate = ?`,
      [1],
    );
    for (const row of rows) {
      await updateEditedFormStartSync(true, row?.id);
    }
    return rows;
  } catch (error) {
    console.error('Error fetching edited form data:', error);
    return [];
  }
};
export const fetchAllEditedAdvancedFormData = async () => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isUpdate = ? AND readyToSync = ?`,
      [1, 1],
    );
    for (const row of rows) {
      await updateEditedFormStartSync(true, row?.id);
    }
    return rows;
  } catch (error) {
    console.error('Error fetching edited form data:', error);
    return [];
  }
};

export const updateFormImageAssureURL = async (url: string, id: number) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.FORM_FILE_TABLE} SET assureFileUrl = ?, isSync = ? WHERE id = ?`,
      [url, 1, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating Assure URL:', error);
    return false;
  }
};
export const updateSubmissionJSON = async (json: string, id: string, isLast: boolean) => {
  if (!json || !id) {
    console.error('Invalid input: JSON or id is missing.');
    return false;
  }
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME}  SET Submission = ? WHERE localId = ?`,
      [json, id],
    );
    if (isLast) {
      await updateReadyToSyncJSON(id, 1);
    }
    return true;
  } catch (error) {
    console.error('Error updating submission JSON:', error);
    return false;
  }
};

export const updateEditSubmissionJSON = async (json: string, id: string, isLast: boolean) => {
  if (!json || !id) {
    console.error('Invalid input: JSON or id is missing.');
    return false;
  }
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME}SET updatedSubmission = ? WHERE id = ?`,
      [json, id],
    );
    if (isLast) {
      await updateReadyToUpdateJSON(id, 1);
    }
    return true;
  } catch (error) {
    console.error('Error updating edited submission JSON:', error);
    return false;
  }
};

export const updateReadyToSyncJSON = async (id: string, readyToSync: number) => {
  if (!id) {
    console.error('Invalid input: id is missing.');
    return false;
  }
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET readyToSync = ? WHERE localId = ?`,
      [readyToSync, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating readyToSync:', error);
    return false;
  }
};

export const updateReadyToUpdateJSON = async (id: string, readyToSync: number) => {
  if (!id) {
    console.error('Invalid input: id is missing.');
    return false;
  }
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} SET readyToSync = ? WHERE id = ?`,
      [readyToSync, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating readyToSync for edited form:', error);
    return false;
  }
};

export const updateAddFormStartSync = async (startSyncing: boolean, id: string) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET startSyncing = ? WHERE localId = ?`,
      [startSyncing ? 1 : 0, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating startSyncing for form:', error);
    return false;
  }
};

export const updateEditedFormStartSync = async (startSyncing: boolean, id: string) => {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} SET startSyncing = ? WHERE id = ?`,
      [startSyncing ? 1 : 0, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating startSyncing for edited form:', error);
    return false;
  }
};

export const updateEditedFormSyncStatus = async (
  id: string,
  isUpdate: number,
  readyToSync: number,
  //isCase: boolean,
  //contentItemId: string
) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} SET isUpdate = ?, readyToSync = ?, startSyncing = ? WHERE id = ?`,
      [isUpdate, readyToSync, 0, id],
    );
    return result.changes === 1;
  } catch (error) {
    console.error('Error updating edited form sync status:', error);
    return false;
  }
};

export const fetchFormioFileData = async (id: string) => {
  if (!id) {
    console.error('Invalid input: fileId is missing.');
    return null;
  }
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORM_FILE_TABLE} WHERE fileId = ? AND isSync = ?`,
      [id, 1],
    );
    return row;
  } catch (error) {
    console.error('Error fetching file data:', error);
    return null;
  }
};

export const deleteImageFormId = async (id: string) => {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM ${TABLES.FORMIO_IMAGE_DATA} WHERE FormId = ?`, [id]);
    await db.runAsync(`DELETE FROM ${TABLES.FORM_FILE_TABLE} WHERE formId = ?`, [id]);
  } catch (error) {
    console.error('Error deleting image by FormId:', error);
  }
};

export const deleteImageKeyAndFormId = async (id: string, key: any) => {
  try {
    const db = await getDatabase();

    await db.runAsync(`DELETE FROM  ${TABLES.FORMIO_IMAGE_DATA} WHERE key = ? AND FormId = ?`, [
      key,
      id,
    ]);
  } catch (error) {
    console.error('Error deleting image by ID:', error.message);
  }
};

export const storeAddFormCaseLicenceAttach = async (
  formId: string,
  caseId: string,
  licenseId: string,
  itemText: string,
) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.ADDFORM_CASELICENSE_ATTACH_TABLE_NAME} (formId, caseId, licenseId, itemText) VALUES (?, ?, ?, ?)`,
    );
    await statement.executeAsync(formId, caseId, licenseId, itemText);
  } catch (error) {
    console.error('Error inserting form case license attach:', error);
  }
};

export const updateFormReadyToSync = async (formId: string) => {
  try {
    const db = await getDatabase();
    const files = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORM_FILE_TABLE} WHERE formId = ? AND isSync = ?`,
      [formId, 0],
    );
    if (files.length === 0) {
      await db.runAsync(
        `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET readyToSync = ? WHERE localId = ?`,
        [1, formId],
      );
      console.log('Marked form ready to sync:', formId);
    }
  } catch (error) {
    console.error('Error updating form readyToSync:', error);
  }
};

export const storeEditSubmissionToAttachTable = async (
  submission,
  id,
  isEdited,
  imageIds,
  caseId,
  isCase,
  fileArray,
) => {
  try {
    const db = await getDatabase();

    // Update Case_Attached_Items_TABLE_NAME with the new submission data
    await db.runAsync(
      `Update ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} 
             SET updatedSubmission = ?, isUpdate = ?, imageIds = ? 
             WHERE id = ?`,
      submission,
      isEdited, // isEdited === 1 ? 0 : 1,
      imageIds,
      id,
    );

    // If there are files, store each one
    if (fileArray && fileArray.length > 0) {
      for (const file of fileArray) {
        await storeFormIOImageDataNew(file, id);
      }
    }

    // Handle additional updates based on isEdited
    if (isEdited === 1) {
      await db.runAsync(
        `Update ${TABLES.ADDFORM_DATA_TABLE_NAME} 
                 SET Submission = ? 
                 WHERE localId = ?`,
        submission,
        id,
      );
    } else {
      const tableName = isCase === 1 ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(
        `Update ${tableName} 
                 SET isSubScreenEdited = ? 
                 WHERE contentItemId = ?`,
        1,
        caseId,
      );
    }

    return true;
  } catch (error) {
    console.error('Error updating submission in attach table:', error);
    return false;
  }
};

// Force sync
export const fetchFormForSyncScreen = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE isSync = ?`,
      0,
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchFormForSyncScreen :', error);
  }
};

export const fetchFormForByLocalId = async (localId: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM  ${TABLES.ADDFORM_DATA_TABLE_NAME} WHERE localId = ?`,
      localId,
    );
    return row; // Return the result directly
  } catch (err) {
    console.error('Error fetching form by local ID:', err);
    return null; // Return null or handle as per your needs
  }
};

export const getFormListById = async (id: string) => {
  try {
    // TABLES.ADDFORM_TABLE_NAME
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.ADDFORM_TABLE_NAME} WHERE id = ?`,
      id,
    );
    return rows; // Return the retrieved rows
  } catch (err) {
    console.log('error', err);
    return []; // Return an empty array in case of an error
  }
};

export const updateFormAfterSync = async (id: string, localId: string) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE "${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME}" SET "id" = ? WHERE "id" = ?`,
      [id, localId],
    );
    return true;
  } catch (error) {
    console.error('Error updating edited submission JSON:', error);
    return false;
  }
};
