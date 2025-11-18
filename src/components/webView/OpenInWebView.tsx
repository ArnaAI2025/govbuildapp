import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity, BackHandler } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import Loader from '../common/Loader';
import ScreenWrapper from '../common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import { WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { getAccessToken, getBaseUrl } from '../../session/SessionManager';
import {
  CONNECTIVITY_THRESHOLD,
  NETWORK_TIMEOUT,
  QUERY_PARAMS,
  TEST_URL,
  URL,
} from '../../constants/url';
import { fetchCaseOrLicenseById } from '../../services/WebViewService';
import type { RootStackParamList } from '../../navigation/Types';
import type { WebViewState } from '../../utils/interfaces/IComponent';
import { isTokenTimeOut, TokenRefreshGlobal } from '../../session/TokenRefresh';
import { ToastService } from '../common/GlobalSnackbar';
import { goBack } from '../../navigation/Index';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

type OpenInWebViewScreenProps = NativeStackScreenProps<RootStackParamList, 'OpenInWebView'>;

// Utility Functions
const constructWebViewUrl = (baseUrl: string, webUrl: string, path: string): string => {
  const endPoint = path.includes('?') ? '&' : '?';
  const encodedPath = encodeURIComponent(path);
  return `${baseUrl}${webUrl}${endPoint}${QUERY_PARAMS.HIDE_HEADER_FOOTER}&${QUERY_PARAMS.HIDE_LEFT_MENU}&returnUrl=${encodedPath}`;
};

const checkConnectionQuality = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
    const startTime = Date.now();
    const response = await fetch(TEST_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Connection test failed');
    const duration = Date.now() - startTime;
    console.log('Connection duration:', duration);
    return duration > CONNECTIVITY_THRESHOLD;
  } catch (error) {
    recordCrashlyticsError('Network check error:', error);
    console.error('Network check error:', error);
    return true; // Assume low connectivity on error
  }
};

// Error Component
const ErrorComponent: React.FC<{
  isConnected: boolean | null;
  isLowConnectivity: boolean;
  onRetry: () => void;
}> = ({ isConnected, isLowConnectivity, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      {isConnected === false
        ? 'No internet connection. Please check your network settings.'
        : isLowConnectivity
          ? 'Poor connection quality. Please try again.'
          : 'Authentication error. Please try again.'}
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const OpenInWebView: React.FC<OpenInWebViewScreenProps> = ({ navigation, route }) => {
  const { param: path = '', title = 'Web View', isNotSkipScreen = false } = route.params ?? {};
  const [state, setState] = useState<WebViewState>({
    url: '',
    accessToken: '',
    isLoadingAPI: true,
    isWebViewLoading: false,
    isAlertDisplayed: false,
    isConnected: false,
    isLowConnectivity: false,
    showError: false,
  });
  const [canGoBack, setCanGoBack] = useState(false); // Track if WebView can go back
  const webViewRef = useRef<WebView>(null);
  const handleCustomBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    } else {
      navigation.goBack();
    }
  };
  // Debounced network check
  const debouncedCheckConnection = useCallback(async () => {
    const isLow = await checkConnectionQuality();
    setState((prev) => ({
      ...prev,
      isLowConnectivity: isLow,
      showError: isLow,
    }));
  }, []);

  // Network state listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      if (!netState.isConnected) {
        setState((prev) => ({
          ...prev,
          showError: true,
          isLoadingAPI: false,
          isConnected: false,
          isWebViewLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          showError: false, // Hide error immediately on reconnect to avoid brief auth message
        }));
        debouncedCheckConnection();
      }
    });
    return () => unsubscribe();
  }, [debouncedCheckConnection]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // Initialize WebView
  const initialize = useCallback(async () => {
    try {
      const [token, baseUrl, netState] = await Promise.all([
        getAccessToken(),
        getBaseUrl(),
        NetInfo.fetch(),
      ]);

      if (!netState.isConnected) {
        setState((prev) => ({ ...prev, isLoadingAPI: false }));
        Alert.alert('Offline', 'Content not available offline.', [
          { text: 'OK', onPress: () => goBack() },
        ]);
        return;
      }

      if (!baseUrl || !URL?.WEB_URL) {
        throw new Error('Base URL or WEB_URL is undefined');
      }

      const constructedUrl = constructWebViewUrl(baseUrl, URL.WEB_URL, path);
      setState((prev) => ({
        ...prev,
        url: constructedUrl,
        accessToken: token ?? '',
        isLoadingAPI: false,
        isWebViewLoading: true,
      }));
    } catch (error) {
      recordCrashlyticsError('Initialization error:', error);
      console.error('Initialization error:', error);
      setState((prev) => ({ ...prev, isLoadingAPI: false, showError: true }));
      Alert.alert('Error', 'Failed to load content. Please try again.');
    }
  }, [path, navigation]);

  useEffect(() => {
    if (!state.isLowConnectivity) initialize();
  }, [state.isLowConnectivity, initialize]);

  useEffect(() => {
    if (state.isConnected) {
      const timer = setTimeout(() => {
        handleReload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.isConnected]);
  const handleReload = () => {
    setState((prev) => ({
      ...prev,
      url: '',
      isLoadingAPI: true,
      showError: false,
      isAlertDisplayed: false,
    }));
    initialize();
  };

  // Handle WebView navigation state changes
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack); // Update canGoBack state
      if (navState.url.includes('about:blank')) return;

      let isSuccess = false;
      if (
        navState.url.includes('submission-confirmation') ||
        navState.url.includes('submissions') ||
        navState.url.includes('Submissions')
      ) {
        isSuccess = true;
        ToastService.show('Form successfully submitted', COLORS.SUCCESS_GREEN);
      } else if (navState.url.includes('/Admin/Edit')) {
        ToastService.show('Form successfully submitted', COLORS.SUCCESS_GREEN);
        const urlParams = new URLSearchParams(navState.url.split('?')[1]);
        const contentId = urlParams.get('ContentItemId');
        if (contentId) {
          const type = navState.url.includes('OrchardCore.Case') ? 'Case' : 'License';
          fetchCaseOrLicenseById(contentId, type, navigation, isNotSkipScreen);
        }
      }

      if (isSuccess && !state.isAlertDisplayed) {
        setState((prev) => ({ ...prev, isAlertDisplayed: true }));
        navigation.goBack();
        // Alert.alert("Success", "Successfully submitted", [
        //   { text: "OK", onPress: () =>  },
        // ]);
      }

      if (
        !navState.url.includes(QUERY_PARAMS.HIDE_HEADER_FOOTER) ||
        !navState.url.includes(QUERY_PARAMS.HIDE_LEFT_MENU)
      ) {
        const endPoint = path.includes('?') ? '&' : '?';
        const newUrl = `${navState.url}${endPoint}${QUERY_PARAMS.HIDE_HEADER_FOOTER}&${QUERY_PARAMS.HIDE_LEFT_MENU}`;
        setState((prev) => ({ ...prev, url: newUrl }));
      }
    },
    [state.isAlertDisplayed, path, navigation],
  );

  // Handle 401 Unauthorized
  const handleUnauthorized = useCallback(async () => {
    try {
      const isExpired = await isTokenTimeOut();
      if (isExpired) {
        await TokenRefreshGlobal();
        const newToken = getAccessToken();
        setState(
          (prev) =>
            ({
              ...prev,
              accessToken: newToken,
              isWebViewLoading: true,
            }) as any,
        );
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      }
    } catch (error) {
      recordCrashlyticsError('Token refresh failed:', error);
      console.error('Token refresh failed:', error);
      // Alert.alert("Session Expired", "Please log in again.", [
      //   { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
      // ]);
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Loader
        loading={
          (state.isLoadingAPI || state.isWebViewLoading) &&
          !state.isLowConnectivity &&
          !state.showError
        }
      />
      <ScreenWrapper title={title} onBackPress={handleCustomBackPress}>
        <View style={styles.viewStyles}>
          {state.showError || !state.url ? (
            <ErrorComponent
              isConnected={state.isConnected}
              isLowConnectivity={state.isLowConnectivity}
              onRetry={handleReload}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{
                uri: state.url,
                headers: { Authorization: `Bearer ${state.accessToken}` },
              }}
              onLoadStart={() => setState((prev) => ({ ...prev, isWebViewLoading: true }))}
              onLoad={() => setState((prev) => ({ ...prev, isWebViewLoading: false }))}
              onError={(event) =>
                setState((prev) => {
                  console.error('WebView error:', event.nativeEvent);
                  return { ...prev, isWebViewLoading: false, showError: true };
                })
              }
              onHttpError={(event) => {
                console.error('WebView HTTP error:', event.nativeEvent);
                if (event.nativeEvent.statusCode === 401) {
                  console.error('Unauthorized: Invalid or expired token');
                  handleUnauthorized();
                }
                setState((prev) => ({
                  ...prev,
                  isWebViewLoading: false,
                  showError: true,
                  isLoadingAPI: false,
                }));
              }}
              javaScriptEnabled
              onNavigationStateChange={handleNavigationStateChange}
              javaScriptCanOpenWindowsAutomatically={false}
              setBuiltInZoomControls={false}
            />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewStyles: {
    flex: 1,
    backgroundColor: COLORS.WHITE || 'white',
    padding: WINDOW_WIDTH * 0.025,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE || 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default memo(OpenInWebView);
