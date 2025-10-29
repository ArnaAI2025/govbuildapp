import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import WebView from 'react-native-webview';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import globalStyles from '../../theme/globalStyles';

type RouteScreenProps = NativeStackScreenProps<RootStackParamList, 'RouteScreen'>;

const RouteScreen: React.FC<RouteScreenProps> = ({ route }) => {
  const [jsCode, setJsCode] = useState<string>('');

  useEffect(() => {
    const locationPoint = JSON.parse(route?.params?.param?.location);
    const data = {
      number: route?.params?.param?.caseNumber,
      address: locationPoint.Address,
    };
    setJsCode(
      `const caseNumber = ${JSON.stringify(data)}; const startLongLat = [${
        locationPoint.Longitude
      },${locationPoint.Latitude}]`,
    );
  }, [route?.params?.param]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper title="Daily Route">
        <View style={[globalStyles.viewStyle, { paddingLeft: 0, paddingRight: 0, paddingTop: 0 }]}>
          <WebView
            style={{
              borderTopLeftRadius: WINDOW_WIDTH * 0.09,
              borderTopRightRadius: WINDOW_WIDTH * 0.09,
            }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            source={require('../daily-inspection/map2.html')}
            injectedJavaScript={jsCode}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default RouteScreen;
