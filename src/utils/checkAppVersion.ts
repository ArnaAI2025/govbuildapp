import { Linking, Platform, Alert } from 'react-native'; // Import Alert from 'react-native'
import { saveIsUpdateLater, saveIsVersionUpdateOffline } from '../session/SessionManager';
import { APP_STORE, PLAY_STORE, URL } from '../constants/url';
import { navigate } from '../navigation/Index';
import { TEXTS } from '../constants/strings';

export const checkAppVersion = async (isUpdate: boolean) => {
  callAPIForAppUpdate(1, isUpdate);
};

const redirectMethod = () => {
  Linking.openURL(Platform.OS === 'ios' ? APP_STORE : PLAY_STORE);
};

export const mandatoryUpdateDialog = () => {
  Alert.alert(
    TEXTS.alertMessages.updateRequired,
    TEXTS.alertMessages.mandatoryUpdateMes,
    [
      {
        text: TEXTS.alertMessages.updateNow,
        onPress: () => {
          redirectMethod();
          return null;
        },
      },
    ],
    { cancelable: false },
  );
};

export const AppUpdateDialog = (flag: number) => {
  Alert.alert(
    TEXTS.alertMessages.UpdateAlert,
    flag == 1 ? TEXTS.alertMessages.UpdateMsg : TEXTS.alertMessages.UpdateNewVersion,
    [
      {
        text: TEXTS.alertMessages.updateNow,
        onPress: () => {
          redirectMethod();
          return null;
        },
      },
      {
        text: TEXTS.alertMessages.updateLatter,
        onPress: () => {
          saveIsUpdateLater(true);
          if (flag == 1) {
            navigate('HomeScreen');
          }
          return null;
        },
      },
    ],
    { cancelable: false },
  );
};

export const callAPIForAppUpdate = (type: number, isUpdate: boolean) => {
  var isNeedUpdate = false;
  var isMandatoryUpdate = false;
  var data;

  // const payload={url:URL.GET_MOBILE_APP_VERSION}
  // const Response = GET_DATA(payload);

  fetch(URL.GET_MOBILE_APP_VERSION, {
    method: 'GET',
  })
    .then((response) => response.json())
    //If response is in json then in success
    .then((responseJson) => {
      console.log('respo----->>>>>', responseJson);

      if (
        Object.prototype.hasOwnProperty.call(responseJson, 'items') &&
        responseJson.items != null &&
        responseJson.items != ''
      ) {
        if (responseJson.items.length > 0) {
          isNeedUpdate = true;
          data = responseJson.items.filter(function (item) {
            return item.IsMandatory == 'true';
          });
          if (data.length > 0) {
            isMandatoryUpdate = true;
          }
        }

        if (isNeedUpdate) {
          if (isMandatoryUpdate) {
            saveIsVersionUpdateOffline(true);
            mandatoryUpdateDialog();
          } else {
            if (!isUpdate) {
              saveIsVersionUpdateOffline(false);
              //   optionalUpdateDialog(type);
            }
          }
        }
      } else {
        saveIsVersionUpdateOffline(false);
        if (isUpdate) {
          saveIsUpdateLater(false);
          navigate('HomeScreen');
        }
      }
    });
};
