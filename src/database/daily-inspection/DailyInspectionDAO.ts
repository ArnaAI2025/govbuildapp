import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { DailyInspectionModel } from '../../utils/interfaces/ISubScreens';
import { getDatabase } from '../DatabaseService';
import { DAILY_INSPECTION_TABLE } from './DailyInspectionSchema';

export async function storeDailyInspectionData(
  data: DailyInspectionModel,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
): Promise<void> {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(`
      INSERT INTO ${DAILY_INSPECTION_TABLE} (
        inspector, contentItemId, caseContentItemId, caseNumber, inspectionDate,
        inspectionType, subject, time, location, advancedFormLinksJson, body,
        status, statusColor, preferredTime, scheduleWith, licenseContentItemId,
        licenseNumber, caseType, createdDate, licenseType,
        isShowAppointmentStatusOnReport, isShowCaseOrLicenseNumberOnReport,
        isShowCaseOrLicenseTypeOnReport, statusForeColor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await statement.executeAsync(
      data.inspector,
      data.contentItemId,
      data.caseContentItemId,
      data.caseNumber,
      data.inspectionDate,
      data.inspectionType,
      data.subject,
      data.time,
      data.location,
      data.advancedFormLinksJson,
      data.body,
      data.status,
      data.statusColor,
      data.preferredTime,
      data.scheduleWith,
      data.licenseContentItemId,
      data.licenseNumber,
      data.caseType,
      data.createdDate,
      data.licenseType,
      isShowAppointmentStatusOnReport,
      isShowCaseOrLicenseNumberOnReport,
      isShowCaseOrLicenseTypeOnReport,
      data.statusForeColor,
    );
  } catch (error) {
    recordCrashlyticsError('Error storing daily inspection data:', error);
    console.error('Error storing daily inspection data:', error);
    throw error;
  }
}

export async function updateDailyInspectionData(
  data: DailyInspectionModel,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `
      UPDATE ${DAILY_INSPECTION_TABLE}
      SET inspector = ?, caseContentItemId = ?, caseNumber = ?, inspectionDate = ?,
          inspectionType = ?, subject = ?, time = ?, location = ?, advancedFormLinksJson = ?,
          body = ?, status = ?, statusColor = ?, preferredTime = ?, scheduleWith = ?,
          licenseContentItemId = ?, licenseNumber = ?, caseType = ?, createdDate = ?,
          licenseType = ?, isShowAppointmentStatusOnReport = ?, isShowCaseOrLicenseNumberOnReport = ?,
          isShowCaseOrLicenseTypeOnReport = ?, statusForeColor = ?
      WHERE contentItemId = ?
    `,
      data.inspector,
      data.caseContentItemId,
      data.caseNumber,
      data.inspectionDate,
      data.inspectionType,
      data.subject,
      data.time,
      data.location,
      data.advancedFormLinksJson,
      data.body,
      data.status,
      data.statusColor,
      data.preferredTime,
      data.scheduleWith,
      data.licenseContentItemId,
      data.licenseNumber,
      data.caseType,
      data.createdDate,
      data.licenseType,
      isShowAppointmentStatusOnReport,
      isShowCaseOrLicenseNumberOnReport,
      isShowCaseOrLicenseTypeOnReport,
      data.statusForeColor,
      data.contentItemId,
    );
  } catch (error) {
    recordCrashlyticsError('Error updating daily inspection data:', error);
    console.error('Error updating daily inspection data:', error);
    throw error;
  }
}

export async function fetchInspectionData(teamMemberId: string): Promise<DailyInspectionModel[]> {
  try {
    const db = await getDatabase();
    let query = `SELECT * FROM ${DAILY_INSPECTION_TABLE}`;
    const params: string[] = [];
    if (teamMemberId) {
      query += ` WHERE scheduleWith = ?`;
      params.push(teamMemberId);
    }
    const rows = await db.getAllAsync(query, ...params);
    return rows as DailyInspectionModel[];
  } catch (error) {
    recordCrashlyticsError('Error fetching daily inspection data:', error);
    console.error('Error fetching daily inspection data:', error);
    return [];
  }
}

export async function updateDailyInspectionListIfExist(
  data: DailyInspectionModel,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
): Promise<void> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM ${DAILY_INSPECTION_TABLE} WHERE contentItemId = ?`,
      [data.contentItemId],
    );
    if (result.length === 0) {
      await storeDailyInspectionData(
        data,
        isShowAppointmentStatusOnReport,
        isShowCaseOrLicenseNumberOnReport,
        isShowCaseOrLicenseTypeOnReport,
      );
    } else {
      await updateDailyInspectionData(
        data,
        isShowAppointmentStatusOnReport,
        isShowCaseOrLicenseNumberOnReport,
        isShowCaseOrLicenseTypeOnReport,
      );
    }
  } catch (error) {
    recordCrashlyticsError('Error updating daily inspection list:', error);
    console.error('Error updating daily inspection list:', error);
  }
}
