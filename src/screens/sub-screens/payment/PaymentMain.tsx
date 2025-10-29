import React, { memo, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBar, TabView } from 'react-native-tab-view';
import { useOrientation } from '../../../utils/useOrientation';
import { fontSize, marginTop, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { COLORS } from '../../../theme/colors';
import { RootStackParamList } from '../../../navigation/Types';
import { Route, Scene } from 'react-native-tab-view/lib/typescript/src/types';
import AccountingDetailScreen from './accountingDetailsTab/AccountingDetailScreen';
import PaymentScreen from './paymentTab/PaymentScreen';
import { TEXTS } from '../../../constants/strings';
import { useNetworkStatus } from '../../../utils/checkNetwork';

type PaymentMainProps = NativeStackScreenProps<RootStackParamList, 'PaymentMain'>;

const PaymentMain: React.FC<PaymentMainProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const { isNetworkAvailable } = useNetworkStatus();
  const [index, setIndex] = useState(0);

  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    if (isNetworkAvailable) {
      setRoutes([
        { key: 'first', title: 'Accouting Details' },
        { key: 'second', title: 'Invoices' },
      ]);
    } else {
      setRoutes([{ key: 'second', title: 'Invoices' }]);
    }
  }, [isNetworkAvailable]);

  const getTabWidth = (numTabs: number): number => {
    if (orientation === 'PORTRAIT') {
      return (WINDOW_WIDTH * 0.9) / numTabs;
    }
    return Platform.OS ? (WINDOW_WIDTH * 1.2) / numTabs : (WINDOW_WIDTH * 2) / numTabs;
  };

  const renderScene = ({ route: tabRoute }: Scene<Route>) => {
    switch (tabRoute.key) {
      case 'first':
        return <AccountingDetailScreen navigation={navigation} route={route.params} />;
      case 'second':
        return <PaymentScreen navigation={navigation} route={route.params} />;
      default:
        return null;
    }
  };

  const renderLabel = ({ route, focused }: Scene<Route> & { focused: boolean }) => (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: focused ? COLORS.BLACK : COLORS.BLACK }]}>
        {route.title}
      </Text>
      <View
        style={[
          styles.tabIndicator,
          {
            borderColor: focused ? COLORS.BLACK : COLORS.BLACK,
            width: getTabWidth(routes.length),
            marginTop: marginTop(0.015),
          },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenWrapper title={TEXTS.subScreens.payment.heading}>
        {routes.length > 0 && (
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: WINDOW_WIDTH }}
            renderTabBar={(props) => (
              <TabBar<Route>
                {...props}
                indicatorStyle={styles.indicatorContainer}
                style={styles.tabBar}
                inactiveColor={COLORS.GRAY_HEADING}
                activeColor={COLORS.APP_COLOR}
                tabStyle={styles.tab}
                // @ts-ignore
                renderLabel={renderLabel}
              />
            )}
          />
        )}
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  indicatorContainer: { backgroundColor: COLORS.APP_COLOR },
  tabBar: {
    elevation: 0,
    padding: 0,
    margin: 0,
    backgroundColor: COLORS.WHITE,
  },
  tab: { padding: 0, margin: 0 },
  labelContainer: { flexDirection: 'column' },
  label: { fontSize: fontSize(0.026) },
  tabIndicator: { borderBottomWidth: 5, borderRadius: 20 },
});

export default memo(PaymentMain);
