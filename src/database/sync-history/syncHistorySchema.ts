import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export const createHistoryTable = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    const query = `
      CREATE TABLE IF NOT EXISTS ${TABLES.SYNC_HISTORY} (
        type TEXT,
        itemId TEXT,
        itemSubId TEXT,
        itemName TEXT,
        updateDate TEXT,
        subTypeTitle TEXT,
        itemType TEXT,
        title TEXT
      )
    `;
    await db.execAsync(query);
  } catch (error) {
    recordCrashlyticsError('History sync error --->>', error);
    console.log('History sync error --->>', error);
  }
};
