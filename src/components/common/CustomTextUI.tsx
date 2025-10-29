import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize } from '../../utils/helper/dimensions';
import { CustomTextUIProps } from '../../utils/interfaces/IComponent';
import { FONT_FAMILY } from '../../theme/fonts';

export const CustomTextUI = memo(
  ({
    title,
    color = COLORS.BLACK,
    backgroundColor,
    isImage = false,
    imagePath,
    iconStyle,
    accessibilityLabel,
  }: CustomTextUIProps) => {
    return (
      <View
        style={[styles.container, backgroundColor && { backgroundColor }]}
        accessibilityLabel={accessibilityLabel || title}
      >
        {isImage && imagePath && (
          <Image
            source={typeof imagePath === 'string' ? { uri: imagePath } : imagePath}
            style={[styles.image, iconStyle]}
            resizeMode="contain"
            accessibilityLabel={`${title} icon`}
          />
        )}
        <Text style={[styles.text, { color }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  image: { marginRight: 5 },
  text: {
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});
