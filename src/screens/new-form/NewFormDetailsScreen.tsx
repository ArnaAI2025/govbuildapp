import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import Loader from '../../components/common/Loader';
import { styles } from './newFormStyles';
import { useNetworkStatus } from '../../utils/checkNetwork';
import { goBack } from '../../navigation/Index';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/Types';
import { getBaseUrl } from '../../session/SessionManager';
import { URL } from '../../constants/url';
import useAuthStore from '../../store/useAuthStore';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { fetchCaseOrLicenseByIdService } from './FormService';

type NewFormDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'NewFormDetailsScreen'>;

const NewFormDetailsScreen: React.FC<NewFormDetailsScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const authData = useAuthStore((state) => state.authData);
  const [url, setURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAlertDisplayed, setIsAlertDisplayed] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const submissionDataRef = useRef('');
  const Data = route.params;

  let path = '';
  if (Data.type === '1') {
    // Normal Advanced Form
    path = Data.param.Path;
  } else if (Data.type === 'Case' || Data.type === 'License') {
    // Case/License must open /Admin/Edit
    path = `${Data.type}/Admin/Edit?ContentItemId=${Data.param.ContentItemId}`;
  } else {
    // Fallback (other types)
    path = `${Data.param.Path}/${Data.type}`;
  }

  // var path =
  //   Data.type == "1" ? Data.param.Path : Data.param.Path + "/" + Data.type;

  const fetchURL = async () => {
    try {
      if (!authData?.access_token || !isNetworkAvailable) {
        setLoading(false);
        return;
      }
      const baseUrl = getBaseUrl();
      const cleanedBase = baseUrl?.endsWith('/') ? baseUrl : baseUrl + '/';
      const webPath = URL.WEB_URL.replace(/^\//, '');
      const encodedReturnUrl = encodeURIComponent(`~/${path}`);
      const finalUrl = `${cleanedBase}${webPath}returnUrl=${encodedReturnUrl}&HideHeaderAndFooter=true&hideLeftMenu=true`;
      console.log('FINAL_URL:----->', finalUrl);
      setURL(finalUrl);
    } catch (error) {
      console.error('Error fetching URL:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchURL();
  }, [authData?.access_token, isNetworkAvailable]);

  const handleWebViewMessage = (event: any) => {
    try {
      const formData = JSON.parse(event.nativeEvent.data);
      submissionDataRef.current = JSON.stringify(formData);
    } catch (e) {
      console.warn('Error parsing message from WebView', e);
    }
  };

  const onNavigationStateChange = async (navState: any) => {
    const currentUrl = navState.url;
    console.log(' Navigation URL:-->>', currentUrl);

    if (!currentUrl || currentUrl.includes('about:blank')) return;

    // Handle submission success
    let isSuccess: boolean =
      currentUrl.includes('submission-confirmation') || currentUrl.includes('submissions');

    if (isSuccess && !isAlertDisplayed) {
      console.log('advanced form submission calling');

      setIsAlertDisplayed(true);
      //  Alert.alert('Your Advanced Form Submissions has been published.');
      ToastService.show('Your Advanced Form Submissions has been published.', COLORS.SUCCESS_GREEN);
      goBack();
      return;
    }

    // Handle OrchardCore redirects
    if (currentUrl.includes('/Admin/Edit')) {
      const queryString = currentUrl.split('?')[1];
      const urlParams = new URLSearchParams(queryString);
      const contentId = urlParams.get('ContentItemId');

      if (contentId) {
        const type = currentUrl.includes('OrchardCore.Case') ? 'Case' : 'License';
        await fetchCaseOrLicenseByIdService(contentId, type, isNetworkAvailable);
      }
    }

    // Enforce UI flags if missing
    const needsUIParams =
      !currentUrl.includes('HideHeaderAndFooter=true') && !currentUrl.includes('/LoginAuto');

    if (needsUIParams) {
      const updatedUrl = currentUrl.includes('?')
        ? `${currentUrl}&HideHeaderAndFooter=true&hideLeftMenu=true`
        : `${currentUrl}?HideHeaderAndFooter=true&hideLeftMenu=true`;

      const jsCode = `window.location.href = "${updatedUrl}";`;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  return (
    <ScreenWrapper title={Data?.title}>
      <Loader loading={loading} />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{
            uri: url,
            headers: { Authorization: `Bearer ${authData?.access_token}` }, // Add Bearer prefix
          }}
          onLoad={() => setLoading(false)}
          javaScriptEnabled
          incognito={false}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={onNavigationStateChange}
          javaScriptCanOpenWindowsAutomatically={false}
          setBuiltInZoomControls={false}
          onLoadProgress={({ nativeEvent }) => {
            console.log('LOAD_PROGRESS_URL:------>>>', nativeEvent.url);
          }}
          onLoadStart={({ nativeEvent }) => {
            console.log('LOAD_START_URL:----->>>', nativeEvent.url);
          }}
          onLoadEnd={({ nativeEvent }) => {
            console.log('LOAD_END_URL:----->>>', nativeEvent.url);
          }}
          originWhitelist={['*']}
          setSupportMultipleWindows={false} // prevent losing session on redirect
          domStorageEnabled
          cacheEnabled={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewFormDetailsScreen;
