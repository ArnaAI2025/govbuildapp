import React, { FunctionComponent } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../home/Home';
import { Image, ImageBackground, TouchableOpacity } from 'react-native';
import IMAGES from '../../../theme/images';
import { useOrientation } from '../../../utils/useOrientation';
import DeviceInfo from 'react-native-device-info';
import { styles } from './dashboarddrawerStyles';
import DrawerContent from './DrawerContent';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { COLORS } from '../../../theme/colors';
import { height } from '../../../utils/helper/dimensions';

const Drawer = createDrawerNavigator();

type Props = Record<string, never>;
type NavigationDrawerStructureProps = {
  navigationProps: DrawerNavigationProp<any>;
};

const DashboardDrawerScreen: FunctionComponent<Props> = () => {
  const orientation = useOrientation();
  const hasNotch = DeviceInfo.hasNotch();
  const NavigationDrawerStructure: FunctionComponent<NavigationDrawerStructureProps> = ({
    navigationProps,
  }) => {
    const toggleDrawer = () => {
      navigationProps.toggleDrawer();
    };
    return (
      <TouchableOpacity onPress={toggleDrawer}>
        <Image style={styles.toggleImage} source={IMAGES.TOGGLE_DRAWER} />
      </TouchableOpacity>
    );
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'center',
        drawerItemStyle: {
          borderRadius: 10,
          marginVertical: 3,
        },
        drawerActiveTintColor: COLORS.WHITE,
        drawerActiveBackgroundColor: COLORS.APP_COLOR,
        // drawerInactiveTintColor:COLORS.WHITE,
        // drawerInactiveBackgroundColor:COLORS.ERROR,
        activeTintColor: COLORS.APP_COLOR,
        animationEnabled: true,
        headerTintColor: COLORS.WHITE, //header color
        headerTitleStyle: styles.headerTintStyles,
        headerStyle: {
          height:
            orientation === 'PORTRAIT' ? (hasNotch ? height(0.15) : height(0.11)) : height(0.11),
        },
        drawerLabelStyle: styles.homeDrawerTextStyle,
        headerLeft: () => <NavigationDrawerStructure navigationProps={navigation} />,
        headerBackground: () => (
          <ImageBackground
            source={IMAGES.HEADER_BACKGROUND}
            resizeMode="stretch"
            style={{ flex: 1 }}
          />
        ),
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
      })}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerStyle: styles.homeDrawerStyle,
          drawerIcon: () => <Image style={styles.homeDrawerImage} source={IMAGES.HOME_LOGO} />,
        }}
        component={HomeScreen}
      />
    </Drawer.Navigator>
  );
};

export default DashboardDrawerScreen;
