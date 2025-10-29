import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  contentStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratMedium,
    flex: 1,
  },
  inputFieldStyle: {},
  filterIconContainer: {
    position: 'relative',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: height(0.01),
    marginRight: height(0.005),
    gap: 6,
  },
  // Search container
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
  searchIconContainer: {
    alignItems: 'flex-end',
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: COLORS.APP_COLOR,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    height: 30,
  },
  filterButton: {
    height: height(0.035),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.RED,
  },
  toggleContainer: {
    width: 45,
    height: 25,
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 10,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});
