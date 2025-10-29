export interface AuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expireTime: number;
  username: string;
  password: string;
  value: any;
  isLoggedIn: boolean;
  adminRole: any;
}

export interface OfflineAuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expireTime: number;
  username: string;
  password: string;
  value: any;
  isLoggedIn: boolean;
  adminRole: any;
}

export interface AuthState {
  authData: AuthData | null;
  offlineAuthData: OfflineAuthData | null;
  sessionTimeout: boolean;
  setAuthData: (data: AuthData) => void;
  setOfflineAuthData: (data: OfflineAuthData) => void;
  setSessionTimeout: (flag: boolean) => void;
  logout: () => void;
}

export interface BiometricStore extends BiometricState {
  hasPromptedBiometricThisSession: boolean;
  setSessionPrompted: (status: boolean) => void;
}

export interface BiometricState {
  isBiometricEnabled: boolean;
  setBiometricStatus: (status: boolean) => void;
  // New in-memory flag for current session biometric prompt
  hasPromptedBiometricThisSession: boolean;
  setSessionPrompted: (status: boolean) => void;
}
