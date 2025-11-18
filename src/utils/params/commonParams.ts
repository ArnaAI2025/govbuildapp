import {
  createFullAddress,
  generateUID,
  generateUniqueID,
  getNewUTCDate,
  StatusColorCodes,
} from '../helper/helpers';
import type { CaseEditFormDataParams, CaseEditSyncModel, LocationDetails } from '../interfaces/ICase';
import type {
  AdminCommentLocalParams,
  AdminCommentParams,
  SetAlertParams,
  SetPublicParams,
  SyncModel,
  AttachedItemParams,
  SettingsFormData,
  SettingsFormInput,
  IImageData,
} from '../interfaces/ISubScreens';

export const caseEditFormData = (
  {
    caseName,
    caseNumber,
    caseNumberDetail,
    expectedDate,
    actualCaseDate,
    caseStatus,
    billingStatus,
    caseType,
    caseTypeName,
    subTypes,
    caseTags,
    totalCost,
    location,
    parcelNumber,
    quickRefNumber,
    isApiUpdateQuickRefNumber,
    description,
    id,
    longitude,
    latitude,
    isManualAddress,
    statusName,
    isEnableMultiline,
    streetAddress,
    city,
    addressState,
    zip,
    mailingAddressStreetRouteField,
    mailingAddressCityField,
    mailingAddressPostalCodeField,
    mailingAddressStateField,
    MailingAddress,
    apartmentSuite,
    countryField,
    mailingAddressCountryField,
    caseStatusName,
    billingStatusName,
    isAllowEditActualDate,
    viewOnlyAssignUsers,
    // displayText,
    assignedUsers,
  }: CaseEditFormDataParams,
  isNetworkAvailable: boolean,
) => {
  // Comman fields for both online & offline
  const details: any = {
    caseName,
    number: caseNumber,
    caseNumberDetail,
    expectedCaseDate: expectedDate === '' ? null : expectedDate,
    caseStatus: statusName,
    subTypes,
    totalCost,
    parcelNumber,
    quickRefNumber,
    description,
    actualCaseDate: actualCaseDate === '' ? null : actualCaseDate,
    location,
    isManualAddress,
    DataType: isNetworkAvailable ? 'Online' : 'Offline',
  };

  if (isNetworkAvailable) {
    // Network-specific fields
    ((details.StatusId = caseStatus),
      (details.CaseTag = caseTags),
      (details.caseType = caseType),
      (details.ApartmentSuite = apartmentSuite),
      (details.SyncModel = SyncModelParam(
        false, // IsForceSync
        false, // IsOfflineSync
        getNewUTCDate(), // UTC date in YYYY-MM-DD
        generateUniqueID(), // Unique sync ID
        id ?? null, // ContentItem ID
        null, // Optional fallback value
      )));
    details.id = id;
    ((details.isEdited = 0),
      (details.isForceSync = !!isNetworkAvailable),
      (details.PostalCodeField = isEnableMultiline ? zip : null),
      (details.billingStatus = billingStatus),
      (details.contentItemId = null),
      (details.isApiUpdateQuickRefNumber = isApiUpdateQuickRefNumber));
    details.IsImplementedTagFunctionality = true;
    // Mailing Address fields
    ((details.MailingAddress = MailingAddress),
      (details.MailingAddressStreetRouteField = isEnableMultiline
        ? mailingAddressStreetRouteField
        : null),
      (details.MailingAddressCityField = isEnableMultiline ? mailingAddressCityField : null),
      (details.MailingAddressStateField = isEnableMultiline ? mailingAddressStateField : null),
      (details.MailingAddressPostalCodeField = isEnableMultiline
        ? mailingAddressPostalCodeField
        : null),
      (details.MailingAddressCountryField = isEnableMultiline ? 'USA' : null),
      // Address fields
      (details.latitudeField = !isManualAddress ? null : (latitude?.toString() ?? null)),
      (details.longitudeField = !isManualAddress ? null : (longitude?.toString() ?? null)),
      (details.StreetRouteField = isEnableMultiline ? streetAddress : null),
      (details.CityField = isEnableMultiline ? city : null),
      (details.StateField = isEnableMultiline ? addressState : null),
      (details.CountryField = isEnableMultiline ? 'USA' : null));
  } else {
    // Offline-specific fields
    ((details.statusId = caseStatus),
      (details.caseTag = caseTags),
      (details.caseTypeId = caseType));
    ((details.caseType = caseTypeName),
      (details.isEdited = 1),
      (details.isForceSync = 0),
      (details.isSync = 0),
      (details.apartmentSuite = apartmentSuite),
      (details.billingStatusId = billingStatus));
    details.billingStatus = billingStatusName;
    details.caseStatusColor = StatusColorCodes(caseStatusName ?? '');
    // details.displayText = displayText || caseNumber;
    ((details.displayText = `${caseNumber ?? ''} ${caseName ?? ''} ${location ?? ''}`.trim()),
      (details.contentItemId = id));
    ((details.postalCodeField = zip), (details.isEditable = true));
    details.modifiedUtc = getNewUTCDate();
    // Mailing Address fields
    ((details.mailingAddress = MailingAddress),
      (details.mailingAddressCityField = mailingAddressCityField),
      (details.mailingAddressCountryField = mailingAddressCountryField
        ? mailingAddressCountryField
        : 'USA'),
      (details.mailingAddressPostalCodeField = mailingAddressPostalCodeField),
      (details.mailingAddressStateField = mailingAddressStateField),
      (details.mailingAddressStreetRouteField = mailingAddressStreetRouteField),
      // Address fields
      (details.latitudeField = !isManualAddress ? '' : (latitude?.toString() ?? '')),
      (details.longitudeField = !isManualAddress ? '' : (longitude?.toString() ?? '')),
      (details.streetRouteField = streetAddress),
      (details.cityField = city),
      (details.stateField = addressState),
      (details.countryField = countryField ? countryField : 'USA'));
    details.isAllowEditActualDate = isAllowEditActualDate;
    details.viewOnlyAssignUsers = viewOnlyAssignUsers;
    details.assignedUsers = assignedUsers;
  }
  return details;
};
export const caseEditFormDataSync = (
  caseName: string,
  caseNumber: string,
  caseNumberDetail: string,
  expectedDate: string | null,
  caseStatus: string | null,
  billingStatus: string | null,
  caseType: string | null,
  subTypes: string,
  totalCost: string,
  location: string,
  parcelNumber: string,
  quickRefNumber: string,
  isApiUpdateQuickRefNumber: boolean,
  description: string,
  id: string | null,
  longitude: string,
  latitude: string,
  actualCaseDate: string | null,
  isManualAddress: boolean,
  local: number,
  statusName: string | null,
  attachedItems: any,
  isEnableMultiline: boolean,
  streetAddress: string,
  city: string,
  addressState: string,
  zip: string,
  mailingAddressStreetRouteField: string,
  mailingAddressCityField: string,
  mailingAddressPostalCodeField: string,
  mailingAddressStateField: string,
  MailingAddress: string,
  apartmentSuite: string,
  caseTags: string,
  SyncModel: any,
): CaseEditSyncModel => {
  return {
    caseName,
    number: caseNumber,
    caseNumberDetail,
    expectedCaseDate: expectedDate === '' ? null : expectedDate,
    StatusId: caseStatus,
    caseStatus: statusName,
    billingStatus,
    caseType,
    subTypes,
    totalCost,
    parcelNumber,
    quickRefNumber,
    isApiUpdateQuickRefNumber,
    description,
    ApartmentSuite: apartmentSuite,
    id,
    latitudeField: !isManualAddress ? null : latitude,
    longitudeField: !isManualAddress ? null : longitude,
    actualCaseDate: actualCaseDate === '' ? null : actualCaseDate,
    location,
    isManualAddress,
    // contentItemId: local ? id : null,
    contentItemId: id,
    isEdited: local ? 1 : 0,
    isForceSync: true,
    DataType: 'Online',
    StreetRouteField: isEnableMultiline ? streetAddress : null,
    CityField: isEnableMultiline ? city : null,
    StateField: isEnableMultiline ? addressState : null,
    PostalCodeField: isEnableMultiline ? zip : null,
    CountryField: isEnableMultiline ? 'USA' : null,
    MailingAddress,
    MailingAddressStreetRouteField: isEnableMultiline ? mailingAddressStreetRouteField : null,
    MailingAddressCityField: isEnableMultiline ? mailingAddressCityField : null,
    MailingAddressStateField: isEnableMultiline ? mailingAddressStateField : null,
    MailingAddressPostalCodeField: isEnableMultiline ? mailingAddressPostalCodeField : null,
    MailingAddressCountryField: isEnableMultiline ? 'USA' : null,
    CaseTag: caseTags,
    SyncModel,
    IsImplementedTagFunctionality: true,
  };
};
export const adminCommentsParam = (
  filename: string | null,
  contentItemId: string,
  attachment: string | null,
  comment: string,
  id: string | null,
  SyncModel: SyncModel,
): AdminCommentParams => ({
  filename,
  attachment,
  comment,
  contentItemId,
  id,
  SyncModel,
});

export const adminCommentsParamForLocal = (
  caseId: string,
  contentItemId: string,
  comment: string,
  isPublic: boolean,
  isNew: boolean,
  author: string,
): AdminCommentLocalParams => ({
  caseId,
  contentItemId,
  comment,
  isPublic,
  isNew,
  author,
});

export const SyncModelParam = (
  IsOfflineSync: boolean,
  IsForceSync: boolean,
  ApiChangeDateUtc: string,
  CorrelationId: string,
  SyncContentItemId: string | null,
  SyncDocumentId?: string | null,
): SyncModel => ({
  IsOfflineSync,
  IsForceSync,
  ApiChangeDateUtc,
  CorrelationId,
  SyncContentItemId,
  SyncDocumentId,
});

export const setAlertParam = (
  id: string | null,
  isAlert: boolean,
  SyncModel: SyncModel,
): SetAlertParams => ({
  id,
  isAlert,
  SyncModel,
});

export const setPublicParam = (
  id: string | null,
  contentItemId: string,
  SyncModel: SyncModel,
): SetPublicParams => ({
  id,
  contentItemId,
  SyncModel,
});

//Attched Items

export const attachedItemsParam = (contentItemId: string): AttachedItemParams => ({
  contentItemId,
});

//location
export const saveUpdateMultipleLocationFormData = (
  isEdit: boolean,
  parcelId: string,
  address: string,
  endDate: string | null,
  contentId: string,
  latitude: string,
  longitude: string,
  id: string,
  SyncModel: SyncModel,
) => {
  var details;
  if (isEdit) {
    details = {
      ParcelId: parcelId,
      Address: address,
      CaseContentItemId: contentId,
      ContentItemId: id,
      EndDate: endDate,
      Latitude: latitude,
      Longitude: longitude,
      SyncModel: SyncModel,
    };
  } else {
    details = {
      ParcelId: parcelId,
      Address: address,
      CaseContentItemId: contentId,
      EndDate: endDate,
      Latitude: latitude,
      Longitude: longitude,
      SyncModel: SyncModel,
    };
  }
  return details;
};

export const settingsFormData = ({
  permitIssuedDate,
  permitExpirationDate,
  viewOnlyAssignUsers,
  assignedUsers,
  assignAccess,
  contentItemId,
  projectValuation,
  caseOwner,
  syncModel,
}: SettingsFormInput): SettingsFormData => {
  const details: SettingsFormData = {
    PermitIssuedDate: permitIssuedDate,
    PermitExpirationDate: permitExpirationDate,
    ViewOnlyAssignUsers: viewOnlyAssignUsers,
    AssignedUsers: assignedUsers,
    AssignAccess: assignAccess,
    ContentItemId: contentItemId,
    ProjectValuation: projectValuation,
    CaseOwner: caseOwner,
    SyncModel: syncModel,
  };

  return details;
};

export const editAddress = (
  ContentItemId: string,
  StreetRoute: string,
  Latitude: string,
  Longitude: string,
  City: string,
  State: string,
  PostalCode: string,
  IsManualAddress?: boolean,
  IsForMailingAddress?: boolean,
  SyncModel?: SyncModel,
) => {
  const details: LocationDetails = {
    ContentItemId,
    AddressPart: {
      Address: createFullAddress(StreetRoute, City, State, PostalCode),
      StreetRoute,
      City,
      State,
      PostalCode,
      Country: 'USA',
    },
    SyncModel,
  };

  if (!IsForMailingAddress) {
    details.IsManualAddress = IsManualAddress ?? false;
    details.AddressPart.Latitude = Latitude ?? '';
    details.AddressPart.Longitude = Longitude ?? '';
  }
  return details;
};
// Define an interface for owner details
export interface OwnerDetails {
  ownerName: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  ownerCellPhone: string;
  ownerMailingAddress: string;
  ownerAddress: string;
  contentItemId: string;
}
// Function with typed parameters and return type
export const OwnerParam = (
  ownerName: string,
  ownerEmail: string,
  ownerPhoneNumber: string,
  ownerCellPhone: string,
  ownerMailingAddress: string,
  ownerAddress: string,
  contentItemId: string,
): OwnerDetails => {
  return {
    ownerName,
    ownerEmail,
    ownerPhoneNumber,
    ownerCellPhone,
    ownerMailingAddress,
    ownerAddress,
    contentItemId,
  };
};

interface LicenseDetailsFormData {
  testScore: string;
  licenseFee: string;
  liabilityInsuranceExpDate: string;
  workersCompExpDate: string;
  issueDate: string;
  effectiveDate: string;
  contentItemId: string;
  LicenseOwner: any; // replace `any` with a proper type if available
  IsImplementedLicenseOwnerOnMobileSide: boolean;
  IsNewMobileAppApi?: boolean;
  assignedUsers?: string;
  viewOnlyAssignUsers?: boolean;
}

export const licenseDetailsFormData = (
  testScore: string,
  licenseFee: string,
  liabilityInsuranceDate: string,
  compInsuranceDate: string,
  issueDate: string,
  effectiveDate: string,
  contentItemId: string,
  LicenseOwner: any,
  assignTeamMembers: string,
  isAllowAssigned: boolean,
): LicenseDetailsFormData => {
  return {
    testScore,
    licenseFee,
    liabilityInsuranceExpDate: liabilityInsuranceDate,
    workersCompExpDate: compInsuranceDate,
    issueDate,
    effectiveDate,
    contentItemId,
    LicenseOwner,
    IsImplementedLicenseOwnerOnMobileSide: true,
    IsNewMobileAppApi: true,
    assignedUsers: assignTeamMembers,
    viewOnlyAssignUsers: isAllowAssigned,
  };
};

export const contactFormData = (
  firstName: string,
  lastName?: string,
  email?: string,
  phoneNumber?: string,
  mailingAddress?: string | null,
  contentItemId?: number | string,
  caseId?: string,
  contactType?: string,
  businessName?: string,
  isAllowAccess?: boolean,
  isPrimary?: boolean,
  notes?: string,
  endDate?: string | null,
  type?: string,
  isNew?: boolean,
  SyncModel?: SyncModel,
) => {
  var details;
  var newId = !isNew ? contentItemId : 0;
  var idKey = type == 'Case' ? 'CaseContentItemId' : 'LicenseContentItemId';
  {
    details = {
      id: newId,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      IsPrimary: isPrimary,
      PhoneNumber: phoneNumber,
      MailingAddress: mailingAddress,
      [idKey]: caseId,
      contactType: contactType,
      businessName: businessName,
      isAllowAccess: isAllowAccess,
      notes: notes,
      endDate: endDate,
      documentId: newId,
      SyncModel: SyncModel,
    };
  }
  return details;
};

export const contactFormDataOffline = (
  firstName: string,
  lastName?: string,
  email?: string,
  phoneNumber?: string,
  mailingAddress?: string | null,
  contentItemId?: number | string,
  caseId?: string,
  contactType?: string,
  businessName?: string,
  isAllowAccess?: boolean,
  isPrimary?: boolean,
  notes?: string,
  endDate?: string | null,
  type?: string,
  isNew?: boolean,
) => {
  const newIds = generateUID();
  var newId = !isNew ? contentItemId : newIds;

  const details = {
    id: newId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    isPrimary: isPrimary,
    phoneNumber: phoneNumber,
    mailingAddress: mailingAddress,
    contentItemId: caseId,
    contactType: contactType,
    businessName: businessName,
    isAllowAccess: isAllowAccess,
    notes: notes,
    endDate: endDate,
    isCase: type == 'Case' ? 1 : 0,
    isNew: isNew ? 1 : 0,
  };
  return details;
};

export interface InspectionInputData {
  msCalendarId: string;
  inspectionId: string;
  outlookFailed: boolean;
  responsiblePartyEmail: string | null;
  duration: number;
  licenseNumber: string | null;
  licenseContentItemId: string | null;
  statusLabel: string;
  preferredTime: string;
  location: string;
  body: string;
  inspectionDate: string;
  startTime: string | null;
  endTime: string | null;
  statusId: string;
  caseNumber: string | null;
  subject: string;
  teamMemberIds: string;
  teamMemberNames: string;
  typeIds: string;
  caseContentItemId: string | null;
  adminNotes: string | null;
  adminImages: IImageData[];
  generalImages: IImageData[];
  isNew: boolean;
  isCase: boolean;
}

//Inspection
interface ScheduleParams {
  appointmentDate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  caseNumber: string | null;
  subject: string;
  scheduleWith: string;
  scheduleWithName: string;
  type: string;
  caseContentItemId: string | null;
  body: string;
  location: string;
  preferredTime: string;
  statusLabel: string;
  licenseContentItemId: string | null;
  licenseNumber: string | null;
  duration: number;
  adminNotes: string | null;
  adminNotesAttachedItems: string;
  applicantNotesAttachedItems: string;
  contentItemId?: string;
  mSCalendarId?: string;
  attendees?: string | null;
  outlookFailed?: boolean;
  SyncModel?: SyncModel;
}

export const scheduleInspectionParams = (
  inspectionData: InspectionInputData,
  isOffline: boolean,
  syncModel: SyncModel,
): ScheduleParams => {
  const {
    msCalendarId,
    inspectionId,
    outlookFailed,
    responsiblePartyEmail,
    duration,
    licenseNumber,
    licenseContentItemId,
    statusLabel,
    preferredTime,
    location,
    body,
    inspectionDate,
    startTime,
    endTime,
    statusId,
    caseNumber,
    subject,
    teamMemberIds,
    teamMemberNames,
    typeIds,
    caseContentItemId,
    adminNotes,
    adminImages,
    generalImages,
    isNew,
  } = inspectionData;

  const commonParams: ScheduleParams = {
    appointmentDate: inspectionDate || new Date().toISOString().split('T')[0],
    startTime: preferredTime === 'Custom' ? startTime : null,
    endTime: preferredTime === 'Custom' ? endTime : null,
    status: statusId,
    caseNumber,
    subject,
    scheduleWith: teamMemberIds,
    scheduleWithName: teamMemberNames,
    type: typeIds,
    caseContentItemId,
    body,
    location,
    preferredTime,
    statusLabel,
    licenseContentItemId,
    licenseNumber,
    duration: preferredTime === 'Custom' ? duration : 0,
    adminNotes,
    adminNotesAttachedItems: JSON.stringify(adminImages),
    applicantNotesAttachedItems: JSON.stringify(generalImages),
  };

  // Add SyncModel for online mode
  if (!isOffline) {
    commonParams.SyncModel = syncModel;
  }

  const newSchedule = {
    attendees: responsiblePartyEmail,
    outlookFailed: outlookFailed,
  };

  const updateSchedule = {
    mSCalendarId: msCalendarId,
    contentItemId: inspectionId,
    outlookFailed: outlookFailed,
  };

  return isNew ? { ...commonParams, ...newSchedule } : { ...commonParams, ...updateSchedule };
};

///Attched Docs
export const addFolderParam = (
  caseLicenseId: string,
  parentFolderId: number,
  isShowOnFE: boolean,
  folderName: string,
  folderId: string,
  isCase: boolean,
  syncModel: SyncModel,
) => {
  var idKey = isCase ? 'CaseContentItemid' : 'LicenseContentItemid';

  const details = {
    Id: folderId,
    DocumentId: 0,
    [idKey]: caseLicenseId,
    ParentFolderId: parentFolderId || null,
    IsShowonFE: isShowOnFE ?? false,
    Name: folderName,
    SyncModel: syncModel,
  };

  console.log('Folder details:', details);
  return details;
};

//For the attached docs
export const addFolderParamOffline = (
  parentFolderID: string | number,
  isShowonFE: boolean,
  folderName: string,
  isFolder: boolean,
  fileName: string,
  url: string,
  details: any,
  documentType: string | undefined,
  shortDescription: string,
  caseStatus: string,
  caseId: string,
  id: string,
) => {
  var detail = {
    parentFolderID: parentFolderID,
    Isfolder: isFolder,
    name: folderName,
    fileName: fileName,
    URL: url,
    details: details,
    documentType: documentType,
    shortDescription: shortDescription,
    isShowonFE: isShowonFE,
    caseStatus: caseStatus,
    caseContentItemId: caseId,
    id: id,
  };

  return detail;
};
export const saveUpdateAttachedDocsFormData = (
  contentItemId: string | null,
  caseContentId: string,
  status: string | undefined,
  type: string | undefined,
  details: any,
  shortDes: string,
  isShowonFE: boolean,
  isUpdate: boolean,
  LicenseStatusKey: string,
  LicenseContentItemIdKey: string,
  fileName: string,
  url: string,
  folderID: number,
  SyncModel: SyncModel | null,
) => {
  var details;
  if (isUpdate) {
    return {
      ContentItemId: contentItemId,
      [LicenseContentItemIdKey]: caseContentId,

      [LicenseStatusKey]: status == 'undefined' ? '' : status,
      Details: details,
      DocumentType: type == 'undefined' ? '' : type,
      ShortDescription: shortDes,
      IsShowonFE: isShowonFE,
      isVersions: false,
      FolderID: folderID,
      ParentFolderId: folderID,
      FileName: fileName,
      SyncModel: SyncModel,
    };
  } else {
    return {
      [LicenseContentItemIdKey]: caseContentId,
      URL: url,
      FileName: fileName,
      [LicenseStatusKey]: status == 'undefined' ? '' : status,
      Details: details,
      DocumentType: type == 'undefined' ? '' : type,
      ShortDescription: shortDes,
      IsShowonFE: isShowonFE,
      isVersions: false,
      FolderID: folderID,
      ParentFolderId: folderID,
      SyncModel: SyncModel,
    };
  }
};

export const saveDocIMGToSyncOffline = (
  contentItemId,
  caseContentId,
  url,
  fileName,
  status,
  type,
  details,
  shortDes,
  isShowonFE,
  isCase,
  typeName,
  fileType,
  statusName,
  parentFolderId,
  LicenseContentItemIdKey,
) => {
  {
    return {
      [LicenseContentItemIdKey]: caseContentId,
      id: contentItemId,
      localUrl: url,
      fileName: fileName,
      fileType: fileType,
      caseStatus: status,
      statusName: statusName,
      details: details,
      documentType: typeName,
      documentTypeId: type,
      shortDescription: shortDes,
      isShowonFE: isShowonFE,
      isCase: isCase,
      parentFolderID: parentFolderId,
      Isfolder: false,
    };
  }
};

export const editAttachItem = (id: string, value: string) => {
  return {
    submissionId: id,
    submission: value,
  };
};
