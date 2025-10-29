import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fontSize, height } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import { TEXTS } from '../../constants/strings';

type PublishButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  contacinerStyle?: object;
  buttonStyle?: object;
  textName?: string;
  textStyle?: object;
};

const PublishButton: React.FC<PublishButtonProps> = ({
  onPress,
  disabled = false,
  contacinerStyle,
  buttonStyle,
  textName,
  textStyle,
}) => {
  return (
    <View style={[styles.container, contacinerStyle]}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, disabled && { opacity: 0.6 }]}
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, textStyle]}>
          {textName != undefined ? textName : TEXTS.caseScreen.publish}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: '60%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textAlign: 'center',
  },
});

export default PublishButton;
