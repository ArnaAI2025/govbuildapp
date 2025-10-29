import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '../session/SessionManager';

export interface OfflineState {
  syncSuccessfull: boolean;
  setsyncSuccessfull: (status: boolean) => void;
}

const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      syncSuccessfull: false,
      setsyncSuccessfull: (status: boolean) => set({ syncSuccessfull: status }),
    }),
    {
      name: 'offline-storage',
      storage: zustandMMKVStorage,
    },
  ),
);

export default useOfflineStore;
