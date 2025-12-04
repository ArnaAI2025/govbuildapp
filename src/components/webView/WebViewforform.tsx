import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Loader from '../common/Loader';
import ScreenWrapper from '../common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { getAccessToken, getBaseUrl } from '../../session/SessionManager';
import { URL } from '../../constants/url';
import type { RootStackParamList } from '../../navigation/Types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchCaseOrLicenseById } from '../../services/WebViewService';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

type WebViewForFormProps = NativeStackScreenProps<RootStackParamList, 'WebViewForForm'>;

const WebViewForForm: React.FC<WebViewForFormProps> = ({ navigation, route }) => {
  const [url, setURL] = useState<string>('');
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [isAlertDisplayed, setIsAlertDisplayed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const webViewRef = useRef<WebView>(null);
  //const isFocused = useIsFocused();

  const {
    type,
    param: { Path }, //ContentItemId: fromItemId
    title,
  } = route.params;

  const path: string = type === '1' ? Path : `${Path}/${type}`;
  //let submissionData: string = "";

  const offlineScript: string = `
    (function() {
      const sendFormData = () => {
        const forms = document.querySelectorAll('form');
        let formDataObject;
        forms.forEach(form => {
          const formData = new FormData(form);
          formData.forEach((value, key) => {
            if (key === "Container") formDataObject = value;
          });
        });
        if (formDataObject) {
          window.ReactNativeWebView.postMessage(JSON.stringify(formDataObject));
        }
      };

      const waitForObjects = () => {
        if (window.EsriGeoEngine?.FormIo?.submission) {
          window.ReactNativeWebView.postMessage(JSON.stringify(window.EsriGeoEngine.FormIo.submission));
        } else {
          setTimeout(waitForObjects, 100);
        }
      };

      document.addEventListener('change', waitForObjects);
      sendFormData();
    })();
  `;

  const handleWebViewMessage = () => {
    try {
    } catch (error) {
      recordCrashlyticsError('Error parsing WebView message:', error);
      console.error('Error parsing WebView message:', error);
    }
  };

  const initializeConnection = async () => {
    try {
      setLoading(true);
      const [accessToken, baseUrl, networkState]: [string, string, NetInfoState] =
        await Promise.all([getAccessToken(), getBaseUrl(), NetInfo.fetch()]);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      setToken(accessToken);

      if (networkState.isConnected && baseUrl) {
        // Normalize baseUrl to remove trailing slash and ensure single slash
        const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
        const webViewUrl = `${normalizedBaseUrl}${URL.WEB_URL}returnUrl=~/${path}?HideHeaderAndFooter=true&hideLeftMenu=true`;
        console.log('WebView URL:', webViewUrl); // Debug URL
        setURL(webViewUrl);
      } else {
        setError('No internet connection');
      }
    } catch (error) {
      recordCrashlyticsError('Initialization error:', error);
      console.error('Initialization error:', error);
      setError('Failed to initialize. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = () => {
    setError(null);
    initializeConnection();
  };

  useEffect(() => {
    initializeConnection();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenWrapper title={title}>
        <Loader loading={isLoadingAPI} />

        <View style={styles.viewStyles}>
          <WebView
            ref={webViewRef}
            javaScriptEnabled
            incognito
            source={{
              uri: url,
              headers: { Authorization: `Bearer ${token}` }, // Add Bearer prefix
            }}
            onLoadStart={() => setLoading(true)}
            onLoad={() => {
              try {
                webViewRef.current?.injectJavaScript(offlineScript);
              } catch (error) {
                recordCrashlyticsError('WebView onLoad error:', error);
                console.error('WebView onLoad error:', error);
                setError('Failed to load WebView');
              } finally {
                setLoading(false);
              }
            }}
            onMessage={handleWebViewMessage}
            onNavigationStateChange={(navState: { url: string }) => {
              try {
                if (navState.url.includes('about:blank')) return;

                let isSuccess: boolean =
                  navState.url.includes('submission-confirmation') ||
                  navState.url.includes('submissions');

                if (navState.url.includes('/Admin/Edit')) {
                  const urlParams = new URLSearchParams(navState.url.split('?')[1]);

                  const contentId = urlParams.get('ContentItemId');
                  if (contentId) {
                    const type = navState.url.includes('OrchardCore.Case') ? 'Case' : 'License';
                    fetchCaseOrLicenseById(contentId, type, navigation);
                  }
                }

                if (isSuccess && !isAlertDisplayed) {
                  // isShowAlert = true;
                  setIsAlertDisplayed(true);
                  Alert.alert('Successfully submitted', '', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                  ]);
                }

                if (!navState.url.includes('HideHeaderAndFooter=true&hideLeftMenu=true')) {
                  const newUrl: string = navState.url.includes('?')
                    ? `${navState.url}&HideHeaderAndFooter=true&hideLeftMenu=true`
                    : `${navState.url}?HideHeaderAndFooter=true&hideLeftMenu=true`;
                  setURL(newUrl);
                }
              } catch (error) {
                recordCrashlyticsError('Navigation state change error:', error);
                console.error('Navigation state change error:', error);
              }
            }}
            onError={(event) => {
              recordCrashlyticsError('WebView error:', error);
              console.error('WebView error:', event.nativeEvent);
              setError('Failed to load WebView');
            }}
            onHttpError={(event) => {
              recordCrashlyticsError('WebView HTTP error:', event.nativeEvent);
              console.error('WebView HTTP error:', event.nativeEvent);
              if (event.nativeEvent.statusCode === 401) {
                setError('Authentication failed. Please try again.');
              }
            }}
          />
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

export default WebViewForForm;
