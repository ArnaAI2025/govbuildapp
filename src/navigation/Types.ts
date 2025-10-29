import { DocumentModel, Folder } from '../utils/interfaces/IAttachedDocs';
import { CaseData } from '../utils/interfaces/ICase';
import { LicenseData } from '../utils/interfaces/zustand/ILicense';
export interface NewFormData {
  DisplayText: string;
  AutoroutePart: string;
  // Add any other keys you're using
  [key: string]: any; // optionally allow more keys
}

export type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  DashboardDrawerScreen: undefined;
  HomeScreen: undefined;
  ForgotPasswordScreen: { baseUrl: string };
  MyCaseScreen: { paramKey: string; screenName: any; isUpdateRecord?: boolean };
  LicenseScreen: undefined;
  EditLicenseScreen: {
    contentItemId: string;
    licenseData: LicenseData;
    refreshAttechedItems?: boolean;
  };
  NewFormScreen: undefined;
  ReportScreen: undefined;
  NewFormDetailsScreen: { data: NewFormData };
  EditCaseScreen: {
    caseId: string;
    myCaseData: CaseData;
    refreshAttechedItems?: boolean;
  };
  AttechedItems: {
    type: string;
    param: any;
    isOnline?: boolean;
    caseDataById?: string;
  };
  AdminNotes: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    permissions: {
      isAllowAddAdminNotes: boolean;
      isAllowAllowMakeAdminCommentsPublic: boolean;
      allowRemoveAdminComments: boolean;
    };
    caseSettingData: any; //There is multiple setting is present so after that completion i will remove this
    isOnline: boolean;
    newCommentAdded?: boolean;
    newCommentId?: string;
  };
  CommentWithFileAttached: {
    isCase: boolean;
    caseData: any; // this is for case when i complete the case module then i will create a interface
    fileArray: any;
    isAdminNotes: boolean;
    comment: string;
    isOnline: boolean;
    permissions?: any;
  };
  EditFormWebView: {
    type: string;
    param: any;
    caseId?: string;
    licenseId?: string;
    caseLicenseObject: any;
    flag?: number;
  };
  PublicComments: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    permissions: {
      isAllowAddAdminNotes: boolean;
      isAllowAllowMakeAdminCommentsPublic: boolean;
      allowRemoveAdminComments: boolean;
    };
    caseSettingData: any; //There is multiple setting is present so after that completion i will remove this
    isOnline: boolean;
    newCommentAdded?: boolean;
    newCommentId?: string;
  };

  AttachedDocs: {
    type: string;
    param: any;
    caseSettingData: any;
    caseDataById: string;
    isOnline: boolean;
  };
  InspectionsScreen: {
    type: string;
    param: any;
    isShowSchedule: boolean;
    isAllowViewInspection: boolean;
    caseDataById: string;
    isOnline: boolean;
  };
  InspectionSchedule: {
    type: string;
    param: any;
    caseData: any;
    inspectionId?: string;
    isAllowViewInspection?: boolean;
    isNew: boolean;
    comeFromInspectionList: boolean;
  };
  Locations: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    IsAllowMutlipleAddress: boolean;
  };
  PaymentMain: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
  };
  // PublicCommentsScreen: {
  //   type: string;
  //   param: any;
  //   caseSettingData: any;
  // };
  RelatedScreen: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
  };
  ContactMain: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
  };
  SettingsScreen: {
    type: string;
    param: any;
    caseSettingData: any;
  };
  LicenseDetailsScreen: {
    type: string;
    param: any;
    caseSettingData: any;
  };
  OwnerScreen: {
    type: string;
    param: any;
    caseSettingData: any;
  };
  SubLicenseScreen: {
    type: string;
    param: any;
    caseSettingData: any;
  };
  ShowLicenseScreen: {
    type: string;
    param: any;
    caseSettingData: any;
  };
  // StatusChangeLog: {
  //   type: string;
  //   param: any;
  //   caseShowHideKeysData: any;
  // };
  StatusChangeLog: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
  };
  TaskScreen: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
    isOnline: boolean;
  };
  SendMailScreen: {
    type: string;
    param: any; // this is for case when i complete the case module then i will create a interface
    caseSettingData: any;
    isOnline: boolean;
  };
  // TaskStatusChangeLog: {
  //   type: string;
  //   param: any;
  //   IsShowTaskStatusLogTab: boolean;
  // };
  // AccountingDetailScreen: {
  //   type: string;
  //   param: any;
  //   caseSettingData: any;
  // };
  // AddForm: {
  //   caseData: any;
  //   type: string;
  // };
  OpenInWebView: {
    paramKey: string;
    param: string;
    title: string;
    isNotSkipScreen?: boolean;
    isForDailyInspection?: boolean;
  };
  // };
  WebViewForForm: {
    type: string;
    param: {
      Path: string;
      ContentItemId: string;
    };
    caseId?: string;
    licenseId?: string;
    flag?: number;
    title: string;
  };
  NewFormWebView: {
    type: string;
    param: any;
    caseId?: string;
    licenseId?: string;
    caseLicenseObject: any;
    flag?: number;
    isFromNewForm?: boolean;
    // title: string;
  };
  EditAttachItem: {
    type: string;
    param: any;
    caseId?: string;
    licenseId?: string;
    caseLicenseObject: any;
    flag?: number;
  };
  FormioFileUploadScreen: {
    paramKey: string;
    param: string;
    submission: any;
    type: string;
    caseLicenseObject: any;
    parentScreenName: string;
    isFromNewForm?: boolean;
  };
  AddForm: {
    caseData: CaseData;
    type: string;
  };
  AddContact: {
    addNew: boolean;
    param: any; // this is for add and edit contact after that complete the contact section then i will create a interface
    type: string;
    caseLicenseID: string;
    caseLicenseData: CaseData;
  };
  AddContract: {
    addNew: boolean;
    param: any; // this is for add and edit contract after that complete the contact section then i will create a interface
    type: string;
    caseID: string;
    caseData: CaseData;
  };
  AddMultiLocation: {
    isEdit: boolean;
    data?: {
      parcelId?: string;
      address?: string;
      latitude?: string;
      longitude?: string;
      endDate?: string;
      contentItemId?: string;
    };
    contentId: string;
    isOnline: boolean;
  };
  AttachedDocsSubScreen: {
    param: Folder | DocumentModel;
    data: Array<Folder | DocumentModel>;
    isNew?: boolean;
    caseDataById?: any;
    isCase: boolean;
    isForceSync: boolean;
    isGridView: boolean;
  };
  AttachDocPreview: {
    paramKey: string;
    url: string;
    fileType?: string;
  };
  AttachedDocsUpdateAndAdd: {
    isOffline?: boolean;
    caseData: any;
    docsData?: DocumentModel;
    isUpdate: boolean;
    fileData?: any;
    fileName?: string;
    fileType?: string;
    fileUrl?: string;
    folderID?: number;
    fileStructure?: string[];
    contentId: string;
    isAllowEditFilename?: boolean;
    contentData?: any;
    isCase?: boolean;
    isStatusReadOnly?: boolean;
    isDefaultAttachDocShowOnFE?: boolean;
  };
  AdvanceFormSubmission: undefined;
  DailyInspection: {
    param: any;
  };
  EditInspection: {
    param: any;
    isEdit?: boolean;
    contentId?: string;
    isOnline: boolean;
  };
  RouteScreen: {
    param: any;
  };
  OfflineItemsScreen: undefined;
  HistoryScreen: undefined;
  OfflineSyncScreen: undefined;
  ItemToSyncScreen: undefined;
  ParcelScreen: undefined;
  ParcelDetail: {
    parcelNumber: string;
  };
  ParcelDetailScreen: {
    parcelNumber: string;
  };
  MyScheduleScreen: {
    param: any;
  };
};

// Placeholder interface for NewFormData (define based on your actual data structure)
export interface NewFormData {
  id: string;
  title: string;
}
