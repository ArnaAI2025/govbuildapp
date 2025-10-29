import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export const fetchSubmissionData = async (statusId: string) => {
  try {
    const db = await getDatabase();
    const row = statusId
      ? await db.getAllAsync(
          `SELECT * FROM ${TABLES.FORM_SUBMISSION_TABLE} WHERE StatusId=?`,
          statusId,
        )
      : await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_SUBMISSION_TABLE}`);

    return row;
  } catch (error) {
    console.error('Error in fetching submission data:', error);
  }
};
export const fetchFormStatusData = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.FORM_SUBMISSION_STATUS_TABLE}`);
    return row;
  } catch (error) {
    console.error('Error in fetching form status data:', error);
  }
};

// Store submission list data
export const storeSubmissionData = async (data: any) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.FORM_SUBMISSION_TABLE}
        (Submission, ContentItemId, Status, DisplayText, Id, Published, Author, ModifiedDateText, AdvancedFormId, CreatedDateText, StatusId) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    );
    await statement.executeAsync(
      data?.Submission,
      data?.ContentItemId,
      data?.Status,
      data?.DisplayText,
      data?.Id,
      data?.Published,
      data?.Author,
      data?.ModifiedDateText,
      data?.AdvancedFormId,
      data?.CreatedDateText,
      data?.StatusId,
    );
  } catch (error) {
    console.error('Error in storing submission data:', error);
  }
};

// Update submission list data
export const updateSubmissionListData = async (data: any) => {
  try {
    const db = await getDatabase();

    await db.runAsync(
      `UPDATE ${TABLES.FORM_SUBMISSION_TABLE}
        SET Submission=?, Status=?, DisplayText=?, Id=?, Published=?, Author=?, ModifiedDateText=?, AdvancedFormId=?, CreatedDateText=?, StatusId=? 
        WHERE ContentItemId=?`,
      data?.Submission,
      data?.Status,
      data?.DisplayText,
      data?.Id,
      data?.Published,
      data?.Author,
      data?.ModifiedDateText,
      data?.AdvancedFormId,
      data?.CreatedDateText,
      data?.StatusId,
      data?.ContentItemId,
    );
  } catch (error) {
    console.error('Error in updating submission list data:', error);
  }
};

export const deleteFormListData = async () => {
  const db = await getDatabase();
  try {
    db.runAsync('DELETE FROM ' + TABLES.ADDFORM_TABLE_NAME);
  } catch (error) {
    console.log('error in deleting form list datat', error);
  }
};

export const updateFormListIfExist = async (data: any) => {
  try {
    await storeAddFormListData(data);
  } catch (err) {
    console.log('Error updating form list:', err);
  }
};

const storeAddFormListData = async (data: any) => {
  const db = await getDatabase();

  try {
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.ADDFORM_TABLE_NAME} 
            (id, DisplayText, ContentType, AutoroutePart, AdvancedForm_Container, Published,
            CreatedUtc, ModifiedUtc, isEdited, isSync, isForceSync,type,tag,ownerName) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );

    const result = await statement.executeAsync(
      data?.ContentItemId,
      data?.DisplayText,
      data?.ContentType,
      JSON?.stringify(data.AutoroutePart),
      JSON?.stringify(data.AdvancedForm.Container.Html),
      data?.Published,
      data?.CreatedUtc,
      data?.ModifiedUtc,
      0, // isEdited
      0, // isSync
      0, // isForceSync
      data?.AdvancedForm?.Type?.Text || '',
      data?.AdvancedForm?.FormTags?.Text || '',
      data?.Owner,
    );
    if (result.changes === 1) {
      return result;
    } else {
      console.warn('No changes made when adding form data.');
      return null;
    }
  } catch (error) {
    console.error('Error storing form data:', error);
    return null; // Handle error without throwing
  }
};
