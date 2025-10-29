// interface EditCaseState {
//   caseDataById: any; // Replace 'any' with a proper type for your case data
//   caseName: string;
//   caseName1: string;
//   apartmentSuite: string;
//   totalCost: string;
//   parcelNumber: string;
//   quickRefNumber: string;
//   isHideQuickRefNumber: boolean;
//   isApiUpdateQuickRefNumber: boolean;
//   description: string;
//   mailingAddress: string;
//   location: string;
//   latitude: string;
//   longitude: string;
//   caseNumber: string;
//   isEnableMultiline: boolean;
//   expectedDate: string | undefined;
//   actualDate: string | undefined;
//   open: boolean;
//   value: { id: string; displayText: string };
//   items: any[]; // Replace with proper type
//   billingStatus: { id: string; displayText: string };
//   openBilling: boolean;
//   isAlertOpen: boolean;
//   itemsBilling: any[]; // Replace with proper type
//   openCaseType: boolean;
//   itemsCaseType: { id: string; displayText: string };
//   selectedSubCaseType: any[]; // Replace with proper type
//   selectedCaseTags: any[]; // Replace with proper type
//   isManualLocation: boolean;
//   expectedDatePicker: boolean;
//   actualDatePicker: boolean;
//   caseType: any[]; // Replace with proper type
//   subCaseType: any[]; // Replace with proper type
//   caseTagsList: any[]; // Replace with proper type
//   billingStatusD: any[]; // Replace with proper type
//   isLoadingAPI: boolean;
//   caseStatusD: any[]; // Replace with proper type
//   attachedItem: any[]; // Replace with proper type
//   isOnline: boolean;
//   inspectionTab: boolean;
//   showLocationEditDialog: boolean;
//   showMailingEditDialog: boolean;
//   isShowTaskStatusLogTab: boolean;
//   mailingAddressStreetRouteField: string;
//   mailingAddressCityField: string;
//   mailingAddressStateField: string;
//   mailingAddressCountryField: string;
//   mailingAddressPostalCodeField: string;
//   chevronStatusList: any[]; // Replace with proper type
//   streetAddress: string;
//   city: string;
//   addressState: string;
//   country: string;
//   zip: string;
//   isSchdule: boolean;
//   schduleStaus: any[]; // Replace with proper type
//   caseSettingData: any; // Replace with proper type
//   isAllowEditCase: boolean;
//   isAllowViewInspection: boolean;
//   assignTeamMemberDisable: boolean;
//   isHideBillingStatusChangeLogTab: boolean;
//   permissions: any; // Replace with proper type
//   isAllowAddAdminNotes: boolean;
//   isAllowMultipleAddress: boolean;
//   caseShowHideKeysData: any; // Replace with proper type
//   alertData: any[]; // Replace with proper type
//   tabList: any[]; // Replace with proper type

//   // Actions
//   setCaseDataById: (data: any) => void;
//   setCaseName: (caseName: string) => void;
//   setCaseName1: (caseName1: string) => void;
//   setApartmentSuite: (apartmentSuite: string) => void;
//   setTotalCost: (totalCost: string) => void;
//   setParcelNumber: (parcelNumber: string) => void;
//   setQuickRefNumber: (quickRefNumber: string) => void;
//   setIsHideQuickRefNumber: (isHide: boolean) => void;
//   setIsApiUpdateQuickRefNumber: (isUpdate: boolean) => void;
//   setDescription: (description: string) => void;
//   setMailingAddress: (mailingAddress: string) => void;
//   setLocation: (location: string) => void;
//   setLatitude: (latitude: string) => void;
//   setLongitude: (longitude: string) => void;
//   setCaseNumber: (caseNumber: string) => void;
//   setIsEnableMultiline: (isEnable: boolean) => void;
//   setExpectedDate: (date: string | undefined) => void;
//   setActualDate: (date: string | undefined) => void;
//   setOpen: (open: boolean) => void;
//   setValue: (value: { id: string; displayText: string }) => void;
//   setItems: (items: any[]) => void;
//   setBillingStatus: (billingStatus: {
//     id: string;
//     displayText: string;
//   }) => void;
//   setOpenBilling: (open: boolean) => void;
//   setIsAlertOpen: (isOpen: boolean) => void;
//   setItemsBilling: (items: any[]) => void;
//   setOpenCaseType: (open: boolean) => void;
//   setItemsCaseType: (items: { id: string; displayText: string }) => void;
//   setSelectedSubCaseType: (subCaseType: any[]) => void;
//   setSelectedCaseTags: (caseTags: any[]) => void;
//   setIsManualLocation: (isManual: boolean) => void;
//   setExpectedDatePicker: (open: boolean) => void;
//   setActualDatePicker: (open: boolean) => void;
//   setCaseType: (caseType: any[]) => void;
//   setSubCaseType: (subCaseType: any[]) => void;
//   setCaseTagsList: (caseTags: any[]) => void;
//   setBillingStatusD: (billingStatus: any[]) => void;
//   setLoadingAPI: (isLoading: boolean) => void;
//   setCaseStatusD: (caseStatus: any[]) => void;
//   setAttachedItem: (items: any[]) => void;
//   setIsOnline: (isOnline: boolean) => void;
//   setInspectionTab: (inspectionTab: boolean) => void;
//   setShowLocationEditDialog: (show: boolean) => void;
//   setShowMailingEditDialog: (show: boolean) => void;
//   setIsShowTaskStatusLogTab: (show: boolean) => void;
//   setMailingAddressStreetRouteField: (street: string) => void;
//   setMailingAddressCityField: (city: string) => void;
//   setMailingAddressStateField: (state: string) => void;
//   setMailingAddressCountryField: (country: string) => void;
//   setMailingAddressPostalCodeField: (postalCode: string) => void;
//   setChevronStatusList: (chevronStatus: any[]) => void;
//   setStreetAddress: (street: string) => void;
//   setCity: (city: string) => void;
//   setAddressState: (state: string) => void;
//   setCountry: (country: string) => void;
//   setZip: (zip: string) => void;
//   setIsSchdule: (isSchdule: boolean) => void;
//   setSchduleStatus: (status: any[]) => void;
//   setCaseSettingData: (data: any) => void;
//   setIsAllowEditCase: (isAllow: boolean) => void;
//   setIsAllowViewInspection: (isAllow: boolean) => void;
//   setAssignTeamMemberDisable: (disable: boolean) => void;
//   setIsHideBillingStatusChangeLogTab: (isHide: boolean) => void;
//   setPermissions: (permissions: any) => void;
//   setIsAllowAddAdminNotes: (isAllow: boolean) => void;
//   setIsAllowMultipleAddress: (isAllow: boolean) => void;
//   setCaseShowHideKeysData: (data: any) => void;
//   setAlertData: (alertData: any[]) => void;
//   setTabList: (tabList: any[]) => void;
//   reset: () => void;
// }

// const initialState: EditCaseState = {
//   caseDataById: {},
//   caseName: "",
//   caseName1: "",
//   apartmentSuite: "",
//   totalCost: "",
//   parcelNumber: "",
//   quickRefNumber: "",
//   isHideQuickRefNumber: false,
//   isApiUpdateQuickRefNumber: true,
//   description: "",
//   mailingAddress: "",
//   location: "",
//   latitude: "",
//   longitude: "",
//   caseNumber: "",
//   isEnableMultiline: false,
//   expectedDate: undefined,
//   actualDate: undefined,
//   open: false,
//   value: { id: "", displayText: "" },
//   items: [],
//   billingStatus: { id: "", displayText: "" },
//   openBilling: false,
//   isAlertOpen: true,
//   itemsBilling: [],
//   openCaseType: false,
//   itemsCaseType: { id: "", displayText: "" },
//   selectedSubCaseType: [],
//   selectedCaseTags: [],
//   isManualLocation: false,
//   expectedDatePicker: false,
//   actualDatePicker: false,
//   caseType: [],
//   subCaseType: [],
//   caseTagsList: [],
//   billingStatusD: [],
//   isLoadingAPI: false,
//   caseStatusD: [],
//   attachedItem: [],
//   isOnline: true,
//   inspectionTab: false,
//   showLocationEditDialog: false,
//   showMailingEditDialog: false,
//   isShowTaskStatusLogTab: false,
//   mailingAddressStreetRouteField: "",
//   mailingAddressCityField: "",
//   mailingAddressStateField: "",
//   mailingAddressCountryField: "",
//   mailingAddressPostalCodeField: "",
//   chevronStatusList: [],
//   streetAddress: "",
//   city: "",
//   addressState: "",
//   country: "",
//   zip: "",
//   isSchdule: false,
//   schduleStaus: [],
//   caseSettingData: undefined,
//   isAllowEditCase: false,
//   isAllowViewInspection: false,
//   assignTeamMemberDisable: false,
//   isHideBillingStatusChangeLogTab: false,
//   permissions: {},
//   isAllowAddAdminNotes: false,
//   isAllowMultipleAddress: false,
//   caseShowHideKeysData: {},
//   alertData: [],
//   tabList: [],
//   setCaseDataById: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseName: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseName1: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setApartmentSuite: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setTotalCost: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setParcelNumber: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setQuickRefNumber: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsHideQuickRefNumber: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsApiUpdateQuickRefNumber: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setDescription: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddress: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setLocation: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setLatitude: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setLongitude: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseNumber: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsEnableMultiline: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setExpectedDate: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setActualDate: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setOpen: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setValue: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setItems: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setBillingStatus: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setOpenBilling: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsAlertOpen: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setItemsBilling: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   setOpenCaseType: function (open: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setItemsCaseType: function (items: {
//     id: string;
//     displayText: string;
//   }): void {
//     throw new Error("Function not implemented.");
//   },
//   setSelectedSubCaseType: function (subCaseType: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setSelectedCaseTags: function (caseTags: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsManualLocation: function (isManual: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setExpectedDatePicker: function (open: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setActualDatePicker: function (open: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseType: function (caseType: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setSubCaseType: function (subCaseType: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseTagsList: function (caseTags: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setBillingStatusD: function (billingStatus: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setLoadingAPI: function (isLoading: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseStatusD: function (caseStatus: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setAttachedItem: function (items: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsOnline: function (isOnline: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setInspectionTab: function (inspectionTab: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setShowLocationEditDialog: function (show: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setShowMailingEditDialog: function (show: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsShowTaskStatusLogTab: function (show: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddressStreetRouteField: function (street: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddressCityField: function (city: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddressStateField: function (state: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddressCountryField: function (country: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setMailingAddressPostalCodeField: function (postalCode: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setChevronStatusList: function (chevronStatus: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setStreetAddress: function (street: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setCity: function (city: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setAddressState: function (state: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setCountry: function (country: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setZip: function (zip: string): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsSchdule: function (isSchdule: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setSchduleStatus: function (status: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseSettingData: function (data: any): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsAllowEditCase: function (isAllow: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsAllowViewInspection: function (isAllow: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setAssignTeamMemberDisable: function (disable: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsHideBillingStatusChangeLogTab: function (isHide: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setPermissions: function (permissions: any): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsAllowAddAdminNotes: function (isAllow: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setIsAllowMultipleAddress: function (isAllow: boolean): void {
//     throw new Error("Function not implemented.");
//   },
//   setCaseShowHideKeysData: function (data: any): void {
//     throw new Error("Function not implemented.");
//   },
//   setAlertData: function (alertData: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   setTabList: function (tabList: any[]): void {
//     throw new Error("Function not implemented.");
//   },
//   reset: function (): void {
//     throw new Error("Function not implemented.");
//   },
// };

// export const useEditCaseStore = create<EditCaseState>((set) => ({
//   ...initialState,
//   setCaseDataById: (data) => set({ caseDataById: data }),
//   setCaseName: (caseName) => set({ caseName }),
//   setCaseName1: (caseName1) => set({ caseName1 }),
//   setApartmentSuite: (apartmentSuite) => set({ apartmentSuite }),
//   setTotalCost: (totalCost) => set({ totalCost }),
//   setParcelNumber: (parcelNumber) => set({ parcelNumber }),
//   setQuickRefNumber: (quickRefNumber) => set({ quickRefNumber }),
//   setIsHideQuickRefNumber: (isHide) => set({ isHideQuickRefNumber: isHide }),
//   setIsApiUpdateQuickRefNumber: (isUpdate) =>
//     set({ isApiUpdateQuickRefNumber: isUpdate }),
//   setDescription: (description) => set({ description }),
//   setMailingAddress: (mailingAddress) => set({ mailingAddress }),
//   setLocation: (location) => set({ location }),
//   setLatitude: (latitude) => set({ latitude }),
//   setLongitude: (longitude) => set({ longitude }),
//   setCaseNumber: (caseNumber) => set({ caseNumber }),
//   setIsEnableMultiline: (isEnable) => set({ isEnableMultiline: isEnable }),
//   setExpectedDate: (date) => set({ expectedDate: date }),
//   setActualDate: (date) => set({ actualDate: date }),
//   setOpen: (open) => set({ open }),
//   setValue: (value) => set({ value }),
//   setItems: (items) => set({ items }),
//   setBillingStatus: (billingStatus) => set({ billingStatus }),
//   setOpenBilling: (open) => set({ openBilling: open }),
//   setIsAlertOpen: (isOpen) => set({ isAlertOpen: isOpen }),
//   setItemsBilling: (items) => set({ itemsBilling: items }),
//   setOpenCaseType: (open) => set({ openCaseType: open }),
//   setItemsCaseType: (items) => set({ itemsCaseType: items }),
//   setSelectedSubCaseType: (subCaseType) =>
//     set({ selectedSubCaseType: subCaseType }),
//   setSelectedCaseTags: (caseTags) => set({ selectedCaseTags: caseTags }),
//   setIsManualLocation: (isManual) => set({ isManualLocation: isManual }),
//   setExpectedDatePicker: (open) => set({ expectedDatePicker: open }),
//   setActualDatePicker: (open) => set({ actualDatePicker: open }),
//   setCaseType: (caseType) => set({ caseType }),
//   setSubCaseType: (subCaseType) => set({ subCaseType }),
//   setCaseTagsList: (caseTags) => set({ caseTagsList: caseTags }),
//   setBillingStatusD: (billingStatus) => set({ billingStatusD: billingStatus }),
//   setLoadingAPI: (isLoading) => set({ isLoadingAPI: isLoading }),
//   setCaseStatusD: (caseStatus) => set({ caseStatusD: caseStatus }),
//   setAttachedItem: (items) => set({ attachedItem: items }),
//   setIsOnline: (isOnline) => set({ isOnline }),
//   setInspectionTab: (inspectionTab) => set({ inspectionTab }),
//   setShowLocationEditDialog: (show) => set({ showLocationEditDialog: show }),
//   setShowMailingEditDialog: (show) => set({ showMailingEditDialog: show }),
//   setIsShowTaskStatusLogTab: (show) => set({ isShowTaskStatusLogTab: show }),
//   setMailingAddressStreetRouteField: (street) =>
//     set({ mailingAddressStreetRouteField: street }),
//   setMailingAddressCityField: (city) => set({ mailingAddressCityField: city }),
//   setMailingAddressStateField: (state) =>
//     set({ mailingAddressStateField: state }),
//   setMailingAddressCountryField: (country) =>
//     set({ mailingAddressCountryField: country }),
//   setMailingAddressPostalCodeField: (postalCode) =>
//     set({ mailingAddressPostalCodeField: postalCode }),
//   setChevronStatusList: (chevronStatus) =>
//     set({ chevronStatusList: chevronStatus }),
//   setStreetAddress: (street) => set({ streetAddress: street }),
//   setCity: (city) => set({ city }),
//   setAddressState: (state) => set({ addressState: state }),
//   setCountry: (country) => set({ country }),
//   setZip: (zip) => set({ zip }),
//   setIsSchdule: (isSchdule) => set({ isSchdule }),
//   setSchduleStatus: (status) => set({ schduleStaus: status }),
//   setCaseSettingData: (data) => set({ caseSettingData: data }),
//   setIsAllowEditCase: (isAllow) => set({ isAllowEditCase: isAllow }),
//   setIsAllowViewInspection: (isAllow) =>
//     set({ isAllowViewInspection: isAllow }),
//   setAssignTeamMemberDisable: (disable) =>
//     set({ assignTeamMemberDisable: disable }),
//   setIsHideBillingStatusChangeLogTab: (isHide) =>
//     set({ isHideBillingStatusChangeLogTab: isHide }),
//   setPermissions: (permissions) => set({ permissions }),
//   setIsAllowAddAdminNotes: (isAllow) => set({ isAllowAddAdminNotes: isAllow }),
//   setIsAllowMultipleAddress: (isAllow) =>
//     set({ isAllowMultipleAddress: isAllow }),
//   setCaseShowHideKeysData: (data) => set({ caseShowHideKeysData: data }),
//   setAlertData: (alertData) => set({ alertData }),
//   setTabList: (tabList) => set({ tabList }),
//   reset: () => set(initialState),
// }));
