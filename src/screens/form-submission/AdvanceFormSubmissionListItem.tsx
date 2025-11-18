import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { SubmissionModel } from '../../utils/interfaces/ISubScreens';
import { height, isIPad, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import TextHeadingAndTitleView from '../../components/common/TextHeadingAndTitleView';
import { ToastService } from '../../components/common/GlobalSnackbar';

interface AdvanceFormSubmissionListItemProps {
  rowData: SubmissionModel;
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
}

export const AdvanceFormSubmissionListItem: React.FC<AdvanceFormSubmissionListItemProps> = ({
  rowData,
  orientation,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        ToastService.show('This is only for view in the app.', COLORS.WARNING_ORANGE);
      }}
      activeOpacity={0.6}
      style={[styles.container, orientation === 'PORTRAIT' ? styles.portrait : styles.landscape]}
    >
      <TextHeadingAndTitleView heading={rowData?.DisplayText ?? ''} value={''} />
      <View style={styles.divider} />
      <View style={styles.badgeContainer}>
        <View style={[styles.publishBadge]}>
          <Icon name={'file-document-outline'} size={20} color={COLORS.BLUE_COLOR} />
          <Text style={[styles.publishText, { fontFamily: FONT_FAMILY.MontserratBold }]}>
            {'AdvancedFormSubmissions'}
          </Text>
        </View>
      </View>
      <View style={styles.badgeContainer}>
        <View style={[styles.publishBadge, { paddingVertical: 6 }]}>
          <Text style={[styles.publishText, { fontFamily: FONT_FAMILY.MontserratBold }]}>
            {rowData.Published ? 'Published' : 'Draft'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: COLORS.APP_COLOR_Light,
            },
          ]}
        >
          <Icon name={'clipboard-list-outline'} size={20} color={COLORS.WHITE} />
          <Text style={styles.statusText}>{rowData.Status}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: COLORS.GRAY_LIGHT }]}>
          <Icon name={'calendar-clock'} size={20} color={COLORS.BLUE_COLOR} />
          <Text style={styles.publishText}>{rowData.ModifiedDateText}</Text>
        </View>

        <View style={[styles.publishBadge, { borderRadius: 8 }]}>
          <Icon name="account" size={20} color={COLORS.APP_COLOR} />
          <Text style={[styles.publishText, { color: COLORS.BLACK }]}>{rowData.Author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.APP_COLOR,
    marginVertical: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
    alignSelf: 'center',
    flexDirection: 'column',
    padding: height(0.02),
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
    flexWrap: 'wrap',
    columnGap: 5,
    rowGap: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: isIPad ? FONT_SIZE.Font_16 : FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  publishText: {
    color: COLORS.BLUE_COLOR,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  privateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.DARK_RED,
    borderRadius: 4,
    marginTop: 10,
  },
  privateText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  editIcon: {
    marginLeft: 'auto',
  },
  divider: {
    width: '100%',
    height: 0,
    backgroundColor: COLORS.GRAY_LIGHT,
    marginTop: height(0.005),
  },
});
