import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import IMAGES from '../../theme/images';
import { COLORS } from '../../theme/colors';
import { fontSize } from '../../utils/helper/dimensions';
import { NoDataProps } from '../../utils/interfaces/IComponent';
import { TEXTS } from '../../constants/strings';
import { FONT_FAMILY } from '../../theme/fonts';

const NoData: React.FC<NoDataProps> = ({
  message = TEXTS.alertMessages.noDataFound,
  imageSource = IMAGES.NO_DATA,
  onRetry,
  showRetry = false,
  containerStyle,
}) => {
  return (
    <View style={[containerStyle, styles.container]}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {showRetry && onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          {TEXTS.alertMessages.Retry}
        </Button>
      )}
    </View>
  );
};

export default NoData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  image: {
    width: 300,
    height: 180,
  },
  message: {
    fontSize: fontSize(0.05),
    color: COLORS.TEXT_COLOR,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 12,
    paddingTop: 15,
  },
  button: {
    borderRadius: 8,
    backgroundColor: COLORS.APP_COLOR,
  },
  buttonText: {
    color: COLORS.WHITE,
  },
});
