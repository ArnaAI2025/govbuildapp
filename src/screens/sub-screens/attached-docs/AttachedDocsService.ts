import {
  generateUniqueID,
  getNewUTCDate,
  sortFoldersAndFiles,
} from '../../../utils/helper/helpers';
import {
  addFolderParam,
  addFolderParamOffline,
  saveDocIMGToSyncOffline,
  saveUpdateAttachedDocsFormData,
  SyncModelParam,
} from '../../../utils/params/commonParams';
import { getBaseUrl } from '../../../session/SessionManager';
import {
  DELETE_API,
  GET_DATA,
  POST_DATA_WITH_TOKEN,
  UPLOAD_API,
} from '../../../services/ApiClient';
import { URL } from '../../../constants/url';
import type { DocumentModel, Folder } from '../../../utils/interfaces/IAttachedDocs';
import {
  fetchAttachedDocsByFolderID,
  fetchAttachedDocsFolderFilesFromDB,
  storeDocToSync,
} from '../../../database/sub-screens/attached-docs/attachedDocsDAO';
import { addFolderParamOfflineLicense } from '../../../utils/params/licenseCommonParams';
import { caseToForceSyncByID } from '../../../database/my-case/myCaseDAO';
import { licenseToForceSyncByID } from '../../../database/license/licenseDAO';
import {
  fetchDocumentTypesFromDb,
  fetchStatus,
} from '../../../database/drop-down-list/dropDownlistDAO';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const DocumentService = {
  async fetchAllFoldersAndFiles(
    contentItemId: string,
    isCase: boolean,
    isNetworkAvailable: boolean,
  ) {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const apiUrl = isCase
          ? `${url}${URL.FOLDER_FILE_LIST_BY_CASEID}${contentItemId}`
          : `${url}${URL.FOLDER_FILE_LIST_BY_LICENSEID}${contentItemId}`;
        const response = await GET_DATA({ url: apiUrl });
        if (response?.status) {
          return [...response?.data?.data?.folders, ...response?.data?.data?.files] as Array<
            Folder | DocumentModel
          >;
        }
        return [];
      } else {
        console.log('IsCase ---', contentItemId);

        const dbData = await fetchAttachedDocsFolderFilesFromDB(
          contentItemId,
          isCase ? true : false,
        );

        const offlineData = await fetchAttachedDocsByFolderID(
          contentItemId,
          isCase ? true : false,
          0,
        );

        if (dbData?.length > 0) {
          const json = JSON.parse(dbData[0]?.AllFilesFoldersJSON);

          return sortFoldersAndFiles([
            ...json.folders, // folders first
            ...json.files, // then files
            ...offlineData, // append any locally saved files (if needed)
          ]) as Array<Folder | DocumentModel>;
        }
        return [];
      }
    } catch (error) {
      recordCrashlyticsError('Error in fetchAllFoldersAndFiles:', error);
      console.error('Error in fetchAllFoldersAndFiles:', error);
      return [];
    }
  },

  async fetchFolderFilesByParent(
    caseLicenseId: string,
    folderId: number | string,
    isCase: boolean,
    isNetworkAvailable: boolean,
  ) {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const apiUrl = isCase
          ? `${url}${URL.FOLDER_FILE_BY_CASE_ID}${caseLicenseId}&folderId=${folderId}`
          : `${url}${URL.FOLDER_FILE_BY_LICENSE_ID}${caseLicenseId}&folderId=${folderId}`;
        const response = await GET_DATA({ url: apiUrl });
        if (response?.status) {
          return [...response?.data.data.folders, ...response?.data.data.files] as Array<
            Folder | DocumentModel
          >;
        }
      } else {
        const offlineData = await fetchAttachedDocsByFolderID(
          caseLicenseId,
          isCase ? true : false,
          folderId,
        );
        return sortFoldersAndFiles(offlineData ?? []) as Array<Folder | DocumentModel>;
      }

      return [];
    } catch (error) {
      recordCrashlyticsError('Error fetching folder files:', error);
      console.error('Error fetching folder files:', error);
      return [];
    }
  },

  async addOrUpdateFolder(
    folderName: string,
    folderId: number,
    contentItemId: string,
    parentFolderId: number | string,
    isCase: boolean,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
    caseData?: any,
    isShowOnFE?: boolean,
  ) {
    try {
      const newId = generateUniqueID();
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const folderParam = addFolderParam(
          contentItemId,
          parentFolderId,
          isShowOnFE,
          folderName,
          folderId as unknown as string,
          isCase,
          SyncModelParam(false, false, getNewUTCDate(), newId, '', folderId as unknown as string),
        );
        console.log('isCase', isCase);
        const apiUrl = isCase
          ? `${url}${URL.ADD_UPDATE_FOLDER}`
          : `${url}${URL.ADD_UPDATE_LICENSE_FOLDER}`;

        const response = await POST_DATA_WITH_TOKEN({
          url: apiUrl,
          body: folderParam,
        });
        console.log('isCase', response);

        setLoading(false);
        if (response?.status && response?.data?.status) {
          ToastService.show(folderId ? 'Folder Updated' : 'Folder Added', COLORS.SUCCESS_GREEN);
          return true;
        }
        return false;
      } else {
        const newId = generateUniqueID();
        const folderParam = isCase
          ? addFolderParamOffline(
              parentFolderId,
              false,
              folderName,
              true,
              '',
              '',
              '',
              '',
              '',
              '',
              contentItemId,
              newId,
            )
          : addFolderParamOfflineLicense(
              parentFolderId,
              false,
              folderName,
              true,
              '',
              '',
              '',
              '',
              '',
              '',
              contentItemId,
              newId,
            );
        const notInOffline = isCase
          ? (await caseToForceSyncByID(contentItemId))?.length === 0
          : (await licenseToForceSyncByID(contentItemId))?.length === 0;
        await storeDocToSync(
          folderParam,
          isCase ? true : false,
          contentItemId,
          newId,
          '',
          notInOffline,
          caseData,
        );
        return [];
      }
    } catch (error) {
      setLoading(false);
      if (
        (typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          (error as { message?: string }).message === 'NETWORK_DISCONNECTED') ||
        (error as { message?: string }).message === 'REQUEST_TIMEOUT'
      ) {
        // const folderParam = isCase
        //   ? addFolderParamOffline(
        //       parentFolderId,
        //       0,
        //       folderName,
        //       1,
        //       "",
        //       "",
        //       "",
        //       "",
        //       "",
        //       "",
        //       contentItemId,
        //       newId
        //     )
        //   : addFolderParamOfflineLicense(
        //       parentFolderId,
        //       0,
        //       folderName,
        //       1,
        //       "",
        //       "",
        //       "",
        //       "",
        //       "",
        //       "",
        //       contentItemId,
        //       newId
        //     );
        // const notInOffline = isCase
        //   ? (await caseToForceSyncByID(contentItemId)).length === 0
        //   : (await licenseToForceSyncByID(contentItemId)).length === 0;
        // await storeDocToSync(
        //   folderParam,
        //   isCase ? 1 : 0,
        //   contentItemId,
        //   newId,
        //   false,
        //   "",
        //   notInOffline,
        //   caseData
        // );
        return [];
      }
      recordCrashlyticsError('Error adding folder:', error);
      console.error('Error adding folder:', error);
      return null;
    }
  },

  async deleteDocument(
    contentItemId: string,
    docId: string,
    isCase: boolean,
    isNetworkAvailable: boolean,
  ) {
    try {
      if (!isNetworkAvailable) {
        console.error('No internet connection. Cannot delete document.');
        return false;
      }
      const url = getBaseUrl();
      const deleteUrl = isCase
        ? `${url}${URL.DELETE_ATTACHED_DOCS}${docId}`
        : `${url}${URL.DELETE_ATTACHED_DOCS_LICENSE}${docId}`;
      const response = await DELETE_API({
        url: deleteUrl,
        body: {},
      });
      if (response) {
        console.log('Document deleted successfully.');
        return true;
      }
      return false;
    } catch (error) {
      recordCrashlyticsError('Error deleting document:', error);
      console.error('Error deleting document:', error);
      return false;
    }
  },

  async fetchDocumentStatus(isCase: boolean, isNetworkAvailable: boolean): Promise<[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const apiUrl = isCase ? `${url}${URL.CASE_STATUS_LIST}` : `${url}${URL.LICENSE_STATUS}`;
        const response = await GET_DATA({ url: apiUrl });
        if (response?.status) {
          return response?.data?.data as [];
        }
        return [];
      } else {
        const result = await fetchStatus(isCase ? true : false);
        return result as [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching status:', error);
      console.error('Error fetching status:', error);
      return [];
    }
  },

  async fetchDocumentTypes(isCase: boolean, isNetworkAvailable: boolean): Promise<DocumentType[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const documentType = isCase ? 'DocumentTypes' : 'LicenseDocumentType';
        const apiUrl = `${url}${URL.CASE_DOCUMENT_TYPE_LIST}${documentType}`;
        const response = await GET_DATA({ url: apiUrl });
        if (response?.status) {
          return response?.data?.data as DocumentType[];
        }
        return [];
      } else {
        const result = await fetchDocumentTypesFromDb(isCase ? true : false);
        return result as [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching document types:', error);
      console.error('Error fetching document types:', error);
      return [];
    }
  },

  async addOrUpdateDocument(
    contentId: string,
    docData: any,
    isUpdate: boolean,
    isCase: boolean,
    fileData: any,
    folderUrl: string,
    caseData: any,
    isNetworkAvailable: boolean,
  ) {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        let responseJsonFile;
        if (!isUpdate && fileData) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', {
            uri: docData?.url,
            name: docData?.fileName,
            type: docData?.fileType,
          } as any);
          uploadFormData.append('dir', folderUrl ?? '');
          responseJsonFile = await UPLOAD_API({
            url: `${url}${URL.FILE_UPLOAD_API}`,
            body: uploadFormData,
          });
          console.log('responseJsonFile-->', responseJsonFile);
          if (!responseJsonFile?.url) {
            ToastService.show(
              responseJsonFile?.message || 'File upload failed',
              COLORS.SUCCESS_GREEN,
            );
            return false;
          }
          docData.url = responseJsonFile?.url;
        }
        const apiUrl = isUpdate
          ? isCase
            ? `${url}${URL.UPDATE_ATTACHED_DOCS}`
            : `${url}${URL.UPDATE_ATTACHED_DOCS_LICENSE}`
          : isCase
            ? `${url}${URL.ADD_ATTCHED_DOCS}`
            : `${url}${URL.ADD_LICENSE_ATTCHED_DOCS}`;
        const formData = saveUpdateAttachedDocsFormData(
          isUpdate ? (docData.contentItemId ?? '') : '',
          contentId,
          docData.statusId,
          docData.documentTypeId ?? '',
          docData.details,
          docData.shortDescription,
          docData.isShowonFE ? true : false,
          isUpdate ? true : false,
          isCase ? 'CaseStatus' : 'LicenseStatus',
          isCase ? 'CaseContentItemId' : 'LicenseContentItemId',
          docData.fileName,
          docData.url,
          docData.folderId,
          SyncModelParam(false, false, getNewUTCDate(), generateUniqueID(), null, null),
        );
        console.log('formData-->', formData);
        const response = await POST_DATA_WITH_TOKEN({
          url: apiUrl,
          body: formData,
        });
        if (response?.status) {
          //  Alert.alert("Successfully Added");
          return response?.status;
        }
        //Alert.alert(response?.message || "Operation failed");
        return response?.message;
      } else {
        const newId = generateUniqueID();
        const notInOffline = isCase
          ? (await caseToForceSyncByID(contentId))?.length === 0
          : (await licenseToForceSyncByID(contentId))?.length === 0;
        const obj = saveDocIMGToSyncOffline(
          newId,
          contentId,
          docData.url,
          docData.fileName,
          docData.statusId,
          docData.documentTypeId,
          docData.details,
          docData.shortDescription,
          docData.isShowonFE ? true : false,
          isCase,
          docData.documentTypeName,
          docData?.fileType,
          docData.statusId,
          docData.folderId,
          isCase ? 'caseContentItemId' : 'licenseContentItemId',
        );
        await storeDocToSync(
          obj,
          isCase ? true : false,
          contentId,
          newId,
          folderUrl,
          notInOffline,
          caseData,
        );
        return true;
      }
    } catch (error) {
      recordCrashlyticsError('Error adding/updating document:', error);
      console.error('Error adding/updating document:', error);
      return false;
    }
  },
};
