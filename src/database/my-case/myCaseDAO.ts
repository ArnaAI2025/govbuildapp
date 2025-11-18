import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { useUnifiedCaseStore } from '../../store/caseStore';
import { getNewUTCDate, toSqlVal } from '../../utils/helper/helpers';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import type { Case } from '../types/case';

export const storeCaseData = async (
  data: Partial<Case>,
  isEnableMultiline: boolean,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASES} 
            (number, caseName, displayText, location, subTypes, totalCost, caseStatus, caseStatusColor, contentItemId, 
            description, statusId, parcelNumber, quickRefNumber,  latitudeField, longitudeField, isManualAddress, billingStatus, 
            billingStatusId, email, phoneNumber, caseTypeId, caseType, actualCaseDate, expectedCaseDate, 
            caseNumberDetail, isEditable, isEdited, isForceSync, createdUtc, modifiedUtc, published, 
            isAllowEditActualDate, viewOnlyAssignUsers, assignedUsers, author, ownerName, IsEnableMultiline, 
            apartmentSuite, cityField, countryField, mailingAddressCityField, mailingAddressCountryField, 
            mailingAddressPostalCodeField, mailingAddressStateField, mailingAddressStreetRouteField, 
            postalCodeField, stateField, streetRouteField, mailingAddress, isShowInspectionTab, caseTag, 
            isAllowEditCase, isAllowViewInspection, isAllowAddAdminNotes, isStatusReadOnly) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
    );
    await statement.executeAsync(
      toSqlVal(data.number ?? ''),
      toSqlVal(data.caseName ?? ''),
      toSqlVal(data.displayText ?? ''),
      toSqlVal(data.location ?? ''),
      toSqlVal(data.subTypes ?? ''),
      toSqlVal(data.totalCost ?? ''),
      toSqlVal(data.caseStatus ?? ''),
      toSqlVal(data.caseStatusColor ?? ''),
      toSqlVal(data.contentItemId ?? ''),
      toSqlVal(data.description ?? ''),
      toSqlVal(data.statusId ?? ''),
      toSqlVal(data.parcelNumber ?? ''),
      toSqlVal(data.quickRefNumber ?? ''),
      toSqlVal(data.latitudeField ?? ''),
      toSqlVal(data.longitudeField ?? ''),
      toSqlVal(data.isManualAddress ?? 0),
      toSqlVal(data.billingStatus ?? ''),
      toSqlVal(data.billingStatusId ?? ''),
      toSqlVal(data.email ?? ''),
      toSqlVal(data.phoneNumber ?? ''),
      toSqlVal(data.caseTypeId ?? ''),
      toSqlVal(data.caseType ?? ''),
      toSqlVal(data.actualCaseDate ?? null),
      toSqlVal(data.expectedCaseDate ?? null),
      toSqlVal(data.caseNumberDetail ?? ''),
      toSqlVal(data.isEditable ?? 1),
      toSqlVal(0), // isEdited default
      toSqlVal(0), // isForceSync default
      toSqlVal(data.createdUtc ?? ''),
      toSqlVal(data.modifiedUtc ?? ''),
      toSqlVal(data.published ?? 0),
      toSqlVal(data.isAllowEditActualDate ?? 0),
      toSqlVal(data.viewOnlyAssignUsers ?? 0),
      toSqlVal(data.assignedUsers ?? ''),
      toSqlVal(data.author ?? ''),
      toSqlVal(data.ownerName ?? ''),
      toSqlVal(isEnableMultiline),
      toSqlVal(data.apartmentSuite ?? ''),
      toSqlVal(data.cityField ?? ''),
      toSqlVal(data.countryField ?? ''),
      toSqlVal(data.mailingAddressCityField ?? ''),
      toSqlVal(data.mailingAddressCountryField ?? ''),
      toSqlVal(data.mailingAddressPostalCodeField ?? ''),
      toSqlVal(data.mailingAddressStateField ?? ''),
      toSqlVal(data.mailingAddressStreetRouteField ?? ''),
      toSqlVal(data.postalCodeField ?? ''),
      toSqlVal(data.stateField ?? ''),
      toSqlVal(data.streetRouteField ?? ''),
      toSqlVal(data.mailingAddress ?? ''),
      toSqlVal(data.isShowInspectionTab ?? 0),
      toSqlVal(data.caseTag ?? ''),
      toSqlVal(isAllowEditCase),
      toSqlVal(isAllowViewInspection),
      toSqlVal(isAllowAddAdminNotes),
      toSqlVal(data?.isStatusReadOnly ?? 0),
    );
    await db.execAsync(`COMMIT;`);
    if (!isOnline) {
      // await queueSyncOperation(TABLES.CASES, "INSERT", data);
    }
    console.log('Case inserted');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error storing case data:', error);
    console.error('Error storing case data:', error);
    throw error;
  }
};

export const updateCaseData = async (
  data: Partial<Case>,
  isSync: boolean,
  isEdited: boolean,
  forceSync: boolean,
  isEnableMultiline: boolean,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
  correlationId: string,
  ApiChangeDateUtc: string,
  caseData: any,
): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  const utcDate = getNewUTCDate();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASES} 
       SET number = ?, caseName = ?, displayText = ?, location = ?, subTypes = ?, totalCost = ?, caseStatus = ?, 
       caseStatusColor = ?, description = ?, statusId = ?, parcelNumber = ?, quickRefNumber = ?, latitudeField = ?, 
       longitudeField = ?, isManualAddress = ?, billingStatus = ?, billingStatusId = ?, email = ?, phoneNumber = ?, 
       caseTypeId = ?, caseType = ?, actualCaseDate = ?, expectedCaseDate = ?, caseNumberDetail = ?, isEditable = ?, 
       isEdited = ?, isSync = ?, isForceSync = ?, DataType = ?, modifiedUtc = ?, isAllowEditActualDate = ?, 
       viewOnlyAssignUsers = ?, assignedUsers = ?, author = ?, ownerName = ?, isEnableMultiline = ?, 
       apartmentSuite = ?, cityField = ?, countryField = ?, mailingAddressCityField = ?, mailingAddressCountryField = ?, 
       mailingAddressPostalCodeField = ?, mailingAddressStateField = ?, mailingAddressStreetRouteField = ?, 
       postalCodeField = ?, stateField = ?, streetRouteField = ?, mailingAddress = ?, isShowInspectionTab = ?, 
       caseTag = ?, isAllowEditCase = ?, isAllowViewInspection = ?, isPermission = ?, isAllowAddAdminNotes = ?, 
       correlationId = ?, ApiChangeDateUtc = ?, isStatusReadOnly = ?, isForceSyncSuccess   = ?
       WHERE contentItemId = ?`,
      [
        toSqlVal(data.number ?? ''),
        toSqlVal(data.caseName ?? ''),
        toSqlVal(data.displayText ?? ''),
        toSqlVal(data.location ?? ''),
        toSqlVal(data.subTypes ?? ''),
        toSqlVal(data.totalCost ?? ''),
        toSqlVal(data.caseStatus ?? ''),
        toSqlVal(data.caseStatusColor ?? ''),
        toSqlVal(data.description ?? ''),
        toSqlVal(data.statusId ?? ''),
        toSqlVal(data.parcelNumber ?? ''),
        toSqlVal(data.quickRefNumber ?? ''),
        toSqlVal(data.latitudeField ?? ''),
        toSqlVal(data.longitudeField ?? ''),
        toSqlVal(data.isManualAddress ?? 0),
        toSqlVal(data.billingStatus ?? ''),
        toSqlVal(data.billingStatusId ?? ''),
        toSqlVal(data.email ?? ''),
        toSqlVal(data.phoneNumber ?? ''),
        toSqlVal(data.caseTypeId ?? ''),
        toSqlVal(data.caseType ?? ''),
        toSqlVal(data.actualCaseDate ?? null),
        toSqlVal(data.expectedCaseDate ?? null),
        toSqlVal(data.caseNumberDetail ?? ''),
        toSqlVal(data.isEditable ?? 1),
        toSqlVal(isEdited),
        toSqlVal(isSync),
        toSqlVal(forceSync ?? 0),
        toSqlVal('Offline'),
        utcDate,
        toSqlVal(data.isAllowEditActualDate ?? 0),
        toSqlVal(data.viewOnlyAssignUsers ?? 0),
        toSqlVal(data.assignedUsers ?? ''),
        toSqlVal(data.author ?? ''),
        toSqlVal(data.ownerName ?? ''),
        toSqlVal(isEnableMultiline),
        toSqlVal(data.apartmentSuite ?? ''),
        toSqlVal(data.cityField ?? ''),
        toSqlVal(data.countryField ?? ''),
        toSqlVal(data.mailingAddressCityField ?? ''),
        toSqlVal(data.mailingAddressCountryField ?? ''),
        toSqlVal(data.mailingAddressPostalCodeField ?? ''),
        toSqlVal(data.mailingAddressStateField ?? ''),
        toSqlVal(data.mailingAddressStreetRouteField ?? ''),
        toSqlVal(data.postalCodeField ?? ''),
        toSqlVal(data.stateField ?? ''),
        toSqlVal(data.streetRouteField ?? ''),
        toSqlVal(data.mailingAddress ?? ''),
        toSqlVal(caseData[0]?.isShowInspectionTab),
        toSqlVal(data.caseTag ?? ''),
        toSqlVal(isAllowEditCase),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isPermission),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(correlationId ?? ''),
        toSqlVal(ApiChangeDateUtc ?? ''),
        toSqlVal(data.isStatusReadOnly ?? 0),
        toSqlVal(data?.isForceSyncSuccess),
        toSqlVal(data.contentItemId ?? ''),
      ],
    );
    if (!isOnline) {
      // await queueSyncOperation(TABLES.CASES, "UPDATE", data);
    }
    console.log('Case successfully updated.');
  } catch (error) {
    recordCrashlyticsError('Error updating case data:--->', error);
    console.error('Error updating case data:--->', error);
    throw error;
  }
};

export const updateOnlyCaseData = async (
  data: Partial<Case>,
  caseData: any,
  isEnableMultiline: boolean,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
  correlationId: string,
  ApiChangeDateUtc: string,
): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(
      `UPDATE ${TABLES.CASES}
       SET number = ?, caseName = ?, displayText = ?, location = ?, subTypes = ?, totalCost = ?, caseStatus = ?, 
       caseStatusColor = ?, description = ?, statusId = ?, parcelNumber = ?, quickRefNumber = ?, latitudeField = ?, 
       longitudeField = ?, isManualAddress = ?, billingStatus = ?, billingStatusId = ?, email = ?, phoneNumber = ?, 
       caseTypeId = ?, caseType = ?, actualCaseDate = ?, expectedCaseDate = ?, caseNumberDetail = ?, isEditable = ?, 
       DataType = ?, modifiedUtc = ?, isAllowEditActualDate = ?, author = ?, ownerName = ?, isEnableMultiline = ?, 
       apartmentSuite = ?, cityField = ?, countryField = ?, mailingAddressCityField = ?, mailingAddressCountryField = ?, 
       mailingAddressPostalCodeField = ?, mailingAddressStateField = ?, mailingAddressStreetRouteField = ?, 
       postalCodeField = ?, stateField = ?, streetRouteField = ?, mailingAddress = ?, isShowInspectionTab = ?, 
       caseTag = ?, isAllowEditCase = ?, isAllowViewInspection = ?, isPermission = ?, isAllowAddAdminNotes = ?, 
       correlationId = ?, ApiChangeDateUtc = ?,
       isStatusReadOnly = ?
       WHERE contentItemId = ?`,
      [
        toSqlVal(data.number ?? ''),
        toSqlVal(data.caseName ?? ''),
        toSqlVal(data.displayText ?? ''),
        toSqlVal(data.location ?? ''),
        toSqlVal(data.subTypes ?? ''),
        toSqlVal(data.totalCost ?? ''),
        toSqlVal(data.caseStatus ?? ''),
        toSqlVal(data.caseStatusColor ?? ''),
        toSqlVal(data.description ?? ''),
        toSqlVal(data.statusId ?? ''),
        toSqlVal(data.parcelNumber ?? ''),
        toSqlVal(data.quickRefNumber ?? ''),
        toSqlVal(data.latitudeField ?? ''),
        toSqlVal(data.longitudeField ?? ''),
        toSqlVal(data.isManualAddress ?? 0),
        toSqlVal(data.billingStatus ?? ''),
        toSqlVal(data.billingStatusId ?? ''),
        toSqlVal(data.email ?? ''),
        toSqlVal(data.phoneNumber ?? ''),
        toSqlVal(data.caseTypeId ?? ''),
        toSqlVal(data.caseType ?? ''),
        toSqlVal(data.actualCaseDate ?? null),
        toSqlVal(data.expectedCaseDate ?? null),
        toSqlVal(data.caseNumberDetail ?? ''),
        toSqlVal(data.isEditable ?? 1),
        toSqlVal('Offline'),
        toSqlVal(data.modifiedUtc ?? ''),
        toSqlVal(data.isAllowEditActualDate ?? 0),
        toSqlVal(data.author ?? ''),
        toSqlVal(data.ownerName ?? ''),
        toSqlVal(isEnableMultiline),
        toSqlVal(data.apartmentSuite ?? ''),
        toSqlVal(data.cityField ?? ''),
        toSqlVal(data.countryField ?? ''),
        toSqlVal(data.mailingAddressCityField ?? ''),
        toSqlVal(data.mailingAddressCountryField ?? ''),
        toSqlVal(data.mailingAddressPostalCodeField ?? ''),
        toSqlVal(data.mailingAddressStateField ?? ''),
        toSqlVal(data.mailingAddressStreetRouteField ?? ''),
        toSqlVal(data.postalCodeField ?? ''),
        toSqlVal(data.stateField ?? ''),
        toSqlVal(data.streetRouteField ?? ''),
        toSqlVal(data.mailingAddress ?? ''),
        toSqlVal(data.isShowInspectionTab ?? 0),
        toSqlVal(data.caseTag ?? ''),
        toSqlVal(isAllowEditCase),
        toSqlVal(isAllowViewInspection),
        toSqlVal(isPermission),
        toSqlVal(isAllowAddAdminNotes),
        toSqlVal(correlationId ?? ''),
        toSqlVal(ApiChangeDateUtc ?? ''),
        toSqlVal(data.isStatusReadOnly ?? 0),
        toSqlVal(data.contentItemId ?? ''),
      ],
    );
    await db.execAsync(`COMMIT;`);
    if (!isOnline) {
      //await queueSyncOperation(TABLES.CASES, "UPDATE", data);
    }
    console.log('Case updated (only)');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error updating case data:---------->', error);
    console.error('Error updating case data:---------->', error);
    throw error;
  }
};

export const updateFatchCaseData = async (
  data: Partial<Case>,
  caseData: any,
  isSync: boolean,
  isEdited: boolean,
  forceSync: boolean,
  isEnableMultiline: boolean,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isPermission: boolean,
  isAllowAddAdminNotes: boolean,
): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(
      `UPDATE ${TABLES.CASES}
       SET number = ?, caseName = ?, displayText = ?, location = ?, subTypes = ?, totalCost = ?, caseStatus = ?, 
       caseStatusColor = ?, description = ?, statusId = ?, parcelNumber = ?, quickRefNumber = ?, latitudeField = ?, 
       longitudeField = ?, isManualAddress = ?, billingStatus = ?, billingStatusId = ?, email = ?, phoneNumber = ?, 
       caseTypeId = ?, caseType = ?, actualCaseDate = ?, expectedCaseDate = ?, caseNumberDetail = ?, isEditable = ?, 
       isEdited = ?, isSync = ?, isForceSync = ?, DataType = ?, modifiedUtc = ?, isAllowEditActualDate = ?, 
       viewOnlyAssignUsers = ?, assignedUsers = ?, author = ?, ownerName = ?, isEnableMultiline = ?, 
       apartmentSuite = ?, cityField = ?, countryField = ?, mailingAddressCityField = ?, mailingAddressCountryField = ?, 
       mailingAddressPostalCodeField = ?, mailingAddressStateField = ?, mailingAddressStreetRouteField = ?, 
       postalCodeField = ?, stateField = ?, streetRouteField = ?, mailingAddress = ?, isShowInspectionTab = ?, 
       caseTag = ?, isAllowEditCase = ?, isAllowViewInspection = ?, isPermission = ?, isAllowAddAdminNotes = ?,
       isStatusReadOnly = ?
       WHERE contentItemId = ?`,
      [
        data.number ?? '',
        data.caseName ?? '',
        data.displayText ?? '',
        data.location ?? '',
        data.subTypes ?? '',
        data.totalCost ?? '',
        data.caseStatus ?? '',
        data.caseStatusColor ?? '',
        data.description ?? '',
        data.statusId ?? '',
        data.parcelNumber ?? '',
        data.quickRefNumber ?? '',
        data.latitudeField ?? '',
        data.longitudeField ?? '',
        data.isManualAddress ?? 0,
        data.billingStatus ?? '',
        data.billingStatusId ?? '',
        data.email ?? '',
        data.phoneNumber ?? '',
        data.caseTypeId ?? '',
        data.caseType ?? '',
        data.actualCaseDate ?? '',
        data.expectedCaseDate ?? '',
        data.caseNumberDetail ?? '',
        data.isEditable ?? 1,
        isEdited,
        isSync,
        forceSync ?? 0,
        'Offline',
        data.modifiedUtc ?? '',
        data.isAllowEditActualDate ?? 0,
        data.viewOnlyAssignUsers ?? 0,
        data.assignedUsers ?? '',
        data.author ?? '',
        data.ownerName ?? '',
        isEnableMultiline,
        data.apartmentSuite ?? '',
        data.cityField ?? '',
        data.countryField ?? '',
        data.mailingAddressCityField ?? '',
        data.mailingAddressCountryField ?? '',
        data.mailingAddressPostalCodeField ?? '',
        data.mailingAddressStateField ?? '',
        data.mailingAddressStreetRouteField ?? '',
        data.postalCodeField ?? '',
        data.stateField ?? '',
        data.streetRouteField ?? '',
        data.mailingAddress ?? '',
        data.isShowInspectionTab ?? 0,
        data.caseTag ?? '',
        isAllowEditCase,
        isAllowViewInspection,
        isPermission,
        isAllowAddAdminNotes,
        data?.isStatusReadOnly ?? 0,
        data.contentItemId ?? '',
      ],
    );
    await db.execAsync(`COMMIT;`);
    if (!isOnline) {
      // await queueSyncOperation(TABLES.CASES, "UPDATE", data);
    }
    console.log('Case updated (fetch)');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error updating case data:->', error);
    console.error('Error updating case data:->', error);
    throw error;
  }
};

export const updateCasePermission = async (
  data: Partial<Case>,
  isAllowEditCase: boolean,
  isAllowViewInspection: boolean,
  isAllowAddAdminNotes: boolean,
): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(
      `UPDATE ${TABLES.CASES} 
       SET isAllowEditCase = ?, isAllowViewInspection = ?, isAllowAddAdminNotes = ? 
       WHERE contentItemId = ?`,
      [isAllowEditCase, isAllowViewInspection, isAllowAddAdminNotes, data.contentItemId ?? ''],
    );
    await db.execAsync(`COMMIT;`);
    if (!isOnline) {
      // await queueSyncOperation(TABLES.CASES, "UPDATE", {
      //   contentItemId: data.contentItemId,
      //   isAllowEditCase,
      //   isAllowViewInspection,
      //   isAllowAddAdminNotes,
      // });
    }
    console.log('Case permissions updated');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error updating case permissions:', error);
    console.error('Error updating case permissions:', error);
    throw error;
  }
};

export const fetchEditedCaseDataFromDB = async (): Promise<Case[]> => {
  const db = getDatabase();
  try {
    const result = (await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE isEdited = 1`,
    )) as Case[];
    return result;
  } catch (error) {
    recordCrashlyticsError('Error fetching edited cases:', error);
    console.error('Error fetching edited cases:', error);
    return [];
  }
};

export const deleteCaseFromDBById = async (contentItemId: string): Promise<void> => {
  const { isOnline } = useUnifiedCaseStore.getState();
  const db = getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);
    await db.runAsync(`DELETE FROM ${TABLES.CASES} WHERE contentItemId = ?`, [contentItemId]);
    await db.execAsync(`COMMIT;`);
    if (!isOnline) {
      // await queueSyncOperation(TABLES.CASES, "DELETE", { contentItemId });
    }
    console.log(`Case with id ${contentItemId} deleted`);
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error deleting case:', error);
    console.error('Error deleting case:', error);
    throw error;
  }
};

export const fetchCaseDataByCaseIdFromDb = async (caseId: string) => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.CASES} WHERE contentItemId = ?`, [
      caseId,
    ]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case by ID:--->', error);
    console.error('Error fetching case by ID:--->', error);
    return null;
  }
};
export const fetchAllCasesFromDB = async () => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.CASES} `);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case by ID:--->', error);
    console.error('Error fetching case by ID:--->', error);
    return null;
  }
};

export const caseToForceSyncByID = async (caseId: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM  ${TABLES.CASES} WHERE contentItemId = ?`, [
      caseId,
    ]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching case by ID:', error);
    console.error('Error fetching case by ID:', error);
    return null;
  }
};

// Add case or license record if not already present (for offline scenario)
export const addCaseLicenseData = async (caseData, isCase) => {
  try {
    const db = getDatabase();
    const tableName = isCase ? TABLES.CASES : TABLES.LICENSE;

    const statement = await db.prepareAsync(
      `INSERT INTO ${tableName}
        (caseName, number, displayText, contentItemId, isSubScreenEdited, notInOffline, isEdited)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    await statement.executeAsync([
      caseData?.caseName || caseData?.licenseDescriptor || '',
      caseData?.number || caseData?.licenseNumber || '',
      caseData?.displayText ?? '',
      caseData?.contentItemId ?? '',
      1, // isSubScreenEdited
      1, // notInOffline
      1, // isEdited
    ]);
  } catch (error) {
    recordCrashlyticsError('Error inserting case/license data in DB addCaseLicenseData:', error);

    console.log('Error inserting case/license data in DB addCaseLicenseData:', error);
  }
};
export const deleteCaseFromDBIfNotFormTheApi = async (id: string) => {
  try {
    const db = getDatabase();
    const caseData = await db.getFirstAsync(
      `SELECT * FROM ${TABLES.CASES} WHERE contentItemId = ?`,
      [id],
    );
    if (caseData?.isForceSyncSuccess === 1) {
      await db.runAsync(
        `DELETE FROM ${TABLES.CASES} WHERE isEdited=? AND isForceSync=? AND isSync=? AND isForceSyncSuccess=? AND contentItemId=?`,
        [0, 0, 1, 1, id],
      );
    } else {
      await db.runAsync(
        `DELETE FROM ${TABLES.CASES} WHERE isEdited = ? AND isSync = ? AND isForceSync = ? AND contentItemId = ?`,
        [0, 0, 0, id],
      );
    }
    console.log(`Case with ID ${id} deleted successfully.`);
  } catch (error) {
    recordCrashlyticsError(`Error deleting case with ID ${id}:`, error);
    console.error(`Error deleting case with ID ${id}:`, error);
  }
};
// storeCaseTypeSettingsData
export const getOfflineCaseTypeSettingsById = async (id) => {
  const db = await getDatabase();
  try {
    const result = await db.getAllAsync(`SELECT * FROM ${TABLES.CASE_TYPE_SETTING} WHERE id = ?`, [
      id,
    ]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    recordCrashlyticsError('Error fetching case type setting:', error);
    console.error('Error fetching case type setting:', error);
    return null;
  }
};

export const updateCaseTypeSettingsIfExists = async (data, caseId) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(`SELECT * FROM ${TABLES.CASE_TYPE_SETTING} WHERE id = ?`, [
      caseId,
    ]);
    if (result.length === 0) {
      await storeCaseTypeSettingsData(data, caseId);
    } else {
      await updateCaseTypeSettingsData(data, caseId);
    }
  } catch (error) {
    recordCrashlyticsError('Error updating case type settings: ', error);
    console.error('Error updating case type settings: ', error);
  }
};

export const storeCaseTypeSettingsData = async (data, caseId) => {
  const db = await getDatabase();
  try {
    await db.execAsync(`BEGIN TRANSACTION;`);

    const statement = await db.prepareAsync(
      `INSERT INTO ${TABLES.CASE_TYPE_SETTING} (
    id,
    contentItemId,
    caseTitle,
    caseDisplayText,
    caseNumberText,
    caseTagText,
    actualCloseDateText,
    expectedCloseDateText,
    attachedItemText,
    isAutoArchive,
    isAllowMutlipleAddress,
    isCaseTypeStatusesOrderedList,
    isLaserficheModuleEnabled,
    isLockCaseSubType,
    isLockCaseType,
    isRequiredCaseName,
    isRequiredCaseNumberDetail,
    isRequiredExpectedCloseDate,
    isRequiredPermitExpirationDate,
    isNotifyCaseOwnerPermitExpiration,
    enableLaserficheForCaseType,
    useGlobalCaseAutoNumberSettings,
    square9CategoryField,
    taskText,
    title,
    isAllowChangeRequiredFields,
    isAllowEditActualDate,
    isAllowProfileRequestInspection,
    isAllowPublicView,
    isDefaultAttachDocShowOnFE,
    isDefaultShowFE,
    isDoNotAddResponsiblePartybyDefault,
    isEPlanSoftModuleEnabled,
    isHideAccDetailsTab,
    isHideActionButton,
    isHideAdminNotesTab,
    isHideAttachedDocTab,
    isHideBillingStatus,
    isHideBillingStatusChangeLogTab,
    isHideCalenderOpt,
    isHideCaseName,
    isHideCaseNumberDetail,
    isHideCaseSubType,
    isHideCaseType,
    isHideChangeLogTab,
    isHideContactTab,
    isHideContentItem,
    isHideDescription,
    isHideExpectedCloseDate,
    isHideFillAndAttach,
    isHideInspectionHistoryLogTab,
    isHideInspectionMenuOnFE,
    isHideMailingAddress,
    isHidePacketReportOpt,
    isHideParcelNumber,
    isHidePaymentHistoryLogTab,
    isHidePaymentTab,
    isHidePublicCommentTab,
    isHideQuickRefNumber,
    isHideRelatedTab,
    isHideSentMailTab,
    isHideSettingTab,
    isHideShowOnFE,
    isHideTag,
    isHideTaskStatusChangeLogTab,
    isHideTaskTab,
    isHideTeamMemberAssignmentLogTab,
    isHideTotalCost,
    isHideViewAllSubmission,
    isInfoShow,
    isPlanReviewEnabled,
    isNotifyAllContactsPermitExpiration,
    isNotifyApplicantPermitExpiration,
    isNotifyAssignOtherTeamMembersOnFileUpload,
    isNotifyAssignTeamMembersOnFileUpload,
    isShowCaseSubTypesList,
    isShowDefaultAdminField,
    isShowNotesOnInspectionTab,
    isShowTaskTabOnProfile,
    isShowUnauthorized,
    isSquare9ModuleEnabled,
    isVelosimoModuleEnabled,
    uploadFinalReportOnClosedStatus,
    useAutoNumber,
    isEdited
  ) VALUES (${Array(85).fill('?').join(', ')})`,
    );
    await statement.executeAsync(
      caseId ?? null,
      data?.contentItemId ?? null,
      data?.caseTitle ?? null,
      data?.caseDisplayText ?? null,
      data?.caseNumberText ?? null,
      data?.caseTagText ?? null,
      data?.actualCloseDateText ?? null,
      data?.expectedCloseDateText ?? null,
      data?.attachedItemText ?? null,
      data?.isAutoArchive ? 1 : 0,
      data?.isAllowMutlipleAddress ? 1 : 0,
      data?.isCaseTypeStatusesOrderedList ? 1 : 0,
      data?.isLaserficheModuleEnabled ? 1 : 0,
      data?.isLockCaseSubType ? 1 : 0,
      data?.isLockCaseType ? 1 : 0,
      data?.isRequiredCaseName ? 1 : 0,
      data?.isRequiredCaseNumberDetail ? 1 : 0,
      data?.isRequiredExpectedCloseDate ? 1 : 0,
      data?.isRequiredPermitExpirationDate ? 1 : 0,
      data?.isNotifyCaseOwnerPermitExpiration ? 1 : 0,
      data?.enableLaserficheForCaseType ? 1 : 0,
      data?.useGlobalCaseAutoNumberSettings ? 1 : 0,
      data?.square9CategoryField ?? 0,
      data?.taskText ?? null,
      data?.title ?? null,
      data?.isAllowChangeRequiredFields ? 1 : 0,
      data?.isAllowEditActualDate ? 1 : 0,
      data?.isAllowProfileRequestInspection ? 1 : 0,
      data?.isAllowPublicView ? 1 : 0,
      data?.isDefaultAttachDocShowOnFE ? 1 : 0,
      data?.isDefaultShowFE ? 1 : 0,
      data?.isDoNotAddResponsiblePartybyDefault ? 1 : 0,
      data?.isEPlanSoftModuleEnabled ? 1 : 0,
      data?.isHideAccDetailsTab ? 1 : 0,
      data?.isHideActionButton ? 1 : 0,
      data?.isHideAdminNotesTab ? 1 : 0,
      data?.isHideAttachedDocTab ? 1 : 0,
      data?.isHideBillingStatus ? 1 : 0,
      data?.isHideBillingStatusChangeLogTab ? 1 : 0,
      data?.isHideCalenderOpt ? 1 : 0,
      data?.isHideCaseName ? 1 : 0,
      data?.isHideCaseNumberDetail ? 1 : 0,
      data?.isHideCaseSubType ? 1 : 0,
      data?.isHideCaseType ? 1 : 0,
      data?.isHideChangeLogTab ? 1 : 0,
      data?.isHideContactTab ? 1 : 0,
      data?.isHideContentItem ? 1 : 0,
      data?.isHideDescription ? 1 : 0,
      data?.isHideExpectedCloseDate ? 1 : 0,
      data?.isHideFillAndAttach ? 1 : 0,
      data?.isHideInspectionHistoryLogTab ? 1 : 0,
      data?.isHideInspectionMenuOnFE ? 1 : 0,
      data?.isHideMailingAddress ? 1 : 0,
      data?.isHidePacketReportOpt ? 1 : 0,
      data?.isHideParcelNumber ? 1 : 0,
      data?.isHidePaymentHistoryLogTab ? 1 : 0,
      data?.isHidePaymentTab ? 1 : 0,
      data?.isHidePublicCommentTab ? 1 : 0,
      data?.isHideQuickRefNumber ? 1 : 0,
      data?.isHideRelatedTab ? 1 : 0,
      data?.isHideSentMailTab ? 1 : 0,
      data?.isHideSettingTab ? 1 : 0,
      data?.isHideShowOnFE ? 1 : 0,
      data?.isHideTag ? 1 : 0,
      data?.isHideTaskStatusChangeLogTab ? 1 : 0,
      data?.isHideTaskTab ? 1 : 0,
      data?.isHideTeamMemberAssignmentLogTab ? 1 : 0,
      data?.isHideTotalCost ? 1 : 0,
      data?.isHideViewAllSubmission ? 1 : 0,
      data?.isInfoShow ? 1 : 0,
      data?.isPlanReviewEnabled ? 1 : 0,
      data?.isNotifyAllContactsPermitExpiration ? 1 : 0,
      data?.isNotifyApplicantPermitExpiration ? 1 : 0,
      data?.isNotifyAssignOtherTeamMembersOnFileUpload ? 1 : 0,
      data?.isNotifyAssignTeamMembersOnFileUpload ? 1 : 0,
      data?.isShowCaseSubTypesList ? 1 : 0,
      data?.isShowDefaultAdminField ? 1 : 0,
      data?.isShowNotesOnInspectionTab ? 1 : 0,
      data?.isShowTaskTabOnProfile ? 1 : 0,
      data?.isShowUnauthorized ? 1 : 0,
      data?.isSquare9ModuleEnabled ? 1 : 0,
      data?.isVelosimoModuleEnabled ? 1 : 0,
      data?.uploadFinalReportOnClosedStatus ? 1 : 0,
      data?.useAutoNumber ? 1 : 0,
      0, // isEdited
    );
    await db.execAsync(`COMMIT;`);
    console.log('Setting data added successfully');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error storing case type setting data:', error);
    console.error('Error storing case type setting data:', error?.message);
  }
};

export const updateCaseTypeSettingsData = async (data, caseId) => {
  const db = await getDatabase();
  await db.execAsync(`BEGIN TRANSACTION;`);
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_TYPE_SETTING} SET
        contentItemId = ?,
        caseTitle = ?,
        caseDisplayText = ?,
        caseNumberText = ?,
        caseTagText = ?,
        actualCloseDateText = ?,
        expectedCloseDateText = ?,
        attachedItemText = ?,
        isAutoArchive = ?,
        isAllowMutlipleAddress = ?,
        isCaseTypeStatusesOrderedList = ?,
        isLaserficheModuleEnabled = ?,
        isLockCaseSubType = ?,
        isLockCaseType = ?,
        isRequiredCaseName = ?,
        isRequiredCaseNumberDetail = ?,
        isRequiredExpectedCloseDate = ?,
        isRequiredPermitExpirationDate = ?,
        isNotifyCaseOwnerPermitExpiration = ?,
        enableLaserficheForCaseType = ?,
        useGlobalCaseAutoNumberSettings = ?,
        square9CategoryField = ?,
        taskText = ?,
        title = ?,
        isAllowChangeRequiredFields = ?,
        isAllowEditActualDate = ?,
        isAllowProfileRequestInspection = ?,
        isAllowPublicView = ?,
        isDefaultAttachDocShowOnFE = ?,
        isDefaultShowFE = ?,
        isDoNotAddResponsiblePartybyDefault = ?,
        isEPlanSoftModuleEnabled = ?,
        isHideAccDetailsTab = ?,
        isHideActionButton = ?,
        isHideAdminNotesTab = ?,
        isHideAttachedDocTab = ?,
        isHideBillingStatus = ?,
        isHideBillingStatusChangeLogTab = ?,
        isHideCalenderOpt = ?,
        isHideCaseName = ?,
        isHideCaseNumberDetail = ?,
        isHideCaseSubType = ?,
        isHideCaseType = ?,
        isHideChangeLogTab = ?,
        isHideContactTab = ?,
        isHideContentItem = ?,
        isHideDescription = ?,
        isHideExpectedCloseDate = ?,
        isHideFillAndAttach = ?,
        isHideInspectionHistoryLogTab = ?,
        isHideInspectionMenuOnFE = ?,
        isHideMailingAddress = ?,
        isHidePacketReportOpt = ?,
        isHideParcelNumber = ?,
        isHidePaymentHistoryLogTab = ?,
        isHidePaymentTab = ?,
        isHidePublicCommentTab = ?,
        isHideQuickRefNumber = ?,
        isHideRelatedTab = ?,
        isHideSentMailTab = ?,
        isHideSettingTab = ?,
        isHideShowOnFE = ?,
        isHideTag = ?,
        isHideTaskStatusChangeLogTab = ?,
        isHideTaskTab = ?,
        isHideTeamMemberAssignmentLogTab = ?,
        isHideTotalCost = ?,
        isHideViewAllSubmission = ?,
        isInfoShow = ?,
        isPlanReviewEnabled = ?,
        isNotifyAllContactsPermitExpiration = ?,
        isNotifyApplicantPermitExpiration = ?,
        isNotifyAssignOtherTeamMembersOnFileUpload = ?,
        isNotifyAssignTeamMembersOnFileUpload = ?,
        isShowCaseSubTypesList = ?,
        isShowDefaultAdminField = ?,
        isShowNotesOnInspectionTab = ?,
        isShowTaskTabOnProfile = ?,
        isShowUnauthorized = ?,
        isSquare9ModuleEnabled = ?,
        isVelosimoModuleEnabled = ?,
        uploadFinalReportOnClosedStatus = ?,
        useAutoNumber = ?,
        isEdited = 1
      WHERE id = ?`,
      [
        data?.contentItemId ?? null,
        data?.caseTitle ?? null,
        data?.caseDisplayText ?? null,
        data?.caseNumberText ?? null,
        data?.caseTagText ?? null,
        data?.actualCloseDateText ?? null,
        data?.expectedCloseDateText ?? null,
        data?.attachedItemText ?? null,
        data?.isAutoArchive ? 1 : 0,
        data?.isAllowMutlipleAddress ? 1 : 0,
        data?.isCaseTypeStatusesOrderedList ? 1 : 0,
        data?.isLaserficheModuleEnabled ? 1 : 0,
        data?.isLockCaseSubType ? 1 : 0,
        data?.isLockCaseType ? 1 : 0,
        data?.isRequiredCaseName ? 1 : 0,
        data?.isRequiredCaseNumberDetail ? 1 : 0,
        data?.isRequiredExpectedCloseDate ? 1 : 0,
        data?.isRequiredPermitExpirationDate ? 1 : 0,
        data?.isNotifyCaseOwnerPermitExpiration ? 1 : 0,
        data?.enableLaserficheForCaseType ? 1 : 0,
        data?.useGlobalCaseAutoNumberSettings ? 1 : 0,
        data?.square9CategoryField ?? 0,
        data?.taskText ?? null,
        data?.title ?? null,
        data?.isAllowChangeRequiredFields ? 1 : 0,
        data?.isAllowEditActualDate ? 1 : 0,
        data?.isAllowProfileRequestInspection ? 1 : 0,
        data?.isAllowPublicView ? 1 : 0,
        data?.isDefaultAttachDocShowOnFE ? 1 : 0,
        data?.isDefaultShowFE ? 1 : 0,
        data?.isDoNotAddResponsiblePartybyDefault ? 1 : 0,
        data?.isEPlanSoftModuleEnabled ? 1 : 0,
        data?.isHideAccDetailsTab ? 1 : 0,
        data?.isHideActionButton ? 1 : 0,
        data?.isHideAdminNotesTab ? 1 : 0,
        data?.isHideAttachedDocTab ? 1 : 0,
        data?.isHideBillingStatus ? 1 : 0,
        data?.isHideBillingStatusChangeLogTab ? 1 : 0,
        data?.isHideCalenderOpt ? 1 : 0,
        data?.isHideCaseName ? 1 : 0,
        data?.isHideCaseNumberDetail ? 1 : 0,
        data?.isHideCaseSubType ? 1 : 0,
        data?.isHideCaseType ? 1 : 0,
        data?.isHideChangeLogTab ? 1 : 0,
        data?.isHideContactTab ? 1 : 0,
        data?.isHideContentItem ? 1 : 0,
        data?.isHideDescription ? 1 : 0,
        data?.isHideExpectedCloseDate ? 1 : 0,
        data?.isHideFillAndAttach ? 1 : 0,
        data?.isHideInspectionHistoryLogTab ? 1 : 0,
        data?.isHideInspectionMenuOnFE ? 1 : 0,
        data?.isHideMailingAddress ? 1 : 0,
        data?.isHidePacketReportOpt ? 1 : 0,
        data?.isHideParcelNumber ? 1 : 0,
        data?.isHidePaymentHistoryLogTab ? 1 : 0,
        data?.isHidePaymentTab ? 1 : 0,
        data?.isHidePublicCommentTab ? 1 : 0,
        data?.isHideQuickRefNumber ? 1 : 0,
        data?.isHideRelatedTab ? 1 : 0,
        data?.isHideSentMailTab ? 1 : 0,
        data?.isHideSettingTab ? 1 : 0,
        data?.isHideShowOnFE ? 1 : 0,
        data?.isHideTag ? 1 : 0,
        data?.isHideTaskStatusChangeLogTab ? 1 : 0,
        data?.isHideTaskTab ? 1 : 0,
        data?.isHideTeamMemberAssignmentLogTab ? 1 : 0,
        data?.isHideTotalCost ? 1 : 0,
        data?.isHideViewAllSubmission ? 1 : 0,
        data?.isInfoShow ? 1 : 0,
        data?.isPlanReviewEnabled ? 1 : 0,
        data?.isNotifyAllContactsPermitExpiration ? 1 : 0,
        data?.isNotifyApplicantPermitExpiration ? 1 : 0,
        data?.isNotifyAssignOtherTeamMembersOnFileUpload ? 1 : 0,
        data?.isNotifyAssignTeamMembersOnFileUpload ? 1 : 0,
        data?.isShowCaseSubTypesList ? 1 : 0,
        data?.isShowDefaultAdminField ? 1 : 0,
        data?.isShowNotesOnInspectionTab ? 1 : 0,
        data?.isShowTaskTabOnProfile ? 1 : 0,
        data?.isShowUnauthorized ? 1 : 0,
        data?.isSquare9ModuleEnabled ? 1 : 0,
        data?.isVelosimoModuleEnabled ? 1 : 0,
        data?.uploadFinalReportOnClosedStatus ? 1 : 0,
        data?.useAutoNumber ? 1 : 0,
        caseId ?? null, // WHERE condition
      ],
    );

    await db.execAsync(`COMMIT;`);
    console.log('Case type setting updated successfully');
  } catch (error) {
    await db.execAsync(`ROLLBACK;`);
    recordCrashlyticsError('Error updating case type setting data:', error);
    console.error('Error updating case type setting data:', error?.message);
  }
};
