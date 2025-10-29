import { Platform, StyleSheet } from 'react-native';
import { fontSize, height, iconSize } from '../../../utils/helper/dimensions';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: height(0.01),
    marginTop: height(0.01),
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
    marginTop: 15,
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
  },
  editIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },

  // Edit case styles
  inputFieldStyle: {
    marginTop: 15,
  },
  scrollView: {
    flex: 1,
    marginBottom: height(0.01),
    marginTop: height(0.01),
  },
  chevronContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingBottom: 15,
  },
  chevronItem: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
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
  timeText: {
    marginLeft: 5,
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

  topbarBackground: {
    width: WINDOW_WIDTH,
    justifyContent: 'center',
  },

  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },

  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  formInput: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    height: height(0.05),
    backgroundColor: COLORS.BLACK,
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
  smallIconStyle: {
    width: iconSize(0.02),
    height: iconSize(0.02),
  },
  inputViewStyle: {
    flexDirection: 'column',
    marginBottom: height(0.03),
    paddingHorizontal: 6,
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
  // License sub contant
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
  marginTopStyle: { marginTop: height(0.01) },
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
  flexStyle: { flexDirection: 'row', alignItems: 'center' },
  assignedView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height(0.02),
    marginBottom: height(0.01),
  },
  checkBox: { borderRadius: 5 },
  calendarIcon: {
    height: iconSize(0.03),
    width: iconSize(0.03),
  },
  infoContainer: { backgroundColor: COLORS.WHITE, padding: 10 },

  // alert container
  alertContainer: {
    padding: height(0.015),
    backgroundColor: COLORS.RED_TRANS,
  },
  alertHeader: {
    flexDirection: 'row',
    height: height(0.03),
    alignItems: 'center',
  },
  alertTitle: {
    flex: 1,
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
  },
  alertIcon: {
    width: iconSize(0.015),
    height: iconSize(0.015),
    tintColor: COLORS.RED,
  },
  alertItem: {
    paddingTop: 10,
  },
  inputWrapper: {
    marginBottom: 10,
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
  input: {
    height: 80,
    lineHeight: 24,
    backgroundColor: COLORS.WHITE,
    marginBottom: 0,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    justifyContent: 'center',
  },
  additionalInfo: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  floatingLabel: {
    fontSize: FONT_SIZE.Font_12,
    color: COLORS.DRAWER_TEXT_COLOR,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 1,
  },
});
