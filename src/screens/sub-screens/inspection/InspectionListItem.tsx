import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { fontSize, height } from '../../../utils/helper/dimensions';
import { convertFrom24To12Format, formatDate } from '../../../utils/helper/helpers';
import { COLORS } from '../../../theme/colors';
import globalStyles from '../../../theme/globalStyles';

interface CustomTextViewWithImageProps {
  heading: string;
  title: string;
}

const CustomTextViewWithImage: React.FC<CustomTextViewWithImageProps> = ({ heading, title }) => (
  <View style={styles.textContainer}>
    <Text style={styles.headingStyleSmall} numberOfLines={1}>{`${heading} - `}</Text>
    <Text style={styles.contentStyleSmall} numberOfLines={1}>
      {title}
    </Text>
  </View>
);

export const InspectionListItem: React.FC<InspectionListItemProps> = ({
  rowData,
  navigation,
  isOnline,
  type,
  caseDataById,
  caseOrLicenseData,
}) => (
  <Card style={globalStyles.cardStyle}>
    <View style={styles.cardContent}>
      <View style={styles.header}>
        <Text style={styles.subject}>
          <Text style={styles.headingStyle}>{`${rowData.subject} - `}</Text>
          <Text style={styles.eventType}>
            {rowData.submissionId == null ? 'Event' : 'Submission'}
          </Text>
        </Text>
        {isOnline && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('InspectionSchedule', {
                param: caseDataById,
                type,
                inspectionId: rowData.contentItemId,
                isNew: false,
                caseData: caseOrLicenseData,
              })
            }
          >
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View>
        <CustomTextViewWithImage heading="Inspector" title={rowData.scheduleWithName || ''} />
        <CustomTextViewWithImage
          heading="Date"
          title={formatDate(rowData.appointmentDate, 'MM-DD-YYYY')}
        />
        <CustomTextViewWithImage
          heading="Start Time"
          title={rowData.startTime ? convertFrom24To12Format(rowData.startTime) : ''}
        />
        <CustomTextViewWithImage
          heading="End Time"
          title={rowData.endTime ? convertFrom24To12Format(rowData.endTime) : ''}
        />
        <CustomTextViewWithImage heading="Preferred Time" title={rowData.preferredTime || ''} />
        <CustomTextViewWithImage heading="Type" title={rowData.type || ''} />
        <CustomTextViewWithImage heading="Status" title={rowData.statusLabel || ''} />
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  cardContent: { padding: height(0.02) },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  subject: { flex: 1 },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
    marginRight: 5,
    fontWeight: '600',
  },
  eventType: {
    borderRadius: 2,
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.035),
    padding: 5,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 2,
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
    padding: 5,
    marginLeft: 10,
    minWidth: WINDOW_WIDTH * 0.1,
    textAlign: 'center',
  },
  textContainer: { flexDirection: 'row', marginTop: 10 },
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032),
    fontWeight: '500',
    marginRight: 5,
  },
  contentStyleSmall: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    paddingRight: 20,
    flexShrink: 1,
  },
});
