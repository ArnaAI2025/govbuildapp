import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
export const createLicenseTable = async (): Promise<void> => {
  const db = await getDatabase();
  try {
    const licenseTableQuery = `
      CREATE TABLE IF NOT EXISTS ${TABLES.LICENSE} (
        licenseDescriptor TEXT,
        licenseNumber TEXT,
        displayText TEXT,
        licenseStatus TEXT,
        statusColor TEXT,
        Id TEXT,
        contentItemId TEXT PRIMARY KEY UNIQUE,
        statusId TEXT,
        parcelNumber TEXT,
        isManualAddress BOOLEAN DEFAULT 0,
        email TEXT,
        phoneNumber TEXT,
        cellNumber TEXT,
        licenseTypeId TEXT,
        licenseType TEXT,
        location TEXT,
        licenseSubType TEXT,
        additionalInfo TEXT,
        longitudeField TEXT,
        latitudeField TEXT,
        isEditable BOOLEAN DEFAULT 0 NOT NULL,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isSubScreenEdited BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        applicantFirstName TEXT,
        applicantLastName TEXT,
        businessName TEXT,
        expirationDate TEXT,
        isPaymentReceived BOOLEAN DEFAULT 0,
        DataType TEXT DEFAULT "Offline" NOT NULL,
        published BOOLEAN DEFAULT 0 NOT NULL,
        assignedUsers TEXT,
        renewalStatus TEXT,
        viewOnlyAssignUsers BOOLEAN DEFAULT 0 NOT NULL,
        modifiedUtc TEXT,
        ownerName TEXT,
        createdUtc TEXT,
        isShowInspectionTab BOOLEAN DEFAULT 0,
        licenseTag TEXT,
        isAllowEditLicense BOOLEAN DEFAULT 0,
        isAllowViewInspection BOOLEAN DEFAULT 0,
        isPermission BOOLEAN DEFAULT 0,
        isAllowAddAdminNotes BOOLEAN DEFAULT 0,
        notInOffline BOOLEAN DEFAULT 0,
        ApiChangeDateUtc TEXT,
        correlationId TEXT,
        quickRefNumber TEXT,
        isStatusReadOnly BOOLEAN DEFAULT false,
        isForceSyncSuccess BOOLEAN DEFAULT 0
      );
    `;
    const licenseDetailsTableQuery = `
      CREATE TABLE IF NOT EXISTS ${TABLES.LICENSE_DETAILS} (
        contentItemId TEXT,
        id TEXT,
        testScore TEXT,
        licenseFee TEXT,
        liabilityInsuranceExpDate TEXT,
        workersCompExpDate TEXT,
        issueDate TEXT,
        effectiveDate TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        licenseOwner TEXT
      );
    `;
    return await Promise.all([
      db.execAsync(licenseTableQuery),
      db.execAsync(licenseDetailsTableQuery),
    ]);
  } catch (error) {
    console.error('Error creating License table:', error);
    throw error;
  }
};
