import { fetchInspectionData } from './DailyInspectionDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { isNetworkAvailable } from '../../utils/checkNetwork';

export async function syncDailyInspections(): Promise<void> {
  try {
    if (!isNetworkAvailable()) {
      console.warn('No internet connection for sync');
      return;
    }

    const localData = await fetchInspectionData('');
    if (localData.length === 0) {
      return;
    }

    // const url = getBaseUrl();
    // for (const inspection of localData) {
    //   const formData = {
    //     contentItemId: inspection.contentItemId,
    //     inspector: inspection.inspector,
    //     caseContentItemId: inspection.caseContentItemId,
    //     caseNumber: inspection.caseNumber,
    //     inspectionDate: inspection.inspectionDate,
    //     inspectionType: inspection.inspectionType,
    //     subject: inspection.subject,
    //     time: inspection.time,
    //     location: inspection.location,
    //     advancedFormLinksJson: inspection.advancedFormLinksJson,
    //     body: inspection.body,
    //     status: inspection.status,
    //     statusColor: inspection.statusColor,
    //     preferredTime: inspection.preferredTime,
    //     scheduleWith: inspection.scheduleWith,
    //     licenseContentItemId: inspection.licenseContentItemId,
    //     licenseNumber: inspection.licenseNumber,
    //     caseType: inspection.caseType,
    //     createdDate: inspection.createdDate,
    //     licenseType: inspection.licenseType,
    //     syncModel: syncMode(
    //       false,
    //       false,
    //       getNewUTCDate(),
    //       inspection.contentItemId,
    //       null
    //     ),
    //   };

    //   const response = await POST_DATA_WITH_TOKEN({
    //     url: `${url}${URL.ADD_DAILY_INSPECTION}`,
    //     body: formData,
    //   });

    //   if (response.status) {
    //     // Optionally, remove synced data from local database
    //     // await deleteInspectionFromLocal(inspection.contentItemId);
    //   }
    // }
  } catch (error) {
    recordCrashlyticsError('Error in syncDailyInspections:', error);
    console.error('Error in syncDailyInspections:', error);
  }
}
