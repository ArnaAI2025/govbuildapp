import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../../theme/colors';
import {
  height,
  iconSize,
  marginTopAndBottom,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { checkFileDomain, downloadFile } from '../../../utils/helper/fileHandlers';
import { RootStackParamList } from '../../../navigation/Types';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { useOrientation } from '../../../utils/useOrientation';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type AttachDocPreviewProps = NativeStackScreenProps<RootStackParamList, 'AttachDocPreview'>;

const AttachDocPreview: React.FC<AttachDocPreviewProps> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState(true);
  const [injectData, setInjectData] = useState('');
  const [fullUrl, setFullUrl] = useState('');
  const orientation = useOrientation();
  const hasNotch = DeviceInfo.hasNotch();

  useEffect(() => {
    if (['xlsx', 'pdf', 'docs', 'docx'].includes(route.params.fileType)) {
      setInjectData(
        `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.1, maximum-scale=1.5, user-scalable=1.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);`,
      );
    }
    checkFileDomain(route?.params?.url).then((result) => {
      setFullUrl(result);
      // } else if (
      //   Array.isArray(result) &&
      //   result.length > 0 &&
      //   typeof result[0] === "string"
      // ) {
      //   setFullUrl(result[0]);
      // } else {
      //   setFullUrl("");
      // }
    });
  }, [route.params.url, route.params.fileType]);
  useEffect(() => {
    if (Platform.OS !== 'ios' && fullUrl) {
      Linking.openURL(fullUrl);
    }
  }, [fullUrl]);

  return (
    <ScreenWrapper title="Preview">
      <View style={{ flex: 1 }}>
        <Loader loading={isLoadingAPI} />
        <View
          style={[
            styles.headerContainer,
            {
              marginTop:
                orientation === 'PORTRAIT'
                  ? hasNotch
                    ? height(-0.056)
                    : height(-0.049)
                  : height(-0.054),
            },
          ]}
        >
          <TouchableOpacity onPress={() => downloadFile(fullUrl)}>
            <Icon name="download" size={30} color={COLORS.APP_COLOR} />
          </TouchableOpacity>
        </View>
        <View style={styles.viewStyles}>
          <WebView
            style={{ margin: 10 }}
            source={{ uri: fullUrl }}
            scalesPageToFit={true}
            injectedJavaScript={injectData}
            javaScriptCanOpenWindowsAutomatically={false}
            setBuiltInZoomControls={false}
            onLoad={() => setLoading(true)}
            onLoadStart={() => setLoading(false)}
            onError={(syntheticEvent) => {
              console.error('WebView error: ', syntheticEvent.nativeEvent);
              setLoading(false);
            }}
            onNavigationStateChange={(navState) => {
              if (!navState.loading) setLoading(false);
            }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    tintColor: COLORS.APP_COLOR,
    marginRight: 10,
    width: iconSize(0.03),
    height: iconSize(0.03),
  },
  viewStyles: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingLeft: WINDOW_WIDTH * 0.025,
    paddingRight: WINDOW_WIDTH * 0.025,
    paddingTop: height(0.022),
    paddingBottom: 20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  containerNotch: {
    height: height(0.14),
  },
  container_Landscape: {
    height: height(0.11),
  },
  topbarBackground: {
    width: WINDOW_WIDTH,
    height: height(0.15),
  },
  topbarBackgroundIpda: {
    width: WINDOW_WIDTH,
    height: height(0.18),
  },
  topbarBackground_Landscape: {
    width: WINDOW_HEIGHT,
    height: height(0.5),
  },
  headerLeftAd: {
    flexDirection: 'row',
    padding: 10,
    marginTop: marginTopAndBottom(0.055),
    alignContent: 'center',
  },
  headerLeftAdTab: {
    flexDirection: 'row',
    padding: 10,
    marginTop: marginTopAndBottom(0.05),
    alignContent: 'center',
  },

  container: {
    height: height(0.11),
  },
  headerLeft: {
    flexDirection: 'row',
    padding: 10,
    marginTop: marginTopAndBottom(0.032),
    alignContent: 'center',
  },
  headerLeftNotch: {
    flexDirection: 'row',
    padding: 10,
    marginTop: marginTopAndBottom(0.06),
    alignContent: 'center',
  },
  headerLeftLandscape: {
    flexDirection: 'row',
    padding: 15,
    marginTop: marginTopAndBottom(0.025),
    alignContent: 'center',
  },
  appBarTitleStyle: {
    color: COLORS.WHITE,
    fontSize: height(0.023),

    textAlign: 'center',
    marginLeft: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: height(0.025),
    paddingHorizontal: 10,
    width: '50%',
  },
});

export default AttachDocPreview;
