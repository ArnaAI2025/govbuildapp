import { FC, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { fontSize, height, iconSize } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { convertFrom24To12Format, formatDate } from '../../../utils/helper/helpers';
import { DailyInspectionModel } from '../../../utils/interfaces/ISubScreens';
import globalStyles from '../../../theme/globalStyles';
import { FONT_FAMILY } from '../../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define interfaces for type safety
interface Location {
  Address?: string;
}

interface InspectionItem {
  contentItemId: string;
  subject: string;
  location: string | null;
  inspectionDate: string;
  preferredTime: string;
  time: string | null;
  createdDate: string | null;
}

interface InspectionDialogListItemProps {
  item: InspectionItem;
  checked: DailyInspectionModel[];
  setChecked: (checked: DailyInspectionModel[]) => void;
}

// Styles defined using StyleSheet for better performance

const InspectionDialogListItem: FC<InspectionDialogListItemProps> = ({
  item,
  checked,
  setChecked,
}) => {
  const handleCheckboxChange = (newValue: boolean): void => {
    const newIds = [...checked];
    const index = newIds.indexOf(item?.contentItemId);

    if (newValue) {
      if (index === -1) {
        newIds.push(item.contentItemId);
      }
    } else {
      if (index > -1) {
        newIds.splice(index, 1);
      }
    }

    setChecked(newIds);
  };

  const renderLocation = (): JSX.Element => {
    if (!item.location) return <View />;

    try {
      const location: Location = JSON.parse(item.location);
      if (!location.Address) return <View />;

      return (
        <View style={styles.locationRow}>
          <Icon name={'map-marker'} size={20} color={COLORS.BLUE_COLOR} />

          <Text>{location.Address}</Text>
        </View>
      );
    } catch (error) {
      console.error('Error parsing location:', error);
      return <View />;
    }
  };

  const renderTimeInfo = (): JSX.Element => {
    const isPreferredTime = ['Day', 'PM', 'AM'].includes(item.preferredTime);
    const timeText = isPreferredTime
      ? item.preferredTime
      : item.time && item.time !== ' - '
        ? `${convertFrom24To12Format(item.time.split('-')[0])} - ${convertFrom24To12Format(item.time.split('-')[1])}`
        : '';

    return (
      <View style={styles.contentBox}>
        {/* <Image
          resizeMode="contain"
          style={styles.contentIcon}
          source={require('../../assets/images/clock.png')}
        /> */}
        <Icon name={'calendar-clock'} size={20} color={COLORS.BLUE_COLOR} />

        <Text style={styles.contentText} numberOfLines={1}>
          {formatDate(item.inspectionDate, 'MM/DD/YYYY')} @ {timeText}
        </Text>
      </View>
    );
  };

  const renderCreatedDate = (): JSX.Element => {
    if (!item.createdDate) return <View />;

    return (
      <View style={styles.contentBox}>
        <Icon name={'calendar-range-outline'} size={20} color={COLORS.BLUE_COLOR} />
        <Text style={styles.contentText} numberOfLines={1}>
          {formatDate(item.createdDate, 'MM/DD/YYYY')}
        </Text>
      </View>
    );
  };

  return (
    <View style={globalStyles.cardContainer}>
      <View style={styles.row}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Checkbox
          value={checked.includes(item?.contentItemId)}
          onValueChange={handleCheckboxChange}
          color={checked.includes(item?.contentItemId) ? COLORS.APP_COLOR : COLORS.GRAY_DARK}
        />
      </View>
      {renderLocation()}
      <View style={styles.contentContainer}>
        {renderTimeInfo()}
        {renderCreatedDate()}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: height(0.018),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_DARK,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  circle: {
    borderRadius: 100,
    elevation: 10,
    backgroundColor: '#00d664',
    shadowColor: '#fff',
    shadowOpacity: 2,
    shadowRadius: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    width: 10,
    height: 10,
    marginRight: 10,
  },
  subjectText: {
    flex: 1,
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  locationRow: {
    flexDirection: 'row' as const,
    marginTop: 5,
    gap: 5,
    alignItems: 'center' as const,
  },
  locationIcon: {
    width: iconSize(0.017),
    height: iconSize(0.017),
    marginRight: 5,
    tintColor: COLORS.BLACK,
  },
  contentContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    marginTop: 10,
  },
  contentBox: {
    borderRadius: 3,
    paddingTop: 3,
    paddingHorizontal: 10,
    paddingBottom: 3,
    marginRight: 10,
    marginTop: 5,
    backgroundColor: COLORS.GRAY_LIGHT,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  contentIcon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.015),
    height: iconSize(0.015),
  },
  contentText: {
    fontSize: fontSize(0.03),
    fontWeight: '500',
    color: COLORS.BLACK,
    marginLeft: 5,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(InspectionDialogListItem);
