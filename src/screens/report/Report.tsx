import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Loader from '../../components/common/Loader';
import { styles } from './reportStyles';
import { useNetworkStatus } from '../../utils/checkNetwork';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import WebView from 'react-native-webview';
import { getBaseUrl } from '../../session/SessionManager';
import { URL } from '../../constants/url';
import useAuthStore from '../../store/useAuthStore';

type Props = Record<string, never>;

const ReportScreen: FunctionComponent<Props> = () => {
  const { isNetworkAvailable } = useNetworkStatus();
  const authData = useAuthStore((state) => state.authData);

  const [url, setURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAlertShown, setIsAlertShown] = useState(false);
  const path = '/GovBuilt.Reporting/Admin/ReportCenter';
  const webViewRef = useRef(null);
  const canGoBack = useRef(false);

  const handleWebViewError = () => {
    if (!isAlertShown) {
      setIsAlertShown(true);
      setLoading(false);
    }
  };

  const fetchURL = async () => {
    try {
      if (!authData?.access_token || !isNetworkAvailable) {
        setLoading(false);
        return;
      }

      const baseUrl = await getBaseUrl();
      const endPoint = path.includes('?')
        ? '&HideHeaderAndFooter=true&hideLeftMenu=true'
        : '?HideHeaderAndFooter=true&hideLeftMenu=true';

      const newURL = `${baseUrl}${URL.WEB_URL}returnUrl=~${path}${endPoint}`;

      setURL(newURL);
    } catch (error) {
      console.error('Error fetching URL:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchURL();
  }, [authData, isNetworkAvailable]);

  // const handleNavigationStateChange = (navState) => {
  //   canGoBack.current = navState.canGoBack;
  //   const { url } = navState;

  //   if (url && !url.includes("about:blank")) {
  //     let updatedUrl = url;
  //     if (!url.includes("HideHeaderAndFooter=true")) {
  //       updatedUrl += (updatedUrl.includes("?") ? "&" : "?") + "HideHeaderAndFooter=true";
  //     }
  //     if (!url.includes("hideLeftMenu=true")) {
  //       updatedUrl += "&hideLeftMenu=true";
  //     }

  //     if (updatedUrl !== url) {
  //       setURL(updatedUrl);

  //       if (Platform.OS === "ios") {
  //         webViewRef.current?.loadUrl(updatedUrl);
  //       } else {
  //         webViewRef.current?.stopLoading();
  //         webViewRef.current?.injectJavaScript(
  //           `window.location.href = "${updatedUrl}"`
  //         );
  //       }
  //     }
  //   }
  // };
  const handleNavigationStateChange = (navState) => {
    canGoBack.current = navState.canGoBack;
    const currentUrl = navState.url;

    if (currentUrl && !currentUrl.includes('about:blank')) {
      let updatedUrl = currentUrl;
      if (!currentUrl.includes('HideHeaderAndFooter=true')) {
        updatedUrl += (updatedUrl.includes('?') ? '&' : '?') + 'HideHeaderAndFooter=true';
      }
      if (!currentUrl.includes('hideLeftMenu=true')) {
        updatedUrl += '&hideLeftMenu=true';
      }

      if (updatedUrl !== currentUrl) {
        setURL(updatedUrl); // Triggers WebView to reload with new URL

        // Optional: For Android, use injectJavaScript to redirect without full reload
        if (Platform.OS === 'android') {
          webViewRef.current?.injectJavaScript(`window.location.href = "${updatedUrl}"; true;`);
        }
      }
    }
  };

  // const handleNavigationStateChange = (navState) => {
  //   canGoBack.current = navState.canGoBack;
  //   const currentUrl = navState.url;

  //   if (currentUrl && !currentUrl.includes("about:blank")) {
  //     let updatedUrl = currentUrl;
  //     if (!currentUrl.includes("HideHeaderAndFooter=true")) {
  //       updatedUrl +=
  //         (updatedUrl.includes("?") ? "&" : "?") + "HideHeaderAndFooter=true";
  //     }
  //     if (!currentUrl.includes("hideLeftMenu=true")) {
  //       updatedUrl += "&hideLeftMenu=true";
  //     }

  //     if (updatedUrl !== currentUrl) {
  //       setURL(updatedUrl);
  //     }
  //   }
  // };

  return (
    <ScreenWrapper title="Reports">
      <Loader loading={loading} />
      <View style={styles.container}>
        {url && authData?.access_token && (
          <WebView
            ref={webViewRef}
            javaScriptEnabled
            style={{ flex: 1, width: '100%', height: '100%' }}
            domStorageEnabled
            cacheEnabled
            onLoad={() => setLoading(false)}
            onError={handleWebViewError}
            onHttpError={handleWebViewError}
            source={{
              uri: url,
              headers: {
                Authorization: `${authData?.token_type} ${authData?.access_token}`,
              },
            }}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptCanOpenWindowsAutomatically={false}
            setBuiltInZoomControls={false}
            setSupportMultipleWindows={false}
            contentInsetAdjustmentBehavior="always"
            onLoadEnd={() => setIsAlertShown(false)}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default ReportScreen;
