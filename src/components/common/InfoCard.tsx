import React, { memo } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import IMAGES from '../../theme/images';
import TextHeadingAndTitleView from '../../components/common/TextHeadingAndTitleView';
import { COLORS } from '../../theme/colors';
import { TEXTS } from '../../constants/strings';
import { height, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { openMaps } from '../../utils/helper/helpers';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import globalStyles from '../../theme/globalStyles';
import type { CaseLicenseItemProps } from '../../utils/interfaces/ISubScreens';

const InfoCard: React.FC<CaseLicenseItemProps> = ({
  item,
  cardType = 'case',
  onPress,
  orientation,
  isNetworkAvailable,
}) => {
  const isLicense = cardType === 'license';
  const typeLabel = isLicense ? TEXTS.license.licenseTypes : TEXTS.caseScreen.caseType;
  const typeValue = isLicense ? (item?.licenseType ?? 'N/A') : (item?.caseType ?? 'N/A');

  const statusLabel = isLicense
    ? `Status - ${item?.licenseStatus ?? 'Unknown'}`
    : `Status - ${item?.caseStatus ?? 'Unknown'}`;

  const statusBadgeColor = isLicense
    ? (item?.statusColor ?? COLORS.BLACK)
    : (item?.caseStatusColor ?? COLORS.BLACK);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.container, orientation === 'PORTRAIT' ? styles.portrait : styles.landscape]}
    >
      <TextHeadingAndTitleView heading={item?.displayText ?? ''} value="" />

      <TextHeadingAndTitleView variant="small" heading={`${typeLabel} -`} value={typeValue} />

      {item?.location?.trim() && item.location !== '0' && !isLicense && (
        <View>
          {item?.location?.trim() && item.location !== '0' ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openMaps(item?.location.trim(), isNetworkAvailable)}
            >
              <TextHeadingAndTitleView
                heading={`${TEXTS.caseScreen.address} -`}
                value={item.location.trim()}
                variant="address"
              />
            </TouchableOpacity>
          ) : (
            <TextHeadingAndTitleView
              heading={`${TEXTS.caseScreen.address} -`}
              value={'N/A'}
              variant="address"
            />
          )}
        </View>
      )}

      <View style={styles.badgeContainer}>
        <View style={styles.publishBadge}>
          <Text style={styles.publishText}>
            {item?.published ? TEXTS.caseScreen.published : TEXTS.caseScreen.draft}
          </Text>
        </View>
        {item?.viewOnlyAssignUsers ? (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.RED }]}>
            <Text style={styles.statusText}>{TEXTS.license.private}</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusBadgeColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        {item?.isEditable ? (
          <TouchableOpacity onPress={onPress} style={styles.editIcon}>
            <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(InfoCard, (prev, next) => {
  return (
    prev?.item?.contentItemId === next?.item?.contentItemId &&
    prev?.orientation === next?.orientation &&
    JSON.stringify(prev.item) === JSON.stringify(next.item)
  );
});

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
    columnGap: 6,
    rowGap: 8,
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
    // flexWrap: "wrap",
    // flexShrink: 1,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  publishText: {
    color: COLORS.BLUE_COLOR,
    fontSize: 14,
    fontFamily: FONT_FAMILY.MontserratBold,
    //  flexShrink: 1,
    //  flexWrap: "wrap",
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
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  editIcon: {
    marginLeft: 'auto',
  },
});
