import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  cardBorder,
  fontSize,
  height,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import TextHeadingAndTitleView from '../../../components/common/TextHeadingAndTitleView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { parseAndFormatDate } from '../../../utils/helper/helpers';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import globalStyles from '../../../theme/globalStyles';

interface SyncHistoryRecord {
  title: string;
  updateDate: string;
  itemName: string;
  itemType: string;
  subTypeTitle: string;
}

interface HistoryItemViewProps {
  data: SyncHistoryRecord;
}

const HistoryItemView: React.FC<HistoryItemViewProps> = ({ data }) => {
  const customMappings: Record<string, string> = {
    attachment: 'Attached Docs',
    admin_notes: 'Admin Notes',
    comment: 'Public Comments',
  };
  const formatName = (str: string) => {
    const lower = str.toLowerCase();
    if (customMappings[lower]) {
      return customMappings[lower];
    }
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const buildSyncedAreasItem = (areas: Array<{ subTypeTitle: string }> = []) => {
    const uniqueNames = new Set<string>();

    areas.forEach((s) => {
      const name = formatName(s.subTypeTitle || '');
      if (name) {
        uniqueNames.add(name);
      }
    });

    return Array.from(uniqueNames).join(', ');
  };

  const syncedAreasItem = buildSyncedAreasItem(data?.SyncedArea);

  return (
    <View style={globalStyles.cardContainer}>
      <TouchableOpacity onPress={() => ''} activeOpacity={1}>
        <TextHeadingAndTitleView heading={`${data.title} - ${data.itemName ?? ''}`} value="" />
        <TextHeadingAndTitleView
          variant="small"
          heading={`${'Type'} -`}
          value={data.itemType ?? 'N/A'}
        />
        <TextHeadingAndTitleView
          variant="small"
          heading={`${'Synced area'} -`}
          numberOfLine={5}
          // value={data.subTypeTitle ?? "N/A"}
          value={syncedAreasItem ?? 'N/A'}
        />
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.GRAY_LIGHT }]}>
            <Icon name={'calendar-clock'} size={24} color={COLORS.BLUE_COLOR} />
            <Text style={styles.publishText}>
              {parseAndFormatDate(data.updateDate, 'MM-DD-YYYY hh:mm:ss A')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    marginTop: height(0.02),
    marginHorizontal: height(0.01),
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    padding: '3%',
    alignItems: 'center',
  },
  heading: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
  },
  date: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
  },
  divider: {
    width: '100%',
    marginVertical: 5,
    height: 0.5,
    backgroundColor: COLORS.GRAY_MEDIUM,
  },
  details: {
    padding: '3%',
  },

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
    justifyContent: 'space-between',
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
    fontSize: FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  editIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default HistoryItemView;
