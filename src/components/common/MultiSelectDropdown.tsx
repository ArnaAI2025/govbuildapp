import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Text,
  InteractionManager,
  Platform,
} from 'react-native';
import { List, TextInput } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { MultiSelectDropdownProps } from '../../utils/interfaces/IComponent';
import { height } from '../../utils/helper/dimensions';

const CustomMultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  data = [],
  labelField = 'label',
  valueField = 'value',
  value = [],
  onChange = () => {},
  label = 'Select',
  placeholder = 'Select options...',
  isLoading = false,
  containerStyle,
  zIndexPriority = 1,
  hintText = '',
  alldata = [],
  disabled = false,
  error = false,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

  const safeSearchText = searchText?.toLowerCase() || '';

  //  Logic to determine selected items:
  // 1. Include items from `data` that match selected `value` IDs.
  // 2. If any selected IDs are not present in `data`, look them up in `alldata` to get their labels.
  // 3. Add those missing items to the selected list (with a fallback label like "Unknown").
  // 4. Mark the missing items as `disabled` so they are not selectable in the dropdown list again.
  const selectedItems = useMemo(() => {
    const selectedFromData = data.filter((item) => value.includes(item[valueField]));

    const remainingSelectedIds = value.filter(
      (val) => !data.some((item) => item[valueField] === val),
    );

    const getLabelFromLicenseSubTypes = (id: string) => {
      if (!alldata?.length) return 'Unknown';
      const match = alldata.find((item) => item[valueField] === id);
      return match ? match[labelField] : 'Unknown';
    };

    const missingItems = remainingSelectedIds
      .filter((id) => id !== '0') //ignore id "0"
      .map((id) => ({
        [labelField]: getLabelFromLicenseSubTypes(id),
        [valueField]: id,
        disabled: true,
      }));
    return [...selectedFromData, ...missingItems];
  }, [data, value, valueField, labelField, alldata]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const labelValue = item?.[labelField];
      return typeof labelValue === 'string'
        ? labelValue.toLowerCase().includes(safeSearchText)
        : false;
    });
  }, [safeSearchText, data, labelField]);

  const toggleDropdown = () => {
    if (disabled) return; // disable dropdown open/close

    setShowDropdown((prev) => {
      const next = !prev;
      if (next) setSearchText(''); // clear search on open
      return next;
    });
  };

  const handleSelect = (item: any) => {
    const itemValue = item[valueField];
    const updatedValues = value.includes(itemValue)
      ? value.filter((val) => val !== itemValue)
      : [...value, itemValue];
    onChange(updatedValues);

    if (Platform.OS === 'android' && scrollRef.current) {
      console.log('android scroll calling...');
      InteractionManager.runAfterInteractions(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  };

  const baseZIndex = zIndexPriority ? 100 + zIndexPriority * 10 : 100;

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = value?.includes(item[valueField]);

    if (item.disabled) {
      return (
        <List.Item
          title={item[labelField]}
          titleStyle={[styles.titleText, { color: COLORS.GRAY_LIGHT }]}
          style={[styles.viewText, { backgroundColor: COLORS.WHITE }]}
        />
      );
    }

    return (
      <TouchableOpacity onPress={() => handleSelect(item)}>
        <List.Item
          title={item[labelField] ?? ''}
          titleStyle={[styles.titleText, isSelected && styles.selectedTitleText]}
          style={[styles.viewText, isSelected && styles.selectedViewText]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { zIndex: baseZIndex, opacity: disabled ? 0.6 : 1 }, // dim effect
      ]}
    >
      <View style={styles.dropdownWrapper}>
        {(selectedItems.length > 0 || showDropdown) && (
          <Text
            style={[
              styles.floatingLabel,
              {
                color: disabled
                  ? COLORS.GRAY_LABEL
                  : showDropdown
                    ? COLORS.APP_COLOR
                    : COLORS.DRAWER_TEXT_COLOR,
              },
            ]}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            styles.input,
            {
              borderColor: error
                ? COLORS.ERROR
                : disabled
                  ? COLORS.GRAY_MEDIUM
                  : showDropdown
                    ? COLORS.APP_COLOR
                    : COLORS.DRAWER_TEXT_COLOR,
            },
          ]}
        >
          <View style={styles.scrollWrapper}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {selectedItems.length === 0 ? (
                <View style={styles.placeholderView}>
                  <Text
                    style={[
                      styles.placeholderText,
                      {
                        color: disabled ? COLORS.GRAY_LIGHT : COLORS.DRAWER_TEXT_COLOR,
                      },
                    ]}
                  >
                    {showDropdown ? placeholder : label}
                  </Text>
                </View>
              ) : (
                selectedItems.map((item) => (
                  <View key={item[valueField]} style={styles.chip}>
                    <List.Item
                      title={item[labelField] ?? ''}
                      titleStyle={styles.chipText}
                      style={styles.chipItem}
                      right={() =>
                        !disabled && (
                          <TouchableOpacity onPress={() => handleSelect(item)}>
                            <List.Icon icon="close-circle" color={COLORS.WHITE} />
                          </TouchableOpacity>
                        )
                      }
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <TouchableOpacity
            disabled={disabled}
            style={{ backgroundColor: COLORS.WHITE }}
            hitSlop={{ left: 15, right: 15, top: 12, bottom: 12 }}
            onPress={toggleDropdown}
          >
            <List.Icon
              icon={showDropdown ? 'chevron-up' : 'chevron-down'}
              color={disabled ? COLORS.GRAY_LIGHT : COLORS.GRAY_DARK}
            />
          </TouchableOpacity>
        </View>

        {hintText ? <Text style={styles.hintText}>{hintText}</Text> : null}
      </View>

      {!disabled && isLoading ? (
        <ActivityIndicator size="small" style={styles.loader} />
      ) : (
        !disabled &&
        showDropdown && (
          <View style={styles.dropdownBox}>
            <TextInput
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              mode="flat"
              underlineColor="transparent"
              style={styles.inlineSearchInput}
              theme={{
                colors: {
                  text: COLORS.BLACK,
                  placeholder: COLORS.GRAY_LIGHT,
                  background: COLORS.WHITE,
                  primary: COLORS.APP_COLOR,
                  error: COLORS.ERROR,
                },
              }}
            />
            {filteredData.length === 0 ? (
              <List.Item
                title="No data found"
                titleStyle={[styles.titleText, { color: COLORS.GRAY_LIGHT }]}
                style={[styles.viewText, { backgroundColor: COLORS.WHITE }]}
              />
            ) : (
              <FlatList
                nestedScrollEnabled
                data={filteredData}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 160 }}
              />
            )}
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: height(0.007),
  },
  dropdownWrapper: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -1,
    left: 12,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 4,
    fontSize: FONT_SIZE.Font_12,
    zIndex: 2,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 50,
    marginTop: 8,
  },
  scrollWrapper: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  placeholderView: {
    justifyContent: 'center',
    paddingVertical: 4,
  },
  placeholderText: {
    color: COLORS.DRAWER_TEXT_COLOR,
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  dropdownBox: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_COLOR,
    borderRadius: 10,
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    maxHeight: 200,
  },
  inlineSearchInput: {
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
    backgroundColor: COLORS.WHITE,
    height: 40,
    borderRadius: 0,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.APP_COLOR,
  },
  loader: {
    marginTop: 10,
  },
  titleText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  viewText: {
    backgroundColor: COLORS.GRAY_VERY_LIGHT,
    marginVertical: 4,
    marginHorizontal: 6,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectedTitleText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  selectedViewText: {
    backgroundColor: COLORS.STEEL_BLUE,
  },
  chip: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    minHeight: 28,
    justifyContent: 'center',
  },
  chipText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    paddingRight: 4,
  },
  searchInput: {
    backgroundColor: COLORS.GRAY_VERY_LIGHT,
    paddingHorizontal: 10,
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 40,
    borderWidth: 0,
    elevation: 0,
  },
  hintText: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default CustomMultiSelectDropdown;
