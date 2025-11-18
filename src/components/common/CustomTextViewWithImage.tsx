import { View, Text, StyleSheet } from 'react-native';
import type { CustomTextViewProps } from '../../utils/interfaces/ISubScreens';
import { fontSize, height } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CustomTextViewWithImage: React.FC<CustomTextViewProps> = ({
  heading,
  line,
  title,
  headingStyle, // Added to allow custom heading styles
  titleStyle, // Added to allow custom title styles
  icon,
}) => (
  <View style={styles.textContainer}>
    {icon ? <Icon name={icon} size={20} color={COLORS.APP_COLOR} style={styles.iconStyle} /> : null}
    <Text style={[styles.headingSmall, headingStyle]} numberOfLines={1}>
      {`${heading} - `}
    </Text>
    <Text style={[styles.contentSmall, titleStyle]} numberOfLines={line}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: height(0.015),
  },
  textContainer: {
    flexDirection: 'row',
    marginVertical: 5, // Adjusted for better spacing (instead of marginTop: 8)
    // alignItems: "center", // Align items vertically for a cleaner look
  },
  headingSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032), // Slightly larger for prominence
    fontFamily: FONT_FAMILY.MontserratMedium, // Bold to match the image's style
    marginRight: 5,
  },
  contentSmall: {
    color: COLORS.GRAY_DARK,
    fontSize: fontSize(0.03), // Slightly smaller than the heading
    fontFamily: FONT_FAMILY.MontserratMedium, // Regular weight for subtext
    paddingRight: 20,
    flexShrink: 1,
  },
  iconStyle: {
    marginRight: 5,
  },
});
