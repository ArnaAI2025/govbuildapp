import { create } from 'zustand';
import type {
  InspectionModel,
  InspectionType,
  InspectionTeamMember,
  InspectionStatus,
  CaseOrLicenseData,
  IImageData,
} from '../utils/interfaces/ISubScreens';

interface InspectionState {
  inspections: InspectionModel[];
  inspectionTypes: InspectionType[];
  teamMembers: InspectionTeamMember[];
  inspectionStatus: InspectionStatus[];
  selectedTypes: InspectionType[];
  selectedTeamMembers: InspectionTeamMember[];
  selectedStatus: InspectionStatus | null;
  caseOrLicenseData: CaseOrLicenseData | null;
  isLoading: boolean;
  isOnline: boolean;
  sortOrder: 'date_desc' | 'date_asc';
  isShowSchedule: boolean;
  inspectionDate: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  preferredTime: string;
  location: string;
  defaultTime: number;
  timeDif: number;
  isHideSign: boolean;
  signature: string;
  fullEditorBody: string;
  adminNotesBody: string;
  msCalendarId: string;
  lstInspectionSubmission: any[];
  isGeneral: boolean;
  generalImageData: IImageData[];
  adminImageData: IImageData[];
  addResponsible: boolean;
  setInspections: (inspections: InspectionModel[]) => void;
  setInspectionTypes: (types: InspectionType[]) => void;
  setTeamMembers: (members: InspectionTeamMember[]) => void;
  setInspectionStatus: (status: InspectionStatus[]) => void;
  setSelectedTypes: (types: InspectionType[]) => void;
  setSelectedTeamMembers: (members: InspectionTeamMember[]) => void;
  setSelectedStatus: (status: InspectionStatus | null) => void;
  setCaseOrLicenseData: (data: CaseOrLicenseData) => void;
  setLoading: (loading: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setSortOrder: (order: 'date_desc' | 'date_asc') => void;
  setIsShowSchedule: (show: boolean) => void;
  setInspectionDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setStartDateTime: (dateTime: string) => void;
  setEndDateTime: (dateTime: string) => void;
  setPreferredTime: (time: string) => void;
  setLocation: (location: string) => void;
  setDefaultTime: (time: number) => void;
  setTimeDif: (diff: number) => void;
  setIsHideSign: (hide: boolean) => void;
  setSignature: (sig: string) => void;
  setFullEditorBody: (body: string) => void;
  setAdminNotesBody: (body: string) => void;
  setMsCalendarId: (id: string) => void;
  setLstInspectionSubmission: (submissions: any[]) => void;
  setIsGeneral: (isGeneral: boolean) => void;
  // setGeneralImageData: (images: IImageData[]) => void;
  // setAdminImageData: (images: IImageData[]) => void;
  setGeneralImageData: (images: IImageData[] | ((prev: IImageData[]) => IImageData[])) => void;
  setAdminImageData: (images: IImageData[] | ((prev: IImageData[]) => IImageData[])) => void;
  setAddResponsible: (add: boolean) => void;
  resetInspectionState: () => void;
}

export const useInspectionStore = create<InspectionState>((set) => ({
  inspections: [],
  inspectionTypes: [],
  teamMembers: [],
  inspectionStatus: [],
  selectedTypes: [],
  selectedTeamMembers: [],
  selectedStatus: null,
  caseOrLicenseData: null,
  isLoading: false,
  isOnline: false,
  sortOrder: 'date_desc',
  isShowSchedule: false,
  inspectionDate: '',
  startTime: '',
  endTime: '',
  startDateTime: '',
  endDateTime: '',
  preferredTime: '1',
  location: '',
  defaultTime: 0,
  timeDif: 0,
  isHideSign: false,
  signature: '',
  fullEditorBody: '',
  adminNotesBody: '',
  msCalendarId: '',
  lstInspectionSubmission: [],
  isGeneral: true,
  generalImageData: [],
  adminImageData: [],
  addResponsible: false,
  setInspections: (inspections) => set({ inspections: inspections ?? [] }),
  setInspectionTypes: (types) => set({ inspectionTypes: types ?? [] }),
  setTeamMembers: (members) => set({ teamMembers: members ?? [] }),
  setInspectionStatus: (status) => set({ inspectionStatus: status ?? [] }),
  setSelectedTypes: (types) => set({ selectedTypes: types ?? [] }),
  setSelectedTeamMembers: (members) => set({ selectedTeamMembers: members ?? [] }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setCaseOrLicenseData: (data) => set({ caseOrLicenseData: data ?? null }),
  setLoading: (loading) => set({ isLoading: loading ?? false }),
  setIsOnline: (online) => set({ isOnline: online ?? false }),
  setSortOrder: (order) => set({ sortOrder: order ?? 'date_desc' }),
  setIsShowSchedule: (show) => set({ isShowSchedule: show ?? false }),
  setInspectionDate: (date) => set({ inspectionDate: date ?? '' }),
  setStartTime: (time) => set({ startTime: time ?? '' }),
  setEndTime: (time) => set({ endTime: time ?? '' }),
  setStartDateTime: (dateTime) => set({ startDateTime: dateTime ?? '' }),
  setEndDateTime: (dateTime) => set({ endDateTime: dateTime ?? '' }),
  setPreferredTime: (time) => set({ preferredTime: time ?? '1' }),
  setLocation: (location) => set({ location: location ?? '' }),
  setDefaultTime: (time) => set({ defaultTime: time ?? 0 }),
  setTimeDif: (diff) => set({ timeDif: diff ?? 0 }),
  setIsHideSign: (hide) => set({ isHideSign: hide ?? false }),
  setSignature: (sig) => set({ signature: sig ?? '' }),
  setFullEditorBody: (body) => set({ fullEditorBody: body ?? '' }),
  setAdminNotesBody: (body) => set({ adminNotesBody: body ?? '' }),
  setMsCalendarId: (id) => set({ msCalendarId: id ?? '' }),
  setLstInspectionSubmission: (submissions) => set({ lstInspectionSubmission: submissions ?? [] }),
  setIsGeneral: (isGeneral) => set({ isGeneral: isGeneral ?? true }),
  // setGeneralImageData: (images) => set({ generalImageData: images ?? [] }),
  // setAdminImageData: (images) => set({ adminImageData: images ?? [] }),
  setGeneralImageData: (updater) =>
    set((state) => ({
      generalImageData:
        typeof updater === 'function' ? updater(state.generalImageData) : (updater ?? []),
    })),

  setAdminImageData: (updater) =>
    set((state) => ({
      adminImageData:
        typeof updater === 'function' ? updater(state.adminImageData) : (updater ?? []),
    })),

  setAddResponsible: (add) => set({ addResponsible: add ?? false }),
  resetInspectionState: () =>
    set({
      selectedTypes: [],
      selectedTeamMembers: [],
      selectedStatus: null,
      inspectionDate: '',
      startTime: '',
      endTime: '',
      startDateTime: '',
      endDateTime: '',
      preferredTime: '1',
      location: '',
      defaultTime: 0,
      timeDif: 0,
      isHideSign: false,
      signature: '',
      fullEditorBody: '',
      adminNotesBody: '',
      msCalendarId: '',
      lstInspectionSubmission: [],
      isGeneral: true,
      generalImageData: [],
      adminImageData: [],
      addResponsible: false,
    }),
}));
