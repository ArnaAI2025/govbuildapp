import type { SyncModel } from '../../utils/interfaces/ISubScreens';

// Interface for settings data
export interface SettingsSyncData {
  contentItemId: string;
  permitIssuedDate?: string;
  permitExpirationDate?: string;
  viewOnlyAssignUsers: boolean;
  assignedUsers?: string;
  assignAccess?: string;
  projectValuation?: string;
  caseOwner?: string;
  isCase: boolean;
  isEdited: boolean;
  isSync: boolean;
  isForceSync: boolean;
  ApiChangeDateUtc?: string;
}

// Interface for sync queue task
export interface SyncQueueTask {
  id: number;
  type: string;
  data: any;
  status: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

//Admin Notes

export interface AdminNoteSyncData {
  id: string;
  caseAndLicenseId: string;
  contentItemId?: string;
  isCase: boolean;
  published?: boolean;
  latest?: boolean;
  contentType?: string;
  modifiedUtc?: string;
  publishedUtc?: string;
  createdUtc?: string;
  owner?: string;
  author?: string;
  displayText?: string;
  isPublic: boolean;
  commentIsAlert?: boolean;
  comment: string;
  isEdited: boolean;
  isEdit?: boolean; // for the update
  isLocallyEdited?: boolean; // Track local edits
  isSync: boolean;
  isForceSync: boolean;
  Attachment?: string;
  FileName?: string;
  ApiChangeDateUtc?: string;
  isFromPublicComment?: boolean;
  correlationId?: string;
  syncModel?: SyncModel; // Sync model for offline changes
}
