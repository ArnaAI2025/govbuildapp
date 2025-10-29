import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { fontSize, height, WINDOW_HEIGHT } from '../../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 10,
  },
  cardContainer: {
    flexDirection: 'column',
    paddingTop: 15,
    flex: 1,
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexRow: {
    flexDirection: 'row',
  },
  syncBtnView: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.045),
    borderRadius: 6,
    marginBottom: '6%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  // syncBtnView: {
  //   backgroundColor: COLORS.APP_COLOR,
  //   height: height(0.045),
  //   width:'87%',
  //   borderRadius: 6,
  //   // marginBottom: "5%",
  //   marginBottom:40,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginHorizontal: 6,
  // },
  syncBtnText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  syncOnlineToOfflineContainer: {
    position: 'absolute',
    // bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 35,
    backgroundColor: COLORS.WHITE, //COLORS.VERY_LIGHT_CYAN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncOnlineToOfflineText: {
    fontSize: FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.APP_COLOR,
  },
  // Process bar style
  progressContainer: {
    marginTop: 20,
    width: '50%',
    alignSelf: 'center',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  scrollViewStyle: {
    backgroundColor: COLORS.WHITE,
    flexGrow: 1,
    minHeight: WINDOW_HEIGHT,
  },
  cardWrapper: {
    // padding: 8,
  },
});
