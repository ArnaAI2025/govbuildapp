import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '../session/SessionManager';
import type { AuthData, AuthState, OfflineAuthData } from '../utils/interfaces/zustand/IAuth';

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authData: null,
      offlineAuthData: null,
      sessionTimeout: false,

      setAuthData: (data: AuthData) => set({ authData: { ...data, isLoggedIn: true } }),

      setOfflineAuthData: (data: OfflineAuthData) =>
        set({ offlineAuthData: { ...data, isLoggedIn: true } }),

      setSessionTimeout: (flag: boolean) => set({ sessionTimeout: flag }), // if required we can use

      logout: () => {
        set({ authData: null, sessionTimeout: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: zustandMMKVStorage,
    },
  ),
);

export default useAuthStore;
