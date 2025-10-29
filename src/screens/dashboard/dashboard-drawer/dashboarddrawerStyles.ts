import { Platform, StyleSheet } from 'react-native';
import {
  fontSize,
  height,
  iconSize,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { FONT_FAMILY } from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeDrawerStyle: {
    width: '80%',
    height: '100%',
  },
  homeDrawerImage: {
    height: iconSize(0.035),
    width: iconSize(0.035),
    tintColor: COLORS.WHITE,
    marginLeft: 10,
  },
  topbarBackgroundNotch: {
    width: WINDOW_WIDTH,
    height: height(0.16),
    flex: 1,
  },
  topbarBackground: {
    width: WINDOW_WIDTH,
    height: height(0.105),
    flex: 1,
  },
  topbarBackground_Landscape: {
    width: WINDOW_HEIGHT,
    height: height(0.11),
  },
  // DRAWER CONTAINER
  drawerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.WHITE,
  },
  drawerHeader: {
    flex: 0.1,
    alignItems: 'center',
    backgroundColor: COLORS.APP_COLOR,
    paddingTop: 40,
    zIndex: 1,
  },
  drawerLogoStyle: {
    height: height(0.025),
    width: WINDOW_WIDTH * 0.4,
    resizeMode: 'contain',
    flex: 1,
  },
  drawerLogoBottomHeight: {
    backgroundColor: COLORS.GRAY_LIGHT,
    height: 2,
    marginTop: 0,
    marginLeft: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  drawerTextStyle: {
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  homeDrawerTextStyle: {
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    color: COLORS.WHITE,
  },
  drawerIconStyle: {
    width: iconSize(0.04),
    height: iconSize(0.04),
    marginLeft: 5,
  },
  headerTintStyles: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.MontserratBold,
    alignSelf: 'center',
    alignContent: 'center',
    marginBottom: Platform.OS === 'android' ? 20 : 35,
    fontSize: fontSize(0.04),
  },
  toggleImage: {
    height: iconSize(0.025),
    width: iconSize(0.025),
    marginLeft: 20,
    marginBottom: Platform.OS === 'android' ? 20 : 35,
  },
  logout: {
    tintColor: COLORS.APP_COLOR,
    height: iconSize(0.03),
    width: iconSize(0.03),
    marginLeft: 10,
  },
  appUpdate: {
    tintColor: COLORS.APP_COLOR,
    height: iconSize(0.03),
    width: iconSize(0.03),
    marginLeft: 10,
  },
});
