import { getDatabase } from './../DatabaseService';
import { TABLES } from './../DatabaseConstants';

export async function createSyncHistoryTables(): Promise<void> {
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
}
