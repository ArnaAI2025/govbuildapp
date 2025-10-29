export interface LicenseData {
  id?: string;
  contentItemId?: string;
  applicantFirstName?: string;
  licenseUniqNumber?: string;
  applicantLastName?: string;
  licenseDescriptor?: string;
  businessName?: string;
  phoneNumber?: string;
  cellNumber?: string;
  email?: string;
  location?: string;
  additionalInfo?: string;
  parcelNumber?: string;
  quickRefNumber?: string;
  expirationDate?: string;
  isLicenseTypeStatusesOrderedList?: boolean;
  ownerName?: string;
  authorName?: string | null;
  createdUtc?: string;
  author?: string;
  modifiedUtc?: string;
  setLicenseLocation?: string;
  setAdditionalInfo?: string;
  setParcelNumber?: string;
  setQuickRefNumber?: string;
  paymentReceived?: string;
  isAllowAssigned?: boolean;
  renewalStatusId?: boolean;
  licenseStatusId?: boolean;
  statusId?: string;
  licenseStatusDisplayText?: string;
  licenseTypeId?: string;
  licenseTypeDisplayText?: string;
  longitudeField?: string;
  latitudeField?: string;
  licenseSubTypeIds?: string;
  streetRouteField?: string;
  cityField?: string;
  stateField?: string;
  countryField?: string;
  postalCodeField?: string;
  isAllowViewInspection?: boolean;
  isAllowAddAdminNotes?: boolean;
  licenseSubType?: string;
  licenseTag?: string;
  licenseTypeName?: string | null;
  isHideParcelNumber?: boolean;
  isHideQuickRefNumber?: boolean;
  isAllowEditLicense?: boolean;
  displayText?: string;
  assignedUsers?: string;
  quickRefNumberName?: string | null;
  owner?: string;
  isBlockApprovedUntilPaymentReceived?: boolean;
  unlockExpirationDate?: boolean;
  autoNumber?: string;
  requireEmailAddress?: boolean;
}
export interface licenseDataPostPayload {
  DataType?: string;
  Id?: string;
  licenseNumber?: string;
  additionalInfo?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  assignedUsers?: string;
  businessName?: string;
  cellNumber?: string;
  email?: string;
  licenseTypeId?: string;
  licenseType?: string;
  expirationDate?: string;
  isForceSync?: boolean;
  isPaymentReceived?: string;
  licenseDescriptor?: string;
  displayText?: string;
  licenseSubType?: string;
  location?: string;
  phoneNumber?: string;
  renewalStatus?: string;
  statusId?: string;
  viewOnlyAssignUsers?: boolean;
  LicenseTag?: string;
  quickRefNumber?: string;
  parcelNumber?: string;
  SyncModel?: any;
  isApiUpdateQuickRefNumberAndParcelNumber?: boolean;
}

export interface licenseDataPostPayloadOffline {
  DataType?: string;
  id?: string;
  licenseNumber?: string;
  additionalInfo?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  assignedUsers?: string;
  businessName?: string;
  cellNumber?: string;
  email?: string;
  licenseTypeId?: string;
  licenseType?: string;
  expirationDate?: string;
  isForceSync?: boolean;
  isPaymentReceived?: string;
  licenseDescriptor?: string;
  displayText?: string;
  licenseSubType?: string;
  location?: string;
  phoneNumber?: string;
  renewalStatus?: string;
  statusId?: string;
  viewOnlyAssignUsers?: boolean;
  licenseTag?: string;
  quickRefNumber?: string;
  parcelNumber?: string;
  SyncModel?: any;
  isApiUpdateQuickRefNumberAndParcelNumber?: boolean;
  contentItemId?: string;
  licenseStatus?: string;
  isEditable?: boolean;
  modifiedUtc?: string;
  statusColor?: string;
}

export interface FilterOptions {
  subType: FilterItem;
  licenseTag: FilterItem;
  licenseType: FilterItem;
  licenseStatus: FilterItem;
  advanceForm: FilterItem;
  teamMember: TeamMember;
  sortBy?: SortOption;
  search?: string;
  isMyLicenseOnly?: boolean;
}

export interface FilterItem {
  displayText: string;
  id: string;
}

export interface TeamMember {
  firstName: string;
  lastName: string;
  userId: string;
}

export interface SortOption {
  displayText: string;
  value: string;
}

// Below License service interfaces
export interface LicenseResponse {
  licenseData?: LicenseData[];
  isMyLicenseOnly?: boolean;
  isAllowEditLicense?: boolean;
  selectedTeamMember?: string;
}

//EDIT LICENSE SCREEN INTERFACE

export interface EditLicenseResponse {
  licenseDetail: any[];
  chevronList: any[];
}

export interface EditLicenseDropdownResponse {
  dropdownsList: FilterOptionsResponse;
}
export interface FilterOptionsResponse {
  licenseStatus?: FilterItem[];
  licenseTags?: FilterItem[];
  licenseTypes?: FilterItem[];
  licenseSubTypes?: FilterItem[];
  billingStatus?: FilterItem[];
  teamMembers?: TeamMember[];
  licenseRenewalStatus?: [];
  licenseAttachedItems?: [];
}

export interface ItemType {
  id?: string;
  textColor?: string;
  backgroundColor?: string;
  displayText?: string;
}
