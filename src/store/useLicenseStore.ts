import { create } from 'zustand';
import { FilterOptionsResponse, ItemType, LicenseData } from '../utils/interfaces/zustand/ILicense';
import { DEFAULT_ADVANCED_FILTERS } from '../constants/data';
import { DefaultAdvancedFiltersInterface } from '../utils/interfaces/IComponent';

interface LicenseState {
  // List license
  licenseData: LicenseData[];
  filters: DefaultAdvancedFiltersInterface;
  pageNo: number;
  licenseIds: string[];
  totalLicenseCount: number;
  isLoading: boolean;
  isOnline: boolean;
  isFirstSync: boolean;
  allDataSync: number;
  filterCount: number;
  allowEditLicense: boolean;
  myLicenseOnly: boolean;
  selectedTeamMember: string;
  isFetchingMore: boolean;
  openFilter: boolean;
  hasMoreData: boolean;

  // Edit license-specific state
  licenseEditData: LicenseData | null;
  chevronStatusList: [];
  dropdownsList: FilterOptionsResponse[];
  licenseSettingData: any;
  permissions: any[];
  isSchedule: boolean;
  isAllowViewInspection: boolean;
  // Alerts
  alertPopupData: any;

  // license actions
  setLicenseData: (licenseData: LicenseData[]) => void;
  setFilters: (filters: Partial<DefaultAdvancedFiltersInterface>) => void;
  setPageNo: (pageNo: number) => void;
  addLicenseId: (id: string) => void;
  setLicenseIds: (ids: string[]) => void;
  setTotalLicenseCount: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  setOnline: (isOnline: boolean) => void;
  setFirstSync: (isFirstSync: boolean) => void;
  setAllDataSync: (value: number) => void;
  setAllowEditLicense: (allowEditLicense: boolean) => void;
  setFilterCount: (count: number) => void;
  setMyLicenseOnly: (myLicenseOnly: boolean) => void;
  setIsFetchingMore: (isFetchingMore: boolean) => void;
  setSelectedTeamMember: (selectedTeamMember: string) => void;
  setOpenFilter: (openFilter: boolean) => void;
  setHasMoreData: (hasMoreData: boolean) => void;
  resetFilters: (hardReset?: boolean) => void;

  // Edit license actions
  setLicenseEditData: (data: LicenseData) => void;
  setChevronStatusList: (list: ItemType[]) => void;
  setDropdownsList: (list: FilterOptionsResponse[]) => void;
  setLicenseSettingData: (data: any) => void;
  setPermisssions: (data: any) => void;
  setIsSchedule: (value: boolean) => void;
  setIsAllowViewInspection: (value: boolean) => void;

  // Alerts
  setAlertPopup: (data: any) => void;
}

export const useLicenseStore = create<LicenseState>((set) => ({
  // license list state
  licenseData: [],
  filters: DEFAULT_ADVANCED_FILTERS,
  pageNo: 1,
  licenseIds: [],
  totalLicenseCount: 0,
  isLoading: false,
  isOnline: false,
  isFirstSync: false,
  allDataSync: 0,
  filterCount: 0,
  allowEditLicense: true,
  // others
  myLicenseOnly: false,
  selectedTeamMember: '',
  isFetchingMore: false,
  openFilter: false,
  hasMoreData: true,

  // Edit license state
  licenseEditData: null,
  chevronStatusList: [],
  dropdownsList: [],
  licenseSettingData: {},
  permissions: [],
  isSchedule: false,
  isAllowViewInspection: false,
  // Alerts
  alertPopupData: null,

  // license actions
  setLicenseData: (licenseData) => set({ licenseData }),
  setFilters: (filters) =>
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      const filterCount = (
        Object.keys(newFilters) as (keyof DefaultAdvancedFiltersInterface)[]
      ).reduce((count, key) => {
        if (key === 'search' || key === 'isMyLicenseOnly') {
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
  addLicenseId: (id) => set((state) => ({ licenseIds: [...state.licenseIds, id] })),
  setLicenseIds: (ids) => set({ licenseIds: ids }),
  setTotalLicenseCount: (count) => set({ totalLicenseCount: count }),
  setLoading: (isLoading) => set({ isLoading }),
  setAllowEditLicense: (allowEditLicense) => set({ allowEditLicense }),
  setOnline: (isOnline) => set({ isOnline }),
  setFirstSync: (isFirstSync) => set({ isFirstSync }),
  setAllDataSync: (value) => set({ allDataSync: value }),
  setFilterCount: (count) => set({ filterCount: count }),
  setMyLicenseOnly: (myLicenseOnly) => set({ myLicenseOnly }),
  setSelectedTeamMember: (value) => set({ selectedTeamMember: value }),
  setIsFetchingMore: (isFetchingMore) => set({ isFetchingMore }),
  setOpenFilter: (openFilter) => set({ openFilter }),
  setHasMoreData: (hasMoreData) => set({ hasMoreData }),
  setIsSchedule: (value) => set({ isSchedule: value }),
  setIsAllowViewInspection: (value) => set({ isAllowViewInspection: value }),
  resetFilters: (hardReset = false) =>
    set((state) => ({
      filters: {
        ...DEFAULT_ADVANCED_FILTERS,
        isMyLicenseOnly: hardReset ? false : state.filters.isMyLicenseOnly,
      },
      filterCount: 0,
      pageNo: 1,
      licenseData: [],
      licenseIds: [],
    })),
  // Edit license actions
  setLicenseEditData: (data) => set({ licenseEditData: data }),
  // setLicenseEditData: (data: Partial<LicenseData>) =>
  //   set((state) => ({
  //     licenseEditData: { ...state.licenseEditData, ...data } as LicenseData,
  //   })),
  setChevronStatusList: (list) => set({ chevronStatusList: list }),
  setDropdownsList: (list) => set({ dropdownsList: list }),
  setLicenseSettingData: (data) => set({ licenseSettingData: data }),
  setPermisssions: (data) => set({ permissions: data }),

  // Alerts
  setAlertPopup: (data) => set({ alertPopupData: data }),
}));
