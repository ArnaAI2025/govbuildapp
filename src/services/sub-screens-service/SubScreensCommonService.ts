import { GET_DATA, POST_DATA_WITH_TOKEN, UPLOAD_API } from '../ApiClient';
import { TEXTS } from '../../constants/strings';
import { URL } from '../../constants/url';
import { getBaseUrl } from '../../session/SessionManager';
import { COLORS } from '../../theme/colors';
import {
  AdminAndPublicComment,
  SentEmail,
  SyncModel,
  Task,
} from '../../utils/interfaces/ISubScreens';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { generateUniqueID, getNewUTCDate } from '../../utils/helper/helpers';
import {
  adminCommentsParam,
  adminCommentsParamForLocal,
  SyncModelParam,
} from '../../utils/params/commonParams';
import useAuthStore from '../../store/useAuthStore';
import { fetchAdminAndPublicCommentsFromOffline } from '../../database/sub-screens/subScreensSync';
import {
  AdminNote,
  storeAdminNotesWithDocsOffline,
  updateAdminNoteAlert,
  updateAdminNoteComment,
  updateAdminNoteMakeAsPublic,
  updateAdminNotePublic,
  updateAdminNotesWithDocs,
} from '../../database/sub-screens/subScreenDAO';
import { TABLES } from '../../database/DatabaseConstants';
import { getDatabase } from '../../database/DatabaseService';
import { AdminNoteSyncData } from '../../database/types/commonSyncModels';

class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

interface FileItem {
  localUrl: string;
  name: string;
  mimeType: string;
}

interface CommentData {
  comment: string;
  fileArray: FileItem[];
  contentItemId: string;
  isAdminNotes: boolean;
  isCase: boolean;
}

interface OfflineComment {
  id: string;
  contentItemId: string;
  fileUrls: string;
  fileNames: string;
  fileMimeTypes: string;
  isPublic: boolean;
  comment: string;
}

/**
 * Fetches admin and public comments from API or offline database.
 * @param contentItemId - The content item ID.
 * @param commentType - The type of comment (e.g., CaseAdminComments).
 * @param isNetworkAvailable - Indicates network availability.
 * @returns Array of comments.
 */
export const fetchAdminAndPublicComment = async (
  contentItemId: string,
  isCase: boolean,
  isPublic: boolean,
  isNetworkAvailable: boolean,
): Promise<AdminAndPublicComment[]> => {
  try {
    if (isNetworkAvailable) {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');

      const apiUrl = isPublic
        ? isCase
          ? `${baseUrl}${URL.COMMENT_API}${contentItemId}&type=CasePublicComments`
          : `${baseUrl}${URL.COMMENT_LICENSE_API}${contentItemId}&type=LicensePublicComments`
        : isCase
          ? `${baseUrl}${URL.COMMENT_API}${contentItemId}&type=CaseAdminComments`
          : `${baseUrl}${URL.COMMENT_LICENSE_API}${contentItemId}&type=LicenseAdminComments`;

      const response = await GET_DATA({
        url: apiUrl,
      });
      if (!response?.status) {
        throw new ServiceError(response?.Messages);
      }
      return response?.data?.data?.comments ?? [];
    } else {
      const comments = await fetchAdminAndPublicCommentsFromOffline(contentItemId, isPublic);
      return comments as unknown as AdminAndPublicComment[];
    }
  } catch (error) {
    throw new ServiceError(
      `Error fetching comments: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Fetches standard comments and types from the API.
 * @param isNetworkAvailable - Indicates network availability.
 * @returns Array of [comments, commentTypes].
 */
export const fetchStandardComments = async (isNetworkAvailable: boolean): Promise<string[][]> => {
  if (!isNetworkAvailable) return [[], []];

  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) throw new ServiceError('Base URL is missing.');

    const [commentResponse, typeResponse] = await Promise.all([
      GET_DATA({ url: `${baseUrl}${URL.INSPECTION_COMMENTS_LIST}` }),
      GET_DATA({ url: `${baseUrl}${URL.STANDARD_COMMENT_TYPE_LIST}` }),
    ]);

    if (commentResponse?.data?.status && typeResponse?.data?.status) {
      return [commentResponse.data.data, typeResponse.data.data];
    }
    return [[], []];
  } catch (error) {
    throw new ServiceError(
      `Error fetching standard comments: ${error instanceof Error ? error.message : ''}`,
    );
  }
};

/**
 * Saves a comment to the API or database.
 * @param contentItemId - The content item ID.
 * @param comment - The comment text.
 * @param isPublic - Indicates if the comment is public.
 * @param isEdit - Indicates if the comment is being edited.
 * @param editCommentId - The ID of the comment being edited.
 * @param isNetworkAvailable - Indicates network availability.
 * @param isFromPublicComment - Indicates if the comment is public.
 * @returns Success status and new comment data.
 */
export const saveComment = async (
  contentItemId: string,
  comment: string,
  isPublic: boolean,
  isEdit: boolean,
  editCommentId: string,
  filename: string,
  attachment: string,
  isNetworkAvailable: boolean,
  isFromPublicComment: boolean,
  isCase: boolean,
): Promise<{ success: boolean; newComment?: AdminAndPublicComment }> => {
  if (!comment.trim()) {
    ToastService.show(TEXTS.subScreens.adminNotes.fillComment, COLORS.ERROR);
    return { success: false };
  }

  const authData = useAuthStore.getState().authData;
  const newId = generateUniqueID();
  const userName = authData?.username ?? 'Unknown';
  const createdUtc = getNewUTCDate();
  console.log('filename:', filename, 'attachment:', attachment);
  try {
    if (isNetworkAvailable) {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');
      const parsedFilename = filename ? JSON.parse(filename).join(',') : null;
      const parsedAttachment = attachment ? JSON.parse(attachment).join(',') : null;
      const apiParams = {
        comment,
        contentItemId,
        Id: isEdit ? editCommentId : null,
        filename: parsedFilename,
        attachment: parsedAttachment,
        syncModel: SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          generateUniqueID(),
          isEdit ? editCommentId : null,
          null,
        ),
      };
      console.log('Admin params --- >', apiParams);

      const payload = {
        url: isFromPublicComment
          ? isCase
            ? `${baseUrl}${URL.ADD_PUBLIC_COMMENT}`
            : `${baseUrl}${URL.ADD_LICENSE_PUBLIC_COMMENT}`
          : isCase
            ? `${baseUrl}${URL.ADD_ADMIN_COMMENT}`
            : `${baseUrl}${URL.ADD_LICENSE_ADMIN_COMMENT}`,
        body: apiParams,
      };

      const response = await POST_DATA_WITH_TOKEN(payload);
      if (!response?.status) {
        throw new ServiceError(response?.message);
      }

      return {
        success: true,
        newComment: {
          id: newId,
          text: comment,
          author: userName,
          createdUtc,
          isPublic,
        },
      };
    } else {
      const data: AdminNote = {
        caseAndLicenseId: contentItemId,
        contentItemId: generateUniqueID(),
        comment,
        isPublic,
        author: userName,
        createdUtc,
        isCase: isCase,
        isEdit: isEdit,
        isFromPublicComment,
        syncModel: SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          generateUniqueID(),
          isEdit ? editCommentId : null,
          null,
        ),
      };

      await updateAdminNoteComment(data, isCase, isPublic, false, newId, createdUtc);
      //  await addToSyncQueue("admin_notes", data);
      console.log('Offline admin note saved:', data);
      return {
        success: true,
        newComment: {
          id: newId,
          text: comment,
          author: userName,
          createdUtc,
          isPublic,
        },
      };
    }
  } catch (error) {
    ToastService.show('Error saving comment', COLORS.ERROR);
    throw new ServiceError(
      `Error saving comment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Sets a comment as an alert.
 * @param commentId - The comment ID.
 * @param value - The alert status.
 * @param isOnline - Indicates network availability.
 * @returns Success status.
 */
export const applySetAsAlert = async (
  commentId: string,
  caseAndLicenseId: string,
  value: boolean,
  comment: string,
  isOnline: boolean,
  isCase: boolean,
): Promise<{ success: boolean }> => {
  try {
    const newId = generateUniqueID();
    const syncParams: SyncModel = {
      IsOfflineSync: false,
      IsForceSync: false,
      ApiChangeDateUtc: getNewUTCDate(),
      CorrelationId: newId,
      SyncContentItemId: commentId,
      SyncDocumentId: null,
    };
    if (isOnline) {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');

      const response = await POST_DATA_WITH_TOKEN({
        url: isCase
          ? `${baseUrl}${URL.ADMIN_COMMENTS_SET_AS_ALERT}`
          : `${baseUrl}${URL.ADMIN_COMMENTS_LICENSE_SET_AS_ALERT}`,
        body: { id: commentId, isAlert: value, SyncModel: syncParams },
      });

      if (!response?.status) {
        throw new ServiceError(response?.Messages);
      }

      return { success: true };
    } else {
      const db = getDatabase();
      const rows = await db.getAllAsync(
        `SELECT * FROM ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} WHERE contentItemId = ?`,
        [commentId],
      );
      if (rows.length === 0) {
        throw new ServiceError(`Admin note with ID ${commentId} not found`);
      }
      const existingNote = rows[0] as AdminNoteSyncData;
      const updatedNote: AdminNote = {
        ...existingNote,
        caseAndLicenseId,
        contentItemId: commentId,
        commentIsAlert: value,
        comment: comment || existingNote?.comment,
        isCase: isCase,
        isPublic: false,
        //isLocallyEdited: true, // Indicate local edit
        isEdit: true, // Keep isEdit false for sync purposes
        syncModel: syncParams,
      };
      console.log('Saving offline admin note alert:------>', updatedNote);

      await updateAdminNoteAlert(updatedNote, isCase);
      //await addsetAlertToSyncQueue("admin_notes", updatedNote);
      console.log('Offline admin note alert saved:--->', updatedNote);
      return { success: true };
    }
  } catch (error) {
    ToastService.show('Error setting comment as alert', COLORS.ERROR);
    throw new ServiceError(
      `Error setting comment as alert: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Sets a comment as public.
 * @param commentId - The comment ID.
 * @param isPublic - The public status.
 * @param contentItemId - The content item ID.
 * @param isOnline - Indicates network availability.
 * @returns Success status.
 */
export const applyPublicComment = async (
  commentId: string,
  isPublic: boolean,
  contentItemId: string,
  isOnline: boolean,
  isCase: boolean,
): Promise<{ success: boolean }> => {
  try {
    if (isOnline) {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');

      const newId = generateUniqueID();
      const syncParams: SyncModel = {
        IsOfflineSync: false,
        IsForceSync: false,
        ApiChangeDateUtc: getNewUTCDate(),
        CorrelationId: newId,
        SyncContentItemId: commentId,
        SyncDocumentId: null,
      };

      const response = await POST_DATA_WITH_TOKEN({
        url: isCase
          ? `${baseUrl}${URL.ADMIN_COMMENTS_SET_AS_PUBLIC}`
          : `${baseUrl}${URL.ADMIN_COMMENTS_LICENSE_SET_AS_PUBLIC}`,
        body: { id: commentId, contentItemId, SyncModel: syncParams },
      });

      if (!response?.status) {
        throw new ServiceError(response?.Messages);
      }
      await updateAdminNoteMakeAsPublic(commentId, true);
      return { success: true };
    } else {
      const data: AdminNote = {
        contentItemId: commentId,
        isPublic,
        caseAndLicenseId: contentItemId,
        isCase: isCase,
      };
      await updateAdminNotePublic(data, isCase);
      return { success: true };
    }
  } catch (error) {
    ToastService.show('Error setting comment as public', COLORS.ERROR);
    throw new ServiceError(
      `Error setting comment as public: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Saves a comment with attached documents.
 * @param data - The comment and file data.
 * @param caseData - The case data.
 * @param navigation - The navigation object.
 * @param setLoading - Function to set loading state.
 */
export const saveCommentWithDoc = async (
  data: CommentData,
  caseData: any,
  navigation: any,
  isOnline: boolean,
): Promise<string> => {
  const { comment, fileArray, contentItemId, isAdminNotes, isCase } = data;
  const newId = generateUniqueID();

  try {
    if (isOnline) {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');
      const endpoint = isCase
        ? isAdminNotes
          ? URL.ADD_ADMIN_COMMENT
          : URL.ADD_PUBLIC_COMMENT
        : isAdminNotes
          ? URL.ADD_LICENSE_ADMIN_COMMENT
          : URL.ADD_LICENSE_PUBLIC_COMMENT;
      const fullUrl = `${baseUrl}${endpoint}`;
      let fileNames: string[] = [];
      let fileLinks: string[] = [];
      const filePath = isCase
        ? `/CaseAttachments/${contentItemId}/${isAdminNotes ? 'AdminComments' : 'PublicComments'}`
        : `/LicenseAttachments/${contentItemId}/${
            isAdminNotes ? 'AdminComments' : 'PublicComments'
          }`;
      if (fileArray.length === 0) {
        const response = await POST_DATA_WITH_TOKEN({
          url: fullUrl,
          body: adminCommentsParam(
            '',
            contentItemId,
            '',
            comment,
            null,
            SyncModelParam(false, false, getNewUTCDate(), newId, null, null),
          ),
        });
        if (response?.status && response?.data?.status) {
          //navigation.goBack();
          return newId;
        } else {
          throw new ServiceError(response?.data?.message || 'Failed to save comment.');
        }
      } else {
        for (const file of fileArray) {
          const formData = new FormData();
          formData.append('file', {
            uri: file.localUrl,
            name: file.name,
            type: file.originalType || file.mimeType,
          } as any);
          formData.append('dir', filePath);
          const uploadResponse = await UPLOAD_API({
            url: `${baseUrl}${URL.FILE_UPLOAD_API}`,
            body: formData,
          });
          if (uploadResponse.url) {
            fileNames.push(uploadResponse.filename);
            fileLinks.push(uploadResponse.url);
          } else {
            throw new ServiceError(uploadResponse.message || 'File upload failed.');
          }
        }
        const escapedFileNames = fileNames.map((name) => name.replace(/,/g, '__COMMA__'));
        console;
        console.log(
          'File names after escaping:',
          adminCommentsParam(
            escapedFileNames.join(','),
            contentItemId,
            fileLinks.join(','),
            comment,
            null,
            SyncModelParam(false, false, getNewUTCDate(), newId, null, null),
          ),
        );
        const response = await POST_DATA_WITH_TOKEN({
          url: fullUrl,
          body: adminCommentsParam(
            escapedFileNames.join(','),
            contentItemId,
            fileLinks.join(','),
            comment,
            null,
            SyncModelParam(false, false, getNewUTCDate(), newId, null, null),
          ),
        });
        if (response?.status && response?.data?.status) {
          //  navigation.goBack();
          return newId;
        } else {
          throw new ServiceError(response?.data?.message || 'Failed to save comment.');
        }
      }
    } else {
      const offlineComment: OfflineComment = {
        id: newId,
        contentItemId,
        fileUrls: fileArray?.map((file) => file.localUrl).join(','),
        fileNames: fileArray?.map((file) => file.name).join(','),
        fileMimeTypes:
          fileArray?.map((file) => file.originalType).join(',') ||
          fileArray?.map((file) => file.mimeType).join(','),
        isPublic: !isAdminNotes,
        comment,
      };
      await saveCommentOffline(
        offlineComment,
        isCase,
        false, // notInOffline
        newId,
        getNewUTCDate(),
        caseData,
        // isAdminNotes
      );
      // navigation.goBack();
      // ToastService.show(
      //   TEXTS.subScreens.commentWithFileAttached.offlineSaveSuccess,
      //   COLORS.SUCCESS_GREEN
      // );
      return newId;
    }
  } catch (error) {
    throw new ServiceError(
      `Error saving comment with doc: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
  }
};

/**
 * Saves a comment offline.
 * @param commentData - The offline comment data.
 * @param isCase - Indicates if the comment is for a case.
 * @param notInOffline - Indicates if the data is not in offline mode.
 * @param corrId - The correlation ID.
 * @param createdDate - The creation date.
 * @param caseData - The case data.
 */
export const saveCommentOffline = async (
  commentData: OfflineComment,
  isCase: boolean,
  notInOffline: boolean,
  corrId: string,
  createdDate: string,
  caseData: any,
  // isAdminNotes: boolean
): Promise<void> => {
  try {
    const { id, contentItemId, isPublic, comment } = commentData;
    const authData = useAuthStore.getState().authData;
    const userName = authData?.username ?? 'Unknown';
    const data: AdminNote = {
      caseAndLicenseId: contentItemId,
      contentItemId: id,
      isPublic: isPublic,
      author: userName,
      fileName: commentData?.fileNames ?? null,
      fileUrl: commentData?.fileUrls ?? null,
      fileType: commentData?.fileMimeTypes ?? null,
      attachment: '',
      comment,
      isCase,
      createdUtc: createdDate,
      correlationId: corrId,
      notInOffline,
    };
    console.log('Saving offline comment data:', JSON.stringify([commentData.fileUrls]));
    await storeAdminNotesWithDocsOffline(data, isCase, notInOffline, corrId, createdDate, caseData);
    updateAdminNotesWithDocs(
      adminCommentsParamForLocal(contentItemId, id, comment, isPublic, true, userName),
      isCase,
      isPublic,
      commentData?.fileUrls ? JSON.stringify(commentData.fileUrls?.split(',')) : null,
      commentData?.fileNames ? JSON.stringify(commentData.fileNames?.split(',')) : null,
      notInOffline,
      corrId,
      data.createdUtc ?? '',
      getNewUTCDate(),
      caseData,
    );
  } catch (error) {
    throw new ServiceError(
      `Error saving offline comment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const fetchSentEmails = async (
  contentItemId: string,
  type: boolean,
  isNetworkAvailable: boolean,
  setLoading: (loading: boolean) => void,
): Promise<SentEmail[]> => {
  try {
    if (isNetworkAvailable) {
      setLoading(true);
      const url = getBaseUrl();
      const endpoint = type
        ? `${url}${URL.SEND_EMAIL_LIST}${contentItemId}`
        : `${url}${URL.SEND_EMAIL_LIST_LICENSE}${contentItemId}`;

      const response = await GET_DATA({ url: endpoint });
      setLoading(false);
      if (response?.status) {
        return response?.data?.data || [];
      }
      return [];
    } else {
      // ToastService.show(TEXTS.errors.noInternet);
      return [];
    }
  } catch (error) {
    setLoading(false);
    if (error instanceof Error) {
      console.error('Error in fetchSentEmails:', error.message);
    } else {
      console.error('Error in fetchSentEmails:', error);
    }
    return [];
  }
};
export const fetchTaskList = async (
  contentItemId: string,
  isNetworkAvailable: boolean,
  setLoading: (loading: boolean) => void,
): Promise<Task[]> => {
  try {
    if (isNetworkAvailable) {
      setLoading(true);
      const url = getBaseUrl();
      const endpoint = { url: `${url}${URL.TASK_LIST}${contentItemId}` };

      const response = await GET_DATA(endpoint);
      setLoading(false);

      if (response.status) {
        return response?.data?.data || [];
      }
      return [];
    } else {
      console.warn('No internet connection');
      return [];
    }
  } catch (error) {
    setLoading(false);
    if (error instanceof Error) {
      console.error('Error in fetchTasks:', error.message);
    } else {
      console.error('Error in fetchTasks:', error);
    }
    return [];
  }
};
