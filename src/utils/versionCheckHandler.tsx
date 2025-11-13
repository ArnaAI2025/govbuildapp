// src/utils/versionCheckHandler.js
import { Alert, Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { MMKV } from 'react-native-mmkv';
import VersionCheck from 'react-native-version-check';

export const storage = new MMKV();

const VersionCheckHandler = async () => {
  try {
    const updateInfo = await VersionCheck.needUpdate();
    const androidVersion = DeviceInfo.getVersion();
    const latestAndroidVersion = "3.1.0";
    const lastPromptDate = storage.getString('lastVersionPromptDate');

    if (lastPromptDate) {
      const lastDate = new Date(lastPromptDate);
      const now = new Date();
      const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      if (diffHours < 24) {
        return;
      }
    }

    if (Platform.OS === 'ios' ? updateInfo.isNeeded : androidVersion < latestAndroidVersion) {
      Alert.alert(
        'Update Available',
        'A newer version of the app is available. Please update to continue.',
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: async () => {
              storage.set('lastVersionPromptDate', new Date().toISOString());
            },
          },
          {
            text: 'Update',
            onPress: () =>
              Linking.openURL(
                Platform.OS === 'ios'
                  ? updateInfo.storeUrl
                  : 'market://details?id=com.appoffline'
              ),
          },
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
};

export default VersionCheckHandler;
