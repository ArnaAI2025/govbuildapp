import { AttachedItem, LicenseType, SyncModel } from './ISubScreens';

export interface CaseData {
  id?: string;
  displayText?: string;
  caseType?: string;
  caseStatusColor?: string;
  caseStatus?: string;
  published?: boolean;
  isEditable?: boolean;
  viewOnlyAssignUsers?: boolean;
  assignedUsers?: string;
  isAllowEditCase?: boolean;
  contentItemId?: string;
  number?: string;
  caseNumberDetail?: string;
  caseName?: string;
  statusId?: string;
  billingStatusId?: string;
  caseTypeId?: string;
  totalCost?: number | string;
  apartmentSuite?: string;
  subTypes?: string;
  caseTag?: string;
  parcelNumber?: string;
  quickRefNumber?: string;
  description?: string;
  mailingAddress?: string;
  mailingAddressStreetRouteField?: string;
  mailingAddressCityField?: string;
  mailingAddressStateField?: string;
  mailingAddressCountryField?: string;
  mailingAddressPostalCodeField?: string;
  streetRouteField?: string;
  cityField?: string;
  stateField?: string;
  countryField?: string;
  postalCodeField?: string;
  latitudeField?: string;
  longitudeField?: string;
  actualCaseDate?: string;
  expectedCaseDate?: string;
  location?: string;
  isManualAddress?: boolean;
  isEnableMultiline?: boolean;
  ownerName?: string;
  createdUtc?: string;
  author?: string;
  authorName?: string;
  modifiedUtc?: string;
  permissions?: any;
  isShowTaskStatusLogTab?: boolean;
  selectedInspectionCaseStatus?: any[];
  isLockCaseNumber?: boolean;
  isStatusReadOnly?: boolean;
  isTypeReadOnly?: boolean;
  isAllowStatusChangeOnReadOnly?: boolean;
  isAllowEditOnTypeReadOnly?: boolean;
  useAutoCaseNumber?: boolean;
  isAllowEditActualDate?: boolean;
  caseStatusName?: string;
  billingStatusName?: string;
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

export interface filterOption {
  displayText: string;
  value: string;
}
// Please remove because we have created on Icomponent.ts file for case and license
export interface FilterOptions {
  subType: FilterItem;
  caseTag: FilterItem;
  caseType: FilterItem;
  caseStatus: FilterItem;
  advanceForm: FilterItem;
  teamMember: TeamMember;
  sortBy?: filterOption;
  search?: string;
  isMyCaseOnly?: boolean;
  filterType?: filterOption;

  // For license filter
  licenseTag: FilterItem;
  licenseType: FilterItem;
  licenseStatus: FilterItem;
  isMyLicenseOnly?: boolean;
}

export interface CaseResponse {
  cases: CaseData[];
  isMyCaseOnly: boolean;
  isAllowEditCase: boolean;
}
export interface EditCaseResponse {
  casesDetails: any[];
  chevronList: any[];
  subDropdownsList: FilterOptionsResponse;
}

export interface CaseItemProps {
  item: CaseData;
  cardType?: string;
  isAllowEditCase?: boolean;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  onPress?: () => void;
}

export interface FilterOptionsResponse {
  subTypes?: FilterItem[];
  caseTags?: FilterItem[];
  caseTypes?: FilterItem[];
  caseStatuses?: FilterItem[];
  advanceForms?: FilterItem[];
  billingStatus?: FilterItem[];
  teamMembers?: TeamMember[];
  sortOption?: filterOption[];
  filterType?: filterOption[];
  renewalStatus?: filterOption[];
}
export interface ItemType {
  id: string;
  textColor?: string;
  backgroundColor?: string;
  displayText: string;
  color?: string;
}
export interface InspectionSchaduleDropdownProps {
  rowData: LicenseType;
  index: string;
  deleteInspectionType: any; // into this any i have send the multiple functions and data for call back so after that compltion i will be rmemove
  type: string;
}

export interface CaseEditFormDataParams {
  caseName: string;
  caseNumber: string;
  caseNumberDetail: string | null;
  expectedDate: string | null;
  caseStatus: string | number;
  billingStatus: string | null;
  caseType: string | number;
  caseTypeName: string;
  subTypes: string | string[] | null;
  totalCost: string | null;
  location: string | null;
  parcelNumber: string | null;
  quickRefNumber: string | null;
  isApiUpdateQuickRefNumber: boolean;
  description: string | null;
  id: string;
  longitude: string | null;
  latitude: string | null;
  actualCaseDate: string | null;
  isManualAddress: boolean;
  statusName: string | null;
  attachedItems?: AttachedItem[] | null; // Adjust based on actual type
  isEnableMultiline: boolean;
  streetAddress: string | null;
  city: string | null;
  addressState: string | null;
  zip: string | null;
  mailingAddressStreetRouteField: string | null;
  mailingAddressCityField: string | null;
  mailingAddressPostalCodeField: string | null;
  mailingAddressStateField: string | null;
  MailingAddress: string | null;
  apartmentSuite: string | null;
  caseTags: string | string[] | null;
  SyncModel?: SyncModel; // Replace with specific type if known
  countryField?: string;
  mailingAddressCountryField?: string;
  caseStatusName?: string;
  billingStatusName?: string;
  isAllowEditActualDate?: boolean;
  viewOnlyAssignUsers?: boolean;
  displayText?: string;
  assignedUsers?: string;
}

export interface CaseEditSyncModel {
  caseName: string;
  number: string;
  caseNumberDetail: string;
  expectedCaseDate: string | null;
  StatusId: string | null;
  caseStatus: string | null;
  billingStatus: string | null;
  caseType: string | null;
  subTypes: string;
  totalCost: string;
  parcelNumber: string;
  quickRefNumber: string;
  isApiUpdateQuickRefNumber: boolean;
  description: string;
  ApartmentSuite: string;
  id: string | null;
  latitudeField: string | null;
  longitudeField: string | null;
  actualCaseDate: string | null;
  location: string;
  isManualAddress: boolean;
  contentItemId: string | null;
  isEdited: number;
  isForceSync: boolean;
  DataType: 'Online';
  StreetRouteField: string | null;
  CityField: string | null;
  StateField: string | null;
  PostalCodeField: string | null;
  CountryField: string | null;
  MailingAddress: string;
  MailingAddressStreetRouteField: string | null;
  MailingAddressCityField: string | null;
  MailingAddressStateField: string | null;
  MailingAddressPostalCodeField: string | null;
  MailingAddressCountryField: string | null;
  CaseTag: string;
  IsImplementedTagFunctionality: boolean;
  SyncModel: any; // Replace `any` with correct type if known
}

export interface Address {
  Address: string;
  StreetRoute: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  Latitude?: string;
  Longitude?: string;
}

export interface LocationDetails {
  ContentItemId: string;
  AddressPart: Address;
  IsManualAddress?: boolean;
  SyncModel?: SyncModel;
}
