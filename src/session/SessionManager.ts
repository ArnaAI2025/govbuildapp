import { MMKV } from 'react-native-mmkv';
import { SESSION_STORAGE } from '../constants/sessionStrings';
import { createJSONStorage } from 'zustand/middleware';
import { recordCrashlyticsError } from '../services/CrashlyticsService';
import { getEncryptionKey } from '../utils/secureStorage';

// SECURE STORAGE (Encrypted MMKV)
let secureStorage: MMKV | null = null;

export async function initializeSecureStorage() {
  const key = await getEncryptionKey();

  secureStorage = new MMKV({
    id: 'secure-storage',
    encryptionKey: key,
  });

  console.log('Secure MMKV initialized with Keychain-managed key');
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

export const saveAccessToken = (value: string) => {
  getSecureStorage().set(SESSION_STORAGE.access_token, value);
};

export const getAccessToken = (): string | null => {
  const value = secureStorage?.getString(SESSION_STORAGE.access_token);
  return getValueOrLog(value, 'access_token', null);
};

export const saveBaseUrl = (value: string) => {
  secureStorage?.set(SESSION_STORAGE.base_url, value);
};

export const getBaseUrl = (): string | null => {
  const value = secureStorage?.getString(SESSION_STORAGE.base_url);
  return getValueOrLog(value, 'base_url', null);
};

export const saveUserRole = (value: string) => {
  secureStorage?.set(SESSION_STORAGE.user_role, value);
};

export const getUserRole = (): string => {
  const value = secureStorage?.getString(SESSION_STORAGE.user_role);
  return getValueOrLog(value, 'user_role', '');
};

export const saveLoggedInUserId = (value: string) => {
  secureStorage?.set(SESSION_STORAGE.user_Id, value);
};

export const getLoggedInUserId = (): string => {
  return secureStorage?.getString(SESSION_STORAGE.user_Id) || '';
};

export const saveLicenseUserRole = (value: string) => {
  secureStorage?.set(SESSION_STORAGE.LICENSE_USER_ROLE, value);
};

export const getLicenseUserRole = (): string => {
  return secureStorage?.getString(SESSION_STORAGE.LICENSE_USER_ROLE) || '';
};

export const saveIsUpdateLater = (value: boolean) => {
  storage.set(SESSION_STORAGE.IS_UPDATE_LATER, value);
};

export const getIsUpdateLater = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.IS_UPDATE_LATER) || false;
};

export const saveIsVersionUpdateOffline = (value: boolean) => {
  storage.set(SESSION_STORAGE.IS_OFFLINE_UPDATE, value);
};

export const getIsVersionUpdateOffline = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.IS_OFFLINE_UPDATE) || false;
};

export const saveOfflineUtcDate = (utcDate: string) => {
  try {
    storage.set(SESSION_STORAGE.OFFLINE_UTC_DATE, utcDate);
  } catch (error) {
    recordCrashlyticsError('Error storing offline UTC time:', error);
  }
};

export const getOfflineUtcDate = (): string | null => {
  return storage.getString(SESSION_STORAGE.OFFLINE_UTC_DATE) || null;
};

export const setWasOnline = (isOnline: boolean) => {
  try {
    storage.set(SESSION_STORAGE.WAS_ONLINE, isOnline);
  } catch (error) {
    recordCrashlyticsError('Error storing wasOnline:', error);
  }
};

export const getWasOnline = (): boolean => {
  return storage.getBoolean(SESSION_STORAGE.WAS_ONLINE) ?? true;
};

export const saveNavigationState = (value: boolean) => {
  storage.set(SESSION_STORAGE.NAV_STATE, String(value));
};

export const getNavigationState = (): boolean => {
  return storage.getString(SESSION_STORAGE.NAV_STATE) === 'true';
};

export const saveUserPassword = (password: string) => {
  secureStorage?.set(SESSION_STORAGE.user_password, password);
};

export const getUserPassword = () => {
  return secureStorage?.getString(SESSION_STORAGE.user_password) || '';
};
const getValueOrLog = (value: any, keyName: string, defaultValue: any = null) => {
  if (value === null || value === undefined) {
    console.warn(`Value for '${keyName}' is null or undefined`);
    return defaultValue;
  }
  return value;
};
