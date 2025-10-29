import { View, StyleSheet, Text } from 'react-native';
import { ScheduleModel } from '../../utils/interfaces/ISubScreens';
import { formatDate } from '../../utils/helper/helpers';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import globalStyles from '../../theme/globalStyles';
import { fontSize, iconSize } from '../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// MyScheduleItemView Component
interface MyScheduleItemViewProps {
  rowData: ScheduleModel;
  orientation: string;
  navigation: any;
}

export const MyScheduleItemView: React.FC<MyScheduleItemViewProps> = ({ rowData }) => {
  return (
    <View style={[globalStyles.cardContainer]}>
      <View style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.subjectStyle}>{rowData.subject || ''}</Text>
          <View style={styles.infoRow}>
            <Icon
              name="calendar"
              size={22}
              color={COLORS.APP_COLOR}
              style={{ marginRight: 6, marginTop: 6 }}
            />
            <Text style={styles.contentStyle}>
              {formatDate(rowData.appointmentDate || '', 'MM/DD/YYYY')}
            </Text>
            {rowData.startTime && rowData.endTime ? (
              <>
                <Icon
                  name="clock"
                  size={22}
                  color={COLORS.APP_COLOR}
                  style={{ marginLeft: 10, marginRight: 6, marginTop: 6 }}
                />
                <Text style={styles.contentStyle}>{rowData.startTime || ''}</Text>
                <Text style={styles.contentStyle}> To </Text>
                <Text style={styles.contentStyle}>{rowData.endTime || ''}</Text>
              </>
            ) : (
              <View></View>
            )}
          </View>

          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: rowData.appointmentStatus?.color || COLORS.GRAY_LIGHT,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {`Status- ${rowData.appointmentStatus?.title || ''}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 5,
    elevation: 5,
    marginVertical: 5,
    marginHorizontal: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    marginBottom: 3,
    marginLeft: 10,
  },
  subjectStyle: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.04),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textAlign: 'left',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  contentStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratRegular,
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    alignItems: 'center',
  },
  statusStyle: {
    fontSize: fontSize(0.03),
    color: COLORS.WHITE,
    borderRadius: 2,
    padding: 8,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  icon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    marginRight: 3,
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
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 8,
  },
});
