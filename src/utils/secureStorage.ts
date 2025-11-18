import * as Keychain from 'react-native-keychain';
import { SESSION_STORAGE } from '../constants/sessionStrings';

export const saveLoginCredentials = async (email: string, password: string) => {
  try {
    await Keychain.setGenericPassword(email, password, {
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch (e) {
    console.log('Keychain Save Error:', e);
  }
};

export const getLoginCredentials = async () => {
  try {
    const creds = await Keychain.getGenericPassword();
    return creds || null;
  } catch (e) {
    console.log('Keychain Read Error:', e);
    return null;
  }
};

export const removeLoginCredentials = async () => {
  try {
    await Keychain.resetGenericPassword();
  } catch (e) {
    console.log('Keychain Remove Error:', e);
  }
};

export async function getEncryptionKey() {
  const saved = await Keychain.getGenericPassword({ service: SESSION_STORAGE.STORAGE_KEY });
  if (saved) return saved.password;
  const newKey = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await Keychain.setGenericPassword('mmkv', newKey, { service: SESSION_STORAGE.STORAGE_KEY });
  return newKey;
}
