import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ChildParcelModel } from '../../../utils/interfaces/ISubScreens';
import { COLORS } from '../../../theme/colors';
import { height, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import { TEXTS } from '../../../constants/strings';
import { navigate } from '../../../navigation/Index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTimeAgo } from '../../../utils/helper/helpers';
import moment from 'moment';
import TextHeadingAndTitleView from '../../../components/common/TextHeadingAndTitleView';

interface ChildParcelListItemProps {
  rowData: ChildParcelModel;
  orientation: string;
}

export const ChildParcelListItem: React.FC<ChildParcelListItemProps> = ({
  rowData,
  orientation,
}) => {
  // return (
  //   <View style={[globalStyles.cardContainer]}>
  //     <TouchableOpacity
  //       onPress={() => navigate("OpenInWebView", { paramKey: "params", param: rowData?.editLink ?? "", title: "Edit"})}
  //     >
  //       <View style={styles.cardContent}>
  //         <View style={{ flex: 1 }}>
  //           <Text style={styles.headingStyle} numberOfLines={1}>
  //             {rowData.title || ""}
  //           </Text>
  //           <Text style={styles.contentStyle} numberOfLines={2}>
  //             {TEXTS.subScreens.parcel.addressLabel}: {rowData.address || ""}
  //           </Text>
  //           <Text style={styles.contentStyle} numberOfLines={2}>
  //             {TEXTS.subScreens.parcel.submittedByLabel}: {rowData.submittedBy || ""}
  //           </Text>
  //           <Text style={styles.contentStyle} numberOfLines={2}>
  //             {TEXTS.subScreens.parcel.createdDateLabel}: {rowData.createdUtc || ""}
  //           </Text>
  //         </View>
  //       </View>
  //     </TouchableOpacity>
  //   </View>
  // );
  return (
    <TouchableOpacity
      onPress={() =>
        navigate('OpenInWebView', {
          paramKey: 'params',
          param: rowData?.editLink ?? '',
          title: 'Edit',
        })
      }
      activeOpacity={0.6}
      style={[styles.container, orientation === 'PORTRAIT' ? styles.portrait : styles.landscape]}
    >
      <TextHeadingAndTitleView heading={rowData?.title ?? ''} value="" />

      {/* <TextHeadingAndTitleView
        variant="small"
        heading={`${typeLabel} -`}
        value={typeValue}
      /> */}
      {rowData?.address && (
        <TextHeadingAndTitleView heading={''} value={rowData?.address ?? ''} variant="address" />
      )}
      <View style={styles.badgeContainer}>
        <View style={styles.publishBadge}>
          <Text style={styles.publishText}>{TEXTS.caseScreen.published}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: COLORS.GRAY_LIGHT,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            },
          ]}
        >
          <Icon name={'calendar-clock'} size={20} color={COLORS.BLUE_COLOR} />
          <Text style={styles.publishText}>
            {getTimeAgo(moment(rowData?.createdUtc, 'MM/DD/YYYY').format('YYYY-MM-DD'))}
          </Text>
        </View>

        <View style={[styles.publishBadge, { flexDirection: 'row', alignItems: 'center' }]}>
          <Icon name="account" size={20} color={COLORS.APP_COLOR} />
          <Text style={[styles.publishText, { color: COLORS.BLACK }]}>{rowData.submittedBy}</Text>
        </View>
        {/* {item?.isEditable ? (
          <TouchableOpacity onPress={onPress} style={styles.editIcon}>
            <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
          </TouchableOpacity>
        ) : (
          <View />
        )} */}
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
