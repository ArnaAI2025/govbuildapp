import { getDatabase } from '../DatabaseService';

export const DAILY_INSPECTION_TABLE = 'DailyInspection';

export async function createDailyInspectionTables(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${DAILY_INSPECTION_TABLE} (
      inspector TEXT,
      contentItemId TEXT UNIQUE PRIMARY KEY,
      caseContentItemId TEXT,
      caseNumber TEXT,
      inspectionDate TEXT,
      inspectionType TEXT,
      subject TEXT,
      time TEXT,
      location TEXT,
      advancedFormLinksJson TEXT,
      body TEXT,
      status TEXT,
      statusColor TEXT,
      preferredTime TEXT,
      scheduleWith TEXT,
      licenseContentItemId TEXT,
      licenseNumber TEXT,
      caseType TEXT,
      createdDate TEXT,
      licenseType TEXT,
      isShowAppointmentStatusOnReport BOOLEAN DEFAULT 0 NOT NULL,
      isShowCaseOrLicenseNumberOnReport BOOLEAN DEFAULT 0 NOT NULL,
      isShowCaseOrLicenseTypeOnReport BOOLEAN DEFAULT 0 NOT NULL,
      statusForeColor TEXT
    )
  `);
}
