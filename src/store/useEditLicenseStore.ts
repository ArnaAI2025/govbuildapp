import { create } from 'zustand';
import { FilterOptionsResponse, ItemType, LicenseData } from '../utils/interfaces/zustand/ILicense';

// EDIT LICENSE STATES
export interface EditLicenseState {
  licenseData?: LicenseData;
  isLoading?: boolean;
  chevronStatusList?: ItemType[];
  licenseUniqNumber?: string;
  dropdownsList: [];
  licenseDescriptor: string;
  applicantFirstName: string;
  applicantLastName: string;
  businessName: string;
  phoneNumber: string;
  cellNumber: string;
  email: string;
  licenseLocation: string;
  additionalInfo: string;
  parcelNumber: string;
  quickRefNumber: string;
  licenseStatusId: string;
  renewalStatusId: string;
  licenseTypeId: string;
  licenseTypeDisplayText: string;
  paymentReceived: string;
  endDatePicker: boolean;
  isAllowViewInspection: boolean;
  isShowTaskStatusLogTab: boolean;
  isAllowMultipleAddress: boolean;
  isAllowAddAdminNotes: boolean;
  isAllowEditLicense: boolean;
  isAlertOpen: boolean;
  isAllowAssigned: boolean;
  userId: string;
  expirationDate: string;

  setLicenseData?: (licenseData: LicenseData) => void;
  setIsLoading?: (isLoading: boolean) => void;
  setChevronStatusList?: (chevronStatusList: ItemType[]) => void;
  setLicenseUniqNumber?: (licenseUniqNumber: string) => void;
  setDropdownsList?: (dropdownsList: FilterOptionsResponse[]) => void;
  setLicenseDescriptor?: (licenseDescriptor: string) => void;
  setApplicantFirstName?: (applicantFirstName: string) => void;
  setApplicantLastName?: (applicantLastName: string) => void;
  setBusinessName?: (businessName: string) => void;
  setPhoneNumber?: (phoneNumber: string) => void;
  setCellNumber?: (cellNumber: string) => void;
  setEmail?: (email: string) => void;
  setLicenseLocation?: (licenseLocation: string) => void;
  setAdditionalInfo?: (additionalInfo: string) => void;
  setParcelNumber?: (parcelNumber: string) => void;
  setQuickRefNumber?: (quickRefNumber: string) => void;
  setLicenseStatusId?: (licenseStatusId: string) => void;
  setRenewalStatusId?: (renewalStatusId: string) => void;
  setLicenseTypeId?: (licenseTypeId: string) => void;
  setLicenseTypeDisplayText?: (licenseTypeDisplayText: string) => void;
  setPaymentReceived?: (paymentReceived: string) => void;
  setEndDatePicker?: (endDatePicker: boolean) => void;
  setIsAllowViewInspection?: (isAllowViewInspection: boolean) => void;
  setIsShowTaskStatusLogTab?: (isShowTaskStatusLogTab: boolean) => void;
  setIsAllowMultipleAddress?: (isAllowMultipleAddress: boolean) => void;
  setIsAllowAddAdminNotes?: (isAllowAddAdminNotes: boolean) => void;
  setIsAllowEditLicense?: (isAllowEditLicense: boolean) => void;
  setIsAlertOpen?: (isAlertOpen: boolean) => void;
  setAllowAssigned?: (isAllowAssigned: boolean) => void;
  setUserId?: (userId: string) => void;
  setExpirationDate?: (expirationDate: string) => void;
}
const useEditLicenseStore = create<EditLicenseState>()((set) => ({
  isLoading: false,
  licenseData: [],
  chevronStatusList: [],
  licenseUniqNumber: '',
  dropdownsList: [],
  licenseDescriptor: '',
  applicantFirstName: '',
  applicantLastName: '',
  businessName: '',
  phoneNumber: '',
  cellNumber: '',
  email: '',
  licenseLocation: '',
  additionalInfo: '',
  parcelNumber: '',
  quickRefNumber: '',
  licenseStatusId: '',
  renewalStatusId: '',
  licenseTypeId: '',
  licenseTypeDisplayText: '',
  paymentReceived: '',

  endDatePicker: false,
  isAllowViewInspection: false,
  isShowTaskStatusLogTab: false,
  isAllowMultipleAddress: false,
  isAllowAddAdminNotes: false,
  isAllowEditLicense: false,
  isAlertOpen: true,
  isAllowAssigned: false,
  userId: '',
  expirationDate: '',

  // Setters

  setIsLoading: (isLoading) => set({ isLoading }),
  setLicenseData: (licenseData) => set({ licenseData }),
  setChevronStatusList: (chevronStatusList) => set({ chevronStatusList }),
  setLicenseUniqNumber: (text) => set({ licenseUniqNumber: text }),
  setDropdownsList: (dropdownsList) => set({ dropdownsList }),
  setLicenseDescriptor: (text) => set({ licenseDescriptor: text }),
  setApplicantFirstName: (text) => set({ applicantFirstName: text }),
  setApplicantLastName: (text) => set({ applicantLastName: text }),
  setBusinessName: (text) => set({ businessName: text }),
  setPhoneNumber: (text) => set({ phoneNumber: text }),
  setCellNumber: (text) => set({ cellNumber: text }),
  setEmail: (text) => set({ email: text }),
  setLicenseLocation: (text) => set({ licenseLocation: text }),
  setAdditionalInfo: (text) => set({ additionalInfo: text }),
  setParcelNumber: (text) => set({ parcelNumber: text }),
  setQuickRefNumber: (text) => set({ quickRefNumber: text }),
  setLicenseStatusId: (text) => set({ licenseStatusId: text }),
  setRenewalStatusId: (text) => set({ renewalStatusId: text }),
  setLicenseTypeId: (text) => set({ licenseTypeId: text }),
  setLicenseTypeDisplayText: (text) => set({ licenseTypeDisplayText: text }),
  setPaymentReceived: (text) => set({ paymentReceived: text }),

  setEndDatePicker: (endDatePicker) => set({ endDatePicker }),
  setIsAllowViewInspection: (isAllowViewInspection) => set({ isAllowViewInspection }),
  setIsShowTaskStatusLogTab: (isShowTaskStatusLogTab) => set({ isShowTaskStatusLogTab }),
  setIsAllowMultipleAddress: (isAllowMultipleAddress) => set({ isAllowMultipleAddress }),
  setIsAllowAddAdminNotes: (isAllowAddAdminNotes) => set({ isAllowAddAdminNotes }),
  setIsAllowEditLicense: (isAllowEditLicense) => set({ isAllowEditLicense }),
  setIsAlertOpen: (isAlertOpen) => set({ isAlertOpen }),
  setAllowAssigned: (isAllowAssigned) => set({ isAllowAssigned }),
  setUserId: (userId) => set({ paymentReceived: userId }),
  setExpirationDate: (expirationDate) => set({ paymentReceived: expirationDate }),
}));

export default useEditLicenseStore;
