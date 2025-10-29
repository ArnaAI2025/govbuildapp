import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS } from '../../theme/colors';
import { fontSize, height, iconSize, modalProps } from '../../utils/helper/dimensions';
import IMAGES from '../../theme/images';
import FloatingInput from './FloatingInput';
import { formatDate } from '../../utils/helper/helpers';

interface DatePickerInputProps {
  isVisible?: boolean;
  label: string;
  value: string | undefined;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  containerStyle?: object;
  placeholderValue?: string;
  hintText?: string;
  mode?: 'date' | 'time' | 'datetime';
  editable?: boolean;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  containerStyle,
  placeholderValue,
  hintText,
  mode = 'date',
  editable = true,
  disabled = false,
  error = false,
  required = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        disabled={!editable}
        onPress={() => {
          if (editable) {
            setIsPickerOpen(true);
          }
        }}
      >
        <FloatingInput
          label={
            required ? (
              <Text>
                {label} <Text style={{ color: COLORS.ERROR }}>*</Text>
              </Text>
            ) : (
              label
            )
          }
          value={
            mode === 'time'
              ? (value ?? '')
              : (formatDate(value, mode === 'datetime' ? 'MM/DD/YYYY hh:mm A' : 'MM/DD/YYYY') ?? '')
          }
          style={[
            styles.editInputFieldStyle,
            {
              backgroundColor: editable === false ? COLORS.GRAY_LIGHT : COLORS.WHITE,
            },
          ]}
          numberOfLines={1}
          editable={!editable}
          disabled={disabled}
          pointerEvents="none"
          onChangeText={() => {}}
          placeholder={placeholderValue}
          keyboardType="default"
          // customRightIcon={
          //   mode === "time" ? IMAGES.CLOCK_ICON : IMAGES.CALENDER_ICON
          // }
          customRightIcon={
            editable ? (mode === 'time' ? IMAGES.CLOCK_ICON : IMAGES.CALENDER_ICON) : undefined
          }
          customRightIconStyle={[styles.calendarIcon, !editable && { opacity: 0.4 }]}
          onIconPress={() => {
            if (editable) {
              setIsPickerOpen(true);
            }
          }}
          hintText={hintText}
          error={error}
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isPickerOpen}
        mode={mode}
        modalPropsIOS={modalProps}
        minimumDate={minimumDate}
        onConfirm={(date) => {
          const year = date.getFullYear();

          if (year <= 1753) {
            // Show error and don't update value
            alert('Please select a year greater than 1753.');
            return;
          }
          setIsPickerOpen(false);
          onChange(date);
        }}
        onCancel={() => setIsPickerOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  label: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    height: height(0.05),
    backgroundColor: COLORS.BLACK,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.022),
  },
  hint: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.018),
    marginLeft: 2,
  },
  calendarIcon: {
    height: iconSize(0.03),
    width: iconSize(0.03),
  },
  editInputFieldStyle: { marginTop: 11 },
});
