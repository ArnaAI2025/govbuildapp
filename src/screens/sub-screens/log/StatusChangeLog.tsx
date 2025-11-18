import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import type { TabRoute } from '../../../utils/interfaces/ISubScreens';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Types';
import MemberHistory from './logTabs/MemberHistory';
import BillingStatus from './logTabs/BillingStatus';
import CaseStatus from './logTabs/CaseStatus';
import InspectionHistory from './logTabs/InspectionHistory';
import PaymentHistory from './logTabs/PaymentHistory';
import TaskStatus from './logTabs/TaskStatus';
import LicenseStatus from './logTabs/LicenseStatus';
import { COLORS } from '../../../theme/colors';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { TEXTS } from '../../../constants/strings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type StatusChangeLogProps = NativeStackScreenProps<RootStackParamList, 'StatusChangeLog'>;

const StatusChangeLog: React.FC<StatusChangeLogProps> = ({ route, navigation }) => {
  const [index, setIndex] = useState<number>(0);
  const caseShowHideKeysData = route?.params?.caseSettingData;
  const contentItemId = route?.params?.param?.contentItemId || '';
  const isCase = route?.params.type === 'Case' ? true : false;
  const caseRoutes: TabRoute[] = [
    { key: 'first', title: 'Assigned Team Members History', id: contentItemId },
    { key: 'second', title: 'Billing Status', id: contentItemId },
    { key: 'third', title: 'Case Status', id: contentItemId },
    { key: 'fourth', title: 'Inspection History', id: contentItemId },
    { key: 'fifth', title: 'Payment History', id: contentItemId },
    { key: 'sixth', title: 'Task Status', id: contentItemId },
  ];

  const licenseRoutes: TabRoute[] = [
    { key: 'first', title: 'Inspection History', id: contentItemId },
    { key: 'second', title: 'License Status', id: contentItemId },
    { key: 'third', title: 'Payment History', id: contentItemId },
  ];

  const [routes, setRoutes] = useState<TabRoute[]>(isCase ? caseRoutes : licenseRoutes);

  useEffect(() => {
    if (isCase && caseShowHideKeysData) {
      const routeData = caseRoutes.filter((route) => {
        if (route.key === 'first' && caseShowHideKeysData.isHideTeamMemberAssignmentLogTab)
          return false;
        if (route.key === 'second' && caseShowHideKeysData.isHideBillingStatusChangeLogTab)
          return false;
        if (route.key === 'third' && caseShowHideKeysData.isHideChangeLogTab) return false;
        if (route.key === 'fourth' && caseShowHideKeysData.isHideInspectionHistoryLogTab)
          return false;
        if (route.key === 'fifth' && caseShowHideKeysData.isHidePaymentHistoryLogTab) return false;
        if (route.key === 'sixth' && caseShowHideKeysData.isHideTaskStatusChangeLogTab)
          return false;
        return true;
      });
      setRoutes(routeData);
      setIndex(0); // Reset index when routes change
    } else {
      setRoutes(licenseRoutes);
      setIndex(0); // Reset index when switching to license routes
    }
  }, [isCase, caseShowHideKeysData]);

  const renderScene = ({ route }: { route: TabRoute }) => {
    if (isCase) {
      switch (route.key) {
        case 'first':
          return <MemberHistory navigation={navigation} route={route.id} />;
        case 'second':
          return <BillingStatus route={route.id} />;
        case 'third':
          return <CaseStatus navigation={navigation} route={route.id} />;
        case 'fourth':
          return <InspectionHistory navigation={navigation} route={route.id} isCase={isCase} />;
        case 'fifth':
          return <PaymentHistory navigation={navigation} route={route.id} isCase={isCase} />;
        case 'sixth':
          return <TaskStatus navigation={navigation} route={route.id} />;
        default:
          return null;
      }
    } else {
      switch (route.key) {
        case 'first':
          return <InspectionHistory navigation={navigation} route={route.id} isCase={isCase} />;
        case 'second':
          return <LicenseStatus navigation={navigation} route={route.id} />;
        case 'third':
          return <PaymentHistory navigation={navigation} route={route.id} isCase={isCase} />;
        default:
          return null;
      }
    }
  };

  const renderTabBar = (props: any) => {
    const totalTabs = isCase ? routes.length : routes.length;
    const isFirstTab = index === 0;
    const isLastTab = index === totalTabs - 1;

    return (
      <View style={styles.tabBarContainer}>
        {/* Back Button */}
        {!isFirstTab && routes.length > 2 && (
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setIndex(index - 1)}
            disabled={isFirstTab} // Disable when on the first tab
          >
            <Icon
              name="chevron-left"
              size={40}
              color={isFirstTab ? COLORS.GRAY_HEADING : COLORS.APP_COLOR}
            />
          </TouchableOpacity>
        )}

        {/* TabBar */}
        <View style={styles.tabBarScroll}>
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicatorStyle}
            style={styles.tabStyle}
            tabStyle={styles.tabItemStyle} // Add explicit tab style
            inactiveColor={COLORS.GRAY_HEADING}
            activeColor={COLORS.APP_COLOR}
            renderLabel={({ route, focused }: { route: TabRoute; focused: boolean }) => (
              <TouchableOpacity
                onPress={() => console.log(`Tab ${route.title} pressed`)}
                style={styles.tabList}
              >
                <Text
                  numberOfLines={2}
                  style={[
                    styles.labelStyle,
                    { color: focused ? COLORS.APP_COLOR : COLORS.GRAY_HEADING },
                  ]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Forward Button */}
        {!isLastTab && routes.length > 2 && (
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setIndex(index + 1)}
            disabled={isLastTab} // Disable when on the last tab
          >
            <Icon
              name="chevron-right"
              size={40}
              color={isLastTab ? COLORS.GRAY_HEADING : COLORS.APP_COLOR}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper title={TEXTS.subScreens.statusChangeLog.heading}>
        <View style={{ flex: 1 }}>
          {isCase ? (
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: WINDOW_WIDTH }}
              renderTabBar={renderTabBar}
            />
          ) : (
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: WINDOW_WIDTH }}
              renderTabBar={renderTabBar}
            />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  iconStyle: {
    height: height(0.025),
    width: height(0.025),
  },

  indicatorStyle: {
    color: COLORS.APP_COLOR,
    backgroundColor: COLORS.APP_COLOR,
  },

  tabBarScroll: {
    flex: 1,
  },

  arrowButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowText: {
    color: COLORS.APP_COLOR,
  },

  tabList: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
  },

  labelStyle: {
    fontSize: fontSize(0.026),
    textAlign: 'center',
  },

  tabStyle: {
    elevation: 0,
    padding: 0,
    margin: 0,
    backgroundColor: COLORS.WHITE,
  },

  contentStyle: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tabItemStyle: {
    paddingHorizontal: 10,
    minWidth: WINDOW_WIDTH / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatusChangeLog;
