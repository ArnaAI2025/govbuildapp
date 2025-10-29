import { create } from 'zustand';
import { DailyInspectionModel } from '../utils/interfaces/ISubScreens';

interface TeamMember {
  id: string;
  displayText: string;
}

interface AdvanceFilter {
  inspectorBy: string;
  type: string;
  status: string;
  caseType: string;
  licenseType: string;
  caseTypeCategory: string;
  licenseTypeCategory: string;
}

interface DailyInspectionState {
  data: DailyInspectionModel[];
  fullData: DailyInspectionModel[];
  allData: DailyInspectionModel[];
  isLoadingAPI: boolean;
  isOnline: boolean;
  filterDate: string;
  endDate: string;
  selectedTeamMember: TeamMember | null;
  teamMembers: TeamMember[];
  selectedTeam: TeamMember[];
  filterCount: number;
  advanceFilter: AdvanceFilter;
  isIncomplete: boolean;
  noInspectorAssigned: boolean;
  isAllowInspectorDragDrop: boolean;
  isAllowOwnInspector: boolean;
  isSameInspector: boolean;
  isShowStatus: boolean;
  caseOrLicenseNumber: boolean;
  caseOrLicenseType: boolean;
  onDragEnd: boolean;
  isCreateRoute: boolean;
  inspectionTypes: { id: string; displayText: string }[];
  inspectionStatus: { id: string; displayText: string }[];
  caseType: { id: string; displayText: string }[];
  caseTypeCategory: { id: string; displayText: string }[];
  licenseType: { id: string; displayText: string }[];
  licenseTypeCategory: { id: string; displayText: string }[];
  selectedInspectionType: { id: string; displayText: string }[];
  selectedStatus: { id: string; displayText: string }[];
  selectedCaseType: { id: string; displayText: string }[];
  selectedCaseTypeCategory: { id: string; displayText: string }[];
  selectedLicenseType: { id: string; displayText: string }[];
  selectedLicenseTypeCategory: { id: string; displayText: string }[];
  createRouteList: [];
  isInspectionUpdated: boolean;
  setData: (data: DailyInspectionModel[]) => void;
  setFullData: (data: DailyInspectionModel[]) => void;
  setAllData: (data: DailyInspectionModel[]) => void;
  setLoading: (isLoadingAPI: boolean) => void;
  setIsOnline: (isOnline: boolean) => void;
  setFilterDate: (filterDate: string) => void;
  setEndDate: (endDate: string) => void;
  setSelectedTeamMember: (selectedTeamMember: TeamMember | null) => void;
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  setSelectedTeam: (selectedTeam: TeamMember[]) => void;
  setFilterCount: (filterCount: number) => void;
  setAdvanceFilter: (advanceFilter: AdvanceFilter) => void;
  setIsIncomplete: (isIncomplete: boolean) => void;
  setNoInspectorAssigned: (noInspectorAssigned: boolean) => void;
  setIsAllowInspectorDragDrop: (isAllowInspectorDragDrop: boolean) => void;
  setIsAllowOwnInspector: (isAllowOwnInspector: boolean) => void;
  setIsSameInspector: (isSameInspector: boolean) => void;
  setShowStatus: (isShowStatus: boolean) => void;
  setCaseOrLicenseNumber: (caseOrLicenseNumber: boolean) => void;
  setCaseOrLicenseType: (caseOrLicenseType: boolean) => void;
  setOnDragEnd: (onDragEnd: boolean) => void;
  setIsCreateRoute: (isCreateRoute: boolean) => void;
  setInspectionTypes: (inspectionTypes: { id: string; displayText: string }[]) => void;
  setInspectionStatus: (inspectionStatus: { id: string; displayText: string }[]) => void;
  setCaseType: (caseType: { id: string; displayText: string }[]) => void;
  setCaseTypeCategory: (caseTypeCategory: { id: string; displayText: string }[]) => void;
  setLicenseType: (licenseType: { id: string; displayText: string }[]) => void;
  setLicenseTypeCategory: (licenseTypeCategory: { id: string; displayText: string }[]) => void;
  setSelectedInspectionType: (
    selectedInspectionType: { id: string; displayText: string }[],
  ) => void;
  setSelectedStatus: (selectedStatus: { id: string; displayText: string }[]) => void;
  setSelectedCaseType: (selectedCaseType: { id: string; displayText: string }[]) => void;
  setSelectedCaseTypeCategory: (
    selectedCaseTypeCategory: { id: string; displayText: string }[],
  ) => void;
  setSelectedLicenseType: (selectedLicenseType: { id: string; displayText: string }[]) => void;
  setSelectedLicenseTypeCategory: (
    selectedLicenseTypeCategory: { id: string; displayText: string }[],
  ) => void;
  setCreateRouteList: (createRouteList: any) => void;
  setIsInspectionUpdated: (isInspectionUpdated: boolean) => void;
}

export const useDailyInspectionStore = create<DailyInspectionState>((set) => ({
  data: [],
  fullData: [],
  allData: [],
  isLoadingAPI: false,
  isOnline: false,
  filterDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  selectedTeamMember: null,
  teamMembers: [{ id: '', displayText: 'Choose Inspector' }],
  selectedTeam: [],
  filterCount: 0,
  advanceFilter: {
    inspectorBy: '',
    type: '',
    status: '',
    caseType: '',
    licenseType: '',
    caseTypeCategory: '',
    licenseTypeCategory: '',
  },
  isIncomplete: false,
  noInspectorAssigned: false,
  isAllowInspectorDragDrop: false,
  isAllowOwnInspector: false,
  isSameInspector: false,
  isShowStatus: true,
  caseOrLicenseNumber: true,
  caseOrLicenseType: true,
  onDragEnd: false,
  isCreateRoute: false,
  inspectionTypes: [],
  inspectionStatus: [],
  caseType: [],
  caseTypeCategory: [],
  licenseType: [],
  licenseTypeCategory: [],
  selectedInspectionType: [],
  selectedStatus: [],
  selectedCaseType: [],
  selectedCaseTypeCategory: [],
  selectedLicenseType: [],
  selectedLicenseTypeCategory: [],
  createRouteList: [],
  isInspectionUpdated: false,
  setData: (data) => set({ data }),
  setFullData: (fullData) => set({ fullData }),
  setAllData: (allData) => set({ allData }),
  setLoading: (loading: boolean) => set({ isLoadingAPI: loading }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setFilterDate: (filterDate) => set({ filterDate }),
  setEndDate: (endDate) => set({ endDate }),
  setSelectedTeamMember: (selectedTeamMember) => set({ selectedTeamMember }),
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
  setFilterCount: (filterCount) => set({ filterCount }),
  setAdvanceFilter: (advanceFilter) => set({ advanceFilter }),
  setIsIncomplete: (isIncomplete) => set({ isIncomplete }),
  setNoInspectorAssigned: (noInspectorAssigned) => set({ noInspectorAssigned }),
  setIsAllowInspectorDragDrop: (isAllowInspectorDragDrop) => set({ isAllowInspectorDragDrop }),
  setIsAllowOwnInspector: (isAllowOwnInspector) => set({ isAllowOwnInspector }),
  setIsSameInspector: (isSameInspector) => set({ isSameInspector }),
  setShowStatus: (isShowStatus) => set({ isShowStatus }),
  setCaseOrLicenseNumber: (caseOrLicenseNumber) => set({ caseOrLicenseNumber }),
  setCaseOrLicenseType: (caseOrLicenseType) => set({ caseOrLicenseType }),
  setOnDragEnd: (onDragEnd) => set({ onDragEnd }),
  setIsCreateRoute: (isCreateRoute) => set({ isCreateRoute }),
  setInspectionTypes: (inspectionTypes) => set({ inspectionTypes }),
  setInspectionStatus: (inspectionStatus) => set({ inspectionStatus }),
  setCaseType: (caseType) => set({ caseType }),
  setCaseTypeCategory: (caseTypeCategory) => set({ caseTypeCategory }),
  setLicenseType: (licenseType) => set({ licenseType }),
  setLicenseTypeCategory: (licenseTypeCategory) => set({ licenseTypeCategory }),
  setSelectedInspectionType: (selectedInspectionType) => set({ selectedInspectionType }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedCaseType: (selectedCaseType) => set({ selectedCaseType }),
  setSelectedCaseTypeCategory: (selectedCaseTypeCategory) => set({ selectedCaseTypeCategory }),
  setSelectedLicenseType: (selectedLicenseType) => set({ selectedLicenseType }),
  setSelectedLicenseTypeCategory: (selectedLicenseTypeCategory) =>
    set({ selectedLicenseTypeCategory }),
  setCreateRouteList: (createRouteList: any) => set({ createRouteList }),
  setIsInspectionUpdated: (isInspectionUpdated) => set({ isInspectionUpdated }),
}));
