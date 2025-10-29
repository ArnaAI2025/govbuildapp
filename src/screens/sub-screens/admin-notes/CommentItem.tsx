import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import RenderHtml from 'react-native-render-html';
import Checkbox from 'expo-checkbox';
import { CommentItemProps } from '../../../utils/interfaces/ISubScreens';
import { formatDate, convertTime } from '../../../utils/helper/helpers';
import { COLORS } from '../../../theme/colors';
import { TEXTS } from '../../../constants/strings';
import { useWindowDimensions } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For offline-compatible icons
import { FONT_SIZE } from '../../../theme/fonts';
import { confirmAction } from '../../../components/dialogs/CustomConfirmationDialog';
import globalStyles from '../../../theme/globalStyles';
import ExpandableViewHelperFile from '../../../components/common/ExpandableFileView';

const CommentItem: React.FC<CommentItemProps> = ({
  item,
  userId,
  isFromPublicComment,
  isNetworkAvailable,
  permissions,
  onEditComment,
  onDeleteComment,
  handleSetAsAlert,
  handleMakePublicComment,
  isStatusReadOnly,
  isHighlighted,
}) => {
  const { width } = useWindowDimensions();

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHighlighted]);
  function margeFileData(attachmentString: string, fileNameString: string) {
    const attachmentArray = JSON.parse(attachmentString ?? []);
    const fileNameArray = JSON.parse(fileNameString ?? [])?.map((name) =>
      name?.replace(/__COMMA__/g, ','),
    );
    const mergedArray = [];

    for (let i = 0; i < attachmentArray.length; i++) {
      const attachmentObj = {
        Attachment: attachmentArray[i],
        FileName: fileNameArray[i],
      };
      mergedArray.push(attachmentObj);
    }
    return mergedArray;
  }
  return (
    <Animated.View style={[globalStyles.cardContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {/* Header with Author, Date, and Time */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <Icon name="account" size={20} color={COLORS.BLUE_COLOR} />
          <Text style={styles.authorText}>{item.author}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={18} color={COLORS.GRAY_DARK} />
          <Text style={styles.dateText}>{formatDate(item?.createdUtc, 'MM/DD/YYYY')}</Text>
          <Icon
            name="clock-outline"
            size={18}
            color={COLORS.GRAY_DARK}
            style={styles.iconSpacing}
          />
          <Text style={styles.dateText}>{convertTime(item.createdUtc)}</Text>
        </View>
      </View>

      {/* Comment Content */}
      <RenderHtml
        source={{ html: item.text }}
        contentWidth={width - 32} // Adjust for padding
        tagsStyles={{
          p: styles.commentText,
          div: styles.commentText,
        }}
      />
      <View style={{ paddingTop: 15 }}>
        {isNetworkAvailable &&
        item?.fileName != '' &&
        item?.fileName != null &&
        item?.fileName != '[]' ? (
          <ExpandableViewHelperFile
            data={margeFileData(item?.attachment ?? '', item?.fileName)}
            isNetConnected={isNetworkAvailable}
          />
        ) : item?.attachment != '' && item?.attachment != null && item?.attachment != '[]' ? (
          <ExpandableViewHelperFile
            data={margeFileData(item?.attachment, item?.fileName ?? '')}
            isNetConnected={isNetworkAvailable}
          />
        ) : (
          <View />
        )}
      </View>

      {/* Public Label */}
      {!!item.isPublic && !isFromPublicComment && (
        <View style={styles.publicBadge}>
          <Text style={styles.publicBadgeText}>{TEXTS.subScreens.adminNotes.public}</Text>
        </View>
      )}

      {/* Actions (Checkboxes and Edit/Delete) */}
      <View style={styles.actionsContainer}>
        <View style={styles.checkboxContainer}>
          {!isFromPublicComment && (
            <>
              <View style={styles.actionRow}>
                <Checkbox
                  value={!!item.isAlert}
                  onValueChange={() =>
                    confirmAction(
                      `Are you sure you want to ${item.isAlert ? 'remove' : 'set'} alert?`,
                      () => handleSetAsAlert?.(item.id, !item.isAlert, item?.text),
                    )
                  }
                  color={item.isAlert ? COLORS.APP_COLOR : undefined}
                  style={styles.checkbox}
                  disabled={isStatusReadOnly}
                />
                <Text style={styles.actionText}>{TEXTS.subScreens.adminNotes.setAlert}</Text>
              </View>

              {permissions?.isAllowAllowMakeAdminCommentsPublic &&
                item.text !== TEXTS.subScreens.adminNotes.moderatorComment && (
                  <View style={styles.actionRow}>
                    <Checkbox
                      value={!!item.isPublic}
                      onValueChange={() =>
                        confirmAction(
                          `Are you sure you want to ${
                            item.isPublic ? 'make it private' : 'make it public'
                          }?`,
                          () => handleMakePublicComment?.(item.id, !item.isPublic),
                        )
                      }
                      color={item.isPublic ? COLORS.APP_COLOR : undefined}
                      style={styles.checkbox}
                      disabled={isStatusReadOnly}
                    />
                    <Text style={styles.actionText}>{TEXTS.subScreens.adminNotes.makePublic}</Text>
                  </View>
                )}
            </>
          )}
        </View>
        {/* Edit/Delete Buttons */}
        {userId === item.author?.toLowerCase() &&
          item.text !== TEXTS.subScreens.adminNotes.moderatorComment &&
          isNetworkAvailable && (
            <View style={[styles.buttonContainer, { opacity: isStatusReadOnly ? 0.4 : 1 }]}>
              <TouchableOpacity
                onPress={() =>
                  onEditComment(item.id, item.text, item.attachment ?? '', item.fileName ?? '')
                }
                disabled={isStatusReadOnly}
                accessibilityLabel="Edit comment"
              >
                <Icon name="pencil" size={25} color={COLORS.BLUE_COLOR} />
              </TouchableOpacity>
              {permissions?.allowRemoveAdminComments && (
                <TouchableOpacity
                  onPress={() =>
                    confirmAction(
                      `Are you sure to want to delete the ${
                        !item.isPublic ? 'admin' : 'public'
                      } comment?`,
                      () => onDeleteComment(item.id),
                      `Delete Comment`,
                    )
                  }
                  disabled={isStatusReadOnly}
                  accessibilityLabel="Delete comment"
                >
                  <Icon name="delete" size={25} color={COLORS.APP_COLOR} />
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  iconSpacing: {
    marginLeft: 8,
  },
  commentText: {
    fontSize: FONT_SIZE.Font_15,
    color: COLORS.BLACK,
    lineHeight: 20,
  },
  publicBadge: {
    backgroundColor: COLORS.BLUE_COLOR,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
  },
  publicBadgeText: {
    fontSize: 12,
    color: COLORS.BLUE_COLOR,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default React.memo(CommentItem);
