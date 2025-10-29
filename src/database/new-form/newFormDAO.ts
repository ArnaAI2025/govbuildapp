import { getNewUTCDate } from '../../utils/helper/helpers';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { storeFormIOImageDataNew } from '../sub-screens/attached-items/attachedItemsDAO';

// Utility: delay function
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchNewAdvancedFormListFromDB = async (
  pageNo: number = 1,
  pageSize: number = 10,
  searchValue?: string,
  selectedTypeId?: string | null,
  selectedTagId?: string | null,
) => {
  try {
    const db = getDatabase();
    const offset = (pageNo - 1) * pageSize;

    let query = `SELECT * FROM ${TABLES.ADDFORM_TABLE_NAME}`;
    let conditions: string[] = [];
    let params: any[] = [];

    // Search filter (case-insensitive)
    if (searchValue && searchValue.trim() !== '') {
      conditions.push(`DisplayText COLLATE NOCASE LIKE ?`);
      params.push(`%${searchValue}%`);
    }

    // Type filter (cast to text to avoid mismatch)
    if (selectedTypeId && selectedTypeId.trim() !== '') {
      conditions.push(`CAST(type AS TEXT) = ?`);
      params.push(selectedTypeId);
    }

    // Tag filter (supports partial match if multiple tags stored)
    if (selectedTagId && selectedTagId.trim() !== '') {
      conditions.push(`tag LIKE ?`);
      params.push(`%${selectedTagId}%`);
    }

    // Add WHERE if needed
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const rows = await db.getAllAsync(query, params);

    // Artificial delay for UX consistency
    await wait(800);

    return rows;
  } catch (error) {
    console.error('Error fetching AddForm list from DB:', error);
    return [];
  }
};

export const fetchFormFilterTypes = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_TYPES_TABLE}`);
    return row;
  } catch (error) {
    console.error('Error fetching form types list from DB:', error);
    return [];
  }
};
export const fetchFormFilterTags = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_TAGS_TABLE}`);
    return row;
  } catch (error) {
    console.error('Error fetching form tags list from DB:', error);
    return [];
  }
};

export const storeFormFilesUrls = async (data) => {
  try {
    const db = await getDatabase();

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FORM_FILE_TABLE} (fileId, assureFileUrl, formId, mimeType, name, isSync) VALUES (?, ?, ?, ?, ?, ?)`,
    );

    if (!statement) {
      throw new Error('Failed to prepare SQL statement.');
    }

    await statement.executeAsync(
      data?.fileId ?? null,
      data?.url ?? null,
      data?.formId ?? null,
      data?.mimeType ?? null,
      data?.name ?? null,
      1, // assuming isSync is always 1
    );
  } catch (error) {
    console.error('Error storing form file URLs:', error.message);
  }
};

export const editFormSubmission = async (submission, id, fileArray) => {
  try {
    const utcDate = getNewUTCDate();
    const db = await getDatabase();
    // TABLES.FORM_FILE_TABLE
    // Update the form submission in the database
    await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET Submission=?, CreatedUtc = ?  WHERE localId=?`,
      submission,
      utcDate,
      id,
    );
    // If there are files in fileArray, process them
    if (fileArray && fileArray.length > 0) {
      for (let element of fileArray) {
        await storeFormIOImageDataNew(element, id);
      }
    }

    return true; // Return true when operation is successful
  } catch (err) {
    console.log('err', err);
    console.log('Error editing form submission:', err);
    return false;
  }
};
