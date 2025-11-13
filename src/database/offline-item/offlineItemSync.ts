import { URL } from '../../constants/url';
import { POST_DATA_WITH_TOKEN } from '../../services/ApiClient';
import { getBaseUrl } from '../../session/SessionManager';
import { CASE, LICENSE, TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { fetchLocalLicenseById, updateLicenseIfIdExist } from '../license/licenseSync';
import {
  fetchCaseSettingById,
  fetchLocalCasebyId,
  updateCaseIfIdExist,
} from '../my-case/myCaseSync';
import { updateOfflineHistoryIfIdExist } from '../../database/sync-history/syncHistorySync';
import { buildLicensePayload } from '../../utils/params/licenseCommonParams';
import { caseEditFormDataSync, SyncModelParam } from '../../utils/params/commonParams';
import {
  convertStringToBool,
  formatDate,
  formatToYYYYMMDD,
  generateUniqueID,
  getNewUTCDate,
} from '../../utils/helper/helpers';
import { updateSettingsSyncStatus } from '../sync-offline-to-server/syncOfflineToServerDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

export const caseForceSync = async (caseId: string, isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    const responseCaseData = await fetchLocalCasebyId(caseId);
    if (Array.isArray(responseCaseData) && responseCaseData.length > 0) {
      const url = getBaseUrl();
      for (var i = 0; i < responseCaseData?.length; i++) {
        let caseDataPost: any = responseCaseData[i];
        caseDataPost.isForceSyncSuccess = 1;
        const SyncModel = SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          caseDataPost.correlationId,
          caseDataPost.contentItemId,
          null,
        );
        const Payload = caseEditFormDataSync(
          caseDataPost.caseName,
          caseDataPost.number,
          caseDataPost.caseNumberDetail,
          formatToYYYYMMDD(caseDataPost.expectedCaseDate),
          caseDataPost.statusId,
          caseDataPost.billingStatusId,
          caseDataPost.caseTypeId,
          caseDataPost.subTypes,
          caseDataPost.totalCost || '0',
          caseDataPost?.location == null
            ? null
            : caseDataPost?.location.trim() === ''
              ? '0'
              : caseDataPost.location,
          caseDataPost.parcelNumber,
          caseDataPost.quickRefNumber,
          true,
          caseDataPost.description,
          caseDataPost.contentItemId,
          caseDataPost.longitudeField || '0',
          caseDataPost.latitudeField || '0',
          formatDate(caseDataPost.actualCaseDate),
          convertStringToBool(caseDataPost.isManualAddress),
          0,
          caseDataPost.caseStatus,
          null,
          convertStringToBool(caseDataPost?.isEnableMultiline),
          caseDataPost.streetRouteField,
          caseDataPost.cityField,
          caseDataPost.stateField,
          caseDataPost.postalCodeField || '0',
          caseDataPost.mailingAddressStreetRouteField,
          caseDataPost.mailingAddressCityField,
          caseDataPost.mailingAddressPostalCodeField || '0',
          caseDataPost.mailingAddressStateField,
          caseDataPost.mailingAddress,
          caseDataPost.apartmentSuite,
          caseDataPost.caseTag,
          SyncModel,
        );
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_CASE_API}`,
          body: Payload,
        });
        if (response?.data?.statusCode === 200) {
          await updateCaseIfIdExist(
            caseDataPost,
            caseDataPost,
            false,
            true,
            false,
            false,
            false,
            caseDataPost?.isEnableMultiline,
            caseDataPost?.isAllowEditCase, //permission
            caseDataPost?.isAllowViewInspection,
            false,
            caseDataPost?.isAllowAddAdminNotes,
          );
          await updateOfflineHistoryIfIdExist(
            CASE,
            caseDataPost.contentItemId,
            '',
            caseDataPost.displayText,
            String(new Date()),
            CASE,
            caseDataPost.caseType,
          );
          return 200;
        } else {
          return 500;
        }
      }
    }
  }
  return 500;
};

export const licenseForceSync = async (licenseId: string, isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    const responseLicenseData = await fetchLocalLicenseById(licenseId);
    if (Array.isArray(responseLicenseData) && responseLicenseData.length > 0) {
      const url = getBaseUrl();
      for (var i = 0; i < responseLicenseData?.length; i++) {
        let licenseEditData: any = responseLicenseData[i];
        licenseEditData.isForceSyncSuccess = 1; // isForceSyncSuccess=true for identify this object is forsynced , this is helpful for delete forcesynck item.
        const SyncModel = SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          licenseEditData.correlationId,
          licenseEditData.contentItemId,
          null,
        );
        const licenseDataPayload = buildLicensePayload({
          contentItemId: licenseEditData?.contentItemId ?? '',
          licenseUniqNumber: licenseEditData?.licenseNumber ?? '',
          expirationDate: licenseEditData?.expirationDate ?? null,
          applicantFirstName: licenseEditData?.applicantFirstName ?? '',
          applicantLastName: licenseEditData?.applicantLastName ?? '',
          email: licenseEditData?.email ?? '',
          phoneNumber: licenseEditData?.phoneNumber ?? '',
          cellNumber: licenseEditData?.cellNumber ?? '',
          parcelNumber: licenseEditData?.parcelNumber ?? '',
          quickRefNumber: licenseEditData?.quickRefNumber ?? '',
          additionalInfo: licenseEditData?.additionalInfo ?? '',
          location: licenseEditData?.location ?? '',
          businessName: licenseEditData?.businessName ?? '',
          renewalStatusId: licenseEditData?.renewalStatus ?? '',
          statusId: licenseEditData?.statusId ?? '',
          licenseStatusDisplayText: licenseEditData?.licenseStatusDisplayText ?? '',
          licenseTypeId: licenseEditData?.licenseTypeId ?? '',
          licenseTypeDisplayText: licenseEditData?.licenseType ?? '',
          licenseTag: licenseEditData?.licenseTag ?? '',
          licenseSubType: licenseEditData?.licenseSubType ?? '',
          assignedUsers: licenseEditData?.assignedUsers,
          paymentReceived: licenseEditData?.isPaymentReceived ?? '',
          licenseDescriptor: licenseEditData?.licenseDescriptor ?? '',
          isForceSync: true,
          isApiUpdateQuickRefNumberAndParcelNumber: true,
          SyncModel: SyncModel,
          isNetworkAvailable: true,
          isAllowAssigned: licenseEditData?.viewOnlyAssignUsers === 0 ? false : true,
        });

        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.EDIT_LICENSES}`,
          body: licenseDataPayload,
        });
        if (response?.data?.statusCode === 200) {
          await updateLicenseIfIdExist(
            licenseEditData,
            licenseEditData,
            false,
            true,
            false,
            false,
            false,
            licenseEditData.isAllowEditLicense,
            licenseEditData.isAllowViewInspection,
            false,
            licenseEditData.isAllowAddAdminNotes,
            '',
            licenseEditData.ApiChangeDateUtc,
          );
          updateOfflineHistoryIfIdExist(
            LICENSE,
            licenseEditData.contentItemId,
            '',
            licenseEditData.displayText,
            String(new Date()),
            LICENSE,
            licenseEditData.licenseType,
          );
          return 200;
        } else {
          return 500;
        }
      }
    }
  }
  return 500;
};

export const caseSettingForceSync = async (contentItemId: string, isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    const responseData = await fetchCaseSettingById(contentItemId);
    if (Array.isArray(responseData) && responseData.length > 0) {
      const url = getBaseUrl();
      for (var i = 0; i < responseData?.length; i++) {
        let setting: any = responseData[i];
        const syncModel = SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          generateUniqueID(),
          setting.contentItemId,
          null,
        );
        const payload = {
          assignAccess: setting?.assignAccess ?? null,
          assignedUsers: setting?.assignedUsers ?? null,
          caseOwner: setting?.caseOwner ?? null,
          contentItemId: setting?.contentItemId,
          permitExpirationDate: setting?.permitExpirationDate
            ? formatDate(setting?.permitExpirationDate, 'YYYY-MM-DD')
            : null,
          permitIssuedDate: setting?.permitIssuedDate
            ? formatDate(setting?.permitIssuedDate, 'YYYY-MM-DD')
            : null,
          projectValuation: setting?.projectValuation ?? null,
          viewOnlyAssignUsers: !!setting?.viewOnlyAssignUsers,
          syncModel,
        };
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_SETTING}`,
          body: payload,
        });
        if (response?.data?.statusCode === 200) {
          await updateSettingsSyncStatus(setting.contentItemId, false, true, false);
          return 200;
        }
      }
    }
  }
  return 500;
};

export const updateIsEditedByCaseID = async (id) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${TABLES.CASES} SET isEdited=?, isSync=?, isForceSync=? WHERE contentItemId=?`,
      [0, 0, 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating case by ID:', error);
    console.error('Error updating case by ID:', error);
  }
};

// Update 'isEdited' by License ID
export const updateIsEditedByLicenseID = async (id) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.LICENSE} 
        SET  isEdited=? , isSync=? , isForceSync=? WHERE contentItemId=?`,
      [0, 0, 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating isEdited by license ID:------>>>>>', error);
    console.error('Error updating isEdited by license ID:------>>>>>', error);
  }
};

export const updateIsEditedByCaseSettingId = async (id) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_SETTINGS_TABLE_NAME} 
        SET  isEdited=? , isSync=? , isForceSync=? WHERE contentItemId=?`,
      [0, 0, 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating isEdited by license ID:------>>>>>', error);
    console.error('Error updating isEdited by license ID:------>>>>>', error);
  }
};
export const updateIsEditedByContactId = async (id) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_CONTACT_TABLE_NAME} 
        SET  isEdited=? , isSync=? , isForceSync=? WHERE contentItemId=?`,
      [0, 0, 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating isEdited by license ID:------>>>>>', error);
    console.error('Error updating isEdited by license ID:------>>>>>', error);
  }
};

export const updateIsEditedByAdminNotesId = async (id) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} 
        SET  isEdited=? , isSync=? , isForceSync=? WHERE contentItemId=?`,
      [0, 0, 0, id],
    );
  } catch (error) {
    recordCrashlyticsError('Error updating isEdited by license ID:------>>>>>', error);
    console.error('Error updating isEdited by license ID:------>>>>>', error);
  }
};
