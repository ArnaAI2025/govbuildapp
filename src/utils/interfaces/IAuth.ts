// URL object used in tenant configuration
export interface TenantURL {
  text: string;
  url: string;
}

// Single team member (when user is a team member)
export interface TeamMember {
  color: string;
  contentItemId: string;
  isAzureActiveDirectoryUser: boolean;
  isNewAppointment: boolean;
  isShowAvailability: boolean;
  isShowRequestAppointment: boolean;
  lastName: string;
  name: string;
  userId: string;
}

// Role response from backend
export interface AdminRole {
  isAdmin: boolean;
  isTeamMember: boolean;
  teamMember?: TeamMember; // optional if not a team member
}

// Full tenant object returned from tenant list API
export interface Tenant {
  contentItemId: string;
  displayText: string;
  isActive: boolean;
  clientID: string;
  clientSecret: string;
  authenticationAppId?: string;
  authenticationCallbackPathAndroid?: string;
  authenticationCallbackPathiOS?: string;
  authenticationDisplayName?: string;
  authenticationTenantId?: string;
  isAzureActiveDirectoryEnabled?: boolean;
  uRL: TenantURL;
}

// Same as Tenant but used as selected tenant in login flow
// We keep it separate for clarity (you can merge if preferred)
export type TenantData = Tenant;

// Final payload stored in auth store & secure storage
export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expireTime: number;
  username: string;
  password: string;
  value: TenantData;
  isLoggedIn: boolean;
  adminRole?: AdminRole; // Set after role validation
}

// Parameters for login API call
export interface LoginParams {
  username: string;
  password: string;
  tenant: TenantData;
}

// Parameters passed to role validation / final auth setup
export interface LoginUserRoleParams {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expireTime: number;
  value: TenantData;
  isEnableBiometrics: boolean;
  username: string;
  password: string;
}

// Navigation & state setters for final dashboard redirect
export interface HandleLoginNavigationParams {
  loginData: AuthPayload;
  setAuthData: (data: AuthPayload) => void;
  setOfflineAuthData: (data: AuthPayload) => void;
  setShowBiometricDialog: (visible: boolean) => void;
}
