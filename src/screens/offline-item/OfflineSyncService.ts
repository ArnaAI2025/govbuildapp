import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { getBaseUrl } from '../../session/SessionManager';
import {
  fetchAdminNotesItemForSyncScreen,
  fetchAttachedDocsForSyncScreen,
  fetchCaseForSyncScreen,
  fetchCaseSettingForSyncScreen,
  fetchContactForSyncCaseLicense,
  fetchLocalCasebyId,
  fetchPublicCommentItemForSyncScreen,
} from '../../database/my-case/myCaseSync';
import {
  fetchLicenseForSyncScreen,
  fetchLocalLicenseById,
} from '../../database/license/licenseSync';
import { navigate } from '../../navigation/Index';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { fetchPendingSyncTasks, SyncQueueTask, SyncType } from '../../utils/syncUtils';
import {
  processAdminNotesTask,
  processCaseTask,
  processContactsTask,
  processLicenseTask,
  processSettingsTask,
} from '../../database/sync-offline-to-server/syncOfflineToServerSync';

export const getCaseByCidData = async (
  contentItemId: string,
  type: 'Case' | 'License',
  isNetworkAvailable: boolean,
) => {
  try {
    if (isNetworkAvailable) {
      const baseUrl = getBaseUrl();
      const url =
        type === 'Case'
          ? `${baseUrl}${URL.GET_CASE_BY_ID}${contentItemId}`
          : `${baseUrl}${URL.LICENSE_BY_CONTENT_ID}${contentItemId}`;

      const response = await GET_DATA({ url });
      if (!response?.status || !response?.data?.status) {
        ToastService.show(' ', COLORS.ERROR);
        throw new Error('Failed to fetch by id: Invalid response status');
      }
      if (response?.status) {
        if (type === 'Case') {
          navigate('EditCaseScreen', {
            caseId: response?.data?.data?.contentItemId,
            myCaseData: response?.data,
          });
        } else {
          navigate('EditLicenseScreen', {
            contentItemId: response?.data?.data?.contentItemId,
            licenseData: response?.data,
          });
        }
      }
    } else {
      type CaseItem = { contentItemId: string };
      type LicenseItem = { contentItemId: string };

      if (type === 'Case') {
        const [caseData] = (await fetchLocalCasebyId(contentItemId)) as CaseItem[];
        if (caseData) {
          navigate('EditCaseScreen', {
            caseId: caseData.contentItemId,
            myCaseData: caseData,
          });
        }
      } else {
        const [licenseData] = (await fetchLocalLicenseById(contentItemId)) as LicenseItem[];
        if (licenseData) {
          navigate('EditLicenseScreen', {
            contentItemId: licenseData.contentItemId,
            licenseData,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching case/license ----->', error);
    throw error;
  }
};

const buildSyncedArea = (
  type:
    | SyncType.CASE
    | SyncType.LICENSE
    | SyncType.SETTINGS
    | SyncType.CONTACTS
    | SyncType.ADMIN_NOTES
    | SyncType.COMMENT
    | SyncType.ATTACHMENT,
  data: any,
  isCase: boolean,
  parentId?: string,
) => {
  return {
    id: data.contentItemId,
    name: type,
    isCase: isCase,
    parentId: parentId,
    isForceSync: data.isForceSync ?? 0,
    modifiedUtc: data.modifiedUtc ?? null,
  };
};

export const buildCaseArray = async () => {
  const caseData = await fetchCaseForSyncScreen();
  const settingData = await fetchCaseSettingForSyncScreen();
  const contactData = await fetchContactForSyncCaseLicense(1); // 1 for case
  const caseAdminNotesData = await fetchAdminNotesItemForSyncScreen(1); // 1 for case, 0 for admin notes
  const casePublicCommentsData = await fetchPublicCommentItemForSyncScreen(1); // 1 for case, 1 for public comments
  const caseAttachedDocsData = await fetchAttachedDocsForSyncScreen(1); // 1 for case
  // Index settings & contacts by contentItemId
  const settingMap = new Map(settingData.map((s) => [s.contentItemId, s]));
  const contactMap = new Map(contactData.map((c) => [c.contentItemId, c]));
  const adminNotesMap = new Map(caseAdminNotesData.map((a) => [a.id, a]));
  const publicCommentsMap = new Map(casePublicCommentsData.map((a) => [a.id, a]));
  const attachedDocsMap = new Map(caseAttachedDocsData.map((a) => [a.caseContentItemId, a]));

  const results: any[] = [];
  // Collect all unique IDs across case/setting/contact
  const allIds = new Set([
    ...caseData.map((item) => item?.contentItemId),
    ...settingData.map((item) => item?.contentItemId),
    ...contactData.map((item) => item?.contentItemId),
    ...caseAdminNotesData.map((item) => item?.id),
    ...casePublicCommentsData.map((item) => item?.id),
    ...caseAttachedDocsData.map((item) => item?.caseContentItemId),
  ]);

  for (const id of allIds) {
    const myCaseData = caseData.find((item) => item?.contentItemId === id);
    const mySettingData = settingMap.get(id);
    const myContactData = contactMap.get(id);
    const myAdminNotesData = adminNotesMap.get(id);
    const myPublicCommentsData = publicCommentsMap.get(id);
    const myAttachedDocsData = attachedDocsMap.get(id);

    // displayCaseData used only for showing case info in UI
    let displayCaseData = myCaseData;
    if (
      !displayCaseData &&
      (mySettingData ||
        myContactData ||
        myAdminNotesData ||
        myPublicCommentsData ||
        myAttachedDocsData)
    ) {
      const localCase = await fetchLocalCasebyId(id);
      if (localCase && localCase.length > 0) {
        displayCaseData = localCase[0];
      }
    }
    // Collect all possible modifiedUtc timestamps
    const dates = [
      displayCaseData?.modifiedUtc,
      mySettingData?.modifiedUtc,
      myContactData?.modifiedUtc,
      myAdminNotesData?.modifiedUtc,
      myPublicCommentsData?.modifiedUtc,
      myAttachedDocsData?.modifiedUtc,
    ]
      .filter((d) => d) // remove null/undefined
      .map((d) => new Date(d).getTime())
      .filter((t) => !isNaN(t)); // ensure valid timestamps

    // Get latest (max) date among all
    const latestModifiedUtc = new Date(Math.max(...dates)).toISOString();
    const payload = {
      id: id,
      ListType: 'Case',
      DisplayText: displayCaseData?.displayText ?? '',
      Status: displayCaseData?.caseStatus ?? '',
      Type: displayCaseData?.caseType ?? '',
      isForceSync: displayCaseData?.isForceSync ?? 0,
      isPermission: displayCaseData?.isPermission ?? 0,
      modifiedUtc: latestModifiedUtc,
      SyncedArea: [] as any[],
    };
    if (myCaseData)
      payload.SyncedArea.push(
        buildSyncedArea(SyncType.CASE, myCaseData, true, myCaseData?.contentItemId),
      );
    if (mySettingData)
      payload.SyncedArea.push(
        buildSyncedArea(SyncType.SETTINGS, mySettingData, true, mySettingData?.contentItemId),
      );
    if (myContactData)
      payload.SyncedArea.push(
        buildSyncedArea(SyncType.CONTACTS, myContactData, true, myContactData?.id),
      );
    if (myAdminNotesData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.ADMIN_NOTES,
          myAdminNotesData,
          true,
          myAdminNotesData?.contentItemId,
        ),
      );
    if (myPublicCommentsData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.COMMENT,
          myPublicCommentsData,
          true,
          myPublicCommentsData?.contentItemId,
        ),
      );
    if (myAttachedDocsData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.ATTACHMENT,
          myAttachedDocsData,
          true,
          myAttachedDocsData?.caseContentItemId,
        ),
      );
    results.push(payload);
  }
  return results;
};

export const buildLicenseArray = async () => {
  const licenseData = await fetchLicenseForSyncScreen();
  const contactData = await fetchContactForSyncCaseLicense(0); // 0 for license
  const licenseAdminNotesData = await fetchAdminNotesItemForSyncScreen(0); // 1 for case, 0 for admin notes
  const licensePublicCommentsData = await fetchPublicCommentItemForSyncScreen(0); // 1 for case, 1 for public comments
  const licenseAttachedDocsData = await fetchAttachedDocsForSyncScreen(0); // 1 for case

  // Index contacts,  by contentItemId
  const contactMap = new Map(contactData.map((c) => [c.contentItemId, c])); // Assuming 'contentItemId' is case id
  const adminNotesMap = new Map(licenseAdminNotesData.map((a) => [a.id, a])); // Assuming 'id' is case id because we added in admin notes this id not contentitem id
  const publicCommentsMap = new Map(licensePublicCommentsData.map((a) => [a.id, a])); // Assuming 'id' is case id because we added in admin notes this id not contentitem id
  const attachedDocsMap = new Map(licenseAttachedDocsData.map((a) => [a.licenseContentItemId, a])); // Assuming 'licenseContentItemId' is license id

  const results: any[] = [];
  // Collect all unique IDs across case/setting/contact
  const allIds = new Set([
    ...licenseData.map((item) => item?.contentItemId),
    ...contactData.map((item) => item?.contentItemId),
    ...licenseAdminNotesData.map((item) => item?.id),
    ...licensePublicCommentsData.map((item) => item?.id),
    ...licenseAttachedDocsData.map((item) => item?.licenseContentItemId),
  ]);

  for (const id of allIds) {
    const myLicenseData = licenseData.find((item) => item?.contentItemId === id);
    const myContactData = contactMap.get(id);
    const myAdminNotesData = adminNotesMap.get(id);
    const myPublicCommentsData = publicCommentsMap.get(id);
    const myAttachedDocsData = attachedDocsMap.get(id);

    // displayCaseData used only for showing case info in UI
    let displayLicenseData = myLicenseData;

    if (
      (!displayLicenseData && myContactData) ||
      myAdminNotesData ||
      myPublicCommentsData ||
      myAttachedDocsData
    ) {
      const localLicense = await fetchLocalLicenseById(id); // id is contentItemId , get local license
      if (localLicense && localLicense.length > 0) {
        displayLicenseData = localLicense[0];
      }
    }

    // Collect all possible modifiedUtc timestamps
    const dates = [
      displayLicenseData?.modifiedUtc,
      myContactData?.modifiedUtc,
      myAdminNotesData?.modifiedUtc,
      myPublicCommentsData?.modifiedUtc,
      myAttachedDocsData?.modifiedUtc,
    ]
      .filter((d) => d) // remove null/undefined
      .map((d) => new Date(d).getTime())
      .filter((t) => !isNaN(t)); // ensure valid timestamps

    // Get latest (max) date among all
    const latestModifiedUtc = new Date(Math.max(...dates)).toISOString();

    const payload = {
      id: id,
      ListType: 'License',
      DisplayText: displayLicenseData?.displayText ?? '',
      Status: displayLicenseData?.licenseStatus ?? '',
      Type: displayLicenseData?.licenseType ?? '',
      isForceSync: displayLicenseData?.isForceSync ?? 0,
      isPermission: displayLicenseData?.isPermission ?? 0,
      modifiedUtc: latestModifiedUtc,
      SyncedArea: [] as any[],
    };
    if (myLicenseData)
      payload.SyncedArea.push(
        buildSyncedArea(SyncType.LICENSE, myLicenseData, false, myLicenseData?.contentItemId),
      );
    if (myContactData)
      payload.SyncedArea.push(
        buildSyncedArea(SyncType.CONTACTS, myContactData, false, myContactData?.id),
      );
    if (myAdminNotesData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.ADMIN_NOTES,
          myAdminNotesData,
          false,
          myAdminNotesData?.contentItemId,
        ),
      );
    if (myPublicCommentsData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.COMMENT,
          myPublicCommentsData,
          false,
          myPublicCommentsData?.contentItemId,
        ),
      );
    if (myAttachedDocsData)
      payload.SyncedArea.push(
        buildSyncedArea(
          SyncType.ATTACHMENT,
          myAttachedDocsData,
          false,
          myAttachedDocsData?.licenseContentItemId,
        ),
      );
    results.push(payload);
  }
  return results;
};

export const processForceSyncQueue = async (rowData: any, offlineItemsCount: () => void) => {
  console.log('------------>Starting Force syncing...<------------');
  const allTasks: SyncQueueTask[] = [];
  for (const item of rowData.SyncedArea || []) {
    const tasks = await fetchPendingSyncTasks(item?.name, 'force_sync');
    const filteredTasks = tasks.filter((task) => task?.data?.contentItemId === item.id);
    console.log(`Fetched ${tasks.length} pending tasks for type ${item?.name}`);
    allTasks.push(...filteredTasks);
  }

  console.log('AllTasks Forcesync----->>>>', allTasks);

  if (allTasks.length === 0) {
    console.log('----------->No tasks to force sync<-------------');
    ToastService.show('No tasks to sync.', COLORS.SUCCESS_GREEN);
    return;
  }

  allTasks.sort((a, b) => a.created_at.localeCompare(b.created_at));

  for (const task of allTasks) {
    if (rowData.ListType === 'Case') {
      switch (task.type as SyncType) {
        case SyncType.CASE:
          console.log('CASE syncing Calling Force Sync');
          await processCaseTask(task, offlineItemsCount, true);
          break;
        case SyncType.SETTINGS:
          console.log('SETTINGS syncing Calling Force Sync');
          await processSettingsTask(task, offlineItemsCount, true);
          break;
        case SyncType.CONTACTS:
          console.log('CONTACTS syncing Calling Force Sync');
          await processContactsTask(task, offlineItemsCount, true);
          break;
        case SyncType.ADMIN_NOTES:
          console.log('ADMIN_NOTES syncing Calling Force Sync');
          await processAdminNotesTask(task, offlineItemsCount, true);
          break;
        default:
          console.warn(`No sync handler for type: ${task.type}`);
      }
    } else if (rowData.ListType === 'License') {
      switch (task.type as SyncType) {
        case SyncType.LICENSE:
          console.log('LICENSE syncing Calling Force Sync');
          await processLicenseTask(task, offlineItemsCount, true);
          break;
        case SyncType.CONTACTS:
          console.log('CONTACTS License syncing Calling Force Sync');
          await processContactsTask(task, offlineItemsCount, true);
          break;
        case SyncType.ADMIN_NOTES:
          console.log('ADMIN_NOTES License syncing Calling Force Sync');
          await processAdminNotesTask(task, offlineItemsCount, true);
          break;
        default:
          console.warn(`No sync handler for type: ${task.type}`);
      }
    } else {
      console.warn(`Skipping task: ${task.type}, not matching ListType: ${rowData.ListType}`);
    }
  }
  console.log('------>Force syncing completed successfully<----------');
};
