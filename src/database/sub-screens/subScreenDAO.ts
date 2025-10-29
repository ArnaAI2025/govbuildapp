import { getDatabase } from '../DatabaseService';
import { TABLES } from '../DatabaseConstants';
import { addCaseLicenseData } from '../my-case/myCaseDAO';
import { SyncModel } from '../../utils/interfaces/ISubScreens';
import { getNewUTCDate } from '../../utils/helper/helpers';

class SyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncError';
  }
}

// Interface for admin notes and public comments data
export const syncAdminNotesWithDatabase = async (
  adminNotes: AdminNote[],
  isCase: boolean,
  id: string,
  isEdited: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    for (const note of adminNotes) {
      const result = await db.getAllAsync(
        `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
        WHERE contentItemId = ?`,
        [note.contentItemId],
      );

      if (result.length === 0) {
        await storeAdminNote(note, isCase, id);
      } else {
        const row = result[0] as { isEdited?: number };
        if (!isEdited && row?.isEdited === 0) {
          await updateAdminNote(note);
        } else {
          // console.log("Record is edited-->", row);
        }
      }
    }
  } catch (error) {
    throw new SyncError(
      `Error syncing admin notes for ID ${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const fetchCaseSettingsDataFromDB = async (caseId: string) => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM  ${TABLES.CASE_SETTINGS_TABLE_NAME} WHERE contentItemId=?`,
      [caseId],
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.log('Error fetching case data from DB fetchCaseSettingsDataFromDB :', error);
  }
};

export const syncCaseSettingsWithDatabase = async (
  caseSetting: any,
  id: string,
  isEdited: boolean,
  isSync: boolean,
  isForceSync: boolean,
  isCase: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_SETTINGS_TABLE_NAME} 
        WHERE contentItemId = ?`,
      [id],
    );

    if (result.length === 0) {
      await storeSettings(caseSetting, isCase, id);
    } else {
      const row = result[0] as { isEdited?: number };
      if (isEdited) {
        await updateSettings(caseSetting, isEdited ?? false, isSync ?? false, isForceSync ?? false);
      } else if (!isEdited && row?.isEdited === 0) {
        await updateServerSettings(caseSetting);
      }
    }
  } catch (error) {
    throw new SyncError(
      `Error syncing admin notes for ID ${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const storeSettings = async (data: any, isCase: boolean, id: string) => {
  const db = getDatabase();

  try {
    // Prepare the SQL statement
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_SETTINGS_TABLE_NAME} 
            (contentItemId, isCase, permitIssuedDate, permitExpirationDate, viewOnlyAssignUsers, assignedUsers, assignAccess, isEdited, projectValuation, caseOwner) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    // Execute the SQL statement
    await statement.executeAsync(
      id,
      isCase,
      data?.permitIssuedDate ?? null,
      data?.permitExpirationDate ?? null,
      data?.viewOnlyAssignUsers ?? null,
      data?.assignedUsers ?? null,
      data?.assignAccess ?? null,
      0, // isEdited is set to 0 by default
      data?.projectValuation ?? null,
      data?.caseOwner ?? null,
    );
  } catch (error) {
    console.error(
      `Error storing settings data:`,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const updateServerSettings = async (data: any) => {
  const db = getDatabase();

  try {
    // Execute the SQL update statement
    await db.runAsync(
      `UPDATE ${TABLES.CASE_SETTINGS_TABLE_NAME}
            SET permitIssuedDate=?, permitExpirationDate=?, viewOnlyAssignUsers=?, assignedUsers=?, assignAccess=?, projectValuation=?, caseOwner=? 
            WHERE contentItemId=?`,
      [
        data?.permitIssuedDate ?? null,
        data?.permitExpirationDate ?? null,
        data?.viewOnlyAssignUsers ?? null,
        data?.assignedUsers ?? null,
        data?.assignAccess ?? null,
        data?.projectValuation ?? null,
        data?.caseOwner ?? null,
        data?.contentItemId,
      ],
    );
  } catch (error) {
    console.error(
      `Error updating server settings data:`,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const updateSettings = async (
  data: any,
  isEdited: boolean,
  isSync: boolean,
  isForceSync: boolean,
) => {
  const db = getDatabase();
  try {
    const modifiedUtc = getNewUTCDate();
    // First update the Case Settings
    await db.runAsync(
      `UPDATE ${TABLES.CASE_SETTINGS_TABLE_NAME}
            SET permitIssuedDate=?, permitExpirationDate=?, viewOnlyAssignUsers=?, assignedUsers=?, assignAccess=?, isEdited=?, isSync=?, isForceSync=?, projectValuation=?, caseOwner=?, modifiedUtc = ?
            WHERE contentItemId=?`,
      [
        data?.permitIssuedDate ?? null,
        data?.permitExpirationDate ?? null,
        data?.viewOnlyAssignUsers ? 1 : 0,
        data?.assignedUsers ?? null,
        data?.assignAccess ?? null,
        isEdited ?? 0,
        isSync ?? 0,
        isForceSync ?? 0,
        data?.projectValuation ?? null,
        data?.caseOwner ?? null,
        modifiedUtc,
        data?.contentItemId,
      ],
    );
    // Then update the Case Table for assigned users and permissions
    const updateaSet = await db.runAsync(
      `UPDATE ${TABLES.CASES}
            SET assignedUsers=?, viewOnlyAssignUsers=?, isSubScreenEdited=?
            WHERE contentItemId=?`,
      [data?.assignedUsers ?? null, data?.viewOnlyAssignUsers ? 1 : 0, 1, data?.contentItemId],
    );
    console.log('updateset', updateaSet);
  } catch (error) {
    console.error(
      `Error updating settings data:`,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export interface AdminNote {
  caseAndLicenseId: string | null;
  contentItemId: string;
  isCase: boolean;
  published?: boolean;
  latest?: boolean;
  contentType?: string;
  modifiedUtc?: string;
  publishedUtc?: string;
  createdUtc?: string;
  owner?: string;
  author?: string;
  displayText?: string;
  isPublic: boolean;
  commentIsAlert?: boolean;
  comment?: string;
  isEdited?: boolean;
  attachment?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  isNewData?: boolean;
  notInOffline?: boolean;
  correlationId?: string;
  apiChangeDateUtc?: string;
  isEdit?: boolean;
  isLocallyEdited?: boolean;
  comment_isAlert?: boolean;
  isFromPublicComment?: boolean;
  syncModel?: SyncModel | null;
}

// Custom error class for database operations
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Stores a new admin note in the database.
 * @param data - The admin note data.
 * @param isCase - Indicates if the note is for a case.
 * @param id - The unique ID for the note.
 */
export const storeAdminNote = async (
  data: AdminNote,
  isCase: boolean,
  id: string,
): Promise<void> => {
  const db = getDatabase();
  try {
    const statement = await db.prepareAsync(`
      INSERT INTO ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      (id, contentItemId, isCase, published, latest, contentType, modifiedUtc, publishedUtc, createdUtc, owner, author, displayText, isPublic, comment_isAlert, comment, isEdited, Attachment, FileName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync([
      id,
      data.contentItemId ?? '',
      isCase ? 1 : 0,
      data.published ? 1 : 0,
      data.latest ? 1 : 0,
      data.contentType ?? '',
      data.modifiedUtc ?? '',
      data.publishedUtc ?? '',
      data.createdUtc ?? '',
      data.owner ?? '',
      data.author ?? '',
      data.displayText ?? '',
      data.isPublic ? 1 : 0,
      data?.commentSubmissionPart?.IsAlert || 0,
      data?.commentSubmissionPart?.Comment ?? '',
      data.isEdited ? 1 : 0,
      data?.commentSubmissionPart?.Attachment ?? '',
      data?.commentSubmissionPart?.FileName ?? '',
    ]);
  } catch (error) {
    throw new DatabaseError(
      `Error inserting admin note: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Updates an existing admin note in the database.
 * @param data - The admin note data to update.
 */
export const updateAdminNote = async (data: AdminNote): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `
      UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME}
      SET published = ?, latest = ?, contentType = ?, modifiedUtc = ?, publishedUtc = ?, createdUtc = ?, owner = ?, author = ?, displayText = ?, isPublic = ?, comment_isAlert = ?, comment = ?, Attachment = ?, FileName = ?
      WHERE contentItemId = ?
    `,
      [
        data?.published ? 1 : 0,
        data?.latest ? 1 : 0,
        data?.contentType ?? '',
        data?.modifiedUtc ?? '',
        data?.publishedUtc ?? '',
        data?.createdUtc ?? '',
        data?.owner ?? '',
        data?.author ?? '',
        data?.displayText ?? '',
        data?.isPublic ? 1 : 0,
        data?.commentSubmissionPart?.IsAlert,
        data?.commentSubmissionPart?.Comment ?? '',
        data?.commentSubmissionPart?.Attachment ?? '',
        data?.commentSubmissionPart?.FileName ?? '',
        data.contentItemId,
      ],
    );
  } catch (error) {
    throw new DatabaseError(
      `Error updating admin note: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Updates or inserts a comment for an admin note.
 * @param data - The comment data.
 * @param isCase - Indicates if the note is for a case.
 * @param isPublic - Indicates if the comment is public.
 * @param notInOffline - Indicates if the data is not in offline mode.
 * @param correlationId - The correlation ID for syncing.
 * @param apiChangeDateUtc - The API change date in UTC.
 */
export const updateAdminNoteComment = async (
  data: AdminNote,
  isCase: boolean,
  isPublic: boolean,
  notInOffline: boolean,
  correlationId: string,
  apiChangeDateUtc: string,
): Promise<void> => {
  const db = getDatabase();
  try {
    const utcDate = getNewUTCDate();
    const statement = await db.prepareAsync(`
      INSERT INTO ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      (id, contentItemId, isCase, comment, isPublic, isNewData, isEdited, createdUtc, author, notInOffline, correlationId, ApiChangeDateUtc, isEdit, modifiedUtc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync([
      data?.caseAndLicenseId ?? null,
      data?.contentItemId ?? null,
      isCase ? 1 : 0,
      data.comment ?? '',
      isPublic ? 1 : 0,
      1, // isNewData
      1, // isEdited
      data.createdUtc ?? '',
      data.author ?? '',
      notInOffline ? 1 : 0,
      correlationId,
      apiChangeDateUtc,
      0, // isEdit
      utcDate,
    ]);

    // Update case or license table to mark as edited
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(
      `
      UPDATE ${tableName} 
      SET isSubScreenEdited = ? 
      WHERE contentItemId = ?
    `,
      [1, data?.caseAndLicenseId],
    );
  } catch (error) {
    throw new DatabaseError(
      `Error updating admin note comment: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

/**
 * Updates the alert status of an admin note.
 * @param data - The admin note data with alert status.
 * @param isCase - Indicates if the note is for a case.
 */
export const updateAdminNoteAlert = async (data: AdminNote, isCase: boolean): Promise<void> => {
  const db = getDatabase();
  try {
    const utcDate = getNewUTCDate();
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      SET comment_isAlert = ?, isEdited = ? , isEdit = ?, modifiedUtc = ?
      WHERE contentItemId = ?`,
      [data?.commentIsAlert ? 1 : 0, 1, 1, utcDate, data.contentItemId],
    );

    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(
      `UPDATE ${tableName} 
      SET isSubScreenEdited = ? 
      WHERE contentItemId = ?
    `,
      [1, data.caseAndLicenseId],
    );
    console.log('data.contentItemId --->', data.contentItemId);
    console.log('data.caseAndLicenseId --->', data.caseAndLicenseId);
    const updatedNote = db.getAllSync(
      `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE contentItemId = ?`,
      [data.contentItemId],
    );
    await db.execAsync(`COMMIT;`);
    console.log('Updated Note:', updatedNote);
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    throw new DatabaseError(
      `Error updating admin note alert: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Updates the public status of an admin note.
 * @param data - The admin note data with public status.
 * @param isCase - Indicates if the note is for a case.
 */
export const updateAdminNotePublic = async (data: AdminNote, isCase: boolean): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      SET isPublic = ?, isEdited = ? 
      WHERE contentItemId = ?`,
      [data.isPublic ? 1 : 0, 1, data.contentItemId],
    );
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(
      `UPDATE ${tableName} 
      SET isSubScreenEdited = ? 
      WHERE contentItemId = ?`,
      [1, data.caseAndLicenseId],
    );
  } catch (error) {
    throw new DatabaseError(
      `Error updating admin note public status: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const updateAdminNoteMakeAsPublic = async (
  contentItemId: string,
  isPublic: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
      SET isPublic = ?
      WHERE contentItemId = ?
    `,
      [isPublic ? 1 : 0, contentItemId],
    );
  } catch (error) {
    throw new DatabaseError(
      `Error updating admin note public status: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const storeAdminNotesWithDocsOffline = async (
  data: any,
  isCase: boolean,
  notInOffline: boolean,
  corrId: string,
  ApiChangeDateUtc: any,
  caseData: any,
) => {
  try {
    const db = await getDatabase();
    console.log('Storing admin notes offline with docs:--->', data);
    const statement = await db.prepareAsync(
      'INSERT INTO ' +
        TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME +
        ' ( localID , contentItemId, comment , isCase, attachment, fileName, fileType, localUrl, createdUtc, isSync, readyToSync, isPublic, notInOffline, correlationId, ApiChangeDateUtc) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    );
    await statement.executeAsync(
      data.contentItemId,
      data.caseAndLicenseId,
      data.comment,
      isCase,
      '', // Empty attachment
      data?.fileName,
      data?.fileType,
      data?.fileUrl,
      Date.now(), // Current timestamp
      0, // isSync
      0, // readyToSync
      data.isPublic,
      notInOffline ? 1 : 0, // Check for offline status
      corrId,
      ApiChangeDateUtc,
    );

    if (notInOffline) {
      await addCaseLicenseData(caseData, isCase);
    } else {
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(`Update ${tableName} SET isSubScreenEdited=? WHERE contentItemId=?`, [
        1,
        data.contentItemId,
      ]);
    }
  } catch (error) {
    console.error('Error storing admin notes offline:', error.message);
  }
};
export const updateAdminNotesWithDocs = async (
  data: any,
  isCase: boolean,
  isPublic: boolean,
  attachment: string | null,
  fileName: string | null,
  notInOffline: boolean,
  corrId: string,
  createdUtc: string,
  ApiChangeDateUtc: any,
  caseData: any,
) => {
  const db = await getDatabase();

  try {
    // Prepare and execute the insert statement
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
            (id, contentItemId, isCase, comment, isPublic, isNewData,isEdited, Attachment, FileName, notInOffline, isEdit, correlationId, ApiChangeDateUtc, createdUtc, author) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    await statement.executeAsync(
      data.caseId,
      data.contentItemId,
      isCase,
      data.comment,
      isPublic,
      1, // isNewData
      1, // isEdited
      attachment,
      fileName,
      notInOffline ? 1 : 0, // notInOffline
      0, // isEdit
      corrId,
      ApiChangeDateUtc,
      createdUtc,
      data?.author ?? '',
    );

    // If not in offline mode, update the sub-screen status for the case or license
    if (!notInOffline) {
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(
        `UPDATE ${tableName} 
                 SET isSubScreenEdited = ? 
                 WHERE contentItemId = ?`,
        [1, data.caseId],
      );
    } else {
      // Handle case or license data if in offline mode
      await addCaseLicenseData(caseData, isCase);
    }
  } catch (error) {
    console.error(
      `Error updating admin notes with attachment for contentItemId ${data.contentItemId}:`,
      error.message,
    );
  }
};
//AttachedItem

export const storeAttachedItems = async (data: any, isCase: boolean, id: string) => {
  try {
    const db = getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} 
        (contentItemId, id, title, isCase, author, contentType, createdUtc, displayLink, displayText, status, isShowFrontEnd, 
        isTurnOfftheSubmissionDetailsonPrint, lstAttachedItems, isEdited, submission) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );
    await statement.executeAsync(
      id,
      data.contentItemId,
      data.title,
      isCase,
      data.author,
      data.contentType,
      data.createdUtc,
      data.displayLink,
      data.displayText,
      data.status,
      data.isShowFrontEnd,
      data.isTurnOfftheSubmissionDetailsonPrint,
      data.lstAttachedItems,
      0,
      data.submission,
    );
  } catch (error) {
    throw new DatabaseError(
      `Error fetching case data from DB storeAttachedItemsData: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const updateAttachedItems = async (data: any) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME}
        SET title=?, author=?, contentType=?, createdUtc=?, displayLink=?, displayText=?, status=?, isShowFrontEnd=?, 
        isTurnOfftheSubmissionDetailsonPrint=?, lstAttachedItems=?, isEdited=?, submission=? WHERE id=?`,
      data.title,
      data.author,
      data.contentType,
      data.createdUtc,
      data.displayLink,
      data.displayText,
      data.status,
      data.isShowFrontEnd,
      data.isTurnOfftheSubmissionDetailsonPrint,
      data.lstAttachedItems,
      0,
      data.submission,
      data.contentItemId,
    );
  } catch (error) {
    throw new DatabaseError(
      `Error fetching case data from DB updateAttachedItemsData: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const storeSubmissionToAttachTable = async (data: any) => {
  try {
    const db = getDatabase();

    // Update the submission in the Case_Attached_Items_TABLE_NAME
    await db.runAsync(
      `Update ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME}
             SET statusText = ?, container = ?, submission = ?, protectedFields = ?
             WHERE id = ?`,
      data.statusText,
      data.container,
      data.submission,
      JSON.stringify(data.protectedFields), // Converting protectedFields to a JSON string
      data.submissionId,
    );
  } catch (error) {
    console.error('Error updating submission to attach table:', error);
  }
};

// Define type for contact data
interface ContactData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  mailingAddress?: string;
  caseOwner?: string;
  contactType?: string;
  businessName?: string;
  isAllowAccess?: boolean;
  isPrimary?: boolean;
  notes?: string;
  endDate?: string;
  [key: string]: any; // fallback for any other fields
}

// Update contact if exists
export const syncContactItemWithDatabase = async (
  data: ContactData[],
  isCase: boolean,
  id: string,
  isEdited: boolean,
): Promise<boolean> => {
  try {
    const db = await getDatabase();

    for (let i = 0; i < data.length; i++) {
      const resultSet = await db.getAllAsync(
        `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE id = ?`,
        [data[i].id],
      );

      if (resultSet.length === 0) {
        await storeContactData(data[i], isCase, id, 0, false);
      } else {
        const row = resultSet[0] as { isEdited?: number };
        if (!isEdited && row?.isEdited === 0) {
          await updateContactData(
            data[i],
            0,
            1,
            0,
            data[i].id,
            data[i].id,
            isCase,
            id,
            data[i].id,
            data[i].ApiChangeDateUtc,
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating contact: ----->>>>', error);
    return false;
  }
};

// Store contact in local DB
export const storeContactData = async (
  data: ContactData,
  isCase: boolean,
  id: string,
  isNew: number,
  notInOffline: boolean,
  corrId?: string,
  ApiChangeDateUtc?: string,
  caseData?: any,
): Promise<void> => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_CONTACT_TABLE_NAME}
        (id, contentItemId, isCase, firstName, lastName, email, phoneNumber, mailingAddress, caseOwner, isEdited, contactType, businessName, isAllowAccess, isPrimary, notes, endDate, isNew, notInOffline, correlationId, ApiChangeDateUtc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      data?.id ?? null,
      id ?? null,
      isCase ? 1 : 0,
      data?.firstName ?? null,
      data?.lastName ?? null,
      data?.email ?? null,
      data?.phoneNumber ?? null,
      data?.mailingAddress ?? null,
      data?.caseOwner ?? null,
      0,
      data?.contactType ?? null,
      data?.businessName ?? null,
      data?.isAllowAccess ? 1 : 0,
      data?.isPrimary ? 1 : 0,
      data?.notes ?? null,
      data?.endDate ?? null,
      isNew ?? 0,
      notInOffline ? 1 : 0,
      corrId ?? null,
      ApiChangeDateUtc ?? null,
    );

    // Post-insert actions
    if (isNew !== 0 && notInOffline !== true) {
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(`UPDATE ${tableName} SET isSubScreenEdited = ? WHERE contentItemId = ?`, [
        1,
        id,
      ]);
    } else if (isNew !== 0 && notInOffline) {
      addCaseLicenseData(caseData, isCase);
    }
  } catch (error: any) {
    console.error('Error storing contact data:', error.message);
  }
};

// Update contact record
export const updateContactData = async (
  data?: ContactData,
  isUpdate?: number,
  isSync?: number,
  isNew?: number,
  id?: string,
  newID?: string,
  isCase?: boolean,
  caseId?: string,
  corrId?: string,
  ApiChangeDateUtc?: string,
): Promise<void> => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} 
        SET id=?, firstName=?, lastName=?, email=?, phoneNumber=?, mailingAddress=?, caseOwner=?, contactType=?, 
        businessName=?, isAllowAccess=?, isPrimary=?, notes=?, endDate=?, isEdited=?, isSync=?, isNew=?, correlationId=?, 
        ApiChangeDateUtc=? WHERE id=?`,
      [
        newID,
        data?.firstName ?? null,
        data?.lastName ?? null,
        data?.email ?? null,
        data?.phoneNumber ?? null,
        data?.mailingAddress ?? null,
        data?.caseOwner ?? null,
        data?.contactType ?? null,
        data?.businessName ?? null,
        data?.isAllowAccess ? 1 : 0,
        data?.isPrimary ? 1 : 0,
        data?.notes ?? null,
        data?.endDate ?? null,
        isUpdate,
        isSync,
        isNew,
        corrId ?? null,
        ApiChangeDateUtc ?? null,
        id != null ? id : data?.id,
      ],
    );

    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(`UPDATE ${tableName} SET isSubScreenEdited=? WHERE contentItemId=?`, [
      isSync === 0 ? 1 : 0,
      caseId,
    ]);
  } catch (error: any) {
    console.error('Error updating contact data:', error.message);
  }
};

//Sync contact update data
export const updateContactDataSync = async (
  data: ContactData,
  id?: string,
  newID?: string,
  isCase?: boolean,
  caseId?: string,
) => {
  const db = await getDatabase();

  try {
    const result = await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} 
            SET id=?, firstName=?, lastName=?, email=?, phoneNumber=?,
             mailingAddress=?, caseOwner=?, contactType=?, businessName=?, 
            isAllowAccess=?, isPrimary=?, notes=?, endDate=?, isEdited=?, 
            isSync=?, isNew=?, isForceSync=? WHERE id=?`,
      [
        newID ?? '',
        data.firstName ?? '',
        data.lastName ?? '',
        data.email ?? '',
        data.phoneNumber ?? '',
        data.mailingAddress ?? '',
        data.caseOwner ?? '',
        data.contactType ?? '',
        data.businessName ?? '',
        data.isAllowAccess ?? 0,
        data.isPrimary ?? 0,
        data.notes ?? '',
        data.endDate ?? null,
        0, // isEdited
        1, // isSync
        0, // isNew
        0, // isForceSync
        id != null ? id : data.id,
      ],
    );
    if (result?.changes > 0) {
      console.log('Contact data updated successfully');
      // Update parent (case or license)
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(
        `UPDATE ${tableName} 
          SET isSubScreenEdited = ? WHERE contentItemId = ?`,
        [0, caseId ?? ''],
      );
    } else {
      console.warn('No contact data updated.');
    }
  } catch (error) {
    console.error('Error updating contact data sync:', error);
  }
};

// Fetch all local contacts for a given license/case
export const getContactsByContentItemId = async (contentItemId: string) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE contentItemId = ?`,
    [contentItemId],
  );
};

// Delete a contact by id
export const deleteContactById = async (id: string) => {
  const db = await getDatabase();
  return await db.runAsync(
    `DELETE FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE isSync=? AND isForceSync=? AND id = ?`,
    [0, 0, id],
  );
};

export const deleteNotInOfflineContact = async (contentItemId) => {
  const db = await getDatabase();
  try {
    await db.runAsync(`DELETE FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE contentItemId=?`, [
      contentItemId,
    ]);
    // await db.runAsync(
    //   `DELETE FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE contentItemId=? AND notInOffline=1`,
    //   [contentItemId]
    // );  //this is old code but not sure notInOffline why we used , if any resion please add this also
    console.log(`Contact with contentItemId ${contentItemId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting contact with contentItemId ${contentItemId}:`, error);
  }
};

export const updateContactDataForceSync = async (id) => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} 
            SET isForceSync=? 
            WHERE id=?`,
      [1, id], // Set isForceSync to 1
    );
  } catch (error) {
    console.error('Error updating contact force sync:', error);
  }
};
// Inspection Releated
export const fetchInspectionData = async (contentItemId: string, type: string) => {
  try {
    const db = getDatabase();
    const selectKey = type === 'Case' ? 'caseContentItemId = ?' : 'licenseContentItemId = ?';
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.INSPECTION_TABLE} WHERE ${selectKey}`,
      contentItemId,
    );
    return rows;
  } catch (error) {
    console.error('Error fetching inspection data:', error);
  }
};
export const insertInspectionRecord = async (data: any) => {
  try {
    const db = getDatabase();
    const statement = await db.prepareAsync(
      'INSERT INTO ' +
        TABLES.INSPECTION_TABLE +
        ' (appointmentDate , contentItemId , caseContentItemId  , caseNumber , endTime , licenseContentItemId ,  licenseNumber , location , preferredTime ,  scheduleWithName , startTime , status , statusLabel , subject ,type , appointmentStatus ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    );

    await statement.executeAsync(
      data?.appointmentDate,
      data?.contentItemId,
      data?.caseContentItemId,
      data?.caseNumber,
      data?.endTime,
      data?.licenseContentItemId,
      data?.licenseNumber,
      data?.location,
      data?.preferredTime,
      data?.scheduleWithName,
      data?.startTime,
      data?.status,
      data?.statusLabel,
      data?.subject,
      data?.type,
      data?.appointmentStatus,
    );
  } catch (error) {
    console.error('Error storing inspection data:', error);
  }
};
export const updateInspectionRecord = async (data: any) => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'Update ' +
        TABLES.INSPECTION_TABLE +
        ' SET appointmentDate =?,  caseContentItemId =? , caseNumber=? , endTime=? , licenseContentItemId =?,  licenseNumber =?, location =?, preferredTime =?,  scheduleWithName =?, startTime=? , status=?, statusLabel=? , subject =?,type =?, appointmentStatus=? WHERE contentItemId=?',
      data?.appointmentDate,
      data?.caseContentItemId,
      data?.caseNumber,
      data?.endTime,
      data?.licenseContentItemId,
      data?.licenseNumber,
      data?.location,
      data?.preferredTime,
      data?.scheduleWithName,
      data?.startTime,
      data?.status,
      data?.statusLabel,
      data?.subject,
      data?.type,
      data?.appointmentStatus,

      data?.contentItemId,
    );
  } catch (error) {
    console.error('Error updating inspection data:', error);
  }
};

export const fetchContactsDataByIdFromDB = async (id) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE id = ?`,
      [id],
    );
    return row;
  } catch (error) {
    console.log('Error fetching case data from DB fetchContactsDataByIdFromDB :', error);
  }
};

export const fetchContactsFromDB = async (caseLicenseId: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE contentItemId = ?`,
      [caseLicenseId],
    );
    return row;
  } catch (error) {
    console.log('Error fetching constact data from DB fetchContactsFromDB :', error);
  }
};

// Fetch Contractor data from the database by contentItemId or id
export const fetchContractorFromDb = async (caseLicenseId: string) => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTRACTS_TABLE_NAME} WHERE caseLicenseId = ?`,
      [caseLicenseId],
    );
    return rows;
  } catch (error) {
    console.error('Error fetching contractor data:----->', error);
  }
};

//Contractor section
export const fetchContractorToSync = async () => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTRACTS_TABLE_NAME} WHERE isEdited = ? OR isNew = ? AND isSync = ?`,
      [1, 1, 0],
    );
    return rows;
  } catch (error) {
    console.error('Error fetching contractors to sync:---->', error);
  }
};

export const updateContractorListIfExist = async (data, isCase, caseLicenseId) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_CONTRACTS_TABLE_NAME} WHERE id = ?`,
      data.id,
    );

    if (result?.length === 0) {
      await storeContractorData(data, isCase, caseLicenseId, 0, 0, false);
    } else {
      await updateContractorData(data, isCase, caseLicenseId, 1, 0);
    }
  } catch (error) {
    console.error('Error updating contractor list:', error);
  }
};

const storeContractorData = async (
  data,
  isCase,
  caseLicenseId,
  isNew,
  isEdited,
  notInOffline,
  corrId,
  ApiChangeDateUtc,
  caseData,
) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(`
            INSERT INTO ${TABLES.CASE_CONTRACTS_TABLE_NAME} 
            (applicantName, id, businessName, contractorId, documentId, email, endDate, 
            isAllowAccess, notes, number, phoneNumber, isCase, caseLicenseId, isNew, 
            isEdited, notInOffline, correlationId, ApiChangeDateUtc)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `);

    await statement.executeAsync(
      data.applicantName,
      data.id,
      data.businessName,
      data.contractorId,
      data.documentId,
      data.email,
      data.endDate,
      data.isAllowAccess,
      data.notes,
      data.number,
      data.phoneNumber,
      isCase,
      caseLicenseId,
      isNew,
      isEdited,
      notInOffline ? 1 : 0,
      corrId,
      ApiChangeDateUtc,
    );

    if (isNew !== 0 && !notInOffline) {
      const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(
        `UPDATE ${tableName} SET isSubScreenEdited = ? WHERE contentItemId = ?`,
        1,
        caseLicenseId,
      );
    } else if (isNew !== 0 && notInOffline) {
      await addCaseLicenseData(caseData, isCase);
    }
  } catch (error) {
    console.error('Error storing contractor data:', error);
    throw error;
  }
};

const updateContractorData = async (
  data,
  isCase,
  caseLicenseId,
  isSync,
  isEdited,
  corrId,
  ApiChangeDateUtc,
) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTRACTS_TABLE_NAME} 
             SET applicantName = ?, 
                 businessName = ?, 
                 contractorId = ?, 
                 documentId = ?, 
                 email = ?, 
                 endDate = ?, 
                 isAllowAccess = ?, 
                 notes = ?, 
                 number = ?, 
                 phoneNumber = ?, 
                 isCase = ?, 
                 isSync = ?, 
                 isEdited = ?, 
                 correlationId = ?, 
                 ApiChangeDateUtc = ? 
             WHERE id = ?`,
      [
        data.applicantName,
        data.businessName,
        data.contractorId,
        data.documentId,
        data.email,
        data.endDate,
        data.isAllowAccess,
        data.notes,
        data.number,
        data.phoneNumber,
        isCase,
        isSync,
        isEdited,
        corrId,
        ApiChangeDateUtc,
        data.id,
      ],
    );
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(
      `UPDATE ${tableName} 
             SET isSubScreenEdited = ? 
             WHERE contentItemId = ?`,
      [isSync === 0 ? 1 : 0, caseLicenseId],
    );
  } catch (error) {
    console.error('Error updating contractor data:', error);
  }
};

interface CaseOrLicenseData {
  contentItemId: string;
  [key: string]: any; // You can be more specific based on your caseData structure
}

export const AddNewContactInDb = async (
  data: any,
  isCase: number,
  caseLicenseId: string, // contentItemId (parent case/license id)
  isNew: number,
  notInOffline: boolean,
  corrId: string,
  ApiChangeDateUtc: string,
  caseData: CaseOrLicenseData,
) => {
  try {
    const db = getDatabase();
    const isNewFlag = isNew ? 1 : 0;
    const isEditedFlag = isNew ? 0 : 1;
    const utcDate = getNewUTCDate();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_CONTACT_TABLE_NAME}
        (
          id, contentItemId, isCase, firstName, lastName, email, phoneNumber,
          mailingAddress, caseOwner, isEdited, contactType, businessName,
          isAllowAccess, isPrimary, notes, endDate, isNew, notInOffline,
          correlationId, ApiChangeDateUtc , modifiedUtc
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync([
      data?.id?.toString() ?? null,
      caseLicenseId ?? null,
      isCase ? 1 : 0,
      data?.firstName ?? null,
      data?.lastName ?? null,
      data?.email ?? null,
      data?.phoneNumber ?? null,
      data?.mailingAddress ?? null,
      data?.caseOwner ?? null,
      isEditedFlag,
      data?.contactType ?? null,
      data?.businessName ?? null,
      data?.isAllowAccess ? 1 : 0,
      data?.isPrimary ? 1 : 0,
      data?.notes ?? null,
      data?.endDate ?? null,
      isNewFlag,
      notInOffline ? 1 : 0,
      corrId ?? null,
      ApiChangeDateUtc ?? null,
      utcDate,
    ]);

    // Verify the newly inserted row
    // const insertedRow = await db.getFirstAsync(
    //   `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE id = ?`,
    //    [data?.id?.toString()]
    // );
    // Update parent Case/License record if needed
    if (isNewFlag && !notInOffline) {
      const tablename = isCase ? TABLES.CASES : TABLES.LICENSE;
      await db.runAsync(`UPDATE ${tablename} SET isSubScreenEdited = ? WHERE contentItemId = ?`, [
        1,
        caseLicenseId,
      ]);
    } else if (isNewFlag && notInOffline) {
      await addCaseLicenseData(caseData, isCase);
    }

    return true;
  } catch (error: any) {
    console.error('Error storing contacts data offline:------>', error?.message);
    return false;
  }
};

export const UpdateContactInDb = async (
  data: any,
  isUpdate: boolean,
  isSync: boolean,
  //isNew: boolean,
  id: string | number,
  isCase: number,
  caseId: string,
  corrId: string,
  ApiChangeDateUtc: string,
) => {
  try {
    const db = getDatabase();
    const utcDate = getNewUTCDate();
    await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} 
        SET 
          firstName = ?, lastName = ?, email = ?, phoneNumber = ?, 
          mailingAddress = ?, caseOwner = ?, contactType = ?, businessName = ?, 
          isAllowAccess = ?, isPrimary = ?, notes = ?, endDate = ?, 
          isEdited = ?, isSync = ?,  correlationId = ?, 
          ApiChangeDateUtc = ? , modifiedUtc = ?
        WHERE id = ?`,
      [
        data?.firstName ?? null,
        data?.lastName ?? null,
        data?.email ?? null,
        data?.phoneNumber ?? null,
        data?.mailingAddress ?? null,
        data?.caseOwner ?? null,
        data?.contactType ?? null,
        data?.businessName ?? null,
        data?.isAllowAccess ? 1 : 0,
        data?.isPrimary ? 1 : 0,
        data?.notes ?? null,
        data?.endDate ?? null,
        isUpdate ? 1 : 0,
        isSync ? 1 : 0,
        corrId ?? null,
        ApiChangeDateUtc ?? null,
        utcDate,
        data.id,
      ],
    );
    // Verify inserted/updated data
    // const updatedRow = await db.getFirstAsync(
    //   `SELECT * FROM ${TABLES.CASE_CONTACT_TABLE_NAME} WHERE id = ?`,
    //   [data.id]
    // );

    // Update parent case/license sync flag
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;
    await db.runAsync(`UPDATE ${tableName} SET isSubScreenEdited = ? WHERE contentItemId = ?`, [
      isSync ? 0 : 1,
      caseId,
    ]);
    console.log('contact edit successfully.');

    return true;
  } catch (error) {
    console.error('Error updating contact in DB:', error?.message);
    return false;
  }
};

export const UpdateContactIdAfterSync = async (oldId: string, newId: string) => {
  try {
    const db = getDatabase();

    await db.runAsync(`UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} SET id = ? WHERE id = ?`, [
      newId,
      oldId,
    ]);
  } catch (error) {
    console.error('Error updating contact ID after sync:', error?.message);
  }
};

// For payment api call
export const updatePaymentsIfIDExist = async (data: any, isCase: boolean, id: string) => {
  try {
    const db = await getDatabase();
    const resultSet = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_PAYMENT_TABLE_NAME} WHERE contentItemId = ?`,
      [data?.contentItemId],
    );

    if (resultSet.length === 0) {
      await storePaymentData(data, isCase, id);
    } else {
      await updatePaymentData(data, id);
    }
  } catch (error) {
    console.error('Error updating payments:----->', error);
  }
};

// Fetch payments data from the database
export const fetchPaymentsFromDb = async (caseId: string) => {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_PAYMENT_TABLE_NAME} WHERE contentItemId = ?`,
      [caseId],
    );
    return rows;
  } catch (error) {
    console.log('Error fetching case data from DB fetchPaymentsFromDB :---->', error);
  }
};

const storePaymentData = async (data: any, isCase: boolean, id: string) => {
  const db = await getDatabase();
  try {
    const statement = await db.prepareAsync(
      `INSERT OR REPLACE INTO ${TABLES.CASE_PAYMENT_TABLE_NAME}
            (contentItemId, id, title, isCase, orderNumber, gatewayResponse, totalAmount, paymentStatus, transactionNumber, name, company, country, paymentUtc, paymentType, isEdited)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync(
      id,
      data?.contentItemId ?? null,
      data?.title ?? null,
      isCase ?? 0,
      data?.orderNumber ?? null,
      data?.gatewayResponse ?? null,
      data?.totalAmount ?? 0,
      data?.paymentStatus ?? null,
      data?.transactionNumber ?? null,
      data?.name ?? null,
      data?.company ?? null,
      data?.country ?? null,
      data?.paymentUtc ?? null,
      data?.paymentType ?? null,
      0,
    );
    console.log('Payment received successfully.');
  } catch (error) {
    console.error('Error storing payment data:', error?.message);
  }
};

const updatePaymentData = async (data: any, id: string) => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE ${TABLES.CASE_PAYMENT_TABLE_NAME} 
            SET 
                title = ?, 
                orderNumber = ?, 
                gatewayResponse = ?, 
                totalAmount = ?,  
                paymentStatus = ?, 
                transactionNumber = ?, 
                name = ?, 
                company = ?, 
                country = ?, 
                paymentUtc = ?, 
                paymentType = ? 
            WHERE id = ?`,
      [
        data.title ?? '',
        data.orderNumber ?? '',
        data.gatewayResponse ?? '',
        data.totalAmount ?? 0,
        data.paymentStatus ?? '',
        data.transactionNumber ?? '',
        data.name ?? '',
        data.company ?? '',
        data.country ?? '',
        data.paymentUtc ?? new Date().toISOString(),
        data.paymentType ?? '',
        id,
      ],
    );
    console.log('Payment data successfully updated.');
  } catch (error) {
    console.error('Error updating payment data:', error);
  }
};

// fetch data from location
export const fetchLocationData = async (caseId) => {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LOCATION} WHERE caseContentItemId = ?`,
      caseId,
    );
    console.log('rows----->>>', rows);

    return rows;
  } catch (error) {
    console.error('Error fetching location data:', error);
  }
};

export const updateLocationListIfExist = async (data) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM ${TABLES.LOCATION} WHERE contentItemId = ?`,
      data.contentItemId,
    );

    if (result.length === 0) {
      await storeLocationData(data);
    } else {
      await updateLocationData(data);
    }
  } catch (error) {
    console.error('Error updating or storing location data:', error);
  }
};
export const storeLocationData = async (data) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.LOCATION} 
         (contentItemId, caseContentItemId, address, parcelId, endDate, latitude, longitude) 
         VALUES (?,?,?,?,?,?,?)`,
    );

    await statement.executeAsync(
      data.contentItemId,
      data.caseContentItemId,
      data.address,
      data.parcelId,
      data.endDate,
      data.latitude,
      data.longitude,
    );
  } catch (error) {
    console.error('Error storing location data:', error);
  }
};
export const updateLocationData = async (data) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.LOCATION} 
         SET caseContentItemId = ?, address = ?, parcelId = ?, endDate = ?, latitude = ?, longitude = ?
         WHERE contentItemId = ?`,
      data.caseContentItemId,
      data.address,
      data.parcelId,
      data.endDate,
      data.latitude,
      data.longitude,
      data.contentItemId,
    );
  } catch (error) {
    console.error('Error updating location data:', error);
  }
};
