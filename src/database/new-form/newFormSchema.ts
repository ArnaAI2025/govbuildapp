import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export async function createFormSelectionListTab() {
  const db = await getDatabase();
  return Promise.all([
    db.execAsync(
      'CREATE TABLE IF NOT EXISTS ' +
        TABLES.FORM_TYPES_TABLE +
        ' (displayText TEXT, id TEXT UNIQUE PRIMARY KEY)',
      null,
      null,
    ),

    // create form submission table
    db.execAsync(
      'CREATE TABLE IF NOT EXISTS ' +
        TABLES.FORM_TAGS_TABLE +
        ' (displayText TEXT, id TEXT UNIQUE PRIMARY KEY)',
      null,
      null,
    ),
  ]);
}
