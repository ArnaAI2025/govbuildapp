import { SyncModel } from './ISubScreens';

export interface Folder {
  id: number;
  parentId: number;
  name: string;
  contentItemId: string;
  isFolder: boolean;
  syncModel: SyncModel;
}

export interface File {
  id: string;
  contentItemId: string;
  fileName: string;
  url: string;
  laserficheEntryId?: number;
  laserficheFileUrl?: string;
  inspectionContentItemId?: string | null;
  isFolder: boolean;
  syncModel: SyncModel;
}

export interface CaseData {
  contentItemId: string;
  caseContentItemId?: string;
  licenseContentItemId?: string;
}

export interface DocData {
  id?: string;
  contentItemId?: string;
  fileName?: string;
  url?: string;
  laserficheEntryId?: number;
  laserficheFileUrl?: string;
  inspectionContentItemId?: string | null;
}
export interface DocumentModel {
  id: string;
  contentItemId: string;
  fileName: string;
  url: string;
  shortDescription?: string;
  details?: string;
  isShowonFE: boolean;
  isInspectionAdminAttachment?: boolean;
  documentTypeId?: string;
  caseStatusId?: string;
  laserficheEntryId?: number;
  laserficheFileUrl?: string;
  ePlanSoftDocumentId?: string;
  bluebeamDocumentId?: string;
  inspectionContentItemId?: string | null;
  isForceSync?: boolean;
}
