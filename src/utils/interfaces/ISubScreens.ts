import { NavigationProp } from '@react-navigation/native';
import { FormItem } from './IComponent';
import { convertDate } from '../helper/helpers';
import { SyncModelParam } from '../params/commonParams';
import { CaseData, FilterItem } from './ICase';
import { RootStackParamList } from '../../navigation/Types';
import { LicenseData } from './zustand/ILicense';

export interface AdminAndPublicComment {
  id: string;
  text: string;
  author: string;
  createdUtc: string;
  isPublic: boolean;
  isAlert?: boolean;
  attachment?: string;
  fileName?: string;
}

export interface CaseLicenseItemProps {
  item?: LicenseData | CaseData;
  cardType?: string;
  isAllowEditCase?: boolean;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  onPress?: () => void;
  isNetworkAvailable?: boolean;
}

export interface StandardComment {
  ContentItemId: string;
  DisplayText: string;
  StandardComment: {
    Comment: {
      Html: string;
    };
    ShortDescription: {
      Text: string;
    };
    CommentType: {
      ContentItemIds: string[];
    } | null;
  };
}

export interface CommentType {
  ContentItemId: string;
  DisplayText: string;
}
export interface SyncModel {
  IsOfflineSync: boolean;
  IsForceSync: boolean;
  ApiChangeDateUtc: string;
  CorrelationId: string;
  SyncContentItemId: string | null;
  SyncDocumentId?: string | null;
}

export interface AdminCommentParams {
  filename: string | null;
  attachment: string | null;
  comment: string;
  contentItemId: string;
  id: string | null;
  SyncModel: SyncModel;
}

export interface AdminCommentLocalParams {
  caseId: string;
  contentItemId: string;
  comment: string;
  isPublic: boolean;
  isNew: boolean;
  author: string;
}

export interface SetAlertParams {
  id: string | null;
  isAlert: boolean;
  SyncModel: SyncModel;
}

export interface SetPublicParams {
  id: string | null;
  contentItemId: string;
  SyncModel: SyncModel;
}

export interface CommentItemProps {
  item: AdminAndPublicComment;
  userId: string;
  isFromPublicComment: boolean;
  isNetworkAvailable: boolean;
  permissions: {
    isAllowAllowMakeAdminCommentsPublic: boolean;
    allowRemoveAdminComments: boolean;
  };
  onEditComment: (commentId: string, text: string, attachment: string, fileName: string) => void;
  onDeleteComment: (commentId: string) => void;
  handleSetAsAlert?: (commentId: string, value: boolean, comment: string) => void;
  handleMakePublicComment?: (commentId: string, value: boolean) => void;
  isStatusReadOnly: boolean;
  isHighlighted?: boolean;
}
export interface CommentsState {
  comments: AdminAndPublicComment[];
  newComment: string;
  isLoading: boolean;
  isPublic: boolean;
  isEditComment: boolean;
  editCommentId: string;
  deleteComment: boolean;
  alertVisible: boolean;
  openComment: boolean;
  checkedStComment: string[];
  userId: string;
  attachment?: string;
  fileName?: string;
  fromAttachedItems?: boolean;
  saveDisabled?: boolean;
}

// AttchedItemsProps

export interface AttachedItem {
  contentItemId: string;
  createdUtc: string;
  author: string;
  displayText: string;
  contentType: string;
  editLink?: string;
  displayLink?: string;
  submission?: string;
  isCase?: number;
}

export interface AttachedItemParams {
  contentItemId: string;
}

export interface AttechedItemsRowViewProps {
  rowData: AttachedItem;
  navigation: NavigationProp<any>;
  isOnline: boolean;
  downloadForm: (contentItemId: string) => void;
  offlineData: any[];
  type: string;
  baseUrl: string;
  isForceSync?: boolean;
}

//Contact & Contacts

export interface Contact {
  id?: string;
  firstName?: string;
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
}

export interface Contractor {
  id?: string;
  number?: string;
  applicantName?: string;
  email?: string | null;
  phoneNumber?: string;
  businessName?: string;
  isAllowAccess?: boolean;
  notes?: string;
  endDate?: string | null;
  contractorId?: string;
  documentId?: string;
  licenseTypeIds?: string;
}

export interface LicenseForContract {
  id: string;
  contentItemId: string;
  number: string;
  businessName: string;
  licenseDescriptor: string;
  applicantFirstName: string;
  applicantLastName: string;
  phoneNumber: string;
  email: string;
  licenseType?: string;
  licenseTypeId?: string;
}

// Interface for Contractor parameters (online API)
export interface ContractorParams {
  Id: string;
  CaseContentItemId?: string;
  LicenseContentItemId?: string;
  IsAllowAccess: boolean;
  ContractorId: string;
  Notes: string;
  EndDate: string | null;
  type: 'Case' | 'License';
  SyncModel: SyncModel;
}

// Interface for Contractor parameters (offline storage)
export interface ContractorParamsOffline {
  applicantName: string;
  id: string;
  businessName: string;
  licenseId: string;
  documentId: string;
  email: string;
  isAllowAccess: boolean;
  notes: string;
  number: string;
  phoneNumber: string;
}
export interface ResponsibleParty {
  id?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  mailingAddress?: string;
  contactType?: string;
  businessName?: string;
  isAllowAccess: boolean;
  isPrimary: boolean;
  notes?: string;
  endDate?: string;
  caseContentItemId?: string;
  licenseContentItemId?: string;
  isNew?: boolean;
}

export interface ResponsiblePartyFormData {
  FirstName: string;
  LastName?: string;
  Email?: string;
  PhoneNumber?: string;
  MailingAddress?: string | null;
  id: string | number;
  contactType?: string;
  businessName?: string;
  isAllowAccess: boolean;
  isPrimary: boolean;
  notes?: string;
  endDate?: string | null;
  type: string;
  addNew: boolean;
  SyncModel?: SyncModel;
  CaseContentItemId?: string;
  LicenseContentItemId?: string;
}

export interface contactFormDataPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  mailingAddress?: string | null;
  id: string | number;
  contactType?: string;
  businessName?: string;
  isAllowAccess: boolean;
  isPrimary: boolean;
  notes?: string;
  endDate?: string | null;
  isCase: number;
  isNew: number;
  contentItemId?: string;
}

export interface TabData {
  title: string;
  screenName: string;
  type: string;
}

export interface AddFormItemViewProps {
  item: FormItem;
  navigation: NavigationProp<any>;
  isNetConnected: boolean;
  caseLicenseData: any;
  formType?: string;
  isMyCase: boolean;
}

export interface Contractor {
  id?: string;
  number?: string;
  applicantName?: string;
  email?: string | null;
  phoneNumber?: string;
  businessName?: string;
  isAllowAccess?: boolean;
  notes?: string;
  endDate?: string | null;
}

export interface CustomTextViewProps {
  heading: string;
  line?: number;
  title: string;
  headingStyle?: object; // Optional prop for custom heading styles
  titleStyle?: object; // Optional prop for custom title styles
  icon?: string; // name of MaterialCommunityIcons icon
}

export interface ContractorTabItemProps {
  rowData: Contractor;
  navigation: NavigationProp<any>;
  type: 'Case' | 'License';
  caseID: string;
  isNetworkAvailable: boolean;
  caseData: any;
}

export interface Contact {
  id?: string;
  firstName?: string;
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
}

export interface ContactScreenProps {
  route: any; // this any used for the getting all the params array object from the route after that requiremnt complete then i will remove
  navigation: NavigationProp<any>;
}

export interface LicenseType {
  id: string;
  displayText: string;
}

export interface License {
  contentItemId: string;
  number: string;
  businessName: string;
  licenseDescriptor: string;
  applicantFirstName: string;
  applicantLastName: string;
  phoneNumber: string;
  email: string;
  id: string;
}

export interface Contractor {
  id?: string;
  applicantName?: string;
  businessName?: string;
  number?: string;
  phoneNumber?: string;
  email?: string | null;
  licenseId?: string;
  documentId?: string;
  isAllowAccess?: boolean;
  notes?: string;
  endDate?: string | null;
  contractorId?: string;
  licenseTypeIds?: string;
}

export interface AddCaseAndLicenseContractorProps {
  navigation: NavigationProp<any>;
  route: {
    params: {
      contentItemId: string;
      type: 'Case' | 'License';
      param?: Contractor;
      addNew: boolean;
      caseData: any;
    };
  };
}
export interface CaseAndLicenseContractorTabProps {
  route: any; // this any used for the getting all the params array object from the route after that requiremnt complete then i will remove
  navigation: NavigationProp<any>;
}

export interface Contact {
  id?: string;
  firstName?: string;
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
}

export interface ContactItemRowProps {
  rowData: Contact;
  navigation: NavigationProp<any>;
  type: 'Case' | 'License';
  caseLicenseID: string;
  caseLicenseData: any;
  isForceSync: boolean;
  isStatusReadOnly: boolean;
}
export const addContractorParams = (
  id: string,
  caseLicenseId: string,
  isAllowAccess: boolean,
  contractorId: string,
  notes: string,
  endDate: string | null,
  type: 'Case' | 'License',
  syncModel: SyncModel,
): ContractorParams => {
  const commonFields = {
    Id: id,
    IsAllowAccess: isAllowAccess,
    ContractorId: contractorId,
    Notes: notes,
    EndDate: endDate ? convertDate(endDate) : null,
    type,
    SyncModel: syncModel,
  };

  return type === 'License'
    ? {
        ...commonFields,
        LicenseContentItemId: caseLicenseId,
      }
    : {
        ...commonFields,
        CaseContentItemId: caseLicenseId,
      };
};

// addContractorParamsOffline: Formats parameters for offline contractor storage
export const addContractorParamsOffline = (
  applicantName: string,
  id: string,
  businessName: string,
  licenseId: string,
  documentId: string,
  email: string,
  isAllowAccess: boolean,
  notes: string,
  number: string,
  phoneNumber: string,
): ContractorParamsOffline => ({
  applicantName,
  id,
  businessName,
  licenseId,
  documentId,
  email,
  isAllowAccess,
  notes,
  number,
  phoneNumber,
});

export interface RelatedCase {
  id: string;
  number: string;
  assignedUsers?: string;
  assignUserCount?: number;
  status?: string;
  type?: string;
  modifyDate?: string;
  author?: string;
}

export interface Payment {
  paymentStatus: string;
  paymentUtc: string;
  name: string;
  company: string;
  orderNumber: string;
  totalAmount: number;
  paymentType: string;
}
export interface PaymentScreenProps {
  route: any;
  navigation: NavigationProp<any>;
}

export interface AccountingDetail {
  id: string;
  accountingDetailId: string;
  totalCost: number;
  paidAmount: number;
  status: string;
  note?: string;
  createdUtc?: string;
  modifiedUtc?: string;
  paymentUtc?: string;
  createdBy?: string;
  modifiedBy?: string;
  paymentBy?: string;
}
export interface AccountingDetailScreenProps {
  route: any;
  navigation: NavigationProp<any>;
}

export interface AccountingDetailTitle {
  id: string;
  displayText: string;
}
export interface AccountingDetailRowItemProps {
  rowData: AccountingDetail;
  accountingDetailsData: AccountingDetailTitle[];
}
export interface CaseSettingData {
  isHideAccDetailsTab?: boolean;
  isHidePaymentTab?: boolean;
}

export interface SentEmail {
  to: string;
  subject: string;
  createdUtc: string;
  succeeded: boolean;
  body: string;
}
export interface Task {
  teamMemberName: string;
  status: string;
  type: string;
  dueDate: string;
  statusChangeDate: string;
}

export interface StatusChangeLog {
  date?: string;
  userName?: string;
  userEmail?: string;
  changeFrom?: string;
  changeTo?: string;
  title?: string; // For TaskStatus
  modifiedDate?: string; // For InspectionHistory
  author?: string; // For InspectionHistory
  subject?: string; // For InspectionHistory
  scheduleWithName?: string; // For InspectionHistory
  type?: string; // For InspectionHistory
  status?: string; // For InspectionHistory
  appointmentDate?: string; // For InspectionHistory
  modifiedUtc?: string; // For PaymentHistory
  modifiedBy?: string; // For PaymentHistory
  modifiedByEmail?: string; // For PaymentHistory
  accountingDetailId?: string; // For PaymentHistory
  totalCost?: number; // For PaymentHistory
  paidAmount?: number; // For PaymentHistory
  note?: string; // For PaymentHistory
}

export interface CaseShowHideKeysData {
  hideAssignedTeamMembertHistory?: boolean;
  hideBillingStatus?: boolean;
  hideCaseStatus?: boolean;
  hideInspectionHistory?: boolean;
  hidePaymentStatus?: boolean;
  hideTaskStatus?: boolean;
}

export interface TabRoute {
  key: string;
  title: string;
  id: string;
}

export interface AdressModel {
  contentItemId: string;
  parcelId?: string;
  address?: string;
  endDate?: string;
  latitude?: string;
  longitude?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  isManualLocation?: boolean;
  id?: string;
  SyncModel?: SyncModel;
}

export interface AddLocationRouteParams {
  isEdit: boolean;
  contentId: string;
  data?: AdressModel;
}

export interface RouteParams {
  param?: {
    contentItemId: string;
  };
  type: 'Case' | 'License';
  caseSettingData?: CaseSettingData;
  isOnline?: boolean;
}
export interface HeadingViewWithListProps {
  title: string;
  list: RelatedCase[];
  navigation: any;
}

export interface RelatedCasesResponse {
  allChildCase?: RelatedCase[];
  allParentCase?: RelatedCase[];
}

export interface SubLicense {
  id: string;
  number: string;
  assignedUsers?: string;
  assignUserCount?: number;
  status?: string;
  type?: string;
  modifyDate?: string;
  author?: string;
}
export interface SubLicenseResponse {
  allChildLicense?: SubLicense[];
  allParentLicense?: SubLicense[];
}

export interface SettingsModel {
  contentItemId?: string;
  permitIssuedDate?: string;
  permitExpirationDate?: string;
  viewOnlyAssignUsers?: boolean;
  assignAccess?: string;
  projectValuation?: string;
  caseOwner?: string;
  ownerName?: string;
  assignedUsers?: string;
}

export interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  userName?: string;
  normalizedUserName?: string;
}

export interface SelectedTeamMember {
  id: string;
  item: string; // Display name (e.g., "FirstName LastName")
}

export interface SettingsFormData {
  PermitIssuedDate: string;
  PermitExpirationDate: string;
  ViewOnlyAssignUsers: boolean;
  AssignedUsers: string;
  AssignAccess: string;
  ContentItemId: string;
  ProjectValuation: string;
  CaseOwner: string;
  SyncModel: SyncModel;
}
export interface SettingsFormInput {
  permitIssuedDate: string;
  permitExpirationDate: string;
  viewOnlyAssignUsers: boolean;
  assignedUsers: string;
  assignAccess: string;
  contentItemId: string;
  projectValuation: string;
  caseOwner: string;
  syncModel: ReturnType<typeof SyncModelParam>;
}
export interface SettingsFormOfflineInput {
  permitIssuedDate: string;
  permitExpirationDate: string;
  viewOnlyAssignUsers: boolean;
  assignedUsers: string;
  assignAccess: string;
  contentItemId: string;
  isSync: number;
  isUpdate: number;
  projectValuation: string;
  caseOwner: string;
}

export interface StandardCommentDialogListItemProps {
  rowData: StandardComment;
  checked: string[];
  setChecked: (checked: string[]) => void;
  inspectionCommentType: FilterItem[];
}

//Inpection

export interface InspectionModel {
  masterStatusLabel: string;
  contentItemId: string;
  subject: string;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  preferredTime?: string;
  scheduleWithName?: string;
  type?: string;
  status?: string;
  statusLabel?: string;
  submissionId?: string;
  location?: string;
  body?: string;
  adminNotes?: string;
  adminNotesAttachedItems?: string;
  applicantNotesAttachedItems?: string;
  selectedInspectionType?: InspectionType[];
  selectedInspectionBy?: InspectionTeamMember[];
  msCalendarId?: string;
  lstInspectionSubmission?: InspectionSubmission[];
}

export interface InspectionType {
  id: string;
  displayText: string;
  color?: string;
}

export interface InspectionStatus {
  id: string;
  displayText: string;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface InspectionTeamMember {
  id: string;
  displayText: string;
}

export interface InspectionSubmission {
  title: string;
  link: string;
}

export interface CaseOrLicenseData {
  contentItemId: string;
  caseTypeId?: string;
  licenseTypeId?: string;
  subTypes?: string;
  schedulingDepartments?: string;
  isRequireInspectionsTakePlaceinAboveOrder?: boolean;
  isAllowOverrideofInspectionTypeOrder?: boolean;
  isDoNotAddResponsiblePartybyDefault?: boolean;
  email?: string;
  number?: string;
  location?: string;
  appointmentStatusWithLabel?: InspectionStatus[];
}

export interface IImageData {
  filename: string;
  url: string;
}

export interface InspectionRowItemProps {
  rowData: InspectionModel;
  orientation: string;
  navigation: NavigationProp<RootStackParamList>;
  isOnline: boolean;
  type: 'Case' | 'License';
  caseDataById: any;
  caseOrLicenseData: CaseOrLicenseData;
}

// Form submission interface
export interface FormStatus {
  id: string;
  displayText: string;
}

export interface SubmissionModel {
  contentItemId: string;
  displayText: string;
  published: boolean;
  status: string;
  modifiedDateText: string;
  author: string;
}

export interface FileModel {
  uri: string;
  name: string;
  mimeType: string;
}

export interface FilePickerConfig {
  flag: 1 | 2 | 3; // 1: Standard, 2: Comment, 3: Inspection
  comment?: string;
  isEdit?: boolean;
  index?: number;
  id?: string;
}

export interface OpenDocPickerDialogProps {
  visible: boolean;
  onClose: () => void;
  config: FilePickerConfig;
  onFileSelected: (
    files: FileModel[],
    comment?: string,
    isEdit?: boolean,
    index?: number,
    id?: string,
  ) => void;
}

export interface DailyInspectionModel {
  contentItemId: string;
  inspector: string;
  caseContentItemId: string;
  caseNumber: string;
  inspectionDate: string;
  inspectionType: string;
  subject: string;
  time: string;
  location: string;
  advancedFormLinksJson: string;
  body: string;
  status: string;
  statusColor: string;
  preferredTime: string;
  scheduleWith: string;
  licenseContentItemId: string;
  licenseNumber: string;
  caseType: string;
  createdDate: string;
  licenseType: string;
  isShowAppointmentStatusOnReport: boolean;
  isShowCaseOrLicenseNumberOnReport: boolean;
  isShowCaseOrLicenseTypeOnReport: boolean;
  statusForeColor: string;
}

//Parcel

export interface ParcelModel {
  id?: string;
  parcelNumber?: string;
  address?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  yearBuilt?: string;
  parentParcel?: string;
  propertyType?: string;
  marketValue?: number;
  currentTenantFirstName?: string;
  currentTenantLastName?: string;
  description?: string;
  applicationLocation?: string;
}

export interface CaseParcelModel {
  id?: string;
  title?: string;
  address?: string;
  submittedBy?: string;
  createdUtc?: string;
  editLink?: string;
}

export interface ChildParcelModel {
  id?: string;
  title?: string;
  address?: string;
  submittedBy?: string;
  createdUtc?: string;
  editLink?: string;
}

export interface SubmissionParcelModel {
  id?: string;
  title?: string;
  address?: string;
  submittedBy?: string;
  createdUtc?: string;
  editLink?: string;
}

//schedule
export interface ScheduleModel {
  id?: string;
  subject?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  appointmentStatus?: {
    title?: string;
    color?: string;
  };
}
