import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { fontSize, height } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { DashboardCardProps } from '../../utils/interfaces/IComponent';
import { ToastService } from './GlobalSnackbar';
import { TEXTS } from '../../constants/strings';

const DashboardCard: React.FC<DashboardCardProps> = ({
  heading,
  value,
  isNew = false,
  image,
  iconColor = COLORS.APP_COLOR,
  backgroundColor = COLORS.WHITE,
  showImage = false,
  disabled = false,
  customStyle,
  onPress,
}) => {
  const borderRadiusValue = showImage ? 6 : 6;
  const marginValue = showImage ? 8 : 3;
  const handleLongPress = () => {
    if (isNew) {
      ToastService.show(TEXTS.alertMessages.NewCaseAssignments, COLORS.ERROR);
    }
  };

  const renderImage = () => {
    if (showImage && image) {
      if (typeof image === 'function') {
        return React.createElement(image, {
          width: 31,
          height: 30,
          style: { marginBottom: 5, marginTop: 10, fill: iconColor },
        });
      } else {
        return (
          <Image
            source={image}
            resizeMode="contain"
            style={[styles.image, { tintColor: iconColor }]}
          />
        );
      }
    }
    return <Text style={styles.headingText}>{heading}</Text>;
  };

  const content = (
    <View style={styles.overlayContent}>
      {renderImage()}
      <Text
        numberOfLines={2}
        style={[
          styles.valueText,
          {
            color: showImage ? COLORS.BLACK : COLORS.WHITE,
            fontSize: fontSize(showImage ? 0.03 : 0.024),
          },
          customStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <Card style={[styles.card, { borderRadius: borderRadiusValue, margin: marginValue }]}>
      <TouchableRipple
        disabled={disabled}
        onPress={onPress}
        onLongPress={handleLongPress}
        rippleColor="rgba(0, 0, 0, 0.1)"
        borderless
      >
        {showImage ? (
          <View
            style={[
              styles.innerContainer,
              {
                backgroundColor: backgroundColor,
                borderRadius: borderRadiusValue,
              },
            ]}
          >
            {content}
          </View>
        ) : (
          <View
            style={[
              styles.upperContainer,
              {
                borderRadius: borderRadiusValue,
              },
            ]}
          >
            {content}
          </View>
        )}
      </TouchableRipple>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    elevation: 5,
    borderWidth: 0,
    borderColor: COLORS.GRAY_LIGHT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  innerContainer: {
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    height: height(0.12),
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.06),
    fontFamily: FONT_FAMILY.MontserratBold,
    marginTop: 5,
  },
  valueText: {
    fontSize: FONT_SIZE.Font_14,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  image: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  upperContainer: {
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    maxWidth: '100%',
    backgroundColor: COLORS.APP_COLOR,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    height: height(0.12),
  },
});

export default DashboardCard;
