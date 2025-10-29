import { CaseData } from './ICase';
import { ImageSourcePropType, TextStyle } from 'react-native';
import { RelatedCase, StatusChangeLog, Task } from './ISubScreens';
import { NavigationProp } from '@react-navigation/native';

export type Status =
  | 'Closed'
  | 'Denied'
  | 'Draft'
  | 'Expired'
  | 'Issued'
  | 'License'
  | 'New form status05/25'
  | 'Not Now'
  | 'Pay Later'
  | 'Pending'
  | 'Approved'
  | 'Completed'
  | 'Submitted';
export interface StatusColors {
  Closed: string;
  Denied: string;
  Draft: string;
  Expired: string;
  Issued: string;
  License: string;
  New_form_status: string;
  Not_Now: string;
  Pay_Later: string;
  Pending: string;
  Approved: string;
  Submitted: string;
}
export interface FloatingInputProps {
  label: string;
  value: string | number | null;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  error?: boolean;
  style?: object;
  leftIcon?: string;
  rightIcon?: string;
  editable?: boolean;
  pointerEvents?: 'none' | 'auto';
  customRightIcon?: ImageSourcePropType;
  customRightIconStyle?: object;
  onIconPress?: () => void;
  hintText?: string;
  isPhoneNumber?: boolean;
  hintTextStyle?: TextStyle;
  maxLength?: number;
  required?: boolean;
}

export interface AutocompleteInputProps {
  data: { displayText: string; [key: string]: any }[];
  query: string;
  onQueryChange: (text: string) => void;
  onSelect: (item: { displayText: string; [key: string]: any }) => void;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  isSearchEnabled?: boolean; // New prop to enable/disable search
}

export type DashboardCardProps = {
  heading?: string | number;
  value: string;
  isNew?: boolean;
  image?: any;
  iconColor?: string;
  backgroundColor?: string;
  showImage?: boolean;
  disabled?: boolean;
  customStyle?: object;
  onPress: () => void;
};

export interface CustomWebViewProps {
  initialUrl: string;
}

export interface CustomHeaderProps {
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  onPress: () => void;
  title: string;
  dateTimeObj: string[];
}

export interface ScreenWrapperProps {
  title: string;
  children: React.ReactNode;
  onBackPress?: () => void;
  dateTimeObj?: string[];
}

export interface DropdownProps {
  data: any[];
  labelField: string;
  valueField: string;
  value: any;
  onChange: (item: any) => void;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  zIndexPriority?: number;
  containerStyle?: object;
  hintText?: string;
  disabled?: boolean;
  error?: boolean;
  showClearIcon?: boolean;
  multiline?: boolean;
  required?: boolean;
  onClear?: () => void;
}
export interface MultiSelectDropdownProps {
  data: any[];
  labelField: string;
  valueField: string;
  value: any[];
  onChange: (values: any[]) => void;
  containerStyle?: object;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  zIndexPriority: number;
  disabled?: boolean;
  error?: boolean;
  hintText?: string;
  alldata?: any[];
}

export interface FABProps {
  onPress: () => void;
  icon?: string;
  style?: string;
  customIcon?: string;
  isLoading?: boolean;
  disabled?: boolean;
  contanerstyle?: object;
}

export interface FolderFileItem {
  id: string;
  name?: string;
  fileName?: string;
  Isfolder?: number;
  [key: string]: any;
}

export interface StandardFolderFileDialogProps {
  visible: boolean;
  items: FolderFileItem[];
  onClose: () => void;
  onSelect: (selectedName: string) => void;
}

export interface FormItem {
  contentItemId: string;
  DisplayText: string;
  isInitialFetch?: boolean;
  AutoroutePart?: string;
}

export interface StandardFormDialogProps {
  visible: boolean;
  forms: FormItem[];
  onClose: () => void;
  onSelect: (selectedForm: string) => void;
}

export interface WebViewUrlParams {
  baseUrl: string;
  path: string;
}

export interface Route {
  key: string;
  title: string;
}
export interface InputFieldProps {
  heading: string;
  value: string;
  setValue: (value: string) => void;
  hint?: string;
  infoMsg?: string;
  isShowInfo?: boolean;
  keyboardType: number;
  maxLength?: number;
}
export interface NoDataProps {
  message?: string;
  imageSource?: any;
  onRetry?: () => void;
  showRetry?: boolean;
  containerStyle?: object;
}

export interface CustomTextUIProps {
  title: string;
  color?: string;
  backgroundColor?: string;
  isImage?: boolean;
  imagePath?: ImageSourcePropType;
  iconStyle?: Record<string, any>;
  accessibilityLabel?: string;
}
export interface StatusChangeItemRowProps {
  rowData: StatusChangeLog;
  navigation: NavigationProp<any>;
  orientation: string;
}

export interface ExpandableTextViewProps {
  heading: string;
  title?: string;
  status: string;
  date?: string;
}

export interface HeadingViewWithListProps {
  title: string;
  list: RelatedCase[];
  navigation: NavigationProp<any>;
}

export interface ExpandableViewProps {
  to: string;
  subject: string;
  createdUtc: string;
  succeeded: boolean;
  data: string;
}
export interface TaskRowItemProps {
  rowData: Task;
  orientation: string;
}
export interface WebViewContent {
  url: string;
  accessToken: string | null;
}

// Advance filter
export interface DefaultAdvancedFiltersInterface {
  caseLicenseSubType?: FilterItemInterface;
  caseLicenseTag?: FilterItemInterface;
  caseLicenseType?: FilterItemInterface;
  caseLicenseStatus?: FilterItemInterface;
  advanceForm?: FilterItemInterface;
  licenseRenewalStatus?: FilterItemInterface;
  teamMember?: TeamMemberInterface;
  sortBy?: filterOptionInterface;
  search?: string;
  isMyCaseOnly?: boolean;
  isMyLicenseOnly?: boolean;
  filterType?: filterOptionInterface;
}

export interface DefaultAdvancedFiltersResponseInterface {
  subTypes?: FilterItemInterface[];
  caseTags?: FilterItemInterface[];
  caseTypes?: FilterItemInterface[];
  caseStatuses?: FilterItemInterface[];
  advanceForms?: FilterItemInterface[];
  teamMembers?: TeamMemberInterface[];
  renewalStatus?: FilterItemInterface[];
  sortOption?: filterOptionInterface[];
  filterType?: filterOptionInterface[];
}

export interface FilterItemInterface {
  displayText: string;
  id: string;
}

export interface TeamMemberInterface {
  firstName: string;
  lastName: string;
  userId: string;
}

export interface filterOptionInterface {
  displayText: string;
  value: string;
}

// CASE LICENSE HERDER
export interface ListCaseLicenseHeaderProps {
  filters: DefaultAdvancedFiltersInterface;
  isNetworkAvailable: boolean;
  openFilter: boolean;
  setOpenFilter: (open: boolean) => void;
  onToggleShowAll: (value: boolean) => void;
  onApplyFilters: (newFilters: DefaultAdvancedFiltersInterface) => void;
  onSearch: (text: string) => void;
  orientation: string;
  headerType: string;
  isForDailyInspection?: boolean;
}

//Goggle datepicker

export interface GooglePlacePickerProps {
  reff: any;
  setLocation?: (location: string) => void;
  setStreetAddress?: (address: string) => void;
  setCity?: (city: string) => void;
  setState?: (state: string) => void;
  setZip?: (zip: string) => void;
  setCountry?: (zip: string) => void;
  setAddress?: (zip: string) => void;
  setLatitude?: (lat: number) => void;
  setLongitude?: (lng: number) => void;
  error?: boolean;
  caseData?: CaseData | null;
  setGoogleAddress?: (data: any) => void;
  hintText?: string;
  defaultValue?: string;
  value?: string;
  locationLable?: string;
  disabled?: boolean;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface AddressParts {
  address1: string;
  city: string;
  state: string;
  postcode: string;
}
//WebView
export interface FileItem {
  localUrl: string;
  name: string;
  mimeType: string;
  originalMimeType: string;
}

export interface OpenDocPickerDialogProps {
  visible: boolean;
  onClose: () => void;
  config: {
    flag: number;
    comment: string;
    FileUploadApi: (files: FileItem[] | FormData, ...args: any[]) => void;
    isEdit: boolean;
    index: string;
    id: string;
  };
}
export interface WebViewState {
  url: string;
  accessToken: string;
  isLoadingAPI: boolean;
  isWebViewLoading: boolean;
  isAlertDisplayed: boolean;
  isConnected: boolean | null;
  isLowConnectivity: boolean;
  showError: boolean;
}
