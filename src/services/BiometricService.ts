import * as LocalAuthentication from 'expo-local-authentication';
import { useBiometricStore } from '../store/biometricStore';
import { ToastService } from '../components/common/GlobalSnackbar';
import { COLORS } from '../theme/colors';
import { TEXTS } from '../constants/strings';

export const loginWithBiometrics = async (onSuccess: () => void, onFailure?: () => void) => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (hasHardware && isEnrolled && supportedTypes.length > 0) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: TEXTS.biometric.authenticateToContinue,
      fallbackLabel: TEXTS.biometric.enterPIN,
      cancelLabel: TEXTS.alertMessages.cancel,
      disableDeviceFallback: false,
    });

    if (result.success) {
      useBiometricStore.getState().setBiometricStatus(true);
      useBiometricStore.getState().setSessionPrompted(true);
      onSuccess();
    } else {
      onFailure?.();
    }
  } else {
    ToastService.show(TEXTS.biometric.biometricAuthentication, COLORS.ERROR);
    onFailure?.();
  }
};

export const biometricVerification = async (): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (hasHardware && isEnrolled && supportedTypes.length > 0) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: TEXTS.biometric.verifyIdentity,
        fallbackLabel: TEXTS.biometric.usePasscode,
        cancelLabel: TEXTS.alertMessages.cancel,
        disableDeviceFallback: false,
      });

      if (result.success) {
        ToastService.show(TEXTS.biometric.authenticationSuccessfully, COLORS.SUCCESS_GREEN);
        return true;
      } else {
        ToastService.show(TEXTS.biometric.authenticationFailed, COLORS.ERROR);
        return false;
      }
    } else {
      ToastService.show(TEXTS.biometric.biometricNotAvailable, COLORS.ERROR);
      return false;
    }
  } catch (err) {
    ToastService.show(
      `Biometric Error: ${(err as Error)?.message || TEXTS.biometric.verificationFailed}`,
      COLORS.ERROR,
    );
    return false;
  }
};
