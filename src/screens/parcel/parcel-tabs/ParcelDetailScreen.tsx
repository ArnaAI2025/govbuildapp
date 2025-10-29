import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { TabRoute } from '../../../utils/interfaces/ISubScreens';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Types';
import { COLORS } from '../../../theme/colors';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ParcelDetails from './ParcelDetails';
import SubmissionParcelScreen from './SubmissionParcelScreen';
import CaseParcelScreen from './CaseParcelScreen';
import ChildParcelScreen from './ChildParcelScreen';

type ParcelDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ParcelDetailScreen'>;

const ParcelDetailScreen: React.FC<ParcelDetailScreenProps> = ({ route }) => {
  const [index, setIndex] = useState<number>(0);
  const parcelNumber = route?.params?.parcelNumber;

  const parcelRoutes: TabRoute[] = [
    { key: 'first', title: 'Parcel Details', id: parcelNumber },
    { key: 'second', title: 'Case', id: parcelNumber },
    { key: 'third', title: 'Submissions', id: parcelNumber },
    { key: 'fourth', title: 'Child Parcels', id: parcelNumber },
  ];

  const [routes] = useState<TabRoute[]>(parcelRoutes);

  const renderScene = ({ route }: { route: TabRoute }) => {
    switch (route.key) {
      case 'first':
        return <ParcelDetails ParcelNumber={route.id} />;
      case 'second':
        return <CaseParcelScreen ParcelNumber={route.id} />;
      case 'third':
        return <SubmissionParcelScreen ParcelNumber={route.id} />;
      case 'fourth':
        return <ChildParcelScreen ParcelNumber={route.id} />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => {
    const totalTabs = routes.length;
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
      <ScreenWrapper title={'Parcel Details'}>
        <View style={{ flex: 1 }}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: WINDOW_WIDTH }}
            renderTabBar={renderTabBar}
          />
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
    marginLeft: 6,
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

export default ParcelDetailScreen;
