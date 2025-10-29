export interface LoginState {
  isLoading: boolean;
  userEmail: string;
  userPassword: string;
  showBiometricDialog: boolean;
  isSelectedTenant: boolean;
  tenantData: string;
  items: any[];
  isNextScreen: boolean;
  buttonText: string;
  loginData: any[];
  query: string;

  // Setters
  setLoading: (isLoading: boolean) => void;
  setUserEmail: (userEmail: string) => void;
  setUserPassword: (userPassword: string) => void;
  setShowBiometricDialog: (show: boolean) => void;
  setIsSelectedTenant: (selected: boolean) => void;
  setTenantData: (data: string) => void;
  setItems: (items: any[]) => void;
  setIsNextScreen: (next: boolean) => void;
  setButtonText: (text: string) => void;
  setLoginData: (data: any[]) => void;
  setQuery: (query: string) => void;
}
