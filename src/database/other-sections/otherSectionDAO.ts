import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

//Daily Inspection
export const updateDailyInspectionListIfExist = async (
  data: any,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
) => {
  try {
    const db = getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM ${TABLES.DAILY_INSPECTION_TABLE} WHERE contentItemId = ?`,
      data?.contentItemId,
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
    console.error('Error updating daily inspection list:', error);
  }
};

const storeDailyInspectionData = async (
  data: any,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
) => {
  try {
    const db = await getDatabase();
    const statement = await db.prepareAsync(
      'INSERT INTO ' +
        TABLES.DAILY_INSPECTION_TABLE +
        ' ( inspector , contentItemId , caseContentItemId  , caseNumber , inspectionDate , inspectionType ,  subject , time , location ,  advancedFormLinksJSON , body , status , statusColor , preferredTime,scheduleWith,licenseContentItemId,licenseNumber,caseType,createdDate,licenseType,advancedFormLinksJson,isShowAppointmentStatusOnReport,isShowCaseOrLicenseNumberOnReport,isShowCaseOrLicenseTypeOnReport,statusForeColor) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    );

    await statement.executeAsync(
      data?.inspector,
      data?.contentItemId,
      data?.caseContentItemId,
      data?.caseNumber,
      data?.inspectionDate,
      data?.inspectionType,
      data?.subject,
      data?.time,
      data?.location,
      data?.advancedFormLinksJSON,
      data?.body,
      data?.status,
      data?.statusColor,
      data?.preferredTime,
      data?.scheduleWith,
      data?.licenseContentItemId,
      data?.licenseNumber,
      data?.caseType,
      data?.createdDate,
      data?.licenseType,
      data?.advancedFormLinksJson,
      isShowAppointmentStatusOnReport,
      isShowCaseOrLicenseNumberOnReport,
      isShowCaseOrLicenseTypeOnReport,
      data?.statusForeColor,
    );
  } catch (error) {
    console.error('Error storing daily inspection data:', error);
    throw error;
  }
};
const updateDailyInspectionData = async (
  data: any,
  isShowAppointmentStatusOnReport: boolean,
  isShowCaseOrLicenseNumberOnReport: boolean,
  isShowCaseOrLicenseTypeOnReport: boolean,
) => {
  try {
    const db = await getDatabase();
    const query =
      'Update ' +
      TABLES.DAILY_INSPECTION_TABLE +
      ' SET inspector=? ,  caseContentItemId=?  , caseNumber=? , inspectionDate=? , inspectionType=? ,  subject=? , time=? , location=? ,  advancedFormLinksJSON=? , body=? , status=? , statusColor=? , preferredTime=?, scheduleWith=?, licenseContentItemId=?, licenseNumber=?, caseType =?, createdDate =?, licenseType =?,advancedFormLinksJson=?, isShowAppointmentStatusOnReport=?, isShowCaseOrLicenseNumberOnReport=?, isShowCaseOrLicenseTypeOnReport=?, statusForeColor=?  WHERE contentItemId=?';

    await db.runAsync(
      query,
      data?.inspector,
      data?.caseContentItemId,
      data?.caseNumber,
      data?.inspectionDate,
      data?.inspectionType,
      data?.subject,
      data?.time,
      data?.location,
      data?.advancedFormLinksJSON,
      data?.body,
      data?.status,
      data?.statusColor,
      data?.preferredTime,
      data?.scheduleWith,
      data?.licenseContentItemId,
      data?.licenseNumber,
      data?.caseType,
      data?.createdDate,
      data?.licenseType,
      data?.advancedFormLinksJson,
      isShowAppointmentStatusOnReport,
      isShowCaseOrLicenseNumberOnReport,
      isShowCaseOrLicenseTypeOnReport,
      data?.statusForeColor,
      data?.contentItemId,
    );
  } catch (error) {
    console.error('Error updating daily inspection data:', error);
  }
};

export const fetchDailyInspectionFromDB = async (teamMemberId: string) => {
  try {
    const db = getDatabase();
    let query;
    let params: any = [];

    if (teamMemberId && teamMemberId !== '') {
      query = `SELECT * FROM ${TABLES.DAILY_INSPECTION_TABLE} WHERE scheduleWith = ?`;
      params = [teamMemberId];
    } else {
      query = `SELECT * FROM ${TABLES.DAILY_INSPECTION_TABLE}`;
    }

    const row = await db.getAllAsync(query, ...params);
    return row;
  } catch (error) {
    console.error('Error fetching daily inspection data:', error);
  }
};
