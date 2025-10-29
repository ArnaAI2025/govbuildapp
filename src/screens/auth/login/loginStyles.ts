import { StyleSheet } from 'react-native';
import {
  fontSize,
  height,
  iconSize,
  width,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
export const styles = StyleSheet.create({
  viewStyles: {
    backgroundColor: COLORS.WHITE,
    padding: 25,
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  topbarBackground: {
    width: WINDOW_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    height: height(0.25),
  },
  container_landscape: {
    height: height(0.18),
    width: WINDOW_HEIGHT,
  },
  topbarBackgroundIpad: {
    width: WINDOW_HEIGHT,
    height: width(0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarBackground1: {
    width: WINDOW_HEIGHT,
    height: width(0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: iconSize(0.3),
    height: iconSize(0.09),
    resizeMode: 'contain',
  },
  textStylesWelcome: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.08),
    fontFamily: FONT_FAMILY.MontserratMedium,
    textAlign: 'center',
    marginTop: 10,
  },
  textStylesContent: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratMedium,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: COLORS.WHITE,
  },
  textStyleHint: {
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.BLACK,
    fontSize: fontSize(0.03),
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 10,
  },
  textStyleError: {
    marginTop: 5,
    color: COLORS.ERROR,
    fontSize: FONT_SIZE.Font_10,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  dotStyle: {
    width: iconSize(0.025),
    height: iconSize(0.025),
    margin: 3,
  },
  textStylesProceed: {
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: fontSize(0.035),
    backgroundColor: COLORS.WHITE,
  },
  nextButton: {
    width: iconSize(0.04),
    height: iconSize(0.04),
    marginLeft: 5,
  },
  keyboardScrollView: { flexGrow: 1, justifyContent: 'flex-start' },
  viewFlex: { flex: 1 },
  flexStyle: {
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  flexDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  forgotPasswordView: { alignItems: 'flex-end' },
});
