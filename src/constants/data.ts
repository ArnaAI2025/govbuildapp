import { COLORS } from '../theme/colors';
import type {
  DefaultAdvancedFiltersInterface,
  filterOptionInterface,
} from '../utils/interfaces/IComponent';

export const DEFAULT_ADVANCED_FILTERS: DefaultAdvancedFiltersInterface = {
  caseLicenseSubType: { displayText: 'All Sub Type', id: '' },
  caseLicenseTag: { displayText: 'All Tag', id: '' },
  caseLicenseType: { displayText: 'All Types', id: '' },
  caseLicenseStatus: { displayText: 'All Status', id: '' },
  advanceForm: { displayText: 'All Attached Advance Forms', id: '' },
  teamMember: { firstName: 'Choose Team Members', lastName: '', userId: '' },
  sortBy: { displayText: 'Sort By', value: '' },
  search: '',
  isMyCaseOnly: false,
  isMyLicenseOnly: false,
  filterType: { displayText: 'Filter by Text', value: 'all' },
  licenseRenewalStatus: { displayText: 'All Renewal Status', id: '' },
};

export const FILTER_TYPE: filterOptionInterface[] = [
  { displayText: 'Filter by Text', value: 'all' },
  { displayText: 'Filter by Contact Info', value: 'contact' },
  { displayText: 'Filter by Case Name', value: 'caseName' },
  { displayText: 'Filter by Location', value: 'location' },
  { displayText: 'Filter by Owner User Name', value: 'userName' },
  { displayText: 'Filter by Parcel Number', value: 'parcelNumber' },
  { displayText: 'Filter by Title', value: 'title' },
  { displayText: 'Filter by Quick Ref Number', value: 'quickrefnumber' },
];
export const SORT_OPTIONS: filterOptionInterface[] = [
  { displayText: 'Sort By', value: '' },
  { displayText: 'Case Address', value: 'address' },
  { displayText: 'Case Number', value: 'caseNumber' },
  { displayText: 'Date', value: 'date' },
  { displayText: 'Title', value: 'title' },
  { displayText: 'Recently Modified', value: 'recentlyModified' },
];

export const LICENSE_SORT = [
  {
    displayText: 'Sort By Title',
    value: '',
  },
  {
    displayText: 'Sort By License Number',
    value: 'licenseNumber',
  },
  {
    displayText: 'Sort By Business Name',
    value: 'businessName',
  },
  {
    displayText: 'Sort By Effective Date',
    value: 'effectiveDate',
  },
  {
    displayText: 'Sort By Expiration Date',
    value: 'expirationDate',
  },
  {
    displayText: 'Sort By Recently Modified',
    value: 'recentlyModified',
  },
];

// Static data for tabs
export const TABS = [
  { title: 'Attached Items', screenName: 'AttechedItems', type: 'Case' },
  { title: 'Admin Notes', screenName: 'AdminNotes', type: 'Case' },
  { title: 'Attached Docs', screenName: 'AttachedDocs', type: 'Case' },
  { title: 'Contacts', screenName: 'ContactMain', type: 'Case' },
  { title: 'Inspections', screenName: 'InspectionsScreen', type: 'Case' },
  {
    title: 'Locations',
    screenName: 'Locations',
    type: 'Case',
    onlineOnly: true,
  },
  { title: 'Payments', screenName: 'PaymentMain', type: 'Case' },
  { title: 'Public Comments', screenName: 'PublicComments', type: 'Case' },
  {
    title: 'Related',
    screenName: 'RelatedScreen',
    type: 'Case',
    onlineOnly: true,
  },
  {
    title: 'Sent Emails',
    screenName: 'SendMailScreen',
    type: 'Case',
    onlineOnly: true,
  },
  { title: 'Settings', screenName: 'SettingsScreen', type: 'Case' },
  { title: 'Tasks', screenName: 'TaskScreen', type: 'Case', onlineOnly: true },
  {
    title: 'Logs',
    screenName: 'StatusChangeLog',
    type: 'Case',
    onlineOnly: true,
  },
  {
    title: 'Task Status Change Log',
    screenName: 'TaskStatusChangeLog',
    type: 'Case',
    onlineOnly: true,
  },
];
export const OFFLINE_TITLES = new Set([
  'AttechedItems',
  'AdminNotes',
  'AttachedDocs',
  'ContactMain',
  'InspectionsScreen',
  'PaymentMain',
  'PublicComments',
  'SettingsScreen',
  'Locations',
]);
// Define tab data For license sub features
export const LICENSE_TABS = [
  { title: 'Attached Items', screenName: 'AttechedItems', type: 'License' },
  { title: 'Admin Notes', screenName: 'AdminNotes', type: 'License' },
  { title: 'Attached Docs', screenName: 'AttachedDocs', type: 'License' },
  { title: 'Contacts', screenName: 'ContactMain', type: 'License' },
  {
    title: 'Sub License',
    screenName: 'SubLicenseScreen',
    type: 'License',
  },
  {
    title: 'Inspections',
    screenName: 'InspectionsScreen',
    type: 'License',
  },
  {
    title: 'License',
    screenName: 'ShowLicenseScreen',
    type: 'License',
  },
  {
    title: 'License Details',
    screenName: 'LicenseDetailsScreen',
    type: 'License',
  },
  {
    title: 'Owner',
    screenName: 'OwnerScreen',
    type: 'License',
  },

  {
    title: 'Payments',
    screenName: 'PaymentMain',
    type: 'License',
  },
  {
    title: 'Public Comments',
    screenName: 'PublicComments',
    type: 'License',
  },
  {
    title: 'Sent Emails',
    screenName: 'SendMailScreen',
    type: 'License',
  },

  {
    title: 'Logs',
    screenName: 'StatusChangeLog',
    type: 'License',
  },
];

export const LICENSE_OFFLINE_TITLES = new Set([
  'Attached Items',
  'Admin Notes',
  'Attached Docs',
  'Contacts',
  'Inspections',
  'License Details',
  // "Owner",
  'Payments',
  'Public Comments',
]);

export const COLOR_CODE_STATUS = (status: string) => {
  var color;
  switch (status) {
    case 'Active':
      color = COLORS.BLACK;
      break;
    case 'Closed':
      color = COLORS.CLOSED;
      break;
    case 'Denied':
      color = COLORS.DENIED;
      break;
    case 'Draft':
      color = COLORS.DRAFT;
      break;
    case 'Expired':
      color = COLORS.EXPIRED;
      break;
    case 'Issued':
      color = COLORS.ISSUED;
      break;
    case 'License':
      color = COLORS.LICENSE;
      break;
    case 'New form status05/25':
      color = COLORS.NEW_FORM_STATUS;
      break;
    case 'Not Now':
      color = COLORS.NOT_NOW;
      break;
    case 'Pay Later':
      color = COLORS.PAY_LATER;
      break;
    case 'Pending':
      color = COLORS.PENDING;
      break;
    case 'Approved':
      color = COLORS.APPROVED;
      break;
    case 'Completed':
      color = COLORS.APPROVED;
      break;
    case 'Submitted':
      color = COLORS.SUBMITTED;
      break;
    case 'In Progress':
      color = COLORS.InProgress;
      break;
    case '':
      color = COLORS.NOT_NOW;
      break;
    default:
      color = COLORS.PENDING;
      break;
  }
  return color;
};
export const PAYMENT_ITEMS = [
  { displayText: 'Yes', id: 'yes' },
  { displayText: 'No', id: 'no' },
];

export const radioButtons = [
  {
    id: '1',
    label: 'Custom',
    value: 'Custom',
    borderColor: COLORS.APP_COLOR,
    color: COLORS.APP_COLOR,
    containerStyle: { flex: 1, justifyContent: 'center' },
  },
  {
    id: '2',
    label: 'AM',
    value: 'am',
    borderColor: COLORS.APP_COLOR,
    color: COLORS.APP_COLOR,
    containerStyle: { flex: 1, justifyContent: 'center' },
  },
  {
    id: '3',
    label: 'PM',
    value: 'pm',
    borderColor: COLORS.APP_COLOR,
    color: COLORS.APP_COLOR,
    containerStyle: { flex: 1, justifyContent: 'center' },
  },
  {
    id: '4',
    label: 'DAY',
    value: 'day',
    borderColor: COLORS.APP_COLOR,
    color: COLORS.APP_COLOR,
    containerStyle: { flex: 1, justifyContent: 'center' },
  },
];
export const DEFAULT_DATA = {
  id: '',
  displayText: '',
};

//Syncing
export const syncing = {
  CHUNK_SIZE: 10,
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_CONCURRENT_REQUESTS: 5,
};
