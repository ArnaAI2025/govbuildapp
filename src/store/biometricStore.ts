import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '../session/SessionManager';
import type { BiometricState } from '../utils/interfaces/zustand/IAuth';

export const useBiometricStore = create<BiometricState>()(
  persist(
    (set) => ({
      isBiometricEnabled: false,
      setBiometricStatus: (status) => set({ isBiometricEnabled: status }),
      hasPromptedBiometricThisSession: false,
      setSessionPrompted: (status) => set({ hasPromptedBiometricThisSession: status }),
    }),
    {
      name: 'biometric-storage',
      storage: zustandMMKVStorage,
      partialize: (state) => ({
        isBiometricEnabled: state.isBiometricEnabled,
      }),
    },
  ),
);
