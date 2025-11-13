import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import DeviceInfo from 'react-native-device-info';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import HistoryScreen from './history/HistoryScreen';
import ItemToSyncScreen from './sync-items/ItemToSyncScreen';
import AllOfflineView from './all-offline-item/AllOfflineView';
import { RootStackParamList } from '../../navigation/Types';
import { useOrientation } from '../../utils/useOrientation';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../theme/colors';
import { height, width } from '../../utils/helper/dimensions';
import { Scene } from 'react-native-tab-view/lib/typescript/src/types';
import { FONT_FAMILY } from '../../theme/fonts';

interface Route {
  key: string;
  title: string;
  icon: any;
  iconActive: any;
}

type OfflineSyncScreenProps = NativeStackScreenProps<RootStackParamList, 'OfflineSyncScreen'>;

const OfflineSyncScreen: React.FC<OfflineSyncScreenProps> = ({}) => {
  const [index, setIndex] = useState<number>(0);
  const orientation = useOrientation();
  const hasNotch = DeviceInfo.hasNotch();
  const [routes] = useState<Route[]>([
    {
      key: 'first',
      title: 'Item To Sync',
      icon: require('../../assets/images/ic_tab_sync.png'),
      iconActive: require('../../assets/images/ic_tab_sync_active.png'),
    },
    {
      key: 'second',
      title: 'History',
      icon: require('../../assets/images/ic_history.png'),
      iconActive: require('../../assets/images/ic_history_active.png'),
    },
    {
      key: 'third',
      title: 'Offline Items',
      icon: require('../../assets/images/ic_tab_sync.png'),
      iconActive: require('../../assets/images/ic_tab_sync_active.png'),
    },
  ]);

  const renderScene = ({ route }: Scene<Route>) => {
    switch (route.key) {
      case 'first':
        return <ItemToSyncScreen isActive={index === 0} />;
      case 'second':
        return <HistoryScreen isActive={index === 1} />;
      case 'third':
        return <AllOfflineView isActive={index === 2} />;
      default:
        return null;
    }
  };
  return (
    <ScreenWrapper title="Offline Sync">
      <View style={styles.content}>
        <View
          style={{
            marginTop:
              orientation === 'PORTRAIT'
                ? hasNotch
                  ? height(-0.056)
                  : height(-0.049)
                : height(-0.054),
            alignItems: 'flex-end',
            alignSelf: 'flex-end',
            zIndex: -1,
            marginBottom: height(0.02),
            width: '50%',
          }}
        >
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>App version</Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {Platform.OS === 'ios' ? '3.1.0' : DeviceInfo.getVersion()}
              </Text>
            </View>
          </View>
        </View>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: WINDOW_WIDTH }}
          renderTabBar={(props) => (
            <TabBar<Route>
              {...props}
              style={styles.tabBar}
              inactiveColor={COLORS.GRAY_HEADING}
              activeColor={COLORS.APP_COLOR}
              indicatorStyle={styles.indicator}
              renderLabel={({ route, focused }) => (
                <Text
                  style={[
                    styles.label,
                    { color: focused ? COLORS.APP_COLOR : COLORS.GRAY_HEADING },
                  ]}
                >
                  {route.title}
                </Text>
              )}
            />
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
  indicatorContainer: {
    height: 0,
    width: 0,
  },
  tabLabelContainer: {
    flexDirection: 'column',
  },
  tabLabelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: height(0.025),
    width: height(0.025),
  },
  label: {
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    marginLeft: 5,
  },
  tabIndicator: {
    borderBottomWidth: 5,
    borderRadius: 20,
  },
  footer: {
    borderRadius: 10,
    backgroundColor: COLORS.SUCCESS_GREEN,
    alignItems: 'center',
    width: 'auto',
    height: 25,
    paddingHorizontal: width(0.015),
    justifyContent: 'center',
  },
  footerText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  sortContainer: { flexDirection: 'row', alignItems: 'center' },
  sortLabel: {
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    marginRight: 4,
  },
  labelContainer: { flexDirection: 'column' },
  indicator: {
    backgroundColor: COLORS.APP_COLOR,
    height: 3,
    borderRadius: 2,
  },
});

export default OfflineSyncScreen;
