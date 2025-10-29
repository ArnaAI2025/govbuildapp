import { COLORS } from '../../theme/colors';
import { Platform, StyleSheet } from 'react-native';
import {
  fontSize,
  height,
  iconSize,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';

export const styles = StyleSheet.create({
  headerView: {
    marginTop: height(-0.036),
    zIndex: 3,
  },
  labelStyle: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
  },
  iconStyle: {
    width: height(0.03),
    height: height(0.03),
    resizeMode: 'contain',
    tintColor: COLORS.APP_COLOR,
  },
  privateCaseBtn: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.03),
    borderRadius: 2,
    paddingTop: 3,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 3,
  },
  listContainer: {
    flex: 1,
    marginTop: height(0.01),
  },

  dropdownStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // CaseItem styles
  container: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.APP_COLOR,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
  },
  portrait: {
    width: WINDOW_WIDTH - WINDOW_WIDTH * 0.05,
  },
  landscape: {
    width: WINDOW_HEIGHT - WINDOW_WIDTH * 0.058,
  },
  content: {
    flexDirection: 'column',
    padding: height(0.02),
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    columnGap: 6, // Optional: spacing between badges
    rowGap: 8,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  publishText: {
    color: COLORS.BLUE_COLOR,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  editIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },

  // Edit case styles
  scrollView: {
    padding: 10,
    flex: 1,
  },
  chevronContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingBottom: 15,
  },
  chevronItem: {},
  infoRowEdited: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height(0.01),
  },
  flexText: {
    flex: 1,
  },
  dateTimeText: {
    marginLeft: 5,
    marginRight: 10,
  },
  title: {
    width: WINDOW_WIDTH * 0.2,
    color: COLORS.BLACK,
    fontSize: fontSize(0.022),
  },
  heading: {
    flex: 1,
    color: COLORS.GRAY_MEDIUM,
    fontSize: fontSize(0.022),
  },

  editCaseContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    marginBottom: height(0.01),
    marginTop: height(0.01),
  },
  topbarBackground: {
    width: WINDOW_WIDTH,
    justifyContent: 'center',
  },
  datePicker: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    alignItems: 'center',
    padding: 5,
    height: height(0.05),
    backgroundColor: COLORS.BLACK,
  },
  formInput: {
    flex: 1,
    borderBottomWidth: 0,
    borderWidth: 1,
    alignItems: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    height: height(0.05),
    backgroundColor: COLORS.WHITE,
  },
  editLabelStyle: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.03),
  },

  inputStyle: {
    color: COLORS.BLACK,
    paddingHorizontal: 5,
    fontSize: fontSize(0.022),
  },

  pickerViewStyle: {
    borderWidth: 0,
    marginBottom: Platform.OS == 'android' ? 10 : 5,
    borderRadius: 0,
    backgroundColor: COLORS.BLACK,
    height: height(0.05),
  },
  editIconStyle: {
    width: iconSize(0.03),
    height: iconSize(0.03),
  },
  inputViewStyle: {
    flexDirection: 'column',
    marginBottom: height(0.04),
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_MEDIUM,
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  label: {
    fontSize: fontSize(0.028),
    marginBottom: 5,
  },
  inputWrapper: {
    marginBottom: 10, // Adds gap between inputs/dropdowns
    // // zIndex: 1,
    marginTop: 10,
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    padding: 5,
    minHeight: height(0.1),
  },
  tabContainer: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tabItem: {
    backgroundColor: COLORS.LIST_BUTTON_BG,
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabText: {
    fontSize: FONT_SIZE.Font_15,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  arrowIcon: {
    width: height(0.03),
    height: height(0.03),
    tintColor: COLORS.APP_COLOR,
  },
});
