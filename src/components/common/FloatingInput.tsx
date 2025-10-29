import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, Image, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { useColorScheme } from 'react-native';
import { FloatingInputProps } from '../../utils/interfaces/IComponent';

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  error = false,
  style,
  leftIcon,
  editable,
  pointerEvents,
  customRightIcon,
  customRightIconStyle,
  onIconPress,
  hintText,
  isPhoneNumber = false,
  hintTextStyle,
  maxLength,
  required,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? COLORS.BLACK : COLORS.BLACK;

  const handleChangeText = (text: string) => {
    if (isPhoneNumber) {
      const digitsOnly = text.replace(/\D/g, '').slice(0, 10);

      let formatted = digitsOnly;
      if (digitsOnly.length > 6) {
        formatted = `(${digitsOnly.slice(0, 3)})-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
      } else if (digitsOnly.length > 3) {
        formatted = `(${digitsOnly.slice(0, 3)})-${digitsOnly.slice(3)}`;
      } else if (digitsOnly.length > 0) {
        formatted = `(${digitsOnly}`;
      }

      onChangeText(formatted);
    } else if (keyboardType === 'numeric') {
      const cleanedText = text.replace(/[^0-9.]/g, '');
      const parts = cleanedText.split('.');
      if (parts.length > 2) {
        onChangeText(parts[0] + '.' + parts.slice(1).join(''));
      } else {
        onChangeText(cleanedText);
      }
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents={editable === true ? 'none' : 'auto'}>
      <TextInput
        // label={label}
        label={
          required ? (
            <Text>
              {label} <Text style={{ color: COLORS.ERROR }}>*</Text>
            </Text>
          ) : (
            label
          )
        }
        value={value === null || value === undefined ? undefined : String(value)}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        autoCorrect={true}
        secureTextEntry={isPassword && !isPasswordVisible}
        keyboardType={keyboardType}
        mode="outlined"
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        maxLength={maxLength}
        error={error}
        editable={editable}
        pointerEvents={pointerEvents}
        style={[styles.input, style, { color: textColor }]}
        theme={{
          roundness: 12,
          colors: {
            primary: COLORS.APP_COLOR,
            text: textColor,
            placeholder: COLORS.GRAY_LIGHT,
            background: COLORS.WHITE,
            error: COLORS.ERROR,
          },
        }}
        left={
          leftIcon ? (
            <TextInput.Icon icon={leftIcon} color={disabled ? COLORS.GRAY_LIGHT : COLORS.BLACK} />
          ) : undefined
        }
        right={
          isPassword ? (
            <TextInput.Icon
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              color={COLORS.BLACK}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            />
          ) : customRightIcon ? (
            <TextInput.Icon
              // icon="close-circle"
              // forceTextInputFocus={false}
              icon={() => (
                <Image
                  source={customRightIcon}
                  style={[
                    styles.customStyle,
                    customRightIconStyle,
                    disabled ? { tintColor: COLORS.GRAY_LIGHT } : { tintColor: COLORS.BLACK },
                  ]}
                  resizeMode="contain"
                />
              )}
              onPress={onIconPress}
              disabled={disabled}
            />
          ) : undefined
        }
      />
      {hintText ? <Text style={[styles.hintText, hintTextStyle]}>{hintText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    marginVertical: 9,
    marginBottom: 0,
    marginTop: 5,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    justifyContent: 'center',
  },
  customStyle: { width: 20, height: 20, tintColor: COLORS.BLACK },
  hintText: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default FloatingInput;
