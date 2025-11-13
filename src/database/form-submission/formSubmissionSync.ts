import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { storeSubmissionData, updateSubmissionListData } from './formSubmissionDAO';

export const syncSubmissionData = async (data: any) => {
  try {
    const db = await getDatabase();
    const array = await db.getAllAsync(
      `SELECT * FROM ${TABLES.FORM_SUBMISSION_TABLE} WHERE ContentItemId = ?`,
      data.ContentItemId,
    );

    if (array.length === 0) {
      await storeSubmissionData(data);
    } else {
      await updateSubmissionListData(data);
    }
  } catch (error) {
    recordCrashlyticsError('Error in updating submission data:', error);
    console.error('Error in updating submission data:', error);
  }
};
