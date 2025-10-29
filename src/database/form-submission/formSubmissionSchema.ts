import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export const createFormSubmissionTables = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    const query = `CREATE TABLE IF NOT EXISTS 
       ${TABLES.FORM_SUBMISSION_STATUS_TABLE}
         (displayText TEXT, id TEXT UNIQUE PRIMARY KEY);
        CREATE TABLE IF NOT EXISTS ${TABLES.FORM_SUBMISSION_TABLE} (Submission TEXT, ContentItemId TEXT UNIQUE PRIMARY KEY, Status TEXT,DisplayText TEXT, Id TEXT, Published BOOLEAN DEFAULT 0 NOT NULL, Author TEXT,ModifiedDateText TEXT,AdvancedFormId TEXT,CreatedDateText TEXT,StatusId TEXT );`;
    await db.execAsync(query);
  } catch (error) {
    console.log('History sync error --->>', error);
  }
};
