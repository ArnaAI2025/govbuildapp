import { create } from 'zustand';

interface DashboardState {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoggedIn: false,
  token: null,
  login: (token) => set({ isLoggedIn: true, token }),
  logout: () => set({ isLoggedIn: false, token: null }),
}));
