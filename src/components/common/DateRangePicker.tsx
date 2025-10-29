import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs, { Dayjs } from 'dayjs';

interface DateRange {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface DateRangePickerProps {
  label?: string;
  initialStartDate?: Dayjs;
  initialEndDate?: Dayjs;
  onChange?: (range: DateRange) => void;
  containerStyle?: object;
  textStyle?: object;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = 'Select Date Range',
  initialStartDate = dayjs(),
  initialEndDate = dayjs().add(5, 'day'),
  onChange,
  containerStyle,
  textStyle,
}) => {
  const [range, setRange] = useState<DateRange>({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  const handleChange = (params: { startDate: any; endDate: any }) => {
    const newRange: DateRange = {
      startDate: params.startDate ? dayjs(params.startDate) : null,
      endDate: params.endDate ? dayjs(params.endDate) : null,
    };
    setRange(newRange);
    if (onChange) {
      onChange(newRange);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
      <DateTimePicker
        mode="range"
        startDate={range.startDate}
        endDate={range.endDate}
        onChange={handleChange}
      />
      <Text style={[styles.rangeText, textStyle]}>
        Selected Range:{'\n'}
        {range.startDate?.format('YYYY-MM-DD') || 'Not set'} →{' '}
        {range.endDate?.format('YYYY-MM-DD') || 'Not set'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rangeText: {
    marginTop: 20,
    fontSize: 16,
  },
});
