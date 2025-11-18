import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { fontSize, height, width } from '../../../../utils/helper/dimensions';
import { COLORS } from '../../../../theme/colors';
import { formatDate } from '../../../../utils/helper/helpers';
import type { ContractorTabItemProps } from '../../../../utils/interfaces/ISubScreens';
import { TEXTS } from '../../../../constants/strings';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import globalStyles from '../../../../theme/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY } from '../../../../theme/fonts';
import IMAGES from '../../../../theme/images';
import ExpandableText from '../../../../components/common/ExpandableText';

export const ContractorTabItem: React.FC<ContractorTabItemProps> = ({
  rowData,
  navigation,
  type,
  caseID,
  isNetworkAvailable,
  caseData,
}) => (
  <View style={globalStyles.cardContainer}>
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        if (isNetworkAvailable) {
          navigation.navigate('AddContract', {
            param: rowData,
            addNew: false,
            type,
            contentItemId: caseID,
            caseData,
          });
        }
      }}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row' }}>
        <Icon name="pound" size={24} color={COLORS.APP_COLOR} />
        <Text style={[styles.heading, { padding: height(0.012), color: COLORS.BLACK }]}>
          {rowData.number || 'Contractor Number'}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.contentContainer}>
        {rowData.applicantName && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.contactName}
            line={1}
            title={rowData.applicantName}
            headingStyle={styles.subHeading} // Added custom style for heading
            titleStyle={styles.subText} // Added custom style for title
          />
        )}
        {rowData.email && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.email}
            line={1}
            title={rowData.email}
            headingStyle={styles.subHeading}
            titleStyle={styles.subText}
          />
        )}
        {rowData.phoneNumber && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.phoneNumber}
            line={1}
            title={rowData.phoneNumber}
            titleStyle={styles.subText}
          />
        )}
        {rowData.businessName && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.businessName}
            line={1}
            title={rowData.businessName}
            headingStyle={styles.subHeading}
            titleStyle={styles.subText}
          />
        )}
        {rowData.isAllowAccess != null && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.isAllowAccess}
            line={1}
            title={rowData.isAllowAccess ? 'Yes' : 'No'}
            headingStyle={styles.subHeading}
            titleStyle={styles.subText}
          />
        )}

        {rowData.endDate && (
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.contactAndContract.endDate}
            line={1}
            title={formatDate(rowData.endDate, 'MM-DD-YYYY')}
            headingStyle={styles.subHeading}
            titleStyle={styles.subText}
          />
        )}
        {rowData.notes && rowData.notes !== '' && (
          <View
            style={{
              flexDirection: 'row',
              marginRight: width(0.05),
              marginTop: height(0.005),
            }}
          >
            <Text style={[styles.headingStyleSmall, styles.subHeading]}>Notes -</Text>
            <ExpandableText text={rowData.notes || ''} numberOfLines={1} />
          </View>
        )}
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => {
            if (isNetworkAvailable) {
              navigation.navigate('AddContract', {
                param: rowData,
                addNew: false,
                type,
                contentItemId: caseID,
                caseData,
              });
            }
          }}
        >
          {isNetworkAvailable &&
            (!caseData?.isStatusReadOnly ? (
              <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
            ) : (
              <Icon name="arrow-right" size={24} color={COLORS.APP_COLOR} />
            ))}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderColor: COLORS.GRAY_MEDIUM,
    padding: 0,
    borderRadius: 10, // Rounded corners to match the image
    borderWidth: 0,
    elevation: 3, // Subtle shadow (reduced from 5 for a lighter effect)
    marginVertical: height(0.015), // Slightly increased for better spacing
    marginHorizontal: 5, // Adjusted for consistency with the image
    backgroundColor: COLORS.WHITE, // Ensure white background
  },
  heading: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.04), // Larger font size for the heading
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  divider: {
    width: '100%', // Relative width for better adaptability
    height: 0.5,
    backgroundColor: COLORS.APP_COLOR,
  },
  contentContainer: {
    padding: height(0.01),
  },
  subHeading: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035), // Slightly smaller than the main heading but still prominent
    fontWeight: 'bold', // Bold to match the image's style
  },
  subText: {
    color: COLORS.GRAY_DARK, // Lighter color to match the subtext style in the image
    fontSize: fontSize(0.03), // Smaller font size for the values
    fontWeight: 'normal', // Regular weight for subtext
  },
  editIcon: {
    marginLeft: 'auto',
  },
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032), // Slightly larger for prominence
    fontFamily: FONT_FAMILY.MontserratMedium, // Bold to match the image's style
    marginRight: 5,
  },
});
