import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { TextInput, List } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { DropdownProps } from '../../utils/interfaces/IComponent';
import { TEXTS } from '../../constants/strings';
import { height } from '../../utils/helper/dimensions';

const CustomDropdown: React.FC<DropdownProps> = ({
  data = [],
  labelField = 'label',
  valueField = 'value',
  value = null,
  onChange = () => {},
  label = '',
  //placeholder = "",
  containerStyle,
  isLoading = false,
  disabled,
  error = false,
  hintText = '',
  showClearIcon = true,
  multiline = false,
  required = false,
  onClear = () => {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  useEffect(() => {
    setShowDropdown(false);
    setSearchText('');
  }, []);
  const selectedItem = Array.isArray(data)
    ? data.find((item) => item?.[valueField] === value)
    : null;

  const displayText =
    typeof selectedItem?.[labelField] === 'string' ? selectedItem[labelField] : searchText;

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.[labelField]?.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const handleSelect = (item: any) => {
    if (item && valueField in item) {
      onChange({ value: item });
      setSearchText('');
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    onChange({ value: null });
    if (onClear) {
      onClear();
    }
    // setSearchText("");
    // setShowDropdown(true); // Open dropdown after clearing for immediate search
  };

  const handleTextInputChange = (text: string) => {
    setSearchText(text);
    if (text && !showDropdown) {
      setShowDropdown(true); // Open dropdown only when typing, no value is selected, and input is not disabled
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item?.[valueField] === value;
    if (item?.disabled) {
      return (
        <List.Item
          title={item?.[labelField] ?? 'No label'}
          titleStyle={[styles.titleText, { color: COLORS.GRAY_LIGHT }]}
          style={[styles.viewText, { backgroundColor: COLORS.WHITE }]}
        />
      );
    }
    return (
      <TouchableOpacity onPress={() => handleSelect(item)}>
        <List.Item
          title={item?.[labelField] ?? ''}
          titleStyle={[styles.titleText, isSelected && styles.selectedTitleText]}
          style={[styles.viewText, isSelected && styles.selectedViewText]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={
          required ? (
            <Text>
              {label} <Text style={{ color: COLORS.ERROR }}>*</Text>
            </Text>
          ) : (
            label
          )
        }
        value={value ? displayText : searchText}
        placeholder="Type to search"
        mode="outlined"
        style={[styles.input]}
        outlineStyle={styles.outlineStyle}
        contentStyle={{
          flexShrink: 1,
          paddingVertical: 10,
        }}
        multiline={multiline}
        numberOfLines={2}
        right={
          showClearIcon && value ? (
            <TextInput.Icon
              icon="close-circle"
              forceTextInputFocus={false}
              onPress={handleClear}
              disabled={disabled}
            />
          ) : (
            <TextInput.Icon
              icon={showDropdown ? 'chevron-up' : 'chevron-down'}
              forceTextInputFocus={false}
              disabled={disabled}
              onPress={() =>
                setShowDropdown((prev) => {
                  const newState = !prev;
                  if (newState && !value) setSearchText('');
                  return newState;
                })
              }
            />
          )
        }
        theme={{
          roundness: 12,
          colors: {
            primary: COLORS.APP_COLOR,
            text: COLORS.BLACK,
            placeholder: COLORS.GRAY_LIGHT,
            background: COLORS.WHITE,
            error: COLORS.ERROR,
          },
        }}
        editable={!value && !disabled} // Editable only when no value is selected
        disabled={disabled}
        onChangeText={value ? undefined : handleTextInputChange} // Allow search only when no value
        onPress={() => {
          if (!disabled) {
            setShowDropdown((prev) => {
              const newState = !prev;
              if (newState && !value) setSearchText('');
              return newState;
            });
          }
        }}
        error={error}
        scrollEnabled={true}
      />
      {isLoading ? (
        <ActivityIndicator size="small" style={styles.loader} />
      ) : (
        showDropdown && (
          <View style={styles.dropdownBox}>
            <FlatList
              data={
                filteredData.length > 0
                  ? filteredData
                  : [
                      {
                        [labelField]: TEXTS.alertMessages.noDataFound,
                        disabled: true,
                      },
                    ]
              }
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              style={{ maxHeight: 180 }}
            />
          </View>
        )
      )}
      {hintText ? <Text style={styles.hintText}>{hintText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: height(0.007),
  },
  input: {
    backgroundColor: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  loader: {
    marginTop: 10,
  },
  outlineStyle: {
    borderRadius: 10,
  },
  titleText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
    flexShrink: 1,
  },
  viewText: {
    backgroundColor: COLORS.GRAY_VERY_LIGHT,
    marginVertical: 4,
    marginHorizontal: 6,
    borderRadius: 6,
  },
  selectedTitleText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  selectedViewText: {
    backgroundColor: COLORS.APP_COLOR,
  },
  dropdownBox: {
    position: 'relative',
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_COLOR,
    borderRadius: 12,
    paddingBottom: 5,
    maxHeight: 240,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    height: 40,
    backgroundColor: COLORS.WHITE,
    marginBottom: 4,
  },
  searchInputOutline: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.APP_COLOR,
  },
  hintText: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default CustomDropdown;
