import { Platform } from 'react-native';
import Config from 'react-native-config';

// export const TENANT_BASE_URL = Config.LIVE_BASE_URL; // for live
export const TENANT_BASE_URL = Config.LIVE_BASE_URL; // for testing

export const SEQURE_BASE_URL = Config.SEQURE_LIVE_BASE_URL; //https url

export const APP_VERSION: number = 60;
export const IOS_VERSION: string = '3.1.0';
export const ANDROID_VERSION: string = '3.1.8';

export const TOKEN_FOR_APP_VERSION = Config.LIVE_TOKEN_FOR_APP_VERSION; // for Live
// export const TOKEN_FOR_APP_VERSION = Config.STAGING_TOKEN_FOR_APP_VERSION; // for testing

export const URL = {
  // AUTH Releted API's
  AUTH_LOGIN: `${TENANT_BASE_URL}connect/token`,
  TENANT_BASE_URL,
  GET_TENANT_LIST: `${TENANT_BASE_URL}${Config.GET_TENANT_LIST}`,
  GET_TENANT_LIST_SECURE: Config.GET_SECURE_TENANT_LIST,
  GET_MOBILE_APP_VERSION: `${TENANT_BASE_URL}/api/queries/GetMobileAppVersion?parameters={"CurrentVersion":${APP_VERSION}}&token=${TOKEN_FOR_APP_VERSION}`,
  GET_TOKEN: TENANT_BASE_URL + 'connect/token',
  GET_SEQURE_TOKEN: `${SEQURE_BASE_URL}connect/token`,
  GET_ADMIN_ROLE: 'api/Case/GetAdminRole',
  GET_GLOBAL_CASE_SETTING: '/api/case/GetGlobalCaseSetting',
  WEB_URL: '/LoginAuto?',
  GET_LICENSE_BY_CONTENT: '/api/License/GetLicenseByContentId?contentItemId=',
  GET_TEAM_MEMBER: '/api/TeamMember/GetTeamMembers?',
  ALL_OFFLINE_DROPDOWN_API: '/api/Case/GetDropDownForOffline',
  INPECTION_API: '/api/Case/GetAllInspectionByCaseIdandStatus?caseId=',
  UPDATE_INSPECTION_FROM_REPORT: '/api/Inspections/UpdateInspectionsFromReport',

  //CASE Releted API's
  MY_CASELIST: 'Api/Case/Submissions',
  GET_CASE_BY_ID: '/api/Case/GetCaseByContentId?ContentItemId=',
  GET_CASE_NUMBER: '/api/Case/GetCaseNumber?contentItemId=',
  GET_CASE_TYPE_FIELDS_SETTING: '/api/Case/GetCaseTypeFieldSetting?caseTypeId=',
  CASELIST_BY_DATE: '/Api/Case/GetCaseList?',
  CASE_SUB_TYPE: '/api/Case/GetCaseDropDownList?name=CaseSubType',
  CASE_TAG_LIST: '/api/Case/GetCaseDropDownList?name=CaseTag',
  CASE_TYPE_LIST: '/api/Case/GetCaseDropDownList?name=CaseType',
  CASE_ADVANCE_FORM_LIST: '/api/Case/GetCaseDropDownList?name=AdvancedForm',
  GET_CASE_CHEVRON_BY_CASEID: '/api/Case/GetCaseStatusChevronByCaseId?caseId=',
  CASE_STATUS_BY_MODULE_ID: '/api/Case/GetCaseStatusByCaseType?caseTypeId=',
  UPDATE_CASE_API: '/Api/Case/EditPublish',
  UPDATE_CASE_LOCATION_API: '/api/Case/SaveCaseLocationAddress',
  UPDATE_CASE_MAILING_ADDRESS_API: '/api/Case/SaveCaseMailingAddress',
  FILE_EXTENSION_API: '/Api/AdvancedForms/GetAllowedFileExtensions',
  SUB_SCREEN_DATA_BY_CASEID: '/api/Case/GetCaseById?ContentItemId=',
  CASE_DOCUMENT_TYPE_LIST: '/api/Case/GetCaseDropDownList?name=',
  CASE_STATUS_LIST: '/api/Case/GetCaseDropDownList?name=CaseStatus',
  CASE_TYPE_CATEGORY_LIST: '/api/Case/GetCaseDropDownList?name=CaseTypeCategory',

  //Sub Screens API's

  //Admin Notes API's
  COMMENT_API: '/Api/Case/GetComments?id=',
  COMMENT_LICENSE_API: '/Api/License/GetComments?id=',
  ADD_ADMIN_COMMENT: '/Api/Case/SaveUpdateAdminComment',
  ADD_LICENSE_ADMIN_COMMENT: '/Api/License/SaveUpdateAdminComment',
  ADMIN_COMMENTS_SET_AS_ALERT: '/Api/Case/AdminCommentSetAsAlert',
  ADMIN_COMMENTS_LICENSE_SET_AS_ALERT: '/Api/License/AdminCommentSetAsAlert',
  ADMIN_COMMENTS_SET_AS_PUBLIC: '/Api/Case/MakePublicComment',
  ADMIN_COMMENTS_LICENSE_SET_AS_PUBLIC: '/Api/License/MakePublicComment',
  INSPECTION_COMMENTS_LIST: '/api/Case/GetContentItems?contentType=StandardComment',
  STANDARD_COMMENT_TYPE_LIST: '/api/Case/GetContentItems?contentType=StandardCommentType',

  //Attached Items API's
  ATTACHED_ITEMS: '/api/Case/ViewAllAttachedForm?caseContentItemId=',
  LICENSE_ATTACHED_ITEMS: '/api/License/GetAttachItemById?LicenseContentItemId=',
  ADVANCE_FORM_BY_ID: '/Api/AdvancedForms/GetAdvancedFormData?Id=',
  EDIT_ADVANCE_FORM_SUBMISSION: '/Api/AdvancedForms/EditAdvancedFormSubmission',
  ADD_FROM_ENTRY: '/Api/AdvancedForms/Entry',

  //Contact & Contract API's
  CASE_CONTACT_LIST: '/Api/Case/GetAllCaseContacts?caseId=',
  CONTRACT_BY_CASE_LICENSE: '/api/License/GetCaseAndLicenseContractor?',
  UPSERT_CONTRACT: 'api/License/AddUpdateContractor',
  ADD_CONTACT: 'Api/Case/AddCaseContact',

  //Payment & Accounting Details

  PAYMENT_LIST: '/api/Payment/GetPaymentHistoryByCaseIdorLicenseId?',
  ACCOUNTING_DETAILS_FOR_CASE: '/api/Case/GetCaseDropDownList',
  ACCOUNTING_DETAILS_FOR_LICENSE: '/api/License/GetAllAccountingDetails',

  ACCOUNTING_DETAILS_BY_CASEID: '/api/Case/GetAccountingDetailsByCaseContentItemId?contentItemId=',
  ACCOUNTING_DETAILS_BY_LICENSEID:
    '/API/License/GetAccountingDetailsByLicenseContentItemId?contentItemId=',

  //Public comment API's
  PUBLIC_COMMENT_API: '/Api/Case/GetComments?id=',
  ADD_PUBLIC_COMMENT: '/Api/Case/SavePublicComment',
  ADD_LICENSE_PUBLIC_COMMENT: '/Api/License/SaveUpdatePublicComment',

  //Inspection comment API's
  CASE_INSPECTION_TYPE_FLAG: '/Api/Inspections/GetAllInspectionTypeByCaseIdAndCaseTypeId',
  LICENSE_INSPECTION_TYPE_FLAG: 'Api/Inspections/GetAllInspectionTypeByLicenseIdAndLicenseTypeId',

  CASE_INSPECTION_TYPE: '/Api/Inspections/GetInspectionListByCaseType?',
  LICENSE_INSPECTION_TYPE: '/api/Inspections/GetInspectionListByLicenseType?',
  DEPARTMENT_MEMBER_LIST: '/Api/Inspections/GetDepartmentMemberList?departments=',
  INSPECTION_BY_ID: '/api/Inspections/GetInspectionByContentItemId?contentItemId=',
  INSPECTION_DEFAULT_TIME_BY_TYPE:
    '/api/Inspections/GetInspectionDefaultTimeByType?inspectionTypeIds=',
  TEAM_MEMBER_SIGNATURE: '/api/Inspections/GetTeamMemberSignature',
  VERIFY_TEAM_MEMBER_SCHADULE: '/api/Inspections/VerifyTeamMemberSchedule?teamMemberIds=',
  INSPECTION_TITLE_BY_TYPE: '/Api/Inspections/GetInspectionTitleByTypes?inspectionTypeIds=',
  ADD_NEW_INPECTION: '/api/Inspections/AddNewInspection',
  UPDATE_INSPECTION_BY_CONTENT_ITEM_ID: '/api/Inspections/UpdateInspectionByContentItemId',

  SYNC_CASE_INSPECTION_API: '/api/Case/GetAllInspectionByCaseIdandStatus?caseId=',
  SYNC_LICENSE_INSPECTION_API: '/api/License/GetAllInspectionByLicenseIdAndStatus?licenseId=',

  //Related
  RELATED_LIST_BY_CASEID: '/API/Case/GetAllRelatedCaseByCaseId?caseId=',
  // Sub License screen
  GET_ALL_PARENT_CHILD_CONTRACTOR_BY_LICENSE_ID:
    '/API/License/GetAllParentAndChildContractorByLicenseId?licenseId=',

  //SendEmail screen
  SEND_EMAIL_LIST: '/api/Case/GetAllSendEmailsByCaseId?caseId=',
  SEND_EMAIL_LIST_LICENSE: 'api/License/GetAllSendEmailsByLicenseId?licenseId=',

  // owner details get
  GET_LICENSE_OWNER_DETAILS: 'API/License/GetLicenseOwnerDetails?licenseId=',
  ADD_UPDATE_LICENSE_OWNER_DETAILS: '/API/License/AddUpdateLicenseOwnerDetails',

  // license detail
  LICENSE_DETAILS_API: '/api/License/GetLicenseDetails?ContentItemId=',
  UPDATE_LICENSE_DETAILS_API: '/api/License/AddUpdateLicenseDetails',

  // GET LICENSE TYPE FIELD SETTING
  GET_LICENSE_TYPE_FIELDS_SETTING: 'api/License/GetLicenseTypeFieldSetting?licenseTypeId=',

  //Task screen screen
  TASK_LIST: '/API/Case/GetAllCaseTasksByCaseId?caseId=',

  //Log screen Api's
  CASE_CHANGE_LOG_STATUS: '/api/case/GetCaseChangeLogByType?caseId=',
  INSPECTION_CHANGE_LOG: '/api/Inspections/GetInspectionHistoryChangeLog',
  CASE_PAYMENT_HISTORY_LOG: '/api/Case/GetPaymentHistoryChangeLog?caseId=',
  LICENSE_PAYMENT_HISTORY_LOG: '/api/License/GetPaymentHistoryChangeLog?licenseId=',
  LICENSE_CHANGE_LOG_STATUS: '/api/License/GetLicenseChangeLogByType?type=Status&licenseId=',

  //Location Api's
  MULTI_LOCATION_LIST: '/api/Case/GetAllMultipleLocationByCaseId?caseId=',
  ADD_MULTIPLE_LOCATION: '/api/Case/SaveMultipleLocation',
  UPDATE_MULTIPLE_LOCATION: '/api/Case/UpdateMultipleLocation',
  DELETE_MULTIPLE_LOCATION: '/api/Case/DeleteCaseMutipleLocationRecord?contentItemId=',

  // Settings API's
  GET_SETTING: '/api/Case/GetCaseSetting?ContentItemId=',
  UPDATE_SETTING: '/api/Case/AddUpdateSetting',
  SETTING_TEAM_MEMBER_LIST: '/api/TeamMember/GetTeamMembers?',

  USERNAME_SEARCH_LIST: '/api/TeamMember/SearchUserName?searchString=',
  // HOME Releted API's
  DASHBOARD_ALL_COUNT: 'Api/Reporting/GetAllCount',

  //Attached Docs Releted API's
  //CASE
  FOLDER_FILE_LIST_BY_CASEID: '/Api/Case/GetAllFoldersFilesByCaseId?caseContentItemId=',
  FOLDER_FILE_BY_CASE_ID: '/Api/Case/GetFoldersFilesByCaseId?caseContentItemId=',
  ADD_UPDATE_FOLDER: '/Api/Case/AddUpdateFolder',
  DELETE_ATTACHED_DOCS: '/api/Case/RemoveCaseAttachedDocument?contentItemId=',
  UPDATE_ATTACHED_DOCS: '/api/Case/UpdateCaseAttachedDocumentDetail',
  ADD_ATTCHED_DOCS: '/api/Case/SaveCaseAttachedDocumentDetail',
  ADD_ALL_CASE_DOC_DATA: '/Api/Case/AddUpdateAllFoldersFiles',

  //LICENSE
  FOLDER_FILE_LIST_BY_LICENSEID: '/api/License/GeAllFoldersFilesByLicenseId?LicenseContentItemId=',
  FOLDER_FILE_BY_LICENSE_ID: '/Api/License/GetFoldersFilesByLicenseId?LicenseContentItemId=',
  ADD_UPDATE_LICENSE_FOLDER: '/Api/License/AddUpdateFolder',
  DELETE_ATTACHED_DOCS_LICENSE: '/Api/License/RemoveLicenseAttachedDocument?contentItemId=',
  FILE_UPLOAD_API: 'formio/azure/upload',
  UPDATE_ATTACHED_DOCS_LICENSE: '/API/License/UpdateLicenseAttachedDocumentDetail',
  ADD_LICENSE_ATTCHED_DOCS: '/API/License/AddLicenseAttachDocument',
  ADD_ALL_LICENSE_DOC_DATA: '/Api/License/AddUpdateAllFoldersFiles',

  //LICENSE Releted API's
  GET_LICENSE_LIST: 'Api/License/Submissions',
  LICENSE_TYPE_LIST: '/api/License/GetLicenseTypeList',
  LICENSE_BY_CONTENT_ID: '/api/License/GetLicenseByContentId?contentItemId=',
  LICENSE_BY_TYPE: '/api/License/GetLicenseByType?type=',
  GET_LICENSE_CHEVRON_BY_LICENSEID: '/api/License/GetLicenseStatusChevronByLicenseId?licenseId=',
  LICENSE_SUB_TYPE: '/Api/License/GetLicenseSubType',
  LICENSE_SUB_TYPE_BY_LICENSE_TYPE_ID: 'Api/License/GetLicenseSubTypesByTypeId?licenseTypeId=',
  LICENSE_TYPE:
    '/Api/License/LicenseTypes?pagenum=&view=Tile&DisplayText=&FilterType=&LicenseType=&LicenseStatus=&TeamMember=&LicenseSubType=&LicenseRenewalStatus=',
  GET_LICENSE_TAGS: '/Api/License/GetLicenseTags',
  LICENSE_STATUS: '/Api/License/GetLicenseStatuses',
  BILLING_STATUS: '/api/Case/GetCaseDropDownList?name=BillingStatus',
  GET_LICENSE_NUMBER: '/api/License/GetLicenseNumber?contentItemId=',
  GET_LICENSE_RENEWAL_STATUS: '/api/License/GetLicenseRenewalStatuses',
  GET_LICENSE_ATTACHED_ITEMS: '/api/License/GetAttachItemById?LicenseContentItemId=',
  EDIT_LICENSES: 'Api/License/EditPublishLicense',
  GET_ALL_LICENSE_CONTACTS: 'Api/License/GetAllContacts?licenseId=',
  ADD_LICENSE_CONTACT: '/Api/License/AddLicenseContact',
  SUB_SCREEN_DATA_BY_LICENSE_ID: '/api/license/GetLicenseById?contentItemId=',
  LICENSE_TYPE_CATEGORY_LIST: '/api/License/GetLicenseDropDownList?contentType=LicenseTypeCategory',

  //LICENSE OFFLINE Releted API's
  LICENSE_LIST_BY_DATE: '/Api/License/GetLicenseList?',

  //Form submission
  GET_ADVANCED_FORM_STATUS: '/Api/AdvancedForms/GetAdvancedFormStatus',
  GET_SUBMISSIONS_ONLINE: 'Api/AdvancedForms/GetSubmissions',
  GET_SUBMISSION_OFFLINE: '/Api/AdvancedForms/GetSubmissionsList?mySubmission=true',

  // Daily Inpection
  DAILY_INSPECTION_REPORT: '/Api/Reporting/GetDailyInspectionReports?date=',
  DEPARTMENT_TEAM_MEMBERS: '/Api/Inspections/GetDepartmentMemberList?departments=',
  SELECT_INSPECTION_LIST: '/api/Reporting/GetSelectList?name=InspectionType',
  APPOINTMENT_STATUS_WITH_LABEL: '/Api/Inspections/GetAppointmentStatusWithLabel',
  UPDATE_DAILY_INSPECTION_REPORT_ORDER:
    '/Api/Reporting/UpdateDailyInspectionReportOrderbyContentItemIds',
  DAILY_INSPECTION_REPORT_DOWNLOAD: '/Api/Reporting/DownloadDailyInspectionCsvReport',

  // NEW FORM
  ADVANCE_FORM_LIST: '/Api/AdvancedForms/GetContentItems?type=AdvancedForm&pagenum=',
  GET_ADVANCED_FORM_LIST_API: 'api/AdvancedForms/GetAdvancedFormList?pagenum',
  GET_ADVANCEFORM_TYPE_API:
    'api/AdvancedForms/GetAdvancedFormSelectList?contentType=AdvancedFormTypes',
  GET_ADVANCEFORM_TAG_API:
    '/api/AdvancedForms/GetAdvancedFormSelectList?contentType=AdvancedFormTags',

  //Parcel
  GET_ALL_PARCEL: '/api/ParcelGenealogy/GetAllParcelsByParcelNumberOrAddress?',
  GET_PARCEL_DETAILS: '/api/ParcelGenealogy/GetParcelDetailsByParcelNumber?parcelNumber=',
  GET_CASE_BY_PARCEL_NUMBER: '/api/ParcelGenealogy/GetCasesByParcelNumber?parcelNumber=',
  GET_SUBMMISSION_BY_PARCEL_NUMBER:
    '/api/ParcelGenealogy/GetSubmissionsByParcelNumber?parcelNumber=',
  GET_CHILD_PARCELS: '/api/ParcelGenealogy/GetChildParcelsByParcelNumber?parcelNumber=',

  //schedule
  GET_ALL_SCHEDULE_LIST: '/api/TeamMember/GetMySchedule',
};

export const AUTH_CONFIG = {
  client_id: Config.AUTH_CONFIG_CLIENT_ID,
  client_secret: Config.AUTH_CONFIG_CLIENT_SECRET,
  grant_type: Config.AUTH_CONFIG_GRANT_TYPE,
  scope: Config.AUTH_CONFIG_SCOPE,
};

export const APP_STORE = Config.APP_STORE_URL;
export const PLAY_STORE = Config.PLAY_STORE_URL;

//Google address api key
export const GOOGLE_PLACE_API_KEY =
  Platform.OS == 'ios' ? Config.GOOGLE_MAPS_API_KEY_IOS : Config.GOOGLE_MAPS_API_KEY_ANDROID;

// Web view
export const TEST_URL = 'https://www.google.com/favicon.ico';
export const NETWORK_TIMEOUT = 5000; // 5 seconds
export const CONNECTIVITY_THRESHOLD = 2000; // 2 seconds
export const QUERY_PARAMS = {
  HIDE_HEADER_FOOTER: 'HideHeaderAndFooter=true',
  HIDE_LEFT_MENU: 'hideLeftMenu=true',
};
