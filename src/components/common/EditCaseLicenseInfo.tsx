import { View, Text, Image, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize, iconSize } from '../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import IMAGES from '../../theme/images';
import { convertTime, formatDate } from '../../utils/helper/helpers';

interface RenderInfoRowProps {
  label: string;
  name?: string;
  utcDate?: string;
  style: StyleProp<ViewStyle>;
  uppercase?: boolean;
}

export const EditCaseLicenseInfo = ({
  label,
  name,
  utcDate,
  style,
  uppercase = false,
}: RenderInfoRowProps) => {
  if (!name && !utcDate) return null;

  return (
    <View style={style}>
      <Text style={styles.headingStyle}>{label}</Text>
      <Text
        style={[styles.titleStyle, styles.flexText, uppercase && { textTransform: 'uppercase' }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Image style={styles.smallIconStyle} source={IMAGES.CALENDER_ICON} />
      <Text style={[styles.titleStyle, styles.dateTimeText]}>{formatDate(utcDate)}</Text>
      <Image style={styles.smallIconStyle} source={IMAGES.CLOCK_ICON} />
      <Text style={[styles.titleStyle, styles.timeText]}>{convertTime(utcDate)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },

  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  flexText: {
    flex: 1,
  },
  smallIconStyle: {
    width: iconSize(0.02),
    height: iconSize(0.02),
  },
  dateTimeText: {
    marginLeft: 5,
    marginRight: 10,
  },
  timeText: {
    marginLeft: 5,
  },
});

export const HintText = (props: any) => {
  return (
    <Text
      style={{
        fontSize: FONT_SIZE.Font_8,
        color: COLORS.GRAY_DARK,
        marginTop: 4,
        marginLeft: 4,
        fontFamily: FONT_FAMILY.MontserratMedium,
      }}
    >
      {props.hintText}
    </Text>
  );
};

export const TitleText = (props: any) => {
  return (
    <Text
      style={{
        color: COLORS.GRAY_DARK,
        fontSize: fontSize(0.028),
      }}
    >
      {props.title}
    </Text>
  );
};
