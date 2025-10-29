import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InspectionRowItemProps } from '../../../utils/interfaces/ISubScreens';
import { COLORS } from '../../../theme/colors';
import { convertFrom24To12Format, formatDate } from '../../../utils/helper/helpers';
import { fontSize, height, iconSize, width } from '../../../utils/helper/dimensions';
import IMAGES from '../../../theme/images';
import { CustomTextViewWithImage } from '../../../components/common/CustomTextViewWithImage';
import { FONT_FAMILY } from '../../../theme/fonts';
import globalStyles from '../../../theme/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ExpandableText from '../../../components/common/ExpandableText';

export const InspectionRowItem: React.FC<InspectionRowItemProps> = ({
  rowData,
  navigation,
  isOnline,
  type,
  caseDataById,
  caseOrLicenseData,
}) => {
  const showNotes = !!caseOrLicenseData?.isShowNotesOnInspectionTab;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded((prev) => !prev);
  const completedInspection =
    String(rowData.statusLabel || '')
      .trim()
      .toLowerCase() === 'completed';

  const cleanNotes = rowData?.body
    ?.replace(/<[^>]+>/g, '') // remove HTML tags
    ?.replace(/&nbsp;/g, ' ') // replace &nbsp; with space
    ?.trim();

  return (
    <View
      style={[
        globalStyles.cardContainer,
        // {
        //   width:
        //     orientation === "PORTRAIT"
        //       ? WINDOW_WIDTH - WINDOW_WIDTH * 0.052
        //       : WINDOW_WIDTH - WINDOW_WIDTH * 0.052,
        // },
      ]}
    >
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.subject}>
          <Text style={styles.headingStyle}>{`${rowData.subject} - `}</Text>
          <Text style={styles.eventType}>
            {rowData.submissionId == null ? 'Event' : 'Submission'}
          </Text>
        </Text>
        <Image
          source={isExpanded ? IMAGES.EXPAND_ICON : IMAGES.COLLAPSE_ICON}
          style={styles.icon}
          tintColor={COLORS.APP_COLOR}
        />
      </TouchableOpacity>
      {isExpanded && (
        <>
          <View style={styles.content}>
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
            <CustomTextViewWithImage heading="Type" title={rowData.type || ''} line={0} />
            <CustomTextViewWithImage heading="Status" title={rowData.statusLabel || ''} line={0} />

            {showNotes && (
              <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Text style={styles.headingStyleSmall}>Notes - </Text>
                <ExpandableText text={cleanNotes || ''} numberOfLines={1} />
              </View>
            )}
          </View>
          <View>
            {isOnline && !completedInspection && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('InspectionSchedule', {
                    param: caseDataById,
                    type,
                    inspectionId: rowData.contentItemId,
                    isNew: false,
                    caseData: caseOrLicenseData,
                    comeFromInspectionList: true,
                  })
                }
              >
                <Icon
                  name={
                    caseOrLicenseData.isStatusReadOnly
                      ? 'arrow-right-circle-outline'
                      : 'square-edit-outline'
                  }
                  size={height(0.035)}
                  color={COLORS.APP_COLOR}
                />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.LIST_CARD_BG,
    borderRadius: 5,
    marginVertical: height(0.01),
    padding: height(0.01),
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    borderColor: COLORS.GRAY_MEDIUM,
    borderWidth: 0,
    marginHorizontal: 2, // Adjusted for consistency with the image
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height(0.01),
  },
  subject: { flex: 1 },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  eventType: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.035),
    fontWeight: 'bold',
  },
  icon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
  },
  content: { padding: height(0.02), marginRight: width(0.16) },
  textContainer: {
    flexDirection: 'row',
    marginVertical: height(0.005),
  },
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  contentStyleSmall: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    flexShrink: 1,
  },
  editButton: {
    alignItems: 'flex-end',
  },
  editButtonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
  },
  c: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032), // Slightly larger for prominence
    fontFamily: FONT_FAMILY.MontserratMedium, // Bold to match the image's style
    marginRight: 5,
  },
});
