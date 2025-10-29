import { create } from 'zustand';

interface NewFormState {
  // List data
  formData: any[];
  pageNo: number;
  hasMoreData: boolean;

  // UI states
  loading: boolean; // for first load
  isFetchingMore: boolean; // for pagination
  searchValue: string;
  selectedTypeId: string;
  selectedTagId: string;

  // Actions
  setFormData: (data: any[], reset?: boolean) => void;
  setPageNo: (page: number) => void;
  setLoading: (status: boolean) => void;
  setIsFetchingMore: (status: boolean) => void;
  setHasMoreData: (status: boolean) => void;
  setSearchValue: (value: string) => void;
  setSelectedTypeId: (id: string) => void;
  setSelectedTagId: (id: string) => void;
  resetStore: () => void;
}

export const useNewFormStore = create<NewFormState>((set) => ({
  // Initial state
  formData: [],
  pageNo: 1,
  hasMoreData: true,
  loading: false,
  isFetchingMore: false,
  searchValue: '',
  selectedTypeId: '',
  selectedTagId: '',

  // Actions
  setFormData: (data, reset = false) =>
    set((state) => ({
      formData: reset ? data : [...state.formData, ...data],
    })),
  setPageNo: (page) => set({ pageNo: page }),
  setLoading: (status) => set({ loading: status }),
  setIsFetchingMore: (status) => set({ isFetchingMore: status }),
  setHasMoreData: (status) => set({ hasMoreData: status }),
  setSearchValue: (value) => set({ searchValue: value }),
  setSelectedTypeId: (value) => set({ selectedTypeId: value }),
  setSelectedTagId: (value) => set({ selectedTagId: value }),
  resetStore: () =>
    set({
      formData: [],
      pageNo: 1,
      hasMoreData: true,
      loading: false,
      isFetchingMore: false,
      searchValue: '',
      selectedTypeId: '',
      selectedTagId: '',
    }),
}));
