import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
  listContainer: {
    flex: 1,
    marginTop: height(0.01),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: height(0.02),
    paddingHorizontal: 10,
  },
  headerText: {
    color: COLORS.TEXT_COLOR,
    fontFamily: FONT_FAMILY.MontserratBold,
    fontSize: fontSize(0.025),
    marginRight: 10,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    borderRadius: 5,
    padding: 6,
    marginRight: height(0.01),
    marginLeft: height(0.01),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    height: 30,
  },
  searchIconContainer: {
    alignItems: 'flex-end',
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: COLORS.APP_COLOR,
  },
  filterButton: {
    height: height(0.035),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
