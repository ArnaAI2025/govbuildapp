import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';

export const styles = StyleSheet.create({
  addCommentContainer: {
    backgroundColor: COLORS.BOX_COLOR,
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 2,
    //marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.APP_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonIcon: {
    width: iconSize(0.025),
    height: iconSize(0.025),
    tintColor: COLORS.WHITE,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'flex-end',
    maxHeight: 200, // Increased from 170 to 200
    marginBottom: 20,
  },
  richEditor: {
    flex: 1,
    minHeight: height(0.045),
    //  height: height(0.2),
    //   maxHeight: height(0.2),
  },
  sendButton: {
    padding: 8,
    alignSelf: 'flex-end',
  },
  sendIcon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    tintColor: COLORS.APP_COLOR,
  },
  publicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  publicToggleText: {
    fontSize: FONT_SIZE.Font_16,
    color: COLORS.BLACK_LITE,
  },
  emptyText: {
    fontSize: FONT_SIZE.Font_16,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginTop: 20,
  },
  commentsList: {
    paddingBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputStyle: {
    color: COLORS.BLACK,
    flex: 1,
    paddingHorizontal: 5,
    fontSize: fontSize(0.022),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  // CommentItem
  commentContainer: {
    backgroundColor: COLORS.LIST_CARD_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderColor: COLORS.BOX_BORDER_COLOR,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: FONT_SIZE.Font_14,
    fontWeight: 'bold',
    color: COLORS.BLACK_LITE,
    marginLeft: 5,
  },
  commentDate: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginLeft: 5,
  },
  commentText: {
    fontSize: FONT_SIZE.Font_15,
    color: COLORS.BLACK_LITE,
    marginVertical: 10,
  },
  publicLabel: {
    fontSize: 14,
    color: COLORS.APP_COLOR,
    fontStyle: 'italic',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: FONT_SIZE.Font_14,
    color: COLORS.BLACK_LITE,
    marginLeft: 8,
  },
  smallIcon: {
    width: iconSize(0.015),
    height: iconSize(0.015),
    marginLeft: 5,
    tintColor: COLORS.APP_COLOR,
  },
  icon: {
    width: iconSize(0.02),
    height: iconSize(0.02),
    tintColor: COLORS.APP_COLOR,
  },
  // File related
  fileSection: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //  marginBottom: 10,
  },
  fileHeaderText: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.04),
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontWeight: '500',
  },
  fileCountText: {
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratRegular,
    color: COLORS.BLACK,
  },
  fileItem: {
    width: WINDOW_WIDTH - 30,
    height: height(0.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  fileImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  fileName: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratRegular,
    marginTop: 10,
    maxWidth: WINDOW_WIDTH * 0.8,
    textAlign: 'center',
  },
});
