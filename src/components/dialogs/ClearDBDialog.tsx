import { Alert } from 'react-native';
import { deleteAllRecords } from '../../database/DatabaseService';
import { useBiometricStore } from '../../store/biometricStore';
import { TEXTS } from '../../constants/strings';

export function clearDBDialog(callLoginAPI: any, MsSignInAsync: any, type: number) {
  const setBiometricStatus = useBiometricStore.getState().setBiometricStatus;

  Alert.alert(
    TEXTS.alertMessages.anotherUserLogin,
    TEXTS.alertMessages.anotherUserLoginMsg,
    [
      {
        text: TEXTS.alertMessages.cancel,
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: TEXTS.alertMessages.confirm,
        onPress: () => {
          setBiometricStatus(false);
          deleteAllRecords();
          if (type === 1) {
            MsSignInAsync();
          } else {
            callLoginAPI(1);
          }
        },
      },
    ],
    { cancelable: false },
  );
}
