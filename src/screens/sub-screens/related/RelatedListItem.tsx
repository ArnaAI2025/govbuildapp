import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
//import { Card } from "react-native-paper";
import {
  cardBorder,
  fontSize,
  height,
  iconSize,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import IMAGES from '../../../theme/images';
import { CustomTextUI } from '../../../components/common/CustomTextUI';
import type { RelatedCase } from '../../../utils/interfaces/ISubScreens';
import globalStyles from '../../../theme/globalStyles';
import { FONT_FAMILY } from '../../../theme/fonts';

const RelatedListItem = (rowData: RelatedCase) => {
  if (!rowData || typeof rowData !== 'object') {
    console.error('Invalid or missing rowData passed to RelatedListItem');
    return <View />;
  }

  return (
    <View style={globalStyles.cardContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headingStyle}>{rowData.number}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.contentContainer}>
          {rowData.assignedUsers && rowData.assignedUsers !== '' ? (
            <CustomTextUI
              iconStyle={styles.userIcon}
              color={COLORS.BOX_COLOR}
              backgroundColor={COLORS.APP_COLOR}
              isImage
              imagePath={IMAGES.PERSON_ICON}
              title={`${rowData.assignedUsers} + ${rowData.assignUserCount || 0}`}
            />
          ) : (
            <View />
          )}
          <CustomTextUI
            color={COLORS.BLACK}
            backgroundColor={COLORS.GRAY_MEDIUM}
            isImage={false}
            title={`Status - ${rowData.status}`}
          />
          <CustomTextUI
            color={COLORS.WHITE}
            backgroundColor={COLORS.TYPE_COLOR}
            isImage={false}
            title={`Type - ${rowData.type}`}
          />
          <CustomTextUI
            iconStyle={styles.calendarIcon}
            color={COLORS.BLACK}
            backgroundColor={COLORS.GRAY_MEDIUM}
            isImage
            imagePath={IMAGES.CALENDER_ICON}
            title={rowData.modifyDate ?? ''}
          />
          <CustomTextUI
            iconStyle={styles.authorIcon}
            color={COLORS.BLACK}
            backgroundColor={COLORS.GRAY_MEDIUM}
            isImage
            imagePath={IMAGES.PERSON_ICON}
            title={rowData.author ?? ''}
          />
        </View>
      </View>
    </View>
  );
};
export default RelatedListItem;

const styles = StyleSheet.create({
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  card: {
    padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    marginLeft: 2,
    marginRight: 2,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: height(0.02),
  },
  divider: {
    width: WINDOW_WIDTH,
    height: 0.5,
    backgroundColor: COLORS.GRAY_MEDIUM,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: height(0.02),
  },
  userIcon: {
    tintColor: COLORS.WHITE,
    width: iconSize(0.015),
    height: iconSize(0.015),
    marginTop: 3,
  },
  calendarIcon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.018),
    height: iconSize(0.018),
  },
  authorIcon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.015),
    height: iconSize(0.015),
  },
});
