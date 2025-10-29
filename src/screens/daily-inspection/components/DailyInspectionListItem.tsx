import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HTMLView from 'react-native-htmlview';

import { DailyInspectionModel } from '../../../utils/interfaces/ISubScreens';

import {
  fontSize,
  height,
  iconSize,
  isIPad,
  width,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import TextHeadingAndTitleView from '../../../components/common/TextHeadingAndTitleView';
import { navigate } from '../../../navigation/Index';
import useNetworkStore from '../../../store/networkStore';
import { convertFrom24To12Format, formatDate } from '../../../utils/helper/helpers';
import globalStyles from '../../../theme/globalStyles';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { handleLocationPress } from '../DailyInspectionService';

// Define interfaces for better type safety
interface LocationData {
  Latitude?: string;
  Longitude?: string;
  Address?: string;
}

interface DailyInspectionListItemProps {
  rowData: DailyInspectionModel;
  getCaseByCID: (
    caseId: string,
    type: 'Case' | 'License',
    flag: number,
    inspectionId?: string,
  ) => void;
  drag: () => void;
  isDraggable: boolean;
  isOnline: boolean;
  isShowStatus: boolean;
  caseOrLicenseNumber: boolean;
  caseOrLicenseType: boolean;
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
}

// Component for rendering status badge
const StatusBadge: React.FC<{
  backgroundColor: string;
  iconName: string;
  text: string;
  textColor?: string;
  onPress?: () => void;
  textStyle?: object;
}> = ({ backgroundColor, iconName, text, textColor = COLORS.WHITE, onPress, textStyle }) => (
  <TouchableOpacity style={{ marginTop: 5 }} activeOpacity={1} onPress={onPress}>
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <View>
        <Icon name={iconName} size={20} color={COLORS.BLUE_COLOR} />
      </View>
      <View style={textStyle}>
        <Text
          style={[styles.statusText, { color: textColor, marginVertical: height(0.002) }]}
          numberOfLines={1}
        >
          {text}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Component for rendering publish badge
const PublishBadge: React.FC<{
  iconName: string;
  text: string;
  onPress?: () => void;
}> = ({ iconName, text, onPress }) => (
  <TouchableOpacity style={{ marginTop: 5 }} activeOpacity={1} onPress={onPress}>
    <View style={styles.publishBadge}>
      <View>
        <Icon name={iconName} size={20} color={COLORS.APP_COLOR} />
      </View>
      <View>
        <Text style={styles.publishText} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const DailyInspectionListItem: React.FC<DailyInspectionListItemProps> = ({
  rowData,
  getCaseByCID,
  drag,
  isDraggable,
  isOnline,
  isShowStatus,
  caseOrLicenseNumber,
  caseOrLicenseType,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useMemo(() => new Animated.Value(0), []);
  const { isNetworkAvailable } = useNetworkStore();
  // Parse location safely
  const location: LocationData | null = useMemo(() => {
    try {
      return rowData.location ? JSON.parse(rowData.location) : null;
    } catch {
      return null;
    }
  }, [rowData.location]);

  // Parse form links safely
  const formLinks = useMemo(() => {
    try {
      return rowData.advancedFormLinksJson ? JSON.parse(rowData.advancedFormLinksJson) : [];
    } catch (error) {
      console.warn('Invalid JSON in advancedFormLinksJson:', error);
      return [];
    }
  }, [rowData.advancedFormLinksJson]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      Animated.timing(expandAnim, {
        toValue: prev ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return !prev;
    });
  }, [expandAnim]);

  const handleCasePress = useCallback(() => {
    if (isNetworkAvailable) {
      console.log('Case or License pressed');
      const id = rowData.caseContentItemId || rowData.licenseContentItemId;
      const type = rowData.caseContentItemId ? 'Case' : 'License';
      getCaseByCID(id, type, 2, rowData.contentItemId);
    } else {
      ToastService.show(TEXTS.alertMessages.notAvailableInOffline, COLORS.WARNING_ORANGE);
    }
  }, [
    isNetworkAvailable,
    rowData.caseContentItemId,
    rowData.licenseContentItemId,
    rowData.contentItemId,
    getCaseByCID,
  ]);

  const handleEditNavigation = useCallback(() => {
    if (isOnline) {
      navigate('EditInspection', {
        param: rowData,
      });
    } else {
      ToastService.show(TEXTS.alertMessages.notAvailableInOffline, COLORS.WARNING_ORANGE);
    }
  }, [isOnline, rowData]);

  const handleCaseOrLicensePress = useCallback(() => {
    const id = rowData.caseContentItemId || rowData.licenseContentItemId;
    const type = rowData.caseContentItemId ? 'Case' : 'License';
    getCaseByCID(id, type, 1);
  }, [rowData.caseContentItemId, rowData.licenseContentItemId, getCaseByCID]);

  const renderFormLink = useCallback(
    ({ item }: { item: { Title: string; Link: string } }) => (
      <TouchableOpacity
        onPress={() => {
          if (isOnline) {
            navigate('OpenInWebView', {
              paramKey: 'params',
              param: item.Link,
              title: 'Daily Inspection',
              isNotSkipScreen: true,
            });
          } else {
            ToastService.show(TEXTS.alertMessages.notAvailableInOffline, COLORS.WARNING_ORANGE);
          }
        }}
      >
        <Text style={styles.formLink}>{item.Title}</Text>
      </TouchableOpacity>
    ),
    [isOnline],
  );

  return (
    <View style={globalStyles.cardContainer}>
      <TouchableOpacity onLongPress={isDraggable ? drag : undefined} disabled={!isDraggable}>
        <View style={{ flexDirection: 'row', flex: 1, gap: width(0.02) }}>
          {isDraggable ? (
            <Icon name="menu" size={24} color={COLORS.BLUE_COLOR} style={{ alignSelf: 'center' }} />
          ) : (
            <View />
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity activeOpacity={1} onPress={handleCasePress}>
                  <TextHeadingAndTitleView
                    heading={rowData?.subject?.toUpperCase() || ''}
                    value=""
                    style={{
                      color: COLORS.APP_COLOR,
                      fontFamily: FONT_FAMILY.MontserratSemiBold,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View>
                {location?.Address && isNetworkAvailable ? (
                  <TouchableOpacity
                    onPress={() => handleLocationPress(location, isNetworkAvailable)}
                  >
                    <Icon name="map-marker-distance" size={20} color={COLORS.BLUE_COLOR} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {location?.Address && (
              <TouchableOpacity onPress={() => handleLocationPress(location, isNetworkAvailable)}>
                <View style={styles.locationContainer}>
                  <Icon
                    name="map-marker"
                    size={20}
                    color={COLORS.BLUE_COLOR}
                    style={{ marginTop: height(0.008) }}
                  />
                  <TextHeadingAndTitleView heading="" value={location.Address} variant="address" />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.badgeContainer}>
              {rowData?.title != '' && isShowStatus && (
                <StatusBadge
                  backgroundColor={rowData.statusColor}
                  iconName={isNetworkAvailable ? 'square-edit-outline' : ''}
                  text={`Status - ${rowData.status}`}
                  textColor={
                    rowData.statusForeColor || rowData.statusColor === '#000000'
                      ? COLORS.WHITE
                      : rowData.statusForeColor
                  }
                  onPress={handleEditNavigation}
                />
              )}

              {caseOrLicenseNumber && (
                <StatusBadge
                  backgroundColor={COLORS.SUCCESS_GREEN}
                  iconName=""
                  text={
                    rowData.caseContentItemId
                      ? `Case - ${rowData.caseNumber}`
                      : `License - ${rowData.licenseNumber}`
                  }
                  onPress={handleCaseOrLicensePress}
                />
              )}

              {caseOrLicenseType && (
                <StatusBadge
                  backgroundColor={COLORS.STEEL_BLUE}
                  iconName=""
                  text={
                    rowData.caseContentItemId
                      ? `Case Type - ${rowData.caseType}`
                      : `License Type - ${rowData.licenseType}`
                  }
                />
              )}

              {(rowData.caseSubTypes || rowData.licenseSubTypes) && (
                <StatusBadge
                  backgroundColor={COLORS.STEEL_BLUE}
                  iconName=""
                  text={
                    rowData.caseContentItemId
                      ? `Case Sub Type - ${rowData.caseSubTypes}`
                      : `License Sub Type - ${rowData.licenseSubTypes}`
                  }
                />
              )}

              {rowData.inspector && (
                <StatusBadge
                  backgroundColor={COLORS.GRAY_LIGHT}
                  iconName={isNetworkAvailable ? 'account-edit' : 'account'}
                  text={rowData.inspector}
                  onPress={handleEditNavigation}
                  textColor={COLORS.BLACK}
                  textStyle={{ maxWidth: WINDOW_WIDTH * 0.8 }}
                />
              )}

              <StatusBadge
                backgroundColor={COLORS.GRAY_LIGHT}
                iconName={isNetworkAvailable ? 'calendar-edit' : 'calendar-clock'}
                text={`${formatDate(rowData.inspectionDate, 'MM/DD/YYYY')} @ ${
                  rowData.preferredTime === 'Day' ||
                  rowData.preferredTime === 'PM' ||
                  rowData.preferredTime === 'AM'
                    ? rowData.preferredTime
                    : rowData.time && rowData.time !== ' - '
                      ? `${convertFrom24To12Format(
                          rowData.time.split('-')[0],
                        )} - ${convertFrom24To12Format(rowData.time.split('-')[1])}`
                      : ''
                }`}
                onPress={handleEditNavigation}
                textColor={COLORS.BLACK}
              />

              {rowData.createdDate && (
                <PublishBadge
                  iconName="calendar-range-outline"
                  text={formatDate(rowData.createdDate, 'MM/DD/YYYY')}
                />
              )}

              {(rowData.licenseContactPhoneNumber || rowData.caseContactPhoneNumber) && (
                <PublishBadge
                  iconName="phone"
                  text={rowData.licenseContactPhoneNumber || rowData.caseContactPhoneNumber}
                />
              )}
            </View>

            {formLinks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.inspectionForms}>
                  <Icon name="file-document" size={20} color={COLORS.APP_COLOR} />
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={formLinks}
                    renderItem={renderFormLink}
                    keyExtractor={(_, index) => index.toString()}
                    style={styles.formList}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        {rowData.body && (
          <View style={styles.bodyContainer}>
            <TouchableOpacity onPress={toggleExpand}>
              <View style={styles.expandButton}>
                <Text style={styles.expandText}>{isExpanded ? 'Read Less' : 'Read More'}</Text>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={26}
                  color={COLORS.APP_COLOR}
                />
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <Animated.View style={{ opacity: expandAnim, marginTop: 10 }}>
                <HTMLView value={rowData.body} />
              </Animated.View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderColor: COLORS.APP_COLOR,
    marginVertical: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
    alignSelf: 'center',
    padding: height(0.02),
  },
  portrait: {
    width: WINDOW_WIDTH * 0.95,
  },
  landscape: {
    width: WINDOW_HEIGHT * 0.942,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: height(0.008),
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 15,
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
    color: COLORS.BLACK,
    fontSize: isIPad ? FONT_SIZE.Font_16 : FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  publishText: {
    color: COLORS.BLACK,
    fontSize: isIPad ? FONT_SIZE.Font_16 : FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  section: {
    marginTop: 20,
  },
  inspectionForms: {
    flexDirection: 'row',
    gap: 8,
  },
  formList: {
    flex: 1,
  },
  formLink: {
    color: COLORS.BLUE_COLOR,
    textDecorationLine: 'underline',
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    marginBottom: 10,
  },
  bodyContainer: {
    marginTop: 10,
    paddingLeft: width(0.056),
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandText: {
    flex: 1,
    color: COLORS.APP_COLOR,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  expandIcon: {
    width: iconSize(0.015),
    height: iconSize(0.015),
  },
});

export default memo(DailyInspectionListItem);
