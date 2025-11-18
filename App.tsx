import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation/Index';
import { loadFonts } from './src/utils/loadFonts';
import { LogBox } from 'react-native';
import { GlobalSnackbarProvider, ToastService } from './src/components/common/GlobalSnackbar';
import 'react-native-get-random-values';
import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { initializeCrashlytics } from './src/services/CrashlyticsService';
import Config from 'react-native-config';
import { COLORS } from './src/theme/colors';
import { getIsUpdateLater, getIsVersionUpdateOffline, initializeSecureStorage } from './src/session/SessionManager';
import { useNetworkStatus } from './src/utils/checkNetwork';
import { checkAppVersion, mandatoryUpdateDialog } from './src/utils/checkAppVersion';

const App = () => {
  if (__DEV__) LogBox.ignoreAllLogs(true);
  const [isAppReady, setAppReady] = useState(false);
  const { isNetworkAvailable } = useNetworkStatus();
  initializeSecureStorage()
  useEffect(() => {
    const prepare = async () => {
      try {
        await loadFonts();
      } catch (e) {
        ToastService.show(
          'Failed to load fonts. Some UI elements may not display correctly.',
          COLORS.ERROR,
        );
        console.error('Font loading error:', e);
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (
      !Config.API_KEY ||
      !Config.AUTH_DOMAIN ||
      !Config.PROJECT_ID ||
      !Config.STORAGE_BUCKET ||
      !Config.MESSAGING_SENDER_ID ||
      !Config.APP_ID
    ) {
      ToastService.show(
        'Firebase configuration is incomplete. Some features may not work.',
        COLORS.ERROR,
      );
      console.error('Firebase configuration is incomplete');
      return;
    }
    try {
      const firebaseConfig = {
        apiKey: Config.API_KEY,
        authDomain: Config.AUTH_DOMAIN,
        projectId: Config.PROJECT_ID,
        storageBucket: Config.STORAGE_BUCKET,
        messagingSenderId: Config.MESSAGING_SENDER_ID,
        appId: Config.APP_ID,
      };
      getApps().length ? getApp() : initializeApp(firebaseConfig);
      initializeCrashlytics();
    } catch (e) {
      ToastService.show(
        'Failed to initialize Firebase. Some features may be unavailable.',
        COLORS.ERROR,
      );
      console.error('Firebase initialization error:', e);
    }
  }, []);

useEffect(() => {
  const handleVersionCheckOnAppStart = async () => {
    const isUpdateLater = getIsUpdateLater();
    const isMandatoryOffline = getIsVersionUpdateOffline();

    if (!isNetworkAvailable && isMandatoryOffline) {
      mandatoryUpdateDialog();
      return;
    }

    if (isNetworkAvailable) {
      await checkAppVersion(isUpdateLater);
    }
  };

  handleVersionCheckOnAppStart();
}, []);

  if (!isAppReady) return null;

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <GlobalSnackbarProvider>
          <Navigation />
        </GlobalSnackbarProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
