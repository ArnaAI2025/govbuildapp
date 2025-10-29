import { MMKV } from 'react-native-mmkv';
import { SESSION_STORAGE } from '../constants/sessionStrings';
import { createJSONStorage } from 'zustand/middleware';

// Create MMKV instance
export const storage = new MMKV();

// For zustand storage
export const zustandMMKVStorage = createJSONStorage(() => ({
  getItem: (key) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
  removeItem: (key) => {
    storage.delete(key);
  },
}));

// Access Token
export const saveAccessToken = (value: string) => {
  if (typeof value === 'string') {
    storage.set(SESSION_STORAGE.access_token, value);
  } else {
    console.warn('Invalid token type');
  }
};

export const getAccessToken = (): string | null => {
  return storage.getString(SESSION_STORAGE.access_token) || null;
};

// Base URL
export const saveBaseUrl = (value: string) => {
  storage.set(SESSION_STORAGE.base_url, value);
};

export const getBaseUrl = (): string | null => {
  return storage.getString(SESSION_STORAGE.base_url) || null;
};

// User Role
export const saveUserRole = (value: string) => {
  storage.set(SESSION_STORAGE.user_role, value);
};

export const saveLoggedInUserId = (value: string) => {
  storage.set(SESSION_STORAGE.user_Id, value);
};

export const getUserRole = (): string => {
  return storage.getString(SESSION_STORAGE.user_role) || '';
};
export const getLoggedInUserId = (): string => {
  return storage.getString(SESSION_STORAGE.user_Id) || '';
};
//License User Role
export const getLicenseUserRole = (): string => {
  return storage.getString(SESSION_STORAGE.LICENSE_USER_ROLE) || '';
};

export const saveLicenseUserRole = (value: string) => {
  storage.set(SESSION_STORAGE.LICENSE_USER_ROLE, value);
};

// APP UPDATE
export const saveIsUpdateLater = (value: boolean) => {
  storage.set(SESSION_STORAGE.IS_UPDATE_LATER, value);
};

// Get boolean
export const getIsUpdateLater = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.IS_UPDATE_LATER) || false;
};

// Save offline version update flag
export const saveIsVersionUpdateOffline = (value: boolean) => {
  storage.set(SESSION_STORAGE.IS_OFFLINE_UPDATE, value);
};

// Get offline version update flag
export const getIsVersionUpdateOffline = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.IS_OFFLINE_UPDATE) || false;
};

// Save offline UTC date (pass the date from caller)
export const saveOfflineUtcDate = (utcDate: string) => {
  try {
    storage.set(SESSION_STORAGE.OFFLINE_UTC_DATE, utcDate);
    console.log('Offline UTC time stored:', utcDate);
  } catch (error) {
    console.error('Error storing offline UTC time:', error);
  }
};

// Retrieve stored offline UTC date
export const getOfflineUtcDate = (): string | null => {
  return storage.getString(SESSION_STORAGE.OFFLINE_UTC_DATE) || null;
};

// Set wasOnline state in MMKV
export const setWasOnline = (isOnline: boolean) => {
  try {
    storage.set(SESSION_STORAGE.WAS_ONLINE, isOnline);
    console.log('Stored wasOnline in MMKV:', isOnline);
  } catch (error) {
    console.error('Error storing wasOnline:', error);
  }
};

// Get wasOnline state from MMKV
export const getWasOnline = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.WAS_ONLINE) ?? true; // Default to true
};

//  case/license navigation
export const saveNavigationState = (value: boolean) => {
  storage.set(SESSION_STORAGE.NAV_STATE, String(value)); // store as string
};

export const getNavigationState = (): boolean => {
  const value = storage.getString(SESSION_STORAGE.NAV_STATE);
  return value === 'true'; // convert back to boolean
};
