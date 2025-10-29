import { create } from 'zustand';
import { LoginState } from '../utils/interfaces/zustand/ILogin';

const useLoginStore = create<LoginState>((set) => ({
  isLoading: false,
  userEmail: '',
  userPassword: '',
  showBiometricDialog: false,
  isSelectedTenant: false,
  tenantData: '',
  items: [],
  isNextScreen: false,
  buttonText: 'Proceed',
  loginData: [],
  query: '',
  // Setters
  setLoading: (isLoading) => set({ isLoading }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setUserPassword: (userPassword) => set({ userPassword }),
  setShowBiometricDialog: (show) => set({ showBiometricDialog: show }),
  setIsSelectedTenant: (selected) => set({ isSelectedTenant: selected }),
  setTenantData: (data) => set({ tenantData: data }),
  setItems: (items) => set({ items }),
  setIsNextScreen: (next) => set({ isNextScreen: next }),
  setButtonText: (text) => set({ buttonText: text }),
  setLoginData: (data) => set({ loginData: data }),
  setQuery: (query) => set({ query }),
}));

export default useLoginStore;
