import type { SyncModel } from '../interfaces/ISubScreens';

export interface AdminCommentParams {
  FileNames: string;
  ContentItemId: string;
  FileUrls: string;
  Comment: string;
  CommentDate: string | null;
  SyncModel: SyncModel;
}

export interface OfflineCommentParams {
  id: string;
  contentItemId: string;
  fileUrls: string;
  fileNames: string;
  fileMimeTypes: string;
  isPublic: boolean;
  comment: string;
}

export interface LocalCommentParams {
  id: string;
  contentItemId: string;
  comment: string;
  isPublic: boolean;
  isSynced: boolean;
}

export const adminCommentsParam = (
  fileNames: string,
  contentItemId: string,
  fileUrls: string,
  comment: string,
  commentDate: string | null,
  syncModel: SyncModel,
): AdminCommentParams => ({
  FileNames: fileNames,
  ContentItemId: contentItemId,
  FileUrls: fileUrls,
  Comment: comment,
  CommentDate: commentDate,
  SyncModel: syncModel,
});

export const adminCommentsParamOffline = (
  id: string,
  contentItemId: string,
  fileUrls: string,
  fileNames: string,
  fileMimeTypes: string,
  isPublic: boolean,
  comment: string,
): OfflineCommentParams => ({
  id,
  contentItemId,
  fileUrls,
  fileNames,
  fileMimeTypes,
  isPublic,
  comment,
});

export const adminCommentsParamForLocal = (
  id: string,
  contentItemId: string,
  comment: string,
  isPublic: boolean,
  isSynced: boolean,
): LocalCommentParams => ({
  id,
  contentItemId,
  comment,
  isPublic,
  isSynced,
});
