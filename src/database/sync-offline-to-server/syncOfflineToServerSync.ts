import {
  commentWithFileToUpload,
  deleteNotInOfflineAdminNotes,
  deleteNotInOfflineAdminNotesFile,
  fetchAdminNotesToSync,
  fetchAttachmentDataForSync,
  fetchCaseSync,
  fetchContactsToSync,
  fetchDocDataToSync,
  fetchLicenseSync,
  fetchSettingsToSync,
  updateAdminNotesAfterSetAsAlert,
  updateAdminNotesSyncStatus,
  updateCommentFileURL,
  updateCommentURLReady,
  updateSettingsSyncStatus,
} from './syncOfflineToServerDAO';
import type { AdminNoteSyncData, SettingsSyncData } from '../types/commonSyncModels';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { getBaseUrl, getOfflineUtcDate } from '../../session/SessionManager';
import {
  convertStringToBool,
  formatDate,
  formatToYYYYMMDD,
  generateUniqueID,
  isNullOrEmpty,
  normalizeBool,
} from '../../utils/helper/helpers';
import { POST_DATA_WITH_TOKEN, UPLOAD_API } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import {
  deleteNotInOfflineContact,
  syncAdminNotesWithDatabase,
  syncCaseSettingsWithDatabase,
  updateContactDataForceSync,
  updateContactDataSync,
} from '../sub-screens/subScreenDAO';
import type { SyncQueueTask } from '../../utils/syncUtils';
import { addToSyncQueue, fetchPendingSyncTasks, updateSyncTaskStatus } from '../../utils/syncUtils';
import { TEXTS } from '../../constants/strings';
import { CASE, FORM, LICENSE, TAB, TABLES } from '../DatabaseConstants';
import {
  caseEditFormDataSync,
  contactFormData,
  editAttachItem,
  SyncModelParam,
} from '../../utils/params/commonParams';
import { updateCaseIfIdExist } from '../my-case/myCaseSync';
import { updateLocation, updateMailingAdress } from '../../screens/my-case/CaseService';
import type { CaseData } from '../../utils/interfaces/ICase';
import { getDatabase } from '../DatabaseService';
import { buildLicensePayload } from '../../utils/params/licenseCommonParams';
import { updateLicenseIfIdExist } from '../license/licenseSync';
import {
  processAttachedDocTask,
  processAttachmentTask,
} from '../sub-screens/attached-docs/attachedDocsSync';
import {
  deleteImageFormId,
  fetchAllEditedFormData,
  fetchAllFormDataJSON,
  fetchFormioFileData,
  fetchFormioImgswithLocalID,
  fetchFromFileDB,
  storeAddFormCaseLicenceAttach,
  updateEditedFormStartSync,
  updateEditedFormSyncStatus,
  updateEditSubmissionJSON,
  updateFormAfterSync,
  updateFormImageAssureURL,
  updateFormReadyToSync,
  updateReadyToSyncJSON,
  updateReadyToUpdateJSON,
  updateSubmissionJSON,
} from '../sub-screens/attached-items/attachedItemsDAO';
import { updateOfflineHistoryIfIdExist } from '../sync-history/syncHistorySync';
import type { SyncModel } from '../../utils/interfaces/ISubScreens';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

// Enum for supported sync types
enum SyncType {
  CASE = 'case',
  SETTINGS = 'settings',
  ADMIN_NOTES = 'admin_notes',
  LICENSE = 'license',
  INSPECTION = 'inspection',
  CONTACTS = 'Contacts',
  // Add placeholders for other sections
  FORM = 'form',
  EDITFORM = 'editForm',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  ATTACHED_DOC = 'attachmentDocs',
  FORM_FILE = 'formFile',
  ADMIN_NOTES_FILE = 'adminNoteFile',
  // Add more as needed for 13+ sections
}

// Constants
const CHUNK_SIZE = 10; // Reduced from 50 to 10 as per client feedback
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_CONCURRENT_REQUESTS = 5; // For scalability

// Centralized retry logic with exponential backoff
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY_MS,
): Promise<T> => {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Retry attempt ${attempt} failed with error:`, error);
      if (attempt === maxRetries) {
        throw new Error(`SyncError: ${error?.message}`);
      }
      if (error?.message?.includes('transaction')) {
        console.warn('Transaction error detected, skipping retry');
        throw error; // Skip retries for transaction errors
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};
// Process a batch of tasks with concurrency control
export const processBatch = async (
  tasks: SyncQueueTask[],
  offlineItemsCount: () => void,
): Promise<void> => {
  const chunks: SyncQueueTask[][] = [];
  for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
    chunks.push(tasks.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    // Process each chunk in slices of MAX_CONCURRENT_REQUESTS
    for (let i = 0; i < chunk.length; i += MAX_CONCURRENT_REQUESTS) {
      const slice = chunk.slice(i, i + MAX_CONCURRENT_REQUESTS);

      const promises = slice.map(async (task) => {
        // Skip tasks that are already done
        if (task.status === 'completed' || task.status === 'force_sync') return;

        await updateSyncTaskStatus(task.id, 'processing', task.retry_count);

        try {
          await retry(async () => {
            console.log('Process Type', task.type);
            switch (task.type as SyncType) {
              case SyncType.CASE:
                console.log('CASE syncing Calling');
                await processCaseTask(task, offlineItemsCount);
                break;
              case SyncType.SETTINGS:
                console.log('SETTINGS syncing Calling');
                await processSettingsTask(task, offlineItemsCount);
                break;
              case SyncType.CONTACTS:
                console.log('CONTACTS syncing Calling');
                await processContactsTask(task, offlineItemsCount);
                break;
              case SyncType.ADMIN_NOTES_FILE:
                console.log('ADMIN_NOTES_FILE syncing Calling');
                await processAdminNotesFileTask(task, offlineItemsCount);
                break;
              case SyncType.ADMIN_NOTES:
                console.log('ADMIN_NOTES syncing Calling');
                await processAdminNotesTask(task, offlineItemsCount);
                break;
              case SyncType.LICENSE:
                console.log('LICENSE syncing Calling');
                await processLicenseTask(task, offlineItemsCount);
                break;
              case SyncType.ATTACHMENT:
                console.log('ATTACHMENT syncing Calling');
                await processAttachmentTask(task, offlineItemsCount);
                break;
              case SyncType.ATTACHED_DOC:
                console.log('ATTACHED_DOC syncing Calling');
                await processAttachedDocTask(task, offlineItemsCount);
                break;
              case SyncType.FORM_FILE:
                console.log('FORM_FILE syncing Calling');
                await processFormFileTask(task, offlineItemsCount);
                break;
              case SyncType.FORM:
                console.log('FORM syncing Calling');
                await processFormTask(task, offlineItemsCount);
                break;
              case SyncType.EDITFORM:
                console.log('EDITFORM syncing Calling');
                await processEditedFormTask(task, offlineItemsCount);
                break;
              // case SyncType.COMMENT:
              //   await processCommentTask(task, offlineItemsCount);
              //   break;
              default:
                throw new Error(`Unsupported sync type: ${task.type}`);
            }
          });
        } catch (error: any) {
          recordCrashlyticsError(`Error processing task ${task.id}:`, error);
          console.error(`Error processing task ${task.id}:`, error);
          await updateSyncTaskStatus(task.id, 'failed', task.retry_count + 1);

          if (task.retry_count >= MAX_RETRIES) {
            ToastService.show(`Failed to sync ${task.type} after retries.`, COLORS.ERROR);
          }
        }
      });
      // Wait for this slice to finish before starting the next slice
      await Promise.all(promises);
    }
  }

  console.log('------>processBatch completed successfully<----------');
};

export const getTotalPendingSyncItemCount = async (): Promise<number> => {
  const db = getDatabase();
  try {
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as total FROM ${TABLES.SYNC_QUEUE} WHERE status = ?`,
      ['pending'],
    );

    return result?.total ?? 0;
  } catch (error) {
    recordCrashlyticsError('Error fetching pending sync count:', error);
    console.error('Error fetching pending sync count:', error);
    return 0;
  }
};

// Main sync queue processor
export const processSyncQueue = async (offlineItemsCount: () => void) => {
  console.log('------------>Starting processSyncQueue...<------------');
  const syncTypes = Object.values(SyncType);
  const allTasks: SyncQueueTask[] = [];
  for (const type of syncTypes) {
    const tasks = await fetchPendingSyncTasks(type, 'pending');
    console.log(`Fetched ${tasks.length} pending tasks for type ${type}`);
    allTasks.push(...tasks);
  }

  if (allTasks.length === 0) {
    console.log('----------->No tasks to sync in processSyncQueue<-------------');
    ToastService.show('No tasks to sync.', COLORS.SUCCESS_GREEN);
    return;
  }

  allTasks.sort((a, b) => a.created_at.localeCompare(b.created_at));
  console.log('allTasks------>>>>>>>', allTasks);

  await processBatch(allTasks, offlineItemsCount);
  console.log('------>processSyncQueue completed successfully<----------');
};

// Process case task
export const processCaseTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
  isforceSync: boolean = false,
) => {
  const caseDataPost = task.data;
  if (!isNullOrEmpty(caseDataPost.contentItemId)) {
    const offlineUtcDate = getOfflineUtcDate();
    const url = getBaseUrl();
    const SyncModel = SyncModelParam(
      true, //IsOfflineSync always true
      isforceSync, //IsForceSync always false
      offlineUtcDate, //utc date when we come on the offline
      caseDataPost.correlationId, //correlationId
      caseDataPost.contentItemId, //contentItemId
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

    if (isNullOrEmpty(caseDataPost.contentItemId)) return;
    if (isforceSync) {
      caseDataPost.isForceSyncSuccess = 1; // isForceSyncSuccess=true for identify this object is forsynced , this is helpful for delete forcesynck item.
    }
    const response = await POST_DATA_WITH_TOKEN({
      url: `${url}${URL.UPDATE_CASE_API}`,
      body: Payload,
    });
    if (normalizeBool(caseDataPost?.isEnableMultiline)) {
      await editAddressApi(caseDataPost, SyncModel);
      await editMailingAddressApi(caseDataPost, SyncModel);
    }
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
        caseDataPost?.isAllowEditCase,
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
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
    } else if (
      response?.data?.statusCode === 409 // response?.data?.message === "There is conflict in web and offline data."
    ) {
      await updateCaseIfIdExist(
        caseDataPost,
        caseDataPost,
        false,
        false,
        true,
        false,
        false,
        caseDataPost?.isEnableMultiline,
        caseDataPost.isAllowEditCase,
        caseDataPost.isAllowViewInspection,
        false,
        caseDataPost.isAllowAddAdminNotes,
      );
      console.log('--Case------>There is conflict in web and offline data.');
      await updateSyncTaskStatus(task.id, 'force_sync');
      // await updateSyncTaskStatus(task.id, "completed");
      offlineItemsCount();
    } else if (response?.data?.statusCode === 403) {
      await updateCaseIfIdExist(
        caseDataPost,
        caseDataPost,
        true,
        false,
        false,
        false,
        true,
        caseDataPost?.isEnableMultiline,
        caseDataPost.isAllowEditCase,
        caseDataPost.isAllowViewInspection,
        true,
        caseDataPost.isAllowAddAdminNotes,
      );
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
    } else if (response?.data?.statusCode === 406) {
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
      console.log('Case Data Already Created.');
    } else {
      // ToastService.show(response?.data?.message, COLORS.ERROR);
      throw new Error(`case error:---->>> ${response?.data?.message || 'Case sync failed'}`);
    }
  }
};

// Process license task
export const processLicenseTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
  isforceSync: boolean = false,
) => {
  const licenseEditData = task.data;
  const offlineUtcDate = getOfflineUtcDate();
  const url = getBaseUrl();
  const SyncModel = SyncModelParam(
    true,
    isforceSync,
    offlineUtcDate,
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
    // longitude: licenseEditData?.longitudeField ?? "",
    // latitude: licenseEditData?.latitudeField ?? "",
    isAllowAssigned: licenseEditData?.viewOnlyAssignUsers === 0 ? false : true,
  });
  if (isforceSync) {
    licenseEditData.isForceSyncSuccess = 1; // isForceSyncSuccess=true for identify this object is forsynced , this is helpful for delete forcesynck item.
  }
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
    );
    await updateOfflineHistoryIfIdExist(
      LICENSE,
      licenseEditData.contentItemId,
      '',
      licenseEditData.displayText,
      String(new Date()),
      LICENSE,
      licenseEditData.licenseType,
    );
    await updateSyncTaskStatus(task.id, 'completed');
    offlineItemsCount();
  } else if (
    response?.data?.statusCode === 409 // response?.data?.message === "There is conflict in web and offline data."
  ) {
    await updateLicenseIfIdExist(
      licenseEditData,
      licenseEditData,
      false,
      false,
      true,
      false,
      false,
      licenseEditData.isAllowEditLicense,
      // licenceData.isAllowViewInspection,
      licenseEditData.isAllowViewInspection,
      false,
      licenseEditData.isAllowAddAdminNotes,
    );
    await updateSyncTaskStatus(task.id, 'force_sync');
    offlineItemsCount();
  } else if (response?.data?.statusCode === 403) {
    await updateLicenseIfIdExist(
      licenseEditData,
      licenseEditData,
      true,
      false,
      false,
      false,
      true,
      licenseEditData.isAllowEditLicense,
      licenseEditData.isAllowViewInspection,
      // licenceData.isAllowViewInspection,
      true,
      licenseEditData.isAllowAddAdminNotes,
    );
    await updateSyncTaskStatus(task.id, 'completed');
    offlineItemsCount();
  } else if (response?.data?.statusCode === 406) {
    await updateSyncTaskStatus(task.id, 'completed');
    offlineItemsCount();
    console.log('Data Already Created.');
  } else {
    ToastService.show(response?.data?.message, COLORS.ERROR);
    throw new Error(`License error:---->>> ${response?.data?.message}`);
  }
};

// Process settings task
export const processSettingsTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
  isforceSync: boolean = false,
) => {
  const setting: SettingsSyncData =
    typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
  const offlineUtcDate = getOfflineUtcDate();
  console.log('offlineUtcDate-processSettingsTask--->>>>', offlineUtcDate);

  const url = getBaseUrl();
  const syncModel = {
    isOfflineSync: true,
    isForceSync: isforceSync,
    apiChangeDateUtc: offlineUtcDate,
    correlationId: generateUniqueID(),
    syncContentItemId: setting?.contentItemId,
    syncDocumentId: null,
  };
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
  console.log('Setting sync response--->', response?.data);

  if (response?.data?.statusCode === 200) {
    await updateSettingsSyncStatus(setting.contentItemId, false, true, false);
    await updateSyncTaskStatus(task.id, 'completed');
    await updateOfflineHistoryIfIdExist(
      TAB,
      setting?.contentItemId,
      '',
      CASE,
      String(new Date()),
      'Settings',
      '',
    );
    offlineItemsCount();
    ToastService.show('Settings synced successfully.', COLORS.SUCCESS_GREEN);
  } else if (response?.data?.statusCode === 403) {
    await updateSettingsSyncStatus(setting.contentItemId, true, false, false);
    await updateSyncTaskStatus(task.id, 'failed', task.retry_count + 1);
    ToastService.show('Permission error syncing settings.', COLORS.ERROR);
  } else if (response?.data?.statusCode === 409) {
    await updateSettingsSyncStatus(setting.contentItemId, false, false, true);
    await updateSyncTaskStatus(task.id, 'force_sync');
    offlineItemsCount();
  } else {
    throw new Error(`API error: ${response?.message}`);
  }
};

// Process admin notes task
export const processAdminNotesTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
  isforceSync: boolean = false,
) => {
  const note: AdminNoteSyncData = task.data;
  const url = getBaseUrl();
  const offlineUtcDate = getOfflineUtcDate();
  let serverContentItemId = '';
  const apiUrl = note.isPublic
    ? note.isCase
      ? `${url}${URL.ADD_PUBLIC_COMMENT}`
      : `${url}${URL.ADD_LICENSE_PUBLIC_COMMENT}` // Added license comment support
    : note.isCase
      ? `${url}${URL.ADD_ADMIN_COMMENT}`
      : `${url}${URL.ADD_LICENSE_ADMIN_COMMENT}`; // Added license comment support

  // Build Sync Payload
  const syncModel = SyncModelParam(
    true,
    isforceSync,
    offlineUtcDate,
    note?.correlationId ?? generateUniqueID(),
    note?.contentItemId,
    null,
  );

  const payload = {
    filename: note?.fileName || null,
    attachment: note?.attachment || null,
    comment: note?.comment,
    contentItemId: note?.caseAndLicenseId || note?.id,
    id: !note?.isNewData && note?.isEdit ? note?.contentItemId : null,
    SyncModel: syncModel,
  };
  try {
    if (normalizeBool(note?.isNewData)) {
      const response = await POST_DATA_WITH_TOKEN({
        url: apiUrl,
        body: payload,
      });
      serverContentItemId = response?.data?.data?.id;
      const statusCode = response?.data?.statusCode;
      const status = response?.status === 200 && response?.data?.status;
      if (status) {
        await updateAdminNotesSyncStatus(
          serverContentItemId,
          note?.contentItemId ?? '',
          note?.id ?? note?.caseAndLicenseId,
          false,
          true,
          false,
        );
        const syncAreaName = note?.isPublic ? 'Public Comments' : 'Admin Notes';
        await updateOfflineHistoryIfIdExist(
          TAB,
          note?.id ?? '',
          serverContentItemId ?? '',
          note.isCase ? CASE : LICENSE,
          String(new Date()),
          syncAreaName,
          '',
        );
        ToastService.show('Admin note synced successfully.', COLORS.SUCCESS_GREEN);
        // Move updateSyncTaskStatus here to ensure it’s called for successful sync
        await updateSyncTaskStatus(task.id, 'completed');
        offlineItemsCount();
      } else if (statusCode === 406 || statusCode === 403) {
        console.log(`API rejected sync (code: ${statusCode})`);
        await deleteNotInOfflineAdminNotesFile(note?.contentItemId ?? '');
        await updateSyncTaskStatus(task.id, 'completed');
        await deleteNotInOfflineAdminNotes(note?.caseAndLicenseId || note?.id);
        offlineItemsCount();
      } else if (statusCode === 409) {
        console.log('Conflict detected (409), marking for force sync.');
        await updateSyncTaskStatus(task.id, 'force_sync');
        await updateAdminNotesSyncStatus(
          serverContentItemId,
          note?.contentItemId ?? '',
          note?.id ?? note?.caseAndLicenseId,
          false,
          false,
          true,
        );
      } else {
        throw new Error(`API error: ${response?.data?.message}`);
      }
    }
    const alertEnable = !note.isPublic && note?.isEdit;

    if (normalizeBool(alertEnable)) {
      console.log('Marking comment as alert');
      await markCommentAsAlert(
        note,
        serverContentItemId,
        syncModel,
        url,
        task.id,
        offlineItemsCount,
      );
    }
  } catch (error) {
    recordCrashlyticsError('Failed to sync admin note:', error);
    console.error('Failed to sync admin note:', error);
    await updateSyncTaskStatus(task.id, 'failed', task.retry_count + 1);
    if (task.retry_count >= MAX_RETRIES) {
      ToastService.show(`Failed to sync ${task.type} after retries.`, COLORS.ERROR);
    }
    throw error;
  }
};
export const processAdminNotesFileTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
) => {
  const file = task.data;
  const url = getBaseUrl();
  const fileURIs = file?.localUrl?.split(',');
  const fileNames = file?.fileName?.split(',');
  const fileTypes = file?.originalType?.split(',') || file?.fileType?.split(',');
  const filePath = file?.isCase
    ? file.isPublic
      ? `/CaseAttachments/${file?.contentItemId}/PublicComment`
      : `/CaseAttachments/${file?.contentItemId}/AdminComments`
    : file.isPublic
      ? `/LicenseAttachments/${file?.contentItemId}/PublicComments`
      : `/LicenseAttachments/${file?.contentItemId}/AdminComments`;

  const allFileLinks: string[] = [];
  const uploadedFileNames: string[] = [];

  try {
    for (let index = 0; index < fileURIs.length; index++) {
      const formData = new FormData();
      formData.append('file', {
        uri: fileURIs[index],
        name: fileNames[index],
        type: fileTypes[index],
      } as any);
      formData.append('dir', filePath);

      const response = await retry(async () => {
        const responseJson = await UPLOAD_API({
          body: formData,
          url: `${url}${URL.FILE_UPLOAD_API}`,
        });
        if (!responseJson.url) {
          throw new Error('File upload failed');
        }
        return responseJson;
      });

      uploadedFileNames.push(response.filename);
      allFileLinks.push(response.url);
    }

    await updateCommentFileURL(allFileLinks.join(','), file.localID);
    await updateCommentURLReady(true, file.localID);
    await updateSyncTaskStatus(task.id, 'completed');
    offlineItemsCount();
  } catch (error) {
    recordCrashlyticsError(`Error processing admin note file task ${task.id}:`, error);
    console.error(`Error processing admin note file task ${task.id}:`, error);
    await updateSyncTaskStatus(task.id, 'failed', task.retry_count + 1);
    if (task.retry_count >= MAX_RETRIES) {
      ToastService.show(`Failed to sync ${task.type} after retries.`, COLORS.ERROR);
    }
    throw error;
  }
};

const contactSyncLock = new Set<string>();
// Process contacts task
export const processContactsTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
  isforceSync: boolean = false,
) => {
  const offlineUtcDate = getOfflineUtcDate();
  console.log('offlineUtcDate-processContactsTask--->>>>', offlineUtcDate);

  const formData = task?.data;
  const lockKey =
    `${formData?.contentItemId ?? formData?.CaseContentItemId}` +
    `-${formData?.id}-${formData?.addNew}`;

  /* if another task already handles it, just mark done & exit */
  if (contactSyncLock.has(lockKey)) {
    await updateSyncTaskStatus(task.id, 'completed');
    return;
  }
  contactSyncLock.add(lockKey);
  const getContactId = !formData?.isNew && formData?.isEdited ? formData.id : null;
  // isNew false  and isEdited true then Id is Added else null

  const SyncModel = {
    ApiChangeDateUtc: offlineUtcDate,
    CorrelationId: formData.correlationId,
    IsForceSync: isforceSync,
    IsOfflineSync: true,
    SyncContentItemId: null,
    SyncDocumentId: getContactId,
  };

  try {
    const payload = contactFormData(
      formData.firstName,
      formData?.lastName,
      formData?.email,
      formData?.phoneNumber,
      typeof formData?.mailingAddress == 'undefined' ? null : formData?.mailingAddress,
      getContactId,
      formData?.contentItemId,
      formData?.contactType,
      formData?.businessName == '' ? null : formData?.businessName,
      formData?.isAllowAccess == 1 ? true : false,
      formData?.isPrimary == 1 ? true : false,
      formData?.notes == '' ? null : formData?.notes,
      formData?.endDate ?? null,
      normalizeBool(formData?.isCase) ? 'Case' : 'License',
      formData?.isNew,
      SyncModel,
    );
    console.log('payload----processContactsTask-->>>>>', payload);

    const url = getBaseUrl();
    const endpoint = normalizeBool(formData?.isCase)
      ? `${url}${URL.ADD_CONTACT}`
      : `${url}${URL.ADD_LICENSE_CONTACT}`;
    const response = await POST_DATA_WITH_TOKEN({
      url: endpoint,
      body: payload,
    });
    console.log('response---contact>>', response?.data);

    if (response?.data?.statusCode === 200) {
      await updateContactDataSync(
        formData,
        formData?.id,
        response?.data?.data,
        formData?.isCase ? true : false,
        formData?.contentItemId,
      );
      await updateOfflineHistoryIfIdExist(
        TAB,
        formData?.contentItemId,
        response?.data?.data ?? '',
        formData.isCase ? CASE : LICENSE,
        String(new Date()),
        'Contact',
        '',
      );
      await updateSyncTaskStatus(task.id, 'completed');
      ToastService.show('Contact sync successfully.', COLORS.SUCCESS_GREEN);
      offlineItemsCount();
    } else if (response?.data?.statusCode == 409) {
      await updateSyncTaskStatus(task.id, 'force_sync');
      updateContactDataForceSync(formData.id);
      offlineItemsCount();
    } else if (response?.data?.statusCode == 406) {
      deleteNotInOfflineContact(formData?.contentItemId);
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
    }
  } catch (error) {
    recordCrashlyticsError('contact sync SQLite error -----→', error);
    console.error('contact sync SQLite error -----→', error?.message, error?.code, error);
    await updateSyncTaskStatus(task.id, 'failed', task.retry_count + 1);
  } finally {
    contactSyncLock.delete(lockKey);
  }
};

// Sync settings
export const syncSettings = async (offlineItemsCount: () => void, isNetworkAvailable: boolean) => {
  try {
    if (!isNetworkAvailable) {
      ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
      return;
    }
    //await processSyncQueue(offlineItemsCount);

    const settingsToSync = await fetchSettingsToSync();
    if (settingsToSync.length === 0) {
      // ToastService.show("No settings to sync.", COLORS.SUCCESS_GREEN);
      return;
    }

    for (const setting of settingsToSync) {
      await addToSyncQueue(SyncType.SETTINGS, setting);
    }

    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing settings:', error);
    console.error('Error syncing settings:', error);
    ToastService.show('Error syncing settings. Will retry later.', COLORS.ERROR);
  }
};

// Sync admin notes
export const syncAdminNotes = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  try {
    if (!isNetworkAvailable) {
      ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
      return;
    }
    // await processSyncQueue(offlineItemsCount);
    console.log('syncAdminNotes process is start ---->');
    const [notesToSync] = await Promise.all([fetchAdminNotesToSync()]);
    //  const notesToSync = (await fetchCaseAdminNotesToSync()) ?? [];
    console.log('Admin Notes to sync ---->', notesToSync);
    if (notesToSync?.length === 0) {
      //  ToastService.show("No admin notes to sync.", COLORS.ORANGE);
      return;
    }
    for (const note of notesToSync) {
      console.log(
        `${note.isPublic ? 'Public comments are added' : 'Admin Notes are added'}---->`,
        note,
      );
      await addToSyncQueue(SyncType.ADMIN_NOTES, note);
    }

    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing admin notes:', error);
    console.error('Error syncing admin notes:', error);
    ToastService.show('Error syncing admin notes. Will retry later.', COLORS.ERROR);
  }
};

export const syncAdminNotesFiles = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  if (!isNetworkAvailable) {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
  try {
    const files = await commentWithFileToUpload();
    if (files.length === 0) {
      ToastService.show('No admin note files to sync.', COLORS.SUCCESS_GREEN);
      return;
    }
    for (const file of files) {
      await addToSyncQueue(SyncType.ADMIN_NOTES_FILE, file);
    }
    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing admin note files:', error);
    console.error('Error syncing admin note files:', error);
    ToastService.show('Error syncing admin note files. Will retry later.', COLORS.ERROR);
  }
};

// Sync cases
export const syncEditCase = async (offlineItemsCount: () => void, isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    try {
      //  await processSyncQueue(offlineItemsCount);
      const caseData = await fetchCaseSync();
      if (caseData.length === 0) {
        //ToastService.show("No case data available to sync.", COLORS.ORANGE);
        return;
      }
      for (const item of caseData) {
        await addToSyncQueue(SyncType.CASE, item);
      }
      await processSyncQueue(offlineItemsCount);
    } catch (error) {
      recordCrashlyticsError('Error syncing cases:', error);
      console.error('Error syncing cases:', error);
      ToastService.show('Error syncing cases. Will retry later.', COLORS.ERROR);
    }
  } else {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
};
// Sync cases
export const syncEditLicense = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  if (isNetworkAvailable) {
    try {
      const licenseData = await fetchLicenseSync();
      if (licenseData.length === 0) {
        // ToastService.show("No license data available to sync.", COLORS.ORANGE);
        return;
      }
      for (const item of licenseData) {
        await addToSyncQueue(SyncType.LICENSE, item);
      }
      await processSyncQueue(offlineItemsCount);
    } catch (error) {
      recordCrashlyticsError('Error syncing license:', error);
      console.error('Error syncing license:', error);
      ToastService.show('Error syncing license. Will retry later.', COLORS.ERROR);
    }
  } else {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
};

export const syncContacts = async (offlineItemsCount: () => void, isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    try {
      const contactData = await fetchContactsToSync();
      if (contactData.length === 0) {
        // ToastService.show("No contacts data available to sync.", COLORS.ORANGE);
        return;
      }
      for (const item of contactData) {
        await addToSyncQueue(SyncType.CONTACTS, item);
      }
      await processSyncQueue(offlineItemsCount);
    } catch (error) {
      recordCrashlyticsError('Error syncing cases:', error);
      console.error('Error syncing cases:', error);
      ToastService.show('Error syncing contacts. Will retry later.', COLORS.ERROR);
    }
  } else {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
};

// Sync Attachments
export const syncAttachments = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  if (isNetworkAvailable) {
    try {
      const attachmentData = await fetchAttachmentDataForSync();
      if (attachmentData.length === 0) {
        ToastService.show('No attachments available to sync.', COLORS.ORANGE);
        return;
      }

      for (const item of attachmentData) {
        await addToSyncQueue(SyncType.ATTACHMENT, item);
      }

      await processSyncQueue(offlineItemsCount);
    } catch (error) {
      recordCrashlyticsError('Error syncing attachments:', error);
      console.error('Error syncing attachments:', error);
      ToastService.show('Error syncing attachments. Will retry later.', COLORS.ERROR);
    }
  } else {
    ToastService.show('No network connection available.', COLORS.ORANGE);
    return;
  }
};

//Sync AttachedDocs
export const syncAttachedDocs = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  if (isNetworkAvailable) {
    try {
      const docData = await fetchDocDataToSync();
      if (docData.length === 0) {
        ToastService.show('No attached documents available to sync.', COLORS.ORANGE);
        return;
      }

      for (const item of docData) {
        await addToSyncQueue(SyncType.ATTACHED_DOC, item);
      }

      await processSyncQueue(offlineItemsCount);
    } catch (error) {
      recordCrashlyticsError('Error syncing attached documents:', error);
      console.error('Error syncing attached documents:', error);
      ToastService.show('Error syncing attached documents. Will retry later.', COLORS.ERROR);
    }
  } else {
    ToastService.show('No network connection available.', COLORS.ORANGE);
    return;
  }
};

export const markCommentAsAlert = async (
  note: AdminNoteSyncData,
  serverContentItemId: string,
  syncModel: any,
  url: string,
  taskId: number,
  offlineItemsCount: () => void,
) => {
  try {
    const contentItemIdForSync = note?.isNewData
      ? serverContentItemId
      : (note?.contentItemId ?? '');
    const payload = {
      id: contentItemIdForSync ?? '',
      isAlert: note.commentIsAlert ?? note?.comment_isAlert ?? false,
      SyncModel: note?.isNewData ? null : syncModel,
    };
    const response = await POST_DATA_WITH_TOKEN({
      url: note.isCase
        ? `${url}${URL.ADMIN_COMMENTS_SET_AS_ALERT}`
        : `${url}${URL.ADMIN_COMMENTS_LICENSE_SET_AS_ALERT}`,
      body: payload,
    });
    if (response?.data?.statusCode === 200 || response?.data?.statusCode === 204) {
      console.log(`Comment ${note?.id} set as alert successfully`);
      const syncAreaName = note?.isPublic ? 'Public Comments' : 'Admin Notes';
      await updateAdminNotesAfterSetAsAlert(
        (note?.isEdit ? note?.contentItemId : serverContentItemId) ?? '',
        note?.id ?? note?.caseAndLicenseId,
        false,
        true,
        false,
      );
      await updateOfflineHistoryIfIdExist(
        TAB,
        note?.id ?? '',
        (note?.isEdit ? note?.contentItemId : serverContentItemId) ?? '',
        note?.isCase ? CASE : LICENSE,
        String(new Date()),
        syncAreaName,
        '',
      );
      ToastService.show('Admin note synced successfully.', COLORS.SUCCESS_GREEN);
      await updateSyncTaskStatus(taskId, 'completed');
      offlineItemsCount();
    } else if (response?.data?.statusCode === 409) {
      console.log('Conflict detected (409), marking for force sync.');
      await updateSyncTaskStatus(taskId, 'force_sync');
      await updateAdminNotesAfterSetAsAlert(
        (note?.isEdit ? note?.contentItemId : serverContentItemId) ?? '',
        note?.id ?? note?.caseAndLicenseId,
        false,
        false,
        true,
      );
    }
  } catch (alertError) {
    recordCrashlyticsError('Failed to set comment as alert:', alertError);
    console.error('Failed to set comment as alert:', alertError);
    ToastService.show(
      'Failed to set comment as alert. Task still completed.',
      COLORS.WARNING_ORANGE,
    );
  }
};

// Handle settings conflict
export const handleConflict = async (setting: SettingsSyncData, taskId: number) => {
  try {
    const url = getBaseUrl();
    const serverData = await POST_DATA_WITH_TOKEN({
      url: `${url}${URL.GET_SETTING}${setting.contentItemId}`,
      body: {},
    });

    if (serverData.status) {
      const serverChangeDate = new Date(serverData.data.ApiChangeDateUtc);
      const localChangeDate = new Date(setting.ApiChangeDateUtc || 0);

      if (serverChangeDate > localChangeDate) {
        await syncCaseSettingsWithDatabase(
          serverData.data,
          setting.contentItemId,
          false,
          true,
          false,
          setting.isCase,
        );
        await updateSyncTaskStatus(taskId, 'completed');
      } else {
        await updateSettingsSyncStatus(setting.contentItemId, true, false, true);
        await addToSyncQueue(SyncType.SETTINGS, {
          ...setting,
          isForceSync: true,
        });
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error resolving conflict:', error);
    console.error('Error resolving conflict:', error);
    await updateSyncTaskStatus(taskId, 'failed');
  }
};

// Handle admin notes conflict
export const handleAdminNotesConflict = async (note: AdminNoteSyncData, taskId: number) => {
  try {
    console.log('This admin notes come into the conflict -->', note);
    const url = getBaseUrl();
    const serverData = await POST_DATA_WITH_TOKEN({
      url: `${url}${note.isCase ? URL.COMMENT_API : ''}${note.contentItemId}`, // for license URL.GET_LICENSE_ADMIN_COMMENT
      body: {},
    });
    if (serverData?.status) {
      const serverChangeDate = new Date(serverData?.data?.ApiChangeDateUtc);
      const localChangeDate = new Date(note?.ApiChangeDateUtc || 0);
      if (serverChangeDate > localChangeDate) {
        await syncAdminNotesWithDatabase(
          [serverData?.data],
          note.isCase,
          note.caseAndLicenseId,
          true,
        );
        await updateSyncTaskStatus(taskId, 'completed');
      } else {
        await updateAdminNotesSyncStatus(
          serverData?.data?.data?.id,
          note?.contentItemId ?? '',
          note?.caseAndLicenseId,
          true,
          false,
          true,
        );
        await addToSyncQueue(SyncType.ADMIN_NOTES, {
          ...note,
          isForceSync: true,
        });
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error resolving admin notes conflict:', error);
    console.error('Error resolving admin notes conflict:', error);
    await updateSyncTaskStatus(taskId, 'failed');
  }
};

// Edit address API
export const editAddressApi = async (caseData: CaseData, SyncModel: SyncModel) => {
  try {
    await updateLocation({
      contentItemId: caseData?.contentItemId || '',
      streetAddress: caseData?.streetRouteField || '',
      latitude: caseData?.latitudeField || '',
      longitude: caseData?.longitudeField || '',
      city: caseData?.cityField || '',
      state: caseData?.stateField || '',
      zip: caseData?.postalCodeField || '',
      isManualLocation: normalizeBool(caseData?.isManualAddress) || false,
      SyncModel: SyncModel,
    });
    // if (updatedLocation?.status) {
    //   ToastService.show("Address updated successfully.", COLORS.SUCCESS_GREEN);
    // } else {
    //   ToastService.show(
    //     updatedLocation?.message || "Error updating address",
    //     COLORS.ERROR
    //   );
    // }
  } catch (error) {
    recordCrashlyticsError('Error updating address:', error);
    console.error('Error updating address:', error);
    // ToastService.show("Error updating address.", COLORS.ERROR);
  }
};

// Edit mailing address API
export const editMailingAddressApi = async (caseData: CaseData, SyncModel: SyncModel) => {
  try {
    await updateMailingAdress({
      contentItemId: caseData?.contentItemId || '',
      streetAddress: caseData?.mailingAddressStreetRouteField || '',
      city: caseData?.mailingAddressCityField || '',
      state: caseData?.mailingAddressStateField || '',
      zip: caseData?.mailingAddressPostalCodeField || '',
      SyncModel: SyncModel,
    });
    // if (updatedMailingAddress?.status) {
    //   ToastService.show(
    //     "Mailing address updated successfully.",
    //     COLORS.SUCCESS_GREEN
    //   );
    // } else {
    //   ToastService.show(
    //     updatedMailingAddress?.message || "Error updating mailing address",
    //     COLORS.ERROR
    //   );
    // }
  } catch (error) {
    recordCrashlyticsError('Error updating mailing address:', error);
    console.error('Error updating mailing address:', error);
  }
};
// Attched Item From
export const syncFormFiles = async (offlineItemsCount: () => void, isNetworkAvailable: boolean) => {
  if (!isNetworkAvailable) {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
  try {
    const files = await fetchFromFileDB();
    if (files.length === 0) {
      ToastService.show('No files to sync.', COLORS.SUCCESS_GREEN);
      return;
    }
    for (const file of files) {
      await addToSyncQueue(SyncType.FORM_FILE, file);
    }
    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing form files:', error);
    console.error('Error syncing form files:', error);
    ToastService.show('Error syncing files. Will retry later.', COLORS.ERROR);
  }
};

export const syncForms = async (offlineItemsCount: () => void, isNetworkAvailable: boolean) => {
  if (!isNetworkAvailable) {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
  try {
    // const formData = await fetchAllFormData1();
    const formData = await fetchAllFormDataJSON(); // Use fetchAllFormDataJSON for all unsynced forms

    if (formData.length === 0) {
      ToastService.show('No forms to sync.', COLORS.SUCCESS_GREEN);
      return;
    }
    for (const form of formData) {
      const updatedForm = await processFormFileBinding(form); //   const getUpdatedRecord = fetchFormDataJSONById(form?.localId);
      await addToSyncQueue(SyncType.FORM, updatedForm);
    }
    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing forms:', error);
    console.error('Error syncing forms:', error);
    ToastService.show('Error syncing forms. Will retry later.', COLORS.ERROR);
  }
};

export const syncEditedForms = async (
  offlineItemsCount: () => void,
  isNetworkAvailable: boolean,
) => {
  if (!isNetworkAvailable) {
    ToastService.show(TEXTS.alertMessages.noNetwork, COLORS.ORANGE);
    return;
  }
  try {
    const editedForms = await fetchAllEditedFormData();
    if (editedForms.length === 0) {
      ToastService.show('No edited forms to sync.', COLORS.SUCCESS_GREEN);
      return;
    }
    for (const form of editedForms) {
      await processEditedFormFileBinding(form);
      await addToSyncQueue(SyncType.EDITFORM, form);
    }
    await processSyncQueue(offlineItemsCount);
  } catch (error) {
    recordCrashlyticsError('Error syncing edited forms:', error);
    console.error('Error syncing edited forms:', error);
    ToastService.show('Error syncing edited forms. Will retry later.', COLORS.ERROR);
  }
};

export const processFormFileBinding = async (form: any) => {
  const formID = form.localId;
  const submit = JSON.parse(form.Submission);
  const allFiles = await fetchFormioImgswithLocalID(formID);
  if (allFiles.length === 0) {
    await updateReadyToSyncJSON(formID, 1); // No files, mark ready to sync
    console.log('No files for form, marked ready to sync:', formID);
    return form;
  }

  for (const file of allFiles) {
    const keyname = file?.key;
    const isDataGrid = file?.isDataGrid;
    const dataGridKey = file?.gridKey;
    const filesData = await fetchFormioFileData(file?.id);
    if (!filesData || filesData.length === 0) continue;

    const fileUpload = filesData.map((element: any) => ({
      storage: 'url',
      name: element.name,
      url: element.assureFileUrl,
      size: '89798',
      type: element.mimeType,
      originalName: element.name,
      data: {
        filename: element.name,
        url: element.assureFileUrl,
        baseUrl: 'https://api.form.io',
        project: '',
        form: '',
      },
    }));

    if (isDataGrid) {
      submit.data[keyname][0][dataGridKey] = fileUpload;
    } else {
      submit.data[keyname] = fileUpload;
    }
  }
  const updatedSubmission = JSON.stringify(submit);
  console.log('Updated Submission JSON', updatedSubmission);

  form.Submission = updatedSubmission;
  await updateSubmissionJSON(JSON.stringify(submit), formID, false);
  await updateReadyToSyncJSON(formID, 1);
  return form;
};

export const processEditedFormFileBinding = async (form: any) => {
  const formID = form.id;
  const submit = JSON.parse(form.updatedSubmission);
  const allFiles = await fetchFormioImgswithLocalID(formID);
  if (allFiles.length === 0) {
    await updateReadyToUpdateJSON(formID, 1);
    console.log('No files for edited form, marked ready to sync:', formID);
    return;
  }

  for (const file of allFiles) {
    const keyname = file?.key;
    const isDataGrid = file?.isDataGrid;
    const dataGridKey = file?.gridKey;
    const filesData = await fetchFormioFileData(file?.id);
    if (!filesData || filesData.length === 0) continue;

    const fileUpload = filesData.map((element: any) => ({
      storage: 'url',
      name: element.name,
      url: element.assureFileUrl,
      size: '89798',
      type: element.mimeType,
      originalName: element.name,
      data: {
        filename: element.name,
        url: element.assureFileUrl,
        baseUrl: 'https://api.form.io',
        project: '',
        form: '',
      },
    }));

    if (isDataGrid) {
      (submit.data || submit)[keyname][0][dataGridKey] = fileUpload;
    } else {
      (submit.data || submit)[keyname] = fileUpload;
    }
  }

  await updateEditSubmissionJSON(JSON.stringify(submit), formID, false);
  await updateReadyToUpdateJSON(formID, 1);
};

export const processFormFileTask = async (task: SyncQueueTask, offlineItemsCount: () => void) => {
  const file = task.data;
  const url = await getBaseUrl();
  const formData = new FormData();
  formData.append('file', {
    uri: file.localFilePath,
    name: file.name,
    type: file.originalType || file.mimeType,
  } as any);

  const response = await retry(async () => {
    const responseJson = await UPLOAD_API({
      url: `${url}${URL.FILE_UPLOAD_API}`,
      body: formData,
    });
    if (!responseJson.url) {
      throw new Error('File upload failed');
    }
    return responseJson;
  });

  await updateFormImageAssureURL(response.url, file.id);
  await updateFormReadyToSync(file.formId);
  await updateSyncTaskStatus(task.id, 'completed');
  offlineItemsCount();
};

export const processFormTask = async (task: SyncQueueTask, offlineItemsCount: () => void) => {
  const formData = task.data;
  const url = await getBaseUrl();
  const payload = {
    ContentType: formData.ContentType || null,
    CreatedUtc: formData.CreatedUtc ? formatDate(formData.CreatedUtc, 'YYYY-MM-DD') : null,
    DisplayText: formData.DisplayText || null,
    Owner: formData.Owner || null,
    Submission: formData.Submission || null,
    caseId: formData.caseId || null,
    caseNumber: formData.caseNumber || null,
    gridIds: formData.gridIds || null,
    id: formData.id || null,
    imageids: formData.imageids || null,
    isDraft: !!formData.isDraft,
    isEdited: !!formData.isEdited,
    isForceSync: !!formData.isForceSync,
    isSync: !!formData.isSync,
    licenseId: formData.licenseId || null,
    localId: formData.localId || null,
    readyToSync: !!formData.readyToSync,
    startSyncing: !!formData.startSyncing,
    title: formData.title || null,
  };

  const response = await retry(async () => {
    const responseJson = await POST_DATA_WITH_TOKEN({
      url: `${url}${URL.ADD_FROM_ENTRY}`,
      body: payload,
    });
    if (!responseJson?.status && !responseJson?.data?.status) {
      ToastService.show(responseJson?.data?.message || 'Form sync failed', COLORS.ERROR);
    }
    return responseJson;
  });

  const formID = response?.data?.data.AdvancedFormSubmissionsPart.ContentItemId;
  const caseId = response?.data?.data.AdvancedFormSubmissionsPart.CaseId;
  const licenseId = response?.data?.data.AdvancedFormSubmissionsPart.LicenseContentItemId;
  const itemText = response?.data?.data.AdvancedFormSubmissionsPart.DisplayText;

  if (formData.licenseId) {
    await storeAddFormCaseLicenceAttach(formID, caseId, licenseId, itemText);
    await updateOfflineHistoryIfIdExist(
      TAB,
      licenseId,
      formID,
      LICENSE,
      String(new Date()),
      'Attached Items',
      '',
    );
  } else if (formData.caseId) {
    await storeAddFormCaseLicenceAttach(formID, caseId, licenseId, itemText);
    await updateOfflineHistoryIfIdExist(
      TAB,
      caseId,
      formID,
      CASE,
      String(new Date()),
      'Attached Items',
      '',
    );
  } else {
    await updateOfflineHistoryIfIdExist(
      FORM,
      formID,
      '',
      formData.DisplayText,
      String(new Date()),
      'Form',
      formData.ContentType,
    );
  }
  await updateAddFormData(formData.localId, 1);
  await updateFormAfterSync(formID, formData.localId);
  await updateSyncTaskStatus(task.id, 'completed');
  offlineItemsCount();
};

export const processEditedFormTask = async (task: SyncQueueTask, offlineItemsCount: () => void) => {
  const formData = task.data;
  const url = await getBaseUrl();
  const payload = editAttachItem(
    formData.id,
    JSON.stringify(JSON.parse(formData.updatedSubmission).data),
  );

  await retry(async () => {
    const responseJson = await POST_DATA_WITH_TOKEN({
      url: `${url}${URL.EDIT_ADVANCE_FORM_SUBMISSION}`,
      body: payload,
    });
    if (!responseJson?.status && !responseJson?.data?.status) {
      throw new Error(responseJson?.data?.message || 'Edited form sync failed');
    }
    return responseJson;
  });

  await updateOfflineHistoryIfIdExist(
    TAB,
    formData.contentItemId,
    formData.id,
    formData.isCase ? CASE : LICENSE,
    String(new Date()),
    'Attached Items',
    '',
  );

  await updateEditedFormStartSync(false, formData.id);
  await updateEditedFormSyncStatus(
    formData.id,
    0,
    0,
    // formData.isCase,
    // formData.contentItemId
  );
  await deleteImageFormId(formData.id);
  await updateSyncTaskStatus(task.id, 'completed');
  offlineItemsCount();
};
export const updateAddFormData = async (id: string, isSync: number) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE ${TABLES.ADDFORM_DATA_TABLE_NAME} SET isSync = ?, readyToSync = ?, startSyncing = ? WHERE localId = ?`,
      [isSync, 0, 0, id],
    );
    console.log('Updated form data for id:', id, isSync);
    return result.changes === 1;
  } catch (error) {
    recordCrashlyticsError('Error updating form data:', error);
    console.error('Error updating form data:', error);
    return false;
  }
};
