import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

const SCHEMA_VERSION = 1;
export const createDropdownListTables = async (): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`,
      [],
    );
    await db.runAsync(`INSERT OR REPLACE INTO schema_version (version) VALUES (?)`, [
      SCHEMA_VERSION,
    ]);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLES.SYNC_QUEUE}  (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,   
        apiResponse TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS ${TABLES.BILLING_STATUS_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.RENEWAL_STATUS} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.DEPARTMENT_MEMBER_LIST} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.TYPE_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN,
        unlockExpirationDate BOOLEAN,
        isMultipleLocation BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.STATUS_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN,
        isRemoveAllAssignedTeamMembers BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.SUBTYPE_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.DOC_TYPE_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.USERS_TABLE_NAME} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.TEAM_MEMBER_TABLE_NAME} (
        firstName TEXT,
        lastName TEXT,
        userId TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN,
        contentItemId TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.TAGS} (
        displayText TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN
      );
    `);
    console.log('Selection dropdown tables created successfully');
  } catch (error) {
    console.error('Error creating dropdown list tables:', error);
    throw error;
  }
};
export const migrateSchema = async () => {
  const db = getDatabase();
  try {
    const versionResult = (await db.getFirstAsync(`SELECT version FROM schema_version`, [])) as
      | { version?: number }
      | undefined;
    const currentVersion = versionResult?.version || 0;
    if (currentVersion < SCHEMA_VERSION) {
      await createDropdownListTables();
      console.log(`Schema migrated to version ${SCHEMA_VERSION}`);
    }
  } catch (error) {
    console.error('Error migrating schema:', error);
  }
};
