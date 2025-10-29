import { Platform, StyleSheet } from 'react-native';
import { COLORS } from './colors';
import { fontSize, height } from '../utils/helper/dimensions';
import { FONT_FAMILY } from './fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
  },
  lightShadowBlueColor: {
    shadowColor: Platform.OS === 'ios' ? 'rgba(0, 112, 192, 0.08)' : 'rgba(0, 112, 192, 0.5)',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 3,
    shadowRadius: 12.35,
    elevation: Platform.OS === 'ios' ? 19 : 8,
  },
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  extraLightShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  highShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12.35,

    elevation: 19,
  },
  /// Styles for the Case Module

  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.THEME_COLOR,
  },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.038), // Dynamic font size for heading
    fontFamily: FONT_FAMILY.MontserratMedium,
    flexShrink: 1,
  },
  contentStyle: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.035),
    paddingRight: 20,
    flexShrink: 1, // Allow the text to shrink if needed
  },
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031), // Smaller font size for small heading
    marginRight: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  headingAddressStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.034), // Dynamic font size for heading
    marginRight: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  iconSize: {
    height: height(0.025),
    width: height(0.025),
    tintColor: COLORS.APP_COLOR,
    marginLeft: 10,
  },
  //Status tab
  contentStyleSmall: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    flexShrink: 1,
  },
  viewStyle: {
    padding: height(0.02),
  },
  cardStyle: {
    borderColor: COLORS.GRAY_MEDIUM,
    padding: 0,
    borderRadius: 10, // Rounded corners to match the image
    borderWidth: 0,
    elevation: 3, // Subtle shadow (reduced from 5 for a lighter effect)
    marginVertical: height(0.01), // Slightly increased for better spacing
    marginHorizontal: 5, // Adjusted for consistency with the image
    backgroundColor: COLORS.WHITE, // Ensure white background
  },
  cardContainer: {
    backgroundColor: COLORS.LIST_CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '98%',
    // width: WINDOW_WIDTH - WINDOW_WIDTH * 0.09,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: COLORS.APP_COLOR,
    marginVertical: height(0.01),
  },
});
