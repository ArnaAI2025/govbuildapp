import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation/Index';
import { loadFonts } from './src/utils/loadFonts';
import { LogBox } from 'react-native';
import { GlobalSnackbarProvider } from './src/components/common/GlobalSnackbar';
import 'react-native-get-random-values';

const App = () => {
  LogBox.ignoreAllLogs();
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await loadFonts();
      } catch (e) {
        console.log('Font loading error:-->', e);
      } finally {
        setAppReady(true);
      }
    };

    // Background sync setup
    // BackgroundFetch.configure(
    //   {
    //     minimumFetchInterval: 15,
    //     stopOnTerminate: false,
    //     enableHeadless: true,
    //     startOnBoot: true,
    //   },
    //   async (taskId: string) => {
    //     console.log("[BackgroundFetch] taskId:", taskId);
    //     await SyncService.processSyncQueue(() =>
    //       console.log("Offline items count updated")
    //     );
    //     BackgroundFetch.finish(taskId);
    //   },
    //   (error) => {
    //     console.error("[BackgroundFetch] failed to start:", error);
    //   }
    // );
    prepare();
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
