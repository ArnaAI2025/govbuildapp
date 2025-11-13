import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export const createCaseTable = async (): Promise<void> => {
  const db = getDatabase();
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLES.CASES} (
        caseName TEXT,
        number TEXT,
        displayText TEXT,
        totalCost TEXT,
        caseStatus TEXT,
        caseStatusColor TEXT,
        contentItemId TEXT UNIQUE PRIMARY KEY,
        statusId TEXT,
        parcelNumber TEXT,
        isManualAddress TEXT,
        billingStatus TEXT,
        billingStatusId TEXT,
        email TEXT,
        phoneNumber TEXT,
        caseTypeId TEXT,
        caseType TEXT,
        location TEXT,
        subTypes TEXT,
        description TEXT,
        longitudeField TEXT,
        latitudeField TEXT,
        caseNumberDetail TEXT,
        expectedCaseDate TEXT,
        actualCaseDate TEXT,
        isEditable BOOLEAN DEFAULT 0 NOT NULL,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isSubScreenEdited BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        DataType TEXT DEFAULT 'Offline' NOT NULL,
        published BOOLEAN DEFAULT 0 NOT NULL,
        isAllowEditActualDate BOOLEAN DEFAULT 0 NOT NULL,
        viewOnlyAssignUsers BOOLEAN DEFAULT 0 NOT NULL,
        assignedUsers TEXT,
        author TEXT,
        ownerName TEXT,
        isEnableMultiline BOOLEAN DEFAULT 0 NOT NULL,
        cityField TEXT,
        countryField TEXT,
        postalCodeField TEXT,
        stateField TEXT,
        streetRouteField TEXT,
        mailingAddress TEXT,
        mailingAddressCityField TEXT,
        mailingAddressCountryField TEXT,
        mailingAddressPostalCodeField TEXT,
        mailingAddressStateField TEXT,
        mailingAddressStreetRouteField TEXT,
        apartmentSuite TEXT,
        isShowInspectionTab BOOLEAN DEFAULT 0,
        caseTag TEXT,
        isAllowEditCase BOOLEAN DEFAULT 0,
        isAllowViewInspection BOOLEAN DEFAULT 0,
        isPermission BOOLEAN DEFAULT 0,
        isAllowAddAdminNotes BOOLEAN DEFAULT 0,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT,
        quickRefNumber TEXT,
        isStatusReadOnly BOOLEAN DEFAULT 0,
         isForceSyncSuccess BOOLEAN DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_cases_contentItemId ON ${TABLES.CASES}(contentItemId);
      CREATE INDEX IF NOT EXISTS idx_cases_modifiedUtc ON ${TABLES.CASES}(modifiedUtc);
      CREATE INDEX IF NOT EXISTS idx_cases_status ON ${TABLES.CASES}(caseStatus);


CREATE TABLE IF NOT EXISTS ${TABLES.CASE_TYPE_SETTING} (
  id TEXT PRIMARY KEY,
  contentItemId TEXT,
  caseTitle TEXT,
  caseDisplayText TEXT,
  caseNumberText TEXT,
  caseTagText TEXT,
  actualCloseDateText TEXT,
  expectedCloseDateText TEXT,
  attachedItemText TEXT,
  isAutoArchive BOOLEAN,
  isAllowMutlipleAddress BOOLEAN,
  isCaseTypeStatusesOrderedList BOOLEAN,
  isLaserficheModuleEnabled BOOLEAN,
  isLockCaseSubType BOOLEAN,
  isLockCaseType BOOLEAN,
  isRequiredCaseName BOOLEAN,
  isRequiredCaseNumberDetail BOOLEAN,
  isRequiredExpectedCloseDate BOOLEAN,
  isRequiredPermitExpirationDate BOOLEAN,
  isNotifyCaseOwnerPermitExpiration BOOLEAN,
  enableLaserficheForCaseType BOOLEAN,
  useGlobalCaseAutoNumberSettings BOOLEAN,
  square9CategoryField INTEGER,
  taskText TEXT,
  title TEXT,
  isAllowChangeRequiredFields BOOLEAN,
  isAllowEditActualDate BOOLEAN,
  isAllowProfileRequestInspection BOOLEAN,
  isAllowPublicView BOOLEAN,
  isDefaultAttachDocShowOnFE BOOLEAN,
  isDefaultShowFE BOOLEAN,
  isDoNotAddResponsiblePartybyDefault BOOLEAN,
  isEPlanSoftModuleEnabled BOOLEAN,
  isHideAccDetailsTab BOOLEAN,
  isHideActionButton BOOLEAN,
  isHideAdminNotesTab BOOLEAN,
  isHideAttachedDocTab BOOLEAN,
  isHideBillingStatus BOOLEAN,
  isHideBillingStatusChangeLogTab BOOLEAN,
  isHideCalenderOpt BOOLEAN,
  isHideCaseName BOOLEAN,
  isHideCaseNumberDetail BOOLEAN,
  isHideCaseSubType BOOLEAN,
  isHideCaseType BOOLEAN,
  isHideChangeLogTab BOOLEAN,
  isHideContactTab BOOLEAN,
  isHideContentItem BOOLEAN,
  isHideDescription BOOLEAN,
  isHideExpectedCloseDate BOOLEAN,
  isHideFillAndAttach BOOLEAN,
  isHideInspectionHistoryLogTab BOOLEAN,
  isHideInspectionMenuOnFE BOOLEAN,
  isHideMailingAddress BOOLEAN,
  isHidePacketReportOpt BOOLEAN,
  isHideParcelNumber BOOLEAN,
  isHidePaymentHistoryLogTab BOOLEAN,
  isHidePaymentTab BOOLEAN,
  isHidePublicCommentTab BOOLEAN,
  isHideQuickRefNumber BOOLEAN,
  isHideRelatedTab BOOLEAN,
  isHideSentMailTab BOOLEAN,
  isHideSettingTab BOOLEAN,
  isHideShowOnFE BOOLEAN,
  isHideTag BOOLEAN,
  isHideTaskStatusChangeLogTab BOOLEAN,
  isHideTaskTab BOOLEAN,
  isHideTeamMemberAssignmentLogTab BOOLEAN,
  isHideTotalCost BOOLEAN,
  isHideViewAllSubmission BOOLEAN,
  isInfoShow BOOLEAN,
  isPlanReviewEnabled BOOLEAN,
  isNotifyAllContactsPermitExpiration BOOLEAN,
  isNotifyApplicantPermitExpiration BOOLEAN,
  isNotifyAssignOtherTeamMembersOnFileUpload BOOLEAN,
  isNotifyAssignTeamMembersOnFileUpload BOOLEAN,
  isShowCaseSubTypesList BOOLEAN,
  isShowDefaultAdminField BOOLEAN,
  isShowNotesOnInspectionTab BOOLEAN,
  isShowTaskTabOnProfile BOOLEAN,
  isShowUnauthorized BOOLEAN,
  isSquare9ModuleEnabled BOOLEAN,
  isVelosimoModuleEnabled BOOLEAN,
  uploadFinalReportOnClosedStatus BOOLEAN,
  useAutoNumber BOOLEAN,
  isEdited BOOLEAN DEFAULT 0
);
`);
    console.log('Case table created');
  } catch (error) {
    recordCrashlyticsError('Error creating Case table:', error);
    console.error('Error creating Case table:', error);
    throw error;
  }
};
export const createSubTabsTables = async (): Promise<void> => {
  const db = getDatabase();
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLES.FORM_FILE_TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        localFilePath TEXT,
        assureFileUrl TEXT,
        formId TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        mimeType TEXT,
        name TEXT,
        fileId TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.ADDFORM_TABLE_NAME} (
        id TEXT UNIQUE PRIMARY KEY,
        DisplayText TEXT,
        ContentType TEXT,
        AutoroutePart TEXT,
        AdvancedForm_Container TEXT,
        Published TEXT,
        CreatedUtc TEXT,
        ModifiedUtc TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        type TEXT,
        tag TEXT,
        ownerName TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.ADDFORM_DATA_TABLE_NAME} (
        localId TEXT UNIQUE PRIMARY KEY,
        id TEXT,
        DisplayText TEXT,
        ContentType TEXT,
        Submission TEXT,
        CreatedUtc TEXT,
        Owner TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        imageids TEXT,
        readyToSync BOOLEAN DEFAULT 0 NOT NULL,
        caseId TEXT,
        licenseId TEXT,
        isDraft BOOLEAN DEFAULT 0 NOT NULL,
        startSyncing BOOLEAN DEFAULT 0 NOT NULL,
        title TEXT,
        gridIds TEXT,
        caseNumber TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.ADDFORM_CASELICENSE_ATTACH_TABLE_NAME} (
        formId TEXT PRIMARY KEY,
        caseId TEXT,
        licenseId TEXT,
        itemText TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.FORMIO_IMAGE_DATA} (
        id TEXT UNIQUE,
        FormId TEXT,
        key TEXT,
        label TEXT,
        validate_required BOOLEAN DEFAULT 0,
        localUrl TEXT,
        assureUrl TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        fileType TEXT,
        fileName TEXT,
        file BLOB,
        isDataGrid BOOLEAN DEFAULT 0 NOT NULL,
        gridKey TEXT,
        count INTEGER,
        condition TEXT,
        isCustomCondition BOOLEAN DEFAULT 0 NOT NULL,
        serverUrl TEXT,
        isMultiple BOOLEAN DEFAULT 0,
        filePattern TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_ATTCHED_DOC_IMG_TABLE_NAME} (
        contentItemId TEXT,
        id TEXT,
        isCase BOOLEAN,
        ePlanSoftDocumentId TEXT,
        url TEXT,
        localUrl TEXT,
        fileName TEXT,
        fileType TEXT,
        isShowonFE TEXT,
        documentTypeId TEXT,
        documentType TEXT,
        caseStatus TEXT,
        details TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        readyToSync BOOLEAN DEFAULT 0 NOT NULL,
        parentFolderId TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.USER_PROFILE_TABLE_NAME} (
        userID TEXT UNIQUE PRIMARY KEY,
        UserName TEXT,
        baseURL TEXT,
        tenantId TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.ALL_FORMS} (
        contentItemId TEXT,
        isCase BOOLEAN DEFAULT 0 NOT NULL,
        contentType TEXT,
        position INTEGER,
        displayText TEXT,
        editLink TEXT,
        displayLink TEXT,
        permitSubmissionId TEXT,
        status TEXT,
        modifiedUtc TEXT,
        author TEXT,
        title TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        ShortDescription TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_ATTCHED_DOCS_TABLE_NAME} (
        contentItemId TEXT,
        id TEXT,
        isCase BOOLEAN,
        ePlanSoftDocumentId TEXT,
        url TEXT,
        fileName TEXT,
        isShowonFE BOOLEAN DEFAULT 0,
        documentTypeId TEXT,
        documentType TEXT,
        caseStatus TEXT,
        details TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        isNew BOOLEAN DEFAULT 0 NOT NULL,
        statusName TEXT,
        shortDescription TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_DOCSFOLDER_FILES_TABLE_NAME} (
        contentItemId TEXT,
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isCase BOOLEAN,
        AllFilesFoldersJSON TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        isNew BOOLEAN DEFAULT 0 NOT NULL,
        isEdited BOOLEAN DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_DOCS_TO_SYNC_TABLE_NAME} (
        licenseContentItemId TEXT,
        caseContentItemId TEXT,
        id TEXT PRIMARY KEY,
        isCase BOOLEAN,
        parentFolderID TEXT,
        Isfolder BOOLEAN DEFAULT 0 NOT NULL,
        name TEXT,
        fileName TEXT,
        URL TEXT,
        details TEXT,
        documentType TEXT,
        shortDescription TEXT,
        isShowonFE BOOLEAN DEFAULT 0 NOT NULL,
        caseStatus TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        isNew BOOLEAN DEFAULT 0 NOT NULL,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isReadyToSync BOOLEAN DEFAULT 0 NOT NULL,
        localUrl TEXT,
        fileType TEXT,
        statusName TEXT,
        documentTypeId TEXT,
        DirPath TEXT,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT,
        isEdit BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_ADMIN_NOTES_TABLE_NAME} (
        id TEXT,
        contentItemId TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN DEFAULT 0 NOT NULL,
        published BOOLEAN DEFAULT 0 NOT NULL,
        latest BOOLEAN DEFAULT 0 NOT NULL,
        contentType TEXT,
        modifiedUtc TEXT,
        publishedUtc TEXT,
        createdUtc TEXT,
        owner TEXT,
        author TEXT,
        displayText TEXT,
        isPublic BOOLEAN NOT NULL DEFAULT false,
        isAlert BOOLEAN,
        comment_isAlert BOOLEAN NOT NULL DEFAULT false,
        comment TEXT,
        isEdited INTEGER NOT NULL DEFAULT 0,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        isNewData BOOLEAN DEFAULT 0 NOT NULL,
        Attachment TEXT,
        FileName TEXT,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT,
        isEdit BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_ADMIN_NOTES_FILE_TABLE_NAME} (
        localID TEXT UNIQUE PRIMARY KEY,
        contentItemId TEXT,
        comment TEXT,
        isCase BOOLEAN DEFAULT 0 NOT NULL,
        attachment TEXT,
        fileName TEXT,
        fileType TEXT,
        localUrl TEXT,
        createdUtc TEXT,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        readyToSync BOOLEAN DEFAULT 0 NOT NULL,
        isPublic BOOLEAN DEFAULT 0 NOT NULL,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_CONTACT_TABLE_NAME} (
        id INTEGER UNIQUE PRIMARY KEY,
        contentItemId TEXT,
        isCase BOOLEAN,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phoneNumber TEXT,
        mailingAddress TEXT,
        caseOwner TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        contactType TEXT,
        businessName TEXT,
        isAllowAccess BOOLEAN DEFAULT 0 NOT NULL,
        isPrimary BOOLEAN DEFAULT 0 NOT NULL,
        notes TEXT,
        endDate TEXT,
        isNew BOOLEAN DEFAULT 0 NOT NULL,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT
      );


      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_CONTRACTS_TABLE_NAME} (
      applicantName TEXT,
       id TEXT UNIQUE PRIMARY KEY,
        businessName TEXT ,
       contractorId TEXT,
        documentId TEXT,
         email TEXT, 
          endDate TEXT,
           isAllowAccess TEXT,
            notes TEXT,
            number TEXT, 
            phoneNumber TEXT,
            isCase BOOLEAN DEFAULT 0 NOT NULL,
             caseLicenseId TEXT,
             isNew BOOLEAN DEFAULT 0,
             isEdited BOOLEAN DEFAULT 0,
             isSync BOOLEAN DEFAULT 0,
             notInOffline BOOLEAN DEFAULT 0,
             correlationId TEXT,
             ApiChangeDateUtc TEXT,
             isForceSync BOOLEAN DEFAULT 0);


      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_PAYMENT_TABLE_NAME} (
        contentItemId TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        title TEXT,
        isCase BOOLEAN DEFAULT 0 NOT NULL,
        orderNumber TEXT,
        gatewayResponse TEXT,
        totalAmount TEXT,
        paymentStatus TEXT,
        transactionNumber TEXT,
        name TEXT,
        company TEXT,
        country TEXT,
        paymentUtc TEXT,
        paymentType TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_ATTCHED_ITEMS_TABLE_NAME} (
        contentItemId TEXT,
        id TEXT UNIQUE PRIMARY KEY,
        title TEXT,
        isCase BOOLEAN DEFAULT 0 NOT NULL,
        author TEXT,
        contentType TEXT,
        createdUtc TEXT,
        displayLink TEXT,
        displayText TEXT,
        status TEXT,
        isShowFrontEnd BOOLEAN DEFAULT 0 NOT NULL,
        isTurnOfftheSubmissionDetailsonPrint BOOLEAN DEFAULT 0 NOT NULL,
        lstAttachedItems TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        modifiedUtc TEXT,
        submission TEXT,
        statusText TEXT,
        container TEXT,
        protectedFields TEXT,
        isUpdate BOOLEAN DEFAULT 0 NOT NULL,
        imageIds TEXT,
        updatedSubmission TEXT,
        readyToSync BOOLEAN DEFAULT 0 NOT NULL,
        startSyncing BOOLEAN DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.CASE_SETTINGS_TABLE_NAME} (
        contentItemId TEXT UNIQUE PRIMARY KEY,
        isCase BOOLEAN,
        permitIssuedDate TEXT,
        permitExpirationDate TEXT,
        viewOnlyAssignUsers BOOLEAN DEFAULT 0 NOT NULL,
        assignedUsers TEXT,
        assignAccess TEXT,
        isEdited BOOLEAN DEFAULT 0 NOT NULL,
        isSync BOOLEAN DEFAULT 0 NOT NULL,
        isForceSync BOOLEAN DEFAULT 0 NOT NULL,
        createdUtc TEXT,
        modifiedUtc TEXT,
        projectValuation TEXT,
        caseOwner TEXT,
        isPermission BOOLEAN DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS ${TABLES.INSPECTION_TABLE} (
        appointmentDate TEXT, 
        contentItemId TEXT UNIQUE PRIMARY KEY, 
        caseContentItemId TEXT , 
        caseNumber TEXT, 
        endTime TEXT, 
        licenseContentItemId TEXT,  
        licenseNumber TEXT, 
        location TEXT, 
        preferredTime TEXT,  
        scheduleWithName TEXT, 
        startTime TEXT, 
        status TEXT, 
        statusLabel TEXT, 
        subject TEXT,
        type TEXT, 
        appointmentStatus TEXT,
        attendees TEXT,
        scheduleWith TEXT,
        generalBody TEXT,
        outlookFailed BOOLEAN DEFAULT O,
        mSCalendarId TEXT,
        duration TEXT,
        AdminNotes TEXT,
        AdminNotesAttachedItems TEXT,
        ApplicantNotesAttachedItems TEXT,
        isSync BOOLEAN DEFAULT 0,
        isForceSync BOOLEAN DEFAULT 0,
        isEdited BOOLEAN DEFAULT 0,
        notInOffline BOOLEAN DEFAULT 0,
        correlationId TEXT,
        ApiChangeDateUtc TEXT,
        isCase BOOLEAN DEFAULT 0,
        body TEXT
        );
      CREATE TABLE IF NOT EXISTS ${TABLES.FILE_EXTENSION_TABLE_NAME} (
        data TEXT
      );
      
      CREATE TABLE IF NOT EXISTS ${TABLES.LOCATION} (
  contentItemId TEXT UNIQUE PRIMARY KEY,
  caseContentItemId TEXT,
  address TEXT,
  parcelId TEXT,
  endDate TEXT,
  latitude REAL,
  longitude REAL,
  isEdited BOOLEAN DEFAULT 0 NOT NULL,
  isSync BOOLEAN DEFAULT 0 NOT NULL,
  isForceSync BOOLEAN DEFAULT 0 NOT NULL,
  createdUtc TEXT,
  modifiedUtc TEXT
);

CREATE TABLE IF NOT EXISTS ${TABLES.LICENSE_DETAILS_TABLE_NAME} (
    contentItemId TEXT PRIMARY KEY,
    assignedUsers TEXT,
    licenseOwner TEXT,
    effectiveDate TEXT,
    issueDate TEXT,
    liabilityInsuranceExpDate TEXT,
    workersCompExpDate TEXT,
    licenseFee TEXT,
    testScore TEXT,
    isNewMobileAppApi BOOLEAN DEFAULT 0 NOT NULL,
    viewOnlyAssignUsers BOOLEAN DEFAULT 0 NOT NULL,
    syncModel TEXT,
    isEdited BOOLEAN DEFAULT 0 NOT NULL,
    isSync BOOLEAN DEFAULT 0 NOT NULL,
    isForceSync BOOLEAN DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS ${TABLES.LICENSE_OWNER_TABLE_NAME} (
    contentItemId TEXT PRIMARY KEY,
    contactEmail TEXT,
    contactFirstName TEXT,
    contactLastName TEXT,
    contactMailingAddress TEXT,
    contactPhoneNumber TEXT,
    licenseOwner TEXT,
    ownerAddress TEXT,
    ownerCellPhone TEXT,
    ownerEmail TEXT,
    ownerMailingAddress TEXT,
    ownerName TEXT,
    ownerPhoneNumber TEXT,
    isEdited BOOLEAN DEFAULT 0 NOT NULL,
    isSync BOOLEAN DEFAULT 0 NOT NULL,
    isForceSync BOOLEAN DEFAULT 0 NOT NULL
);
    CREATE TABLE IF NOT EXISTS ${TABLES.OFFLINE_FORMS_CACHED_DATA} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_item_id TEXT,
      form_type TEXT,
      title TEXT,
      path TEXT,
      html_data TEXT,
      form_json TEXT,
      last_updated TEXT,
      synced INTEGER DEFAULT 0,
      user_id TEXT
    );
    `);
    console.log('Sub tabs tables created successfully');
  } catch (error) {
    recordCrashlyticsError('Error creating additional tables:', error);
    console.error('Error creating additional tables:', error);
    throw error;
  }
};
