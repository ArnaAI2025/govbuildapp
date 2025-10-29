import { create } from 'zustand';
import { CaseData, FilterOptionsResponse, ItemType } from '../utils/interfaces/ICase';
import { DefaultAdvancedFiltersInterface } from '../utils/interfaces/IComponent';
import { DEFAULT_ADVANCED_FILTERS } from '../constants/data';

interface UnifiedCaseState {
  cases: CaseData[];
  filters: DefaultAdvancedFiltersInterface;
  pageNo: number;
  caseIds: string[];
  totalCaseCount: number;
  isLoading: boolean;
  isOnline: boolean;
  isFirstSync: boolean;
  allDataSync: number;
  filterCount: number;
  isAllowEditCase?: boolean;
  caseData: CaseData | null;
  chevronStatusList: ItemType[];
  dropdownsList: FilterOptionsResponse[];
  caseSettingData: any;
  isAllowMultipleAddress: boolean;
  isSchedule: boolean;
  isAllowViewInspection: boolean;
  isShowTaskStatusLogTab: boolean;
  showLocationEditDialog: boolean;
  showMailingEditDialog: boolean;
  permissions: any[];
  alertPopupData: any;

  setCases: (cases: CaseData[]) => void;
  setFilters: (filters: Partial<DefaultAdvancedFiltersInterface>) => void;
  setPageNo: (pageNo: number) => void;
  addCaseId: (id: string) => void;
  setCaseIds: (ids: string[]) => void;
  setTotalCaseCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setOnline: (isOnline: boolean) => void;
  setFirstSync: (isFirstSync: boolean) => void;
  setAllDataSync: (value: number) => void;
  setFilterCount: (count: number) => void;
  setIsAllowEditCase: (isAllowEditCase: boolean) => void;
  resetFilters: (hardReset?: boolean) => void;
  setCaseData: (data: CaseData) => void;
  setChevronStatusList: (list: ItemType[]) => void;
  setDropdownsList: (list: FilterOptionsResponse[]) => void;
  setCaseSettingData: (data: any) => void;
  setIsAllowMultipleAddress: (value: boolean) => void;
  setIsSchedule: (value: boolean) => void;
  setIsAllowViewInspection: (value: boolean) => void;
  setIsShowTaskStatusLogTab: (value: boolean) => void;
  setShowLocationEditDialog: (value: boolean) => void;
  setShowMailingEditDialog: (value: boolean) => void;
  resetMailingAddress: () => void;
  resetLocation: () => void;
  setPermisssions: (data: any) => void;
  setAlertPopup: (data: any) => void;
}

export const useUnifiedCaseStore = create<UnifiedCaseState>((set, get) => ({
  cases: [],
  filters: DEFAULT_ADVANCED_FILTERS,
  pageNo: 1,
  caseIds: [],
  totalCaseCount: 0,
  isLoading: false,
  isOnline: false,
  isFirstSync: false,
  allDataSync: 0,
  filterCount: 0,
  isAllowEditCase: false,
  caseData: null,
  chevronStatusList: [],
  dropdownsList: [],
  caseSettingData: {},
  isAllowMultipleAddress: false,
  isSchedule: false,
  isAllowViewInspection: false,
  isShowTaskStatusLogTab: false,
  showLocationEditDialog: false,
  showMailingEditDialog: false,
  permissions: [],
  alertPopupData: null,

  setCases: (cases) => set({ cases }),
  setFilters: (filters) =>
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      const filterCount = (
        Object.keys(newFilters) as (keyof DefaultAdvancedFiltersInterface)[]
      ).reduce((count, key) => {
        if (key === 'search' || key === 'isMyCaseOnly' || key === 'isMyLicenseOnly') {
          return count; // Ignore search and toggle fields
        }
        const value = newFilters[key];
        const defaultValue = DEFAULT_ADVANCED_FILTERS[key];
        if (key === 'teamMember' && value?.userId) {
          return count + 1;
        }
        if (
          value &&
          (!defaultValue ||
            (value as any)?.id !== (defaultValue as any)?.id ||
            (value as any)?.value !== (defaultValue as any)?.value ||
            (Array.isArray(value) && value.length > 0))
        ) {
          return count + 1;
        }
        return count;
      }, 0);
      return { filters: newFilters, filterCount };
    }),
  setPageNo: (pageNo) => set({ pageNo }),
  addCaseId: (id) => set((state) => ({ caseIds: [...state.caseIds, id] })),
  setCaseIds: (ids) => set({ caseIds: ids }),
  setTotalCaseCount: (count) => set({ totalCaseCount: count }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setOnline: (isOnline) => set({ isOnline }),
  setFirstSync: (isFirstSync) => set({ isFirstSync }),
  setAllDataSync: (value) => set({ allDataSync: value }),
  setFilterCount: (count) => set({ filterCount: count }),
  setIsAllowEditCase: (isAllowEditCase) => set({ isAllowEditCase }),
  resetFilters: (hardReset = false) =>
    set((state) => ({
      filters: {
        ...DEFAULT_ADVANCED_FILTERS,
        isMyCaseOnly: hardReset ? false : state.filters.isMyCaseOnly,
      },
      filterCount: 1,
      pageNo: 1,
      cases: [],
      caseIds: [],
    })),
  setCaseData: (data) => set({ caseData: data }),
  setChevronStatusList: (list) => set({ chevronStatusList: list }),
  setDropdownsList: (list) => set({ dropdownsList: list }),
  setCaseSettingData: (data) => set({ caseSettingData: data }),
  setIsAllowMultipleAddress: (value) => set({ isAllowMultipleAddress: value }),
  setIsSchedule: (value) => set({ isSchedule: value }),
  setIsAllowViewInspection: (value) => set({ isAllowViewInspection: value }),
  setIsShowTaskStatusLogTab: (value) => set({ isShowTaskStatusLogTab: value }),
  setShowLocationEditDialog: (value) => set({ showLocationEditDialog: value }),
  setShowMailingEditDialog: (value) => set({ showMailingEditDialog: value }),
  resetMailingAddress: () => {
    const { caseData } = get();
    if (caseData) {
      set({
        caseData: {
          ...caseData,
          mailingAddressStreetRouteField: '',
          mailingAddressCityField: '',
          mailingAddressStateField: '',
          mailingAddressCountryField: '',
          mailingAddressPostalCodeField: '',
        },
      });
    }
  },
  resetLocation: () => {
    const { caseData } = get();
    if (caseData) {
      set({
        caseData: {
          ...caseData,
          streetRouteField: '',
          cityField: '',
          stateField: '',
          countryField: '',
          postalCodeField: '',
          latitudeField: '',
          longitudeField: '',
        },
      });
    }
  },
  setPermisssions: (data) => set({ permissions: data }),
  setAlertPopup: (data) => set({ alertPopupData: data }),
}));
