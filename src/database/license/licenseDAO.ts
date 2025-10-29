import { getNewUTCDate, toSqlVal } from '../../utils/helper/helpers';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { License } from '../types/license';

// Store License Data
export const storeLicenseData = async (
  data: Partial<License>,
  isAllowEditLicense: boolean,
  isAllowViewInspection: boolean,
  isAllowAddAdminNotes: boolean,
): Promise<{ success: boolean; message: string; error?: any }> => {
  const db = await getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.LICENSE} 
        (Id, licenseNumber, viewOnlyAssignUsers, 
         licenseDescriptor, displayText, licenseStatus, statusColor, 
         contentItemId, statusId, parcelNumber, isManualAddress, email, 
         phoneNumber, cellNumber, licenseTypeId, licenseType, location,
         licenseSubType, additionalInfo, longitudeField, latitudeField,
         isEditable, isEdited, isSync, isSubScreenEdited, isForceSync,
         applicantFirstName, applicantLastName, businessName, expirationDate,
         isPaymentReceived, published, assignedUsers, renewalStatus, modifiedUtc,
         ownerName, createdUtc, isShowInspectionTab, licenseTag,
         isAllowEditLicense, isAllowViewInspection, isAllowAddAdminNotes, quickRefNumber)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );

    await statement.executeAsync(
      toSqlVal(data.id || data.contentItemId),
      toSqlVal(data.licenseNumber),
      toSqlVal(data.viewOnlyAssignUsers),
      toSqlVal(data.licenseDescriptor),
      toSqlVal(data.displayText),
      toSqlVal(data.licenseStatus),
      toSqlVal(data.statusColor),
      toSqlVal(data.contentItemId),
      toSqlVal(data.statusId),
      toSqlVal(data.parcelNumber),
      toSqlVal(data.isManualAddress),
      toSqlVal(data.email),
      toSqlVal(data.phoneNumber),
      toSqlVal(data.cellNumber),
      toSqlVal(data.licenseTypeId),
      toSqlVal(data.licenseType),
      toSqlVal(data.location),
      toSqlVal(data.licenseSubType),
      toSqlVal(data.additionalInfo),
      toSqlVal(data.longitudeField),
      toSqlVal(data.latitudeField),
      toSqlVal(data.isEditable ?? 1),
      toSqlVal(0), // isEdited
      toSqlVal(0), // isSync
      toSqlVal(0), // isSubScreenEdited
      toSqlVal(0), // isForceSync
      toSqlVal(data.applicantFirstName),
      toSqlVal(data.applicantLastName),
      toSqlVal(data.businessName),
      toSqlVal(data.expirationDate),
      toSqlVal(data.isPaymentReceived ?? 1),
      toSqlVal(data.published ?? 1),
      toSqlVal(data.assignedUsers),
      toSqlVal(data.renewalStatus),
      toSqlVal(data.modifiedUtc),
      toSqlVal(data.ownerName),
      toSqlVal(data.createdUtc),
      toSqlVal(data.isShowInspectionTab ?? 0),
      toSqlVal(data.licenseTag),
      toSqlVal(isAllowEditLicense),
      toSqlVal(isAllowViewInspection),
      toSqlVal(isAllowAddAdminNotes),
      toSqlVal(data.quickRefNumber),
    );

    await db.execAsync(`COMMIT;`);
    console.log('License inserted');
    return { success: true, message: 'License stored successfully.' };
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    console.error('Error storing license data:---->>>', error);
    return {
      success: false,
      message: 'Failed to store license data.',
      error,
    };
  }
};

// Update License Data
export const updateLicenseData = async (
  data: Partial<License>,
  licenseData?: any,
  isSync?: boolean,
  isEdited?: boolean,
  forceSync?: boolean,
  isSubScreenEdited: number | null = 0,
  isAllowEditLicense?: boolean,
  isAllowViewInspection?: boolean,
  isPermission?: boolean,
  isAllowAddAdminNotes?: boolean,
  ApiChangeDateUtc?: string,
  correlationId?: string,
): Promise<void> => {
  const db = await getDatabase();
  const utcDate = getNewUTCDate();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.LICENSE} SET
        licenseNumber            = ?, viewOnlyAssignUsers   = ?, licenseDescriptor    = ?,
        displayText              = ?, licenseStatus        = ?, statusColor          = ?,
        statusId                 = ?, parcelNumber         = ?, isManualAddress      = ?,
        email                    = ?, phoneNumber          = ?, cellNumber           = ?,
        licenseTypeId            = ?, licenseType          = ?, location             = ?,
        licenseSubType           = ?, additionalInfo       = ?, longitudeField       = ?,
        latitudeField            = ?, isEditable           = ?, isEdited             = ?,
        isSync                   = ?, isSubScreenEdited    = ?, isForceSync          = ?,
        applicantFirstName       = ?, applicantLastName    = ?, businessName         = ?,
        expirationDate           = ?, isPaymentReceived    = ?, assignedUsers        = ?,
        renewalStatus            = ?, modifiedUtc          = ?, ownerName            = ?,
        createdUtc               = ?, isShowInspectionTab  = ?, licenseTag           = ?,
        isAllowEditLicense       = ?, isAllowViewInspection= ?, isPermission         = ?,
        isAllowAddAdminNotes     = ?, ApiChangeDateUtc     = ?, correlationId        = ?,
        quickRefNumber           = ?, isForceSyncSuccess   = ? WHERE contentItemId  = ?`,
      [
        toSqlVal(data?.licenseNumber),
        toSqlVal(data.viewOnlyAssignUsers ?? false),
        toSqlVal(data.licenseDescriptor),
        toSqlVal(data.displayText),
        toSqlVal(data.licenseStatus),
        toSqlVal(data.statusColor),
        toSqlVal(data.statusId),
        toSqlVal(data.parcelNumber),
        toSqlVal(data.isManualAddress),
        toSqlVal(data.email),
        toSqlVal(data.phoneNumber),
        toSqlVal(data.cellNumber),
        toSqlVal(data.licenseTypeId),
        toSqlVal(data.licenseType),
        toSqlVal(data.location),
        toSqlVal(data.licenseSubType),
        toSqlVal(data.additionalInfo),
        toSqlVal(data.longitudeField),
        toSqlVal(data.latitudeField),
        toSqlVal(data.isEditable ?? 1),
        toSqlVal(isEdited),
        toSqlVal(isSync),
        toSqlVal(isSubScreenEdited ?? 0),
        toSqlVal(forceSync),
        toSqlVal(data.applicantFirstName),
        toSqlVal(data.applicantLastName),
        toSqlVal(data.businessName),
        toSqlVal(data.expirationDate),
        toSqlVal(data.isPaymentReceived),
        toSqlVal(data.assignedUsers),
        toSqlVal(data.renewalStatus),
        // toSqlVal(data.modifiedUtc),
        utcDate,
        toSqlVal(licenseData[0]?.ownerName),
        toSqlVal(licenseData[0]?.createdUtc),
        toSqlVal(licenseData[0]?.isShowInspectionTab),
        toSqlVal(data.licenseTag),
        toSqlVal(isAllowEditLicense),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isPermission),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(ApiChangeDateUtc),
        toSqlVal(correlationId),
        toSqlVal(data.quickRefNumber),
        toSqlVal(data.isForceSyncSuccess),
        toSqlVal(data.contentItemId),
      ],
    );
    console.log(`License successfully updated for contentItemId = ${data?.contentItemId}`);
  } catch (err) {
    console.error('Error updating license data:--->', err);
    throw err;
    // try {
    //   await db.execAsync("ROLLBACK;");s
    // } catch (rollbackError) {
    //   console.warn("Rollback failed:", rollbackError);
    // }
    // console.error("Error updating license data:", err);
    // return {
    //   success: false,
    //   message: "Error updating license data.",
    //   error: err,
    // };
  }
};

// Update fetch License Data
export const updateFatchLicenseData = async (
  data: Partial<License>,
  licenseData: any,
  isSync: boolean,
  isEdited: boolean,
  forceSync: boolean,
  isSubScreenEdited: number | null,
  isAllowEditLicense: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
  ApiChangeDateUtc: string,
  corrId: string,
): Promise<void> => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.LICENSE} 
        SET licenseNumber=?, viewOnlyAssignUsers=?, licenseDescriptor=?, displayText=?,
            licenseStatus=?, statusColor=?, statusId=?, parcelNumber=?, isManualAddress=?,
            email=?, phoneNumber=?, cellNumber=?, licenseTypeId=?, licenseType=?, location=?,
            licenseSubType=?, additionalInfo=?, longitudeField=?, latitudeField=?,
            isEditable=?, isEdited=?, isSync=?, isSubScreenEdited=?, isForceSync=?,
            applicantFirstName=?, applicantLastName=?, businessName=?, expirationDate=?,
            isPaymentReceived=?, assignedUsers=?, renewalStatus=?, modifiedUtc=?, ownerName=?,
            createdUtc=?, isShowInspectionTab=?, licenseTag=?, isAllowEditLicense=?,
            isAllowViewInspection=?, isPermission=?, isAllowAddAdminNotes=?, ApiChangeDateUtc=?,
            correlationId=?, quickRefNumber=?
        WHERE contentItemId=?`,
      [
        toSqlVal(data.licenseNumber),
        toSqlVal(data.viewOnlyAssignUsers),
        toSqlVal(data.licenseDescriptor),
        toSqlVal(data.displayText),
        toSqlVal(data.licenseStatus),
        toSqlVal(data.statusColor),
        toSqlVal(data.statusId),
        toSqlVal(data.parcelNumber),
        toSqlVal(data.isManualAddress),
        toSqlVal(data.email),
        toSqlVal(data.phoneNumber),
        toSqlVal(data.cellNumber),
        toSqlVal(data.licenseTypeId),
        toSqlVal(data.licenseType),
        toSqlVal(data.location),
        toSqlVal(data.licenseSubType),
        toSqlVal(data.additionalInfo),
        toSqlVal(data.longitudeField),
        toSqlVal(data.latitudeField),
        toSqlVal(data.isEditable ?? 1),
        toSqlVal(isEdited),
        toSqlVal(isSync),
        toSqlVal(isSubScreenEdited ?? 0),
        toSqlVal(forceSync),
        toSqlVal(data.applicantFirstName),
        toSqlVal(data.applicantLastName),
        toSqlVal(data.businessName),
        toSqlVal(data.expirationDate),
        toSqlVal(data.isPaymentReceived ?? 1),
        toSqlVal(data.assignedUsers),
        toSqlVal(data.renewalStatus),
        toSqlVal(data.modifiedUtc),
        toSqlVal(data.ownerName),
        toSqlVal(data.createdUtc),
        toSqlVal(data.isShowInspectionTab),
        toSqlVal(data.licenseTag),
        toSqlVal(isAllowEditLicense),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isPermission),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(ApiChangeDateUtc),
        toSqlVal(corrId),
        toSqlVal(data.quickRefNumber),
        toSqlVal(data.contentItemId),
      ],
    );
    console.log('fetch License data updated successfully.');
  } catch (err) {
    console.error('Error updating license data:--->', err);
    throw err;
  }
};

// Update Only License Data
export const updateOnlyLicenseData = async (
  data: Partial<License>,
  licenseData?: any,
  isAllowEditLicense?: boolean,
  isAllowViewInspection?: boolean,
  isPermission?: boolean,
  isAllowAddAdminNotes?: boolean,
  ApiChangeDateUtc?: string,
  correlationId?: string,
): Promise<void> => {
  const db = await getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(
      `UPDATE ${TABLES.LICENSE} 
        SET licenseNumber=?, viewOnlyAssignUsers=?, licenseDescriptor=?, 
            displayText=?, licenseStatus=?, statusColor=?, statusId=?, 
            parcelNumber=?, isManualAddress=?, email=?, phoneNumber=?,
            cellNumber=?, licenseTypeId=?, licenseType=?, location=?, 
            licenseSubType=?, additionalInfo=?, longitudeField=?, latitudeField=?, 
            isEditable=?, applicantFirstName=?, applicantLastName=?, businessName=?, 
            expirationDate=?, isPaymentReceived=?, assignedUsers=?, renewalStatus=?, 
            modifiedUtc=?, ownerName=?, createdUtc=?, isShowInspectionTab=?, 
            licenseTag=?, isAllowEditLicense=?, isAllowViewInspection=?, isPermission=?, 
            isAllowAddAdminNotes=?, ApiChangeDateUtc=?, correlationId=?, 
            quickRefNumber=? 
        WHERE contentItemId=?`,
      [
        toSqlVal(data.licenseNumber),
        toSqlVal(data.viewOnlyAssignUsers),
        toSqlVal(data.licenseDescriptor),
        toSqlVal(data.displayText),
        toSqlVal(data.licenseStatus),
        toSqlVal(data.statusColor),
        toSqlVal(data.statusId),
        toSqlVal(data.parcelNumber),
        toSqlVal(data.isManualAddress),
        toSqlVal(data.email),
        toSqlVal(data.phoneNumber),
        toSqlVal(data.cellNumber),
        toSqlVal(data.licenseTypeId),
        toSqlVal(data.licenseType),
        toSqlVal(data.location),
        toSqlVal(data.licenseSubType),
        toSqlVal(data.additionalInfo),
        toSqlVal(data.longitudeField),
        toSqlVal(data.latitudeField),
        toSqlVal(data.isEditable ?? 1),
        toSqlVal(data.applicantFirstName),
        toSqlVal(data.applicantLastName),
        toSqlVal(data.businessName),
        toSqlVal(data.expirationDate),
        toSqlVal(data.isPaymentReceived ?? 1),
        toSqlVal(data.assignedUsers),
        toSqlVal(data.renewalStatus),
        toSqlVal(data.modifiedUtc),
        toSqlVal(data.ownerName),
        toSqlVal(data.createdUtc),
        toSqlVal(data.isShowInspectionTab ?? 0),
        toSqlVal(data.licenseTag),
        toSqlVal(isAllowEditLicense),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isPermission),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(ApiChangeDateUtc),
        toSqlVal(correlationId),
        toSqlVal(data.quickRefNumber),
        toSqlVal(data.contentItemId),
      ],
    );
    await db.execAsync(`COMMIT;`);
    console.log('Only License data updated successfully.');
  } catch (err) {
    await db.execAsync(`ROLLBACK;`);
    console.error('Error updating only license data:--->', err);
    throw err;
  }
};

// Update License Permissions if needed
export const updateLicensePermission = async (
  data: Partial<License>,
  isAllowEditLicense: boolean,
  isAllowViewInspection: boolean,
  isAllowAddAdminNotes: boolean,
) => {
  const db = await getDatabase();
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    const result = await db.runAsync(
      `UPDATE ${TABLES.LICENSE}
         SET  isAllowEditLicense   = ?,
              isAllowViewInspection= ?,
              isAllowAddAdminNotes = ?
       WHERE contentItemId = ?`,
      [
        toSqlVal(isAllowEditLicense),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(data?.contentItemId),
      ],
    );
    await db.execAsync('COMMIT;');
    console.log('License Permission updated successfully.');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    console.error(
      `Error updating license permissions for contentItemId: ${data?.contentItemId}`,
      error,
    );
  }
};

// Fetch All license from Database
export const fetchAllLicenseFromDB = async () => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.LICENSE}`);
    return row;
  } catch (error) {
    console.error('Error fetching license data:', error);
    return [];
  }
};

// Delete License from DB by ID
export const deleteLicenseFromDBIfNotFormTheApi = async (id: string) => {
  try {
    const db = await getDatabase();
    const data = await db.getAllAsync(`SELECT * FROM license WHERE contentItemId = ?`, [id]);
    if (data[0]?.isForceSyncSuccess === 1) {
      await db.runAsync(
        `DELETE FROM ${TABLES.LICENSE} WHERE isEdited=? AND isForceSync=? AND isSync=? AND isForceSyncSuccess=? AND contentItemId=?`,
        [0, 0, 1, 1, id],
      );
    } else {
      await db.runAsync(
        `DELETE FROM ${TABLES.LICENSE} WHERE isEdited=? AND isSync=? AND isForceSync=? AND contentItemId=? `,
        [0, 0, 0, id],
      );
    }
    console.log(`License with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error fetching license by ID:----> ${id}`, error);
  }
};

export const licenseToForceSyncByID = async (licenseId: string) => {
  const db = await getDatabase();
  try {
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.LICENSE} WHERE contentItemId=?`, [
      licenseId,
    ]);
    return row;
  } catch (error) {
    console.error(`Error fetching license by ID: ${licenseId}`, error);
  }
};
