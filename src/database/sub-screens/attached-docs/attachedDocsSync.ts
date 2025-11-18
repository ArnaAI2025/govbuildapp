import { URL } from '../../../constants/url';
import { GET_DATA, POST_DATA_WITH_TOKEN, UPLOAD_API } from '../../../services/ApiClient';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';
import { getBaseUrl } from '../../../session/SessionManager';
import { saveUpdateAttachedDocsFormData } from '../../../utils/params/commonParams';
import { updateSyncTaskStatus } from '../../../utils/syncUtils';
import { CASE, LICENSE, TAB, TABLES } from '../../DatabaseConstants';
import { getDatabase } from '../../DatabaseService';
import { updateOfflineHistoryIfIdExist } from '../../sync-history/syncHistorySync';
import type { SyncQueueTask } from '../../types/commonSyncModels';
import {
  deleteRowsByCaseID,
  fetchAllDocDataToSync,
  storeAttachedDocsFolderData,
  updateAttachedDocsFoldersData,
  updateAttachedDocsSyncStatus,
  updateAttachedisNewStatus,
  updateDocURL,
  updateDocURLReady,
  updateFileExtensionIfIDExist,
  updateSyncDocURL,
  updateSyncDocURLReady,
} from './attachedDocsDAO';
import NetInfo from '@react-native-community/netinfo';

export const syncAllCaseFoldersFilesAPI = async (
  contentItemId: string,
  isCase: boolean,
): Promise<void> => {
  console.log(isCase);
  const url = getBaseUrl();
  try {
    const apiUrl = isCase
      ? `${url}${URL.FOLDER_FILE_LIST_BY_CASEID}${contentItemId}`
      : `${url}${URL.FOLDER_FILE_LIST_BY_LICENSEID}${contentItemId}`;
    const response = await GET_DATA({
      url: apiUrl,
    });
    if (response?.status) {
      const responseData = response?.data?.data || [];
      await upsertAttachedDocsByCaseIdExist(responseData, isCase, contentItemId);
    }
  } catch (error) {
    recordCrashlyticsError('Error in LocationDataAPI:---->>>', error);
    console.error('Error in LocationDataAPI:---->>>', error);
  }
};

export const upsertAttachedDocsByCaseIdExist = async (data: any, isCase: boolean, id: string) => {
  try {
    const db = await getDatabase();

    const resultSet = await db.getAllAsync(
      `SELECT * FROM ${TABLES.CASE_DOCSFOLDER_FILES_TABLE_NAME} WHERE contentItemId = ?`,
      [id],
    );

    if (resultSet.length === 0) {
      await storeAttachedDocsFolderData(data, isCase, id, false);
    } else {
      if (resultSet[0]?.isEdited === 0) {
        await updateAttachedDocsFoldersData(data, id);
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error updating attached docs by Case ID:', error);
    console.error('Error updating attached docs by Case ID:', error);
  }
};

export const syncFileExtensionData = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      console.warn('No internet connection');
      return;
    }

    const url = getBaseUrl();
    const response = await GET_DATA({
      url: `${url}${URL.FILE_EXTENSION_API}`,
    });

    if (response?.data && response?.data?.data?.length > 0) {
      await updateFileExtensionIfIDExist(JSON.stringify(response?.data?.data));
    }
  } catch (error) {
    recordCrashlyticsError('Error in FileExtensionDataAPI:', error);
    console.error('Error in FileExtensionDataAPI:', error);
  }
};

export const processAttachmentTask = async (task: SyncQueueTask, offlineItemsCount: () => void) => {
  const { caseId, isCase, records } = task.data;
  const url = getBaseUrl();

  // Upload files for records with valid localUrl
  for (const record of records) {
    if (record.Isfolder === 0 && record.localUrl && record.localUrl !== '') {
      const formData = new FormData();
      formData.append('file', {
        uri: record.localUrl,
        name: record.fileName || '',
        type: record.originalType || record.fileType || '',
      } as any);
      formData.append('dir', record.DirPath || '');

      const response = await UPLOAD_API({
        url: `${url}${URL.FILE_UPLOAD_API}`,
        body: formData,
      });

      if (response?.url) {
        await updateSyncDocURL(response.url, record.id);
        await updateSyncDocURLReady(true, record.id);
      } else {
        recordCrashlyticsError(`File upload failed for record ${record.id}`, response);
        console.error(`File upload failed for record ${record.id}`);
      }
    }
  }

  // Fetch all records for the case/license to build the hierarchy
  const docData = await fetchAllDocDataToSync(caseId, isCase);

  if (docData.length > 0) {
    console.log('Doc data:----->>>>>', JSON.stringify(docData, null, 2)); // Debug input data
    const fullJSON = await buildDocJSON(docData, isCase);
    console.log('JSON payload sent to API:', JSON.stringify(fullJSON, null, 2)); // Debug payload
    const apiUrl = isCase
      ? `${url}${URL.ADD_ALL_CASE_DOC_DATA}`
      : `${url}${URL.ADD_ALL_LICENSE_DOC_DATA}`;
    const docResponse = await POST_DATA_WITH_TOKEN({
      url: apiUrl,
      body: fullJSON,
    });

    if (docResponse?.status && docResponse?.data?.status) {
      await updateOfflineHistoryIfIdExist(
        TAB,
        caseId ?? '',
        docData[0]?.id ?? '',
        isCase ? CASE : LICENSE,
        String(new Date()),
        'Attached Docs',
        '',
      );
      await deleteRowsByCaseID(caseId, isCase);
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
    } else {
      console.error('API error response:--->', JSON.stringify(docResponse, null, 2));
      throw new Error('Failed to sync attachment data');
    }
  } else {
    await updateSyncTaskStatus(task.id, 'completed');
    offlineItemsCount();
  }
};

export const processAttachedDocTask = async (
  task: SyncQueueTask,
  offlineItemsCount: () => void,
) => {
  const docData = task.data;
  const url = getBaseUrl();
  // Upload the file
  const formData = new FormData();
  formData.append('file', {
    uri: docData?.localUrl,
    name: docData?.fileName,
    type: docData?.fileType,
  } as any);
  const response = await UPLOAD_API({
    url: `${url}${URL.FILE_UPLOAD_API}`,
    body: formData,
  });

  if (response?.url) {
    await updateDocURL(response.url, docData?.id);
    await updateDocURLReady(true, docData?.id);

    const isCase = docData.isCase;
    const apiUrl = isCase
      ? `${url}${URL.ADD_ATTCHED_DOCS}`
      : `${url}${URL.ADD_LICENSE_ATTCHED_DOCS}`;
    // const offlineUtcDate = getOfflineUtcDate();
    //   const SyncModel = {
    //     isOfflineSync: true,
    //     isForceSync: false,
    //     apiChangeDateUtc:offlineUtcDate,
    //     correlationId: generateUniqueID(),
    //     syncContentItemId:docData?.contentItemId,
    //     syncDocumentId: null,
    //   };
    const payload = saveUpdateAttachedDocsFormData(
      null,
      docData?.contentItemId,
      docData?.caseStatus,
      docData?.documentType,
      docData?.details,
      docData?.ShortDescription,
      docData?.showOnFE,
      false,
      isCase ? 'CaseStatus' : 'LicenseStatus',
      isCase ? 'CaseContentItemId' : 'LicenseContentItemId',
      docData?.fileName,
      response.url,
      0,
      null,
    );
    console.log('Data for the sync ADD_ATTCHED_DOCS --->', payload);

    const docResponse = await POST_DATA_WITH_TOKEN({
      url: apiUrl,
      body: payload,
    });
    console.log('docResponse---123--->>>>', docResponse);

    if (docResponse?.status && docResponse?.data) {
      await updateAttachedDocsSyncStatus(1, 0, docData?.id, 0);
      await updateAttachedisNewStatus(docData?.id, 0, docResponse?.data?.contantItemId);
      console.log('now history is calling for attached docs');

      // await updateOfflineHistoryIfIdExist(
      //   TAB,
      //   docData.id??"",
      //   docResponse.data.contantItemId??"",
      //   isCase ? CASE : LICENSE,
      //   String(new Date()),
      //   "Attached Docs",
      //   ""
      // );
      await updateSyncTaskStatus(task.id, 'completed');
      offlineItemsCount();
    } else {
      await updateAttachedDocsSyncStatus(0, 1, docData?.id, 1);
      throw new Error('Failed to sync attached document');
    }
  } else {
    throw new Error('File upload failed');
  }
};

const buildDocJSON = async (rows: any[], isCase: boolean) => {
  const folders: any[] = [];
  const files: any[] = [];
  const rootFiles: any[] = [];

  // Create a set of folder IDs to check for UUID parentFolderID
  const folderIds = new Set(rows.filter((obj) => obj.Isfolder === 1).map((obj) => obj.id));

  // Create a map to store folders by their database ID (UUID)
  const folderMap: { [key: string]: any } = {};

  // First pass: Create folder and file objects
  for (const obj of rows) {
    console.log('obj DB --->', obj);
    if (obj.Isfolder === 0) {
      const folderIdValue =
        obj.parentFolderID === '0' || obj.parentFolderID === '0.0'
          ? '0'
          : folderIds.has(obj.parentFolderID)
            ? '0'
            : obj.parentFolderID || '0';
      const fileObj: any = {
        ContentItemId: '',
        URL: obj.URL || '',
        FileName: obj.fileName || '',
        [isCase ? 'CaseStatus' : 'LicenseStatus']: obj.caseStatus || '',
        Details: obj.details || '',
        DocumentType: obj.documentTypeId || '',
        ShortDescription: obj.shortDescription || '',
        IsShowonFE: obj.isShowonFE === 1 ? true : false,
        isVersions: false,
        FolderID: /^[0-9]+$/.test(folderIdValue) ? parseInt(folderIdValue, 10) : '0',
        ParentFolderId: /^[0-9]+$/.test(folderIdValue) ? parseInt(folderIdValue, 10) : '0',
        SyncModel: null,
      };
      if (isCase) {
        fileObj.CaseContentItemId = obj.caseContentItemId || '';
      } else {
        fileObj.LicenseContentItemId = obj.licenseContentItemId || '';
      }
      // Store parentFolderID for hierarchy
      if (
        obj.parentFolderID &&
        obj.parentFolderID !== '0' &&
        obj.parentFolderID !== '0.0' &&
        folderIds.has(obj.parentFolderID)
      ) {
        fileObj._parentFolderId = obj.parentFolderID; // Temporary for hierarchy
      }
      files.push(fileObj);
    } else {
      const folderObj = {
        Id: 0,
        name: obj.name || '',
        IsShowonFE: obj.isShowonFE === 1 ? true : false,
        parentFolderID:
          obj.parentFolderID === '0' || obj.parentFolderID === '0.0'
            ? '0'
            : folderIds.has(obj.parentFolderID)
              ? '0'
              : obj.parentFolderID || '0',
        caseContentItemId: isCase ? obj.caseContentItemId : undefined,
        licenseContentItemId: !isCase ? obj.licenseContentItemId : undefined,
        files: [],
        folders: [],
      };
      folderMap[obj.id] = folderObj;
    }
  }

  // Second pass: Build hierarchy for folders
  for (const obj of rows) {
    const folderIdValue =
      obj.parentFolderID === '0' || obj.parentFolderID === '0.0'
        ? '0'
        : folderIds.has(obj.parentFolderID)
          ? '0'
          : obj.parentFolderID || '0';
    if (obj.Isfolder === 1) {
      if (!obj.parentFolderID || obj.parentFolderID === '0' || obj.parentFolderID === '0.0') {
        folders.push(folderMap[obj.id]);
      } else if (folderMap[obj.parentFolderID]) {
        folderMap[obj.parentFolderID].folders.push(folderMap[obj.id]);
      } else if (/^[0-9]+$/.test(folderIdValue)) {
        folders.push(folderMap[obj.id]);
      } else {
        console.warn(`Invalid parentFolderID: ${obj.parentFolderID} for folder ${obj.id}`);
        folders.push(folderMap[obj.id]);
      }
    }
  }

  // Assign files to folders or root files array
  for (const file of files) {
    if (file._parentFolderId && folderMap[file._parentFolderId]) {
      folderMap[file._parentFolderId].files.push(file);
      delete file._parentFolderId;
    } else {
      rootFiles.push(file);
    }
  }

  return { folders, files: rootFiles };
};

// const getChildObject = async (obj: any, isCase: boolean) => {
//   const folderObj: any = {
//     id: 0,
//     name: obj.name,
//     isShowonFE: obj.isShowonFE === 1,
//     ParentFolderID: /^[0-9]+$/.test(obj.parentFolderID)
//       ? obj.parentFolderID
//       : 0,
//   };
//   if (isCase) {
//     folderObj.caseContentItemId = obj.caseContentItemId;
//   } else {
//     folderObj.licenseContentItemId = obj.licenseContentItemId;
//   }

//   const data = await fetchDocByParentID(obj.id);
//   const files: any[] = [];
//   const folders: any[] = [];

//   for (const newObj of data) {
//     if (newObj?.Isfolder === 0) {
//       const fileObj: any = {
//         URL: newObj?.URL,
//         FileName: newObj?.fileName,
//         CaseStatus: newObj?.caseStatus,
//         Details: newObj?.details,
//         DocumentType: newObj?.documentType,
//         ShortDescription: newObj?.shortDescription,
//         IsShowonFE: newObj?.IsShowonFE === 1,
//         FolderId: newObj?.parentFolderID.includes(".")
//           ? newObj?.parentFolderID.split(".")[0]
//           : 0,
//       };
//       if (isCase) {
//         fileObj.caseContentItemId = newObj?.caseContentItemId;
//       } else {
//         fileObj.licenseContentItemId = newObj?.licenseContentItemId;
//       }
//       files.push(fileObj);
//     } else {
//       const childFolder = await getChildObject(newObj, isCase);
//       folders.push(childFolder);
//     }
//   }

//   folderObj.files = files;
//   folderObj.folders = folders;
//   return folderObj;
// };
