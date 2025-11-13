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
import { getIsUpdateLater, getIsVersionUpdateOffline, storage } from './src/session/SessionManager';
import { useNetworkStatus } from './src/utils/checkNetwork';
import { checkAppVersion, mandatoryUpdateDialog } from './src/utils/checkAppVersion';

const VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const App = () => {
  if(__DEV__) LogBox.ignoreAllLogs(true);
  const [isAppReady, setAppReady] = useState(false);
  const { isNetworkAvailable } = useNetworkStatus();

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
    const handleVersionCheck = async () => {
      const lastCheckTimestamp = storage.getNumber('lastVersionCheckTimestamp') || 0;
      const now = Date.now();
      const isUpdate = getIsUpdateLater();
      if (now - lastCheckTimestamp < VERSION_CHECK_INTERVAL) {
        return;
      }
      if (typeof isUpdate !== 'undefined') {
        if (isNetworkAvailable) {
          try {
            await checkAppVersion(isUpdate);
            storage.set('lastVersionCheckTimestamp', now);
          } catch (error) {
            ToastService.show(`Failed to check for updates ${error}`, COLORS.ERROR);
          }
        } else {
          const isVersion = getIsVersionUpdateOffline();
          if (isVersion) {
            mandatoryUpdateDialog();
          }
        }
      }
    };

    handleVersionCheck();
  }, [isNetworkAvailable]);

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
