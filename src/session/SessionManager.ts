import { MMKV } from 'react-native-mmkv';
import { SESSION_STORAGE } from '../constants/sessionStrings';
import { createJSONStorage } from 'zustand/middleware';
import { recordCrashlyticsError } from '../services/CrashlyticsService';
import { getEncryptionKey } from '../utils/secureStorage';

// SECURE STORAGE (Encrypted MMKV)
let secureStorage: MMKV | null = null;

export async function initializeSecureStorage() {
  try {
    const key = await getEncryptionKey();

    secureStorage = new MMKV({
      id: 'secure-storage',
      encryptionKey: key,
    });
  } catch (error) {
    recordCrashlyticsError('Failed to initialize secure MMKV storage', error);
    throw error;
  }
}

export function getSecureStorage(): MMKV {
  if (!secureStorage) {
    throw new Error('SecureStorage not initialized! Call initializeSecureStorage() in App.tsx');
  }
  return secureStorage;
}

// NORMAL STORAGE (Non-Sensitive)
export const storage = new MMKV({
  id: 'normal-storage',
});

export const zustandMMKVStorage = createJSONStorage(() => ({
  getItem: (key) => {
    return storage.getString(key) ?? null;
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
  removeItem: (key) => {
    storage.delete(key);
  },
}));

const safeSecureSet = (key: string, value: string | boolean) => {
  try {
    getSecureStorage().set(key, value as string | number | boolean);
  } catch (error) {
    recordCrashlyticsError(`Failed to write secure value for key: ${key}`, error);
  }
};

const safeSecureGetString = (key: string, fallback: string | null = null): string | null => {
  try {
    return secureStorage?.getString(key) ?? fallback;
  } catch (error) {
    recordCrashlyticsError(`Failed to read secure string for key: ${key}`, error);
    return fallback;
  }
};

export const saveAccessToken = (value: string) => {
  safeSecureSet(SESSION_STORAGE.access_token, value);
};

export const getAccessToken = (): string | null => {
  return safeSecureGetString(SESSION_STORAGE.access_token, null);
};

export const saveBaseUrl = (value: string) => {
  safeSecureSet(SESSION_STORAGE.base_url, value);
};

export const getBaseUrl = (): string | null => {
  return safeSecureGetString(SESSION_STORAGE.base_url, null);
};

export const saveUserRole = (value: string) => {
  safeSecureSet(SESSION_STORAGE.user_role, value);
};

export const getUserRole = (): string => {
  return safeSecureGetString(SESSION_STORAGE.user_role, '') ?? '';
};

export const saveLoggedInUserId = (value: string) => {
  safeSecureSet(SESSION_STORAGE.user_Id, value);
};

export const getLoggedInUserId = (): string => {
  return safeSecureGetString(SESSION_STORAGE.user_Id, '') ?? '';
};

export const saveLicenseUserRole = (value: string) => {
  safeSecureSet(SESSION_STORAGE.LICENSE_USER_ROLE, value);
};

export const getLicenseUserRole = (): string => {
  return safeSecureGetString(SESSION_STORAGE.LICENSE_USER_ROLE, '') ?? '';
};

export const saveIsUpdateLater = (value: boolean) => {
  try {
    storage.set(SESSION_STORAGE.IS_UPDATE_LATER, value);
  } catch (error) {
    recordCrashlyticsError('Error storing IS_UPDATE_LATER flag:', error);
  }
};

export const getIsUpdateLater = (): boolean => {
  try {
    const stored = storage.getBoolean(SESSION_STORAGE.IS_UPDATE_LATER);
    return stored ?? false;
  } catch (error) {
    recordCrashlyticsError('Error reading IS_UPDATE_LATER flag:', error);
    return false;
  }
};

export const saveIsVersionUpdateOffline = (value: boolean) => {
  try {
    storage.set(SESSION_STORAGE.IS_OFFLINE_UPDATE, value);
  } catch (error) {
    recordCrashlyticsError('Error storing IS_OFFLINE_UPDATE flag:', error);
  }
};

export const getIsVersionUpdateOffline = (): boolean => {
  try {
    const stored = storage.getBoolean(SESSION_STORAGE.IS_OFFLINE_UPDATE);
    return stored ?? false;
  } catch (error) {
    recordCrashlyticsError('Error reading IS_OFFLINE_UPDATE flag:', error);
    return false;
  }
};

export const saveOfflineUtcDate = (utcDate: string) => {
  try {
    storage.set(SESSION_STORAGE.OFFLINE_UTC_DATE, utcDate);
  } catch (error) {
    recordCrashlyticsError('Error storing offline UTC time:', error);
  }
};

export const getOfflineUtcDate = (): string | null => {
  try {
    return storage.getString(SESSION_STORAGE.OFFLINE_UTC_DATE) ?? null;
  } catch (error) {
    recordCrashlyticsError('Error reading offline UTC time:', error);
    return null;
  }
};

export const setWasOnline = (isOnline: boolean) => {
  try {
    storage.set(SESSION_STORAGE.WAS_ONLINE, isOnline);
  } catch (error) {
    recordCrashlyticsError('Error storing wasOnline:', error);
  }
};

export const getWasOnline = (): boolean => {
  try {
    const stored = storage.getBoolean(SESSION_STORAGE.WAS_ONLINE);
    return stored ?? true;
  } catch (error) {
    recordCrashlyticsError('Error reading wasOnline:', error);
    return true;
  }
};

export const saveNavigationState = (value: boolean) => {
  try {
    storage.set(SESSION_STORAGE.NAV_STATE, String(value));
  } catch (error) {
    recordCrashlyticsError('Error storing navigation state:', error);
  }
};

export const getNavigationState = (): boolean => {
  try {
    return storage.getString(SESSION_STORAGE.NAV_STATE) === 'true';
  } catch (error) {
    recordCrashlyticsError('Error reading navigation state:', error);
    return false;
  }
};

export const saveUserPassword = (password: string) => {
  safeSecureSet(SESSION_STORAGE.user_password, password);
};

export const getUserPassword = () => {
  return safeSecureGetString(SESSION_STORAGE.user_password, '') ?? '';
};
