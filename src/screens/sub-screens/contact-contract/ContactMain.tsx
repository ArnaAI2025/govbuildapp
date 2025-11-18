import React, { memo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBar, TabView } from 'react-native-tab-view';
import { useOrientation } from '../../../utils/useOrientation';
import { fontSize, marginTop, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { COLORS } from '../../../theme/colors';
import type { RootStackParamList } from '../../../navigation/Types';
import type { Route, Scene } from 'react-native-tab-view/lib/typescript/src/types';
import ContactScreen from './contactTab/ContactScreen';
import CaseAndLicenseContractorTab from './contractorTab/CaseAndLicenseContractorTab';

type ContactMainProps = NativeStackScreenProps<RootStackParamList, 'ContactMain'>;

const ContactMain: React.FC<ContactMainProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const [index, setIndex] = useState(0);
  const [routes] = useState<Route[]>([
    { key: 'first', title: 'Contacts' },
    { key: 'second', title: 'Contractors' },
  ]);

  const getTabWidth = (numTabs: number): number => {
    if (orientation === 'PORTRAIT') {
      return (WINDOW_WIDTH * 0.9) / numTabs;
    }
    return Platform.OS ? (WINDOW_WIDTH * 1.2) / numTabs : (WINDOW_WIDTH * 2) / numTabs;
  };

  const renderScene = ({ route: tabRoute }: Scene<Route>) => {
    switch (tabRoute.key) {
      case 'first':
        return <ContactScreen navigation={navigation} route={route.params} />;
      case 'second':
        return <CaseAndLicenseContractorTab navigation={navigation} route={route.params} />;
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
      <ScreenWrapper title="Contacts">
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
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    width: 0,
    height: 0,
    backgroundColor: COLORS.APP_COLOR,
  },
  tabBar: {
    elevation: 0,
    padding: 0,
    margin: 0,
    backgroundColor: COLORS.WHITE,
  },
  tab: {
    padding: 0,
    margin: 0,
  },
  labelContainer: {
    flexDirection: 'column',
  },
  label: {
    fontSize: fontSize(0.026),
  },
  tabIndicator: {
    borderBottomWidth: 5,
    borderRadius: 20,
  },
});

export default memo(ContactMain);
