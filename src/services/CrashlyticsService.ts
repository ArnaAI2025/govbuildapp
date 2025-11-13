import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Initialize Crashlytics and handle global JS errors
 */
export const initializeCrashlytics = () => {
  try {
    if (__DEV__) {
      crashlytics().setCrashlyticsCollectionEnabled(false); // disable in dev
    } else {
      crashlytics().setCrashlyticsCollectionEnabled(true); // enable for TestFlight/Production
    }

    // Set global JS error handler
    const defaultHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      crashlytics().recordError(error);
      crashlytics().log(`JS Error: ${error.message}`);
      if (isFatal) {
        crashlytics().crash();
      }
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });

    console.log('Crashlytics initialized');
  } catch (err) {
    console.log('Crashlytics init error:', err);
  }
};

/**
 * Helper for logging messages to Crashlytics
 */
export const logCrashlyticsEvent = (message: string) => {
  crashlytics().log(message);
  console.log('Crashlytics Log:', message);
};

/**
 * Record handled errors
 */
export const recordCrashlyticsError = (message: string, error: any) => {
  crashlytics().log(__DEV__ ? `Development Mode:- ${message}:- ${error}` : `${message}:- ${error}`);
  crashlytics().recordError(error);
};
