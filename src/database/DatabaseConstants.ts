export const DATABASE_NAME = 'db.GovbuiltOffline';

export const TABLES = {
  EXAMPLE: 'example_table',
  SYNC_QUEUE: 'sync_queue',
  USER: 'user_table',
  FORMS: 'forms_table',
  CASES: 'cases',
  CASE_TYPE_SETTING: 'caseTypeSettings',
  LICENSE: 'license',
  LICENSE_DETAILS: 'licenseDetail',
  USER_PROFILE_TABLE_NAME: 'userProfile',
  CASE_TABLE_NAME: 'myCase',
  ATTACHITEM_EDIT_SYNC: 'attachItemEditSync',
  CASE_SETTINGS_TABLE_NAME: 'settings',

  CASE_ATTCHED_DOCS_TABLE_NAME: 'attachedDoc',
  CASE_DOCSFOLDER_FILES_TABLE_NAME: 'attachedDocFolderFiles',
  CASE_DOCS_TO_SYNC_TABLE_NAME: 'attachedDocToSync',
  CASE_ATTCHED_ITEMS_TABLE_NAME: 'attachedItems',
  CASE_ADMIN_NOTES_TABLE_NAME: 'adminNotes',
  CASE_ADMIN_NOTES_FILE_TABLE_NAME: 'adminNotesFile',
  CASE_ATTCHED_DOC_IMG_TABLE_NAME: 'attachedDocImg',
  ADDFORM_TABLE_NAME: 'addFormList',
  ADDFORM_CASE_TABLE_NAME: 'caseAddFormList',
  ADDFORM_DATA_TABLE_NAME: 'addFormData',
  ADDFORM_CASELICENSE_ATTACH_TABLE_NAME: 'addForm_caselicense_attach',
  FILE_EXTENSION_TABLE_NAME: 'fileExtension',
  FORMIO_IMAGE_DATA: 'formioImageData',
  FORMIO_EDIT_IMAGE_DATA: 'formioEditImageData',

  // Dropdown
  BILLING_STATUS_TABLE_NAME: 'billingStatus',
  DEPARTMENT_MEMBER_LIST: 'DepartmentMemberList',
  TYPE_TABLE_NAME: 'caseLicenseType',
  RENEWAL_STATUS: 'RenewalStatus',
  STATUS_TABLE_NAME: 'caseLicenseStatus',
  SUBTYPE_TABLE_NAME: 'caseLicenseSubType',
  DOC_TYPE_TABLE_NAME: 'documentTypes',
  USERS_TABLE_NAME: 'userDropDown',
  TEAM_MEMBER_TABLE_NAME: 'teamMembers',
  TAGS: 'CaseLicenceTags',

  FORM_FILE_TABLE: 'FileTable',
  DAILY_INSPECTION_TABLE: 'DailyInspection',
  INSPECTION_TABLE: 'Inspection',
  FORM_SUBMISSION_TABLE: 'FormSubmission',
  FORM_SUBMISSION_STATUS_TABLE: 'FormSubmissionStatus',
  CONTRACTOR: 'Contractor',
  LOCATION: 'Location',
  FORM_TYPES_TABLE: 'FormTypes',
  FORM_TAGS_TABLE: 'FormTags',
  ALL_FORMS: 'allForms',
  NEW_FORM: 'newFormList',
  //Sync history
  SYNC_HISTORY: 'SyncHistory',

  // Case Payments
  CASE_PAYMENT_TABLE_NAME: 'payments',

  // case Contacts & Contractors
  CASE_CONTRACTS_TABLE_NAME: 'caseContract',
  CASE_CONTACT_TABLE_NAME: 'caseContact',
  // license Details & Owner
  LICENSE_OWNER_TABLE_NAME: 'licenseOwner',
  LICENSE_DETAILS_TABLE_NAME: 'licenseDetails',

  //  offline_forms
  OFFLINE_FORMS_CACHED_DATA: 'offlineFormCached',
};

export const CREATE_TABLES = {
  EXAMPLE: `
    CREATE TABLE IF NOT EXISTS ${TABLES.EXAMPLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value TEXT
    );
  `,
};

export const CASE = 'Case';
export const LICENSE = 'License';
export const FORM = 'Form';
export const TAB = 'Tab';
export const CASE_ACCESS = 'CASE_ACCESS';

export const MY_CASE_CONSTENTS = {};
export const LICENSE_CONSTENTS = {};
export const FORM_SUBMISSION_CONSTENTS = {};
export const DAILY_INSPECTION_CONSTENTS = {};
export const NEW_FORM_CONSTENTS = {};
