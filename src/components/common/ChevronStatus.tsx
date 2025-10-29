import { StyleSheet, Platform, View, Image, Text } from 'react-native';
import { ItemType } from '../../utils/interfaces/ICase';
import { COLORS } from '../../theme/colors';
import IMAGES from '../../theme/images';
import { memo, useMemo } from 'react';
import { FONT_FAMILY } from '../../theme/fonts';

const RenderItemChevronStatus = memo(({ item }: { item: ItemType }) => {
  const colors = useMemo(
    () => ({
      text: item.textColor?.toLowerCase() || COLORS.WHITE,
      background:
        item.backgroundColor?.toLowerCase() || item?.color?.toLowerCase() || COLORS.GRAY_MEDIUM,
    }),
    [(item?.textColor, item?.backgroundColor, item?.color)],
  );

  const containerStyle = [styles.chevronTextContainer, { backgroundColor: colors.background }];

  const textStyle = [
    styles.chevronText,
    { backgroundColor: colors.background, color: colors.text },
  ];
  const iconTintColor = colors.background;
  return (
    <View style={styles.renderChaveronView}>
      <Image style={styles.flagIcon} source={IMAGES.FLAG_ICON} tintColor={iconTintColor} />
      <View style={containerStyle}>
        <Text style={textStyle}>{item.displayText}</Text>
      </View>
      <Image style={styles.playIcon} source={IMAGES.PLAY_ICON} tintColor={iconTintColor} />
    </View>
  );
});

const styles = StyleSheet.create({
  renderChaveronView: {
    flexDirection: 'row',
    height: 25,
    marginBottom: 5,
    marginLeft: -18,
    alignItems: 'center',
  },
  flagIcon: {
    width: 25,
    height: 25,
  },
  chevronTextContainer: {
    height: 25,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: { marginLeft: -1 },
      ios: { marginLeft: 0 },
    }),
  },
  chevronText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  playIcon: {
    width: 20,
    height: 25,
  },
});

export default RenderItemChevronStatus;
