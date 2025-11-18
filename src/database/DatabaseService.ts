import crashlytics from '@react-native-firebase/crashlytics';
import * as SQLite from 'expo-sqlite';
import EventEmitter from 'eventemitter3';
import { DATABASE_NAME, TABLES } from './DatabaseConstants';
import { recordCrashlyticsError } from '../services/CrashlyticsService';
import { createDropdownListTables } from './drop-down-list/dropDownlistScheme';
import { createFormSubmissionTables } from './form-submission/formSubmissionSchema';
import { createHistoryTable } from './sync-history/syncHistorySchema';
import { createCaseTable, createSubTabsTables } from './my-case/myCaseSchema';
import { createLicenseTable } from './license/licenseSchema';
import { createDailyInspectionTables } from './daily-inspection/DailyInspectionSchema';
import { createFormSelectionListTab } from './new-form/newFormSchema';

let db: SQLite.SQLiteDatabase | null = null;
export const dbEventEmitter = new EventEmitter();

let isInitialized = false;

export const initializeDatabase = async () => {
  if (isInitialized) return;
  try {
    await openDatabase();
    await Promise.all([
      createDropdownListTables(),
      createFormSubmissionTables(),
      createHistoryTable(),
      createCaseTable(),
      createSubTabsTables(),
      createLicenseTable(),
      createDailyInspectionTables(),
      createFormSelectionListTab(),
    ]);
    crashlytics().log('Database tables created successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
    crashlytics().recordError(error);
  }
};
// Open the database (Singleton pattern)
export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    try {
      db = SQLite.openDatabaseSync(DATABASE_NAME, {
        useNewConnection: true,
      });
      console.log('****<----DATABASE OPEN SUCCESSFULLY---->****', db);
    } catch (error) {
      recordCrashlyticsError('Failed to open database:', error);
      console.error('Failed to open database:', error);
      throw error;
    }
  }
  return db;
};

// Close the database
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    try {
      await db.closeAsync();
      console.log('***<----DATABASE CLOSED SUCCESSFULLY------>***');
      db = null;
    } catch (error) {
      recordCrashlyticsError('Error closing database:', error);
      console.error('Error closing database:', error);
    }
  } else {
    console.log('No database connection to close.');
  }
};

// Get current database instance safely
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DATABASE_NAME, { useNewConnection: false });
    db.execAsync('PRAGMA busy_timeout = 10000;');
  }
  return db;
};

// Initialize schema/tables
// export const initializeDatabase = async (): Promise<void> => {
//   const database = getDatabase();
//   try {
//     await database.execAsync(CREATE_TABLES?.EXAMPLE);
//     console.log('=========Database initialized.========');
//   } catch (error) {
//     recordCrashlyticsError('Error initializing database:', error);
//     console.error('Error initializing database:', error);
//   }
// };

// Track DB operations with event emitter and Crashlytics (future)
export const trackDatabaseOperation = async (
  method: 'execAsync' | 'getAllAsync' | 'runAsync' | 'prepareAsync',
  query: string,
  params: any[] = [],
) => {
  dbEventEmitter.emit('db-transaction', {
    type: 'START',
    method,
    query,
    params,
  });

  try {
    const dbMethod = getDatabase()[method] as (query: string, params?: any[]) => Promise<any>;
    const result = await dbMethod(query, params);

    dbEventEmitter.emit('db-transaction', {
      type: 'SUCCESS',
      method,
      query,
      params,
      result,
    });
    return result;
  } catch (error: any) {
    dbEventEmitter.emit('db-transaction', {
      type: 'ERROR',
      method,
      query,
      params,
      error: error.message,
    });
    recordCrashlyticsError(`Database operation failed (${method}):`, error);
    console.error(`Database operation failed (${method}):`, error);

    throw error;
  }
};

// Permission dialog tracking
let permissionDialogActive = false;

export const setPermissionDialogActive = (isActive: boolean) => {
  permissionDialogActive = isActive;
};

export const clearPermissionDialogActive = () => {
  permissionDialogActive = false;
};

export const isPermissionDialogActive = (): boolean => {
  return permissionDialogActive;
};

// Log tables, row counts, column names, and sample row data
export const logDatabaseStats = async (): Promise<void> => {
  try {
    const database = getDatabase();
    const tables = await database.getAllAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `);

    if (tables.length === 0) {
      console.log('No tables found in the database.');
      return;
    }

    console.log('Database Stats:');
    for (const table of tables) {
      const tableName = table?.name;

      // Count rows
      const countResult = await database.getAllAsync(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult[0]?.count ?? 0;

      // Get column info
      const columns = await database.getAllAsync(`PRAGMA table_info(${tableName});`);
      const columnNames = columns.map((col) => col.name).join(', ');
      const columnCount = columns.length;

      // Fetch all rows
      const rows = await database.getAllAsync(`SELECT * FROM ${tableName}`);

      console.log(`Table: ${tableName}`);
      console.log(`Rows: ${count}`);
      console.log(`Columns (${columnCount}): ${columnNames}`);

      if (rows.length === 0) {
        console.log('No rows found in this table.');
      } else {
        console.log('Row Data:');
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}.`, row);
        });
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error retrieving database stats:', error);
    console.error('Error retrieving database stats:', error);
  }
};

export const deleteAllRecords = async () => {
  const db = getDatabase();
  try {
    await Promise.all([
      db.runAsync(`DELETE FROM ${TABLES.CASES}`),
      db.runAsync(`DELETE FROM ${TABLES.LICENSE}`),
    ]);
    console.log('All records deleted successfully');
  } catch (error) {
    console.error('Error deleting records:', error);
    recordCrashlyticsError('Error deleting records', error);
    throw error;
  }
};
