export interface LoginUserRoleParams {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expireTime: number;
  value: any; // Can replace with a more specific type
  isEnableBiometrics: boolean;
  username: string;
  pass: string;
}

export interface LoginParams {
  username: string;
  pass: string;
  value: string;
}

// Login service interface
export interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
  [key: string]: any;
}

export interface validateUserRole {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expireTime: number;
  value: any;
  isEnableBiometrics: boolean;
  username: string;
  password: string;
  setAuthData: Function;
  setOfflineAuthData: Function;
  setLoginData: Function;
  navigate: Function;
  setShowBiometricDialog: Function;
}
interface TenantURL {
  text: string;
  url: string;
}

export interface TenantData {
  authenticationAppId: string;
  authenticationCallbackPathAndroid: string;
  authenticationCallbackPathiOS: string;
  authenticationDisplayName: string;
  authenticationTenantId: string;
  clientID: string;
  clientSecret: string;
  contentItemId: string;
  displayText: string;
  isActive: boolean;
  isAzureActiveDirectoryEnabled: boolean;
  uRL: TenantURL;
}

interface TeamMember {
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

interface AdminRole {
  isAdmin: boolean;
  isTeamMember: boolean;
  teamMember: TeamMember;
}

export interface AuthPayload {
  access_token: string;
  adminRole: AdminRole;
  expireTime: number;
  isLoggedIn: boolean;
  password: string;
  refresh_token: string;
  token_type: string;
  username: string;
  value: TenantData;
}
