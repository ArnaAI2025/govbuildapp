import React from 'react';
import { View, Text, Image, TextStyle, StyleSheet } from 'react-native';
import IMAGES from '../../theme/images';
import { convertTime, formatDate } from '../../utils/helper/helpers';
import { fontSize, height, iconSize } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';

interface InfoRowProps {
  label?: string;
  name?: string;
  utcDate?: string;
  uppercase?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, name, utcDate, uppercase = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.headingStyle}>{label}</Text>
        {name ? (
          <Text
            style={[
              styles.titleStyle,
              styles.flexText,
              uppercase && ({ textTransform: 'uppercase' } as TextStyle),
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
        ) : null}
      </View>

      {utcDate ? (
        <View style={styles.rightContainer}>
          <View style={styles.subContainer}>
            <Image style={styles.smallIconStyle} source={IMAGES.CALENDER_ICON} />

            <Text style={[styles.titleStyle, styles.dateTimeText]}>
              {formatDate(utcDate, 'MM/DD/YYYY')}
            </Text>
          </View>
          <View style={styles.subContainer}>
            <Image style={styles.smallIconStyle} source={IMAGES.CLOCK_ICON} />
            <Text style={[styles.titleStyle, styles.timeText]}>{convertTime(utcDate)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default InfoRow;
const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: height(0.01),
    minHeight: 25, // optional for alignment
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 100, // Reserve space for date/time
  },
  rightContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    marginRight: 0,
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
  },
  flexText: {
    flexShrink: 1,
  },
  smallIconStyle: {
    width: iconSize(0.02),
    height: iconSize(0.02),
  },
  dateTimeText: {
    marginLeft: 5,
    marginRight: 5,
  },
  timeText: {
    marginLeft: 2,
  },
});
