import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import IMAGES from '../../theme/images';
import { fontSize, height, iconSize, marginTopAndBottom } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import type { CustomHeaderProps } from '../../utils/interfaces/IComponent';
import { DateTimeInfoToolTip } from './DateTimeInfoTooltip';
import { formatUTCDate } from '../../utils/helper/helpers';

const CustomHeader: React.FC<CustomHeaderProps> = (props) => {
  const hasNotch = DeviceInfo.hasNotch();
  const createdBy = props?.dateTimeObj?.[0];
  const createdOn = props?.dateTimeObj?.[1];
  const modifiedBy = props?.dateTimeObj?.[2];
  const modifiedOn = props?.dateTimeObj?.[3];
  return (
    <View
      style={[
        {
          height:
            props.orientation === 'PORTRAIT'
              ? hasNotch
                ? height(0.12)
                : height(0.08)
              : height(0.09),
        },
        styles.shadowStyle,
      ]}
    >
      <View
        style={[
          props.orientation === 'PORTRAIT'
            ? hasNotch
              ? styles.textTitleOne
              : styles.textTitleSecond
            : styles.textTitleThird,

          { alignContent: 'center' },
        ]}
      >
        <TouchableOpacity hitSlop={styles.hitSlop} onPress={props.onPress}>
          <Image style={styles.iconStyle} source={IMAGES.LEFT_ARRAOW} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.textTitle}>{props.title}</Text>
        <View
          style={{
            marginTop: height(0.013),
            marginRight: height(0.01),
            justifyContent: 'flex-end',
            flexDirection: 'row',
            flex: 1,
          }}
        >
          {(createdBy || createdOn || modifiedBy || modifiedOn) && (
            <DateTimeInfoToolTip
              createdBy={createdBy}
              createdOn={formatUTCDate(createdOn ?? '', 'MM/DD/YYYY hh:mm A')}
              modifiedBy={modifiedBy}
              modifiedOn={formatUTCDate(modifiedOn ?? '', 'MM/DD/YYYY hh:mm A')}
              size={iconSize(0.03)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  textTitle: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.05),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
    marginLeft: 7,
    marginTop: height(0.01),
  },
  textTitleOne: {
    flexDirection: 'row',
    paddingTop: 10,
    marginTop: marginTopAndBottom(0.07),
    alignContent: 'center',
  },
  textTitleSecond: {
    flexDirection: 'row',
    //paddingTop: 10,
    marginTop: marginTopAndBottom(0.039),
    alignContent: 'center',
  },
  textTitleThird: {
    flexDirection: 'row',
    paddingTop: 10,
    // marginTop: marginTopAndBottom(0.025),
    marginTop: marginTopAndBottom(0.039),
    alignContent: 'center',
  },
  iconStyle: {
    height: iconSize(0.03),
    width: iconSize(0.03),
    marginLeft: 10,
    tintColor: COLORS.APP_COLOR,
    marginTop: height(0.01),
  },
  flexOne: { flex: 1 },
  hitSlop: { left: 20, right: 20, top: 20, bottom: 20 },
  shadowStyle: {
    shadowColor: COLORS.APP_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    // zIndex: 9999,
    zIndex: 1,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.APP_COLOR,
  },
});
