import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../theme/fonts';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginTop: 20 },
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  logoLandScape: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  textStylesBold: {
    fontSize: fontSize(0.08),
    fontFamily: FONT_FAMILY.MontserratBold,
    color: COLORS.APP_COLOR,
  },
  textStylesMedium: {
    fontSize: fontSize(0.08),
    fontFamily: FONT_FAMILY.MontserratBold,
    color: COLORS.APP_COLOR,
    marginLeft: 5,
  },
  textStylesContent: {
    marginTop: 10,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.APP_COLOR,
  },
  textStylesContent1: {
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.APP_COLOR,
  },
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: height(0.06),
    width: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.VERY_LIGHT_CYAN,
    marginTop: 10,
    padding: 10,
  },
});
export default styles;
