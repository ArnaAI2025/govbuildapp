import { Linking, Platform, Alert } from 'react-native'; // Import Alert from 'react-native'
import { saveIsUpdateLater, saveIsVersionUpdateOffline } from '../session/SessionManager';
import { APP_STORE, PLAY_STORE, URL } from '../constants/url';
import { navigate } from '../navigation/Index';
import { TEXTS } from '../constants/strings';
import { GET_DATA } from '../services/ApiClient';
import { MMKV } from 'react-native-mmkv';
import { recordCrashlyticsError } from '../services/CrashlyticsService';

export const storage = new MMKV();

const COOLDOWN_HOURS = 24;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

export const checkAppVersion = async (isUpdate: boolean): Promise<void> => {
  await callAPIForAppUpdate(1, isUpdate);
};

const redirectToStore = (): void => {
  const storeUrl = Platform.OS === 'ios' ? APP_STORE : PLAY_STORE;
  Linking.openURL(storeUrl ?? '').catch((err) =>
    console.error('[redirectToStore] Failed to open store:', err),
  );
};

export const mandatoryUpdateDialog = (): void => {
  Alert.alert(
    TEXTS.alertMessages.updateRequired,
    TEXTS.alertMessages.mandatoryUpdateMes,
    [
      {
        text: TEXTS.alertMessages.updateNow,
        onPress: redirectToStore,
      },
    ],
    { cancelable: false },
  );
};

export const appUpdateDialog = (flag: number): void => {
  Alert.alert(
    TEXTS.alertMessages.UpdateAlert,
    flag === 1 ? TEXTS.alertMessages.UpdateMsg : TEXTS.alertMessages.UpdateNewVersion,
    [
      {
        text: TEXTS.alertMessages.updateNow,
        onPress: redirectToStore,
      },
      {
        text: TEXTS.alertMessages.updateLatter,
        onPress: () => {
          const nextTime = Date.now() + COOLDOWN_MS;
          storage.set('nextOptionalPromptTime', nextTime.toString());
          saveIsUpdateLater(true);
          if (flag === 1) {
            if (flag === 1) navigate('DashboardDrawerScreen');
          }
        },
      },
    ],
    { cancelable: false },
  );
};

export const callAPIForAppUpdate = async (type: number, isUpdate: boolean) => {
  try {
    const payload = {
      url: URL.GET_MOBILE_APP_VERSION,
    };
    const response = await GET_DATA(payload);
    if (!response || !response?.data?.items || !Array.isArray(response?.data?.items)) {
      handleNoUpdate(isUpdate);
      return;
    }

    const hasMandatoryUpdate = response?.data?.items.some((item) => item.IsMandatory === 'true');

    const hasUpdate = response?.data?.items?.length > 0;

    if (!hasUpdate) {
      handleNoUpdate(isUpdate);
      return;
    }

    if (hasMandatoryUpdate) {
      saveIsVersionUpdateOffline(true);
      mandatoryUpdateDialog();
    } else {
      if (!isUpdate) {
        saveIsVersionUpdateOffline(false);
        appUpdateDialog(type);
      }
    }
  } catch (error) {
    console.error('[callAPIForAppUpdate] API call failed:', error);
    recordCrashlyticsError("Error in callAPIForAppUpdate:',", error);
    saveIsVersionUpdateOffline(false);
  }
};

const handleNoUpdate = (isUpdate: boolean) => {
  saveIsVersionUpdateOffline(false);
  if (isUpdate) {
    saveIsUpdateLater(false);
    navigate('DashboardDrawerScreen');
  }
};

// export const versionCheckHandler = async () => {
//   try {
//     const updateInfo = await VersionCheck.needUpdate();
//     const androidVersion = DeviceInfo.getVersion();
//     const latestAndroidVersion = '3.1.0';
//     const lastPromptDate = storage.getString('lastVersionPromptDate');

//     if (lastPromptDate) {
//       const lastDate = new Date(lastPromptDate);
//       const now = new Date();
//       const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
//       if (diffHours < 24) {
//         return;
//       }
//     }

//     if (Platform.OS === 'ios' ? updateInfo.isNeeded : androidVersion < latestAndroidVersion) {
//       Alert.alert(
//         'Update Available',
//         'A newer version of the app is available. Please update to continue.',
//         [
//           {
//             text: 'Later',
//             style: 'cancel',
//             onPress: () => {
//               (async () => {
//                 storage.set('lastVersionPromptDate', new Date().toISOString());
//               })();
//             },
//           },
//           {
//             text: 'Update',
//             onPress: () => {
//               Linking.openURL(
//                 Platform.OS === 'ios' ? updateInfo.storeUrl : 'market://details?id=com.appoffline',
//               );
//             },
//           },
//         ],
//         { cancelable: false },
//       );
//     }
//   } catch (error) {
//     console.error('Version check failed:', error);
//   }
// };
