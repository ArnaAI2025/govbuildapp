import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Keyboard,
  useColorScheme,
} from 'react-native';
import { TextInput, List } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import type { AutocompleteInputProps } from '../../utils/interfaces/IComponent';
import { TEXTS } from '../../constants/strings';

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  data,
  query,
  onQueryChange,
  onSelect,
  label = 'Search',
  placeholder = TEXTS.alertMessages.TypeSearch,
  isLoading = false,
  isSearchEnabled = true,
}) => {
  const [filteredData, setFilteredData] = useState<typeof data>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(typeof data)[0] | null>(null);
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? COLORS.BLACK : COLORS.BLACK;

  useEffect(() => {
    if (!query) {
      setFilteredData([]);
      setShowDropdown(false);
      return;
    }

    // If query matches any item exactly, don't auto-open
    const exactMatch = data.find((item) => item.displayText.toLowerCase() === query.toLowerCase());

    if (exactMatch) {
      setShowDropdown(false);
      return;
    }

    const results = data.filter((item) =>
      item.displayText.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredData(results);
    setShowDropdown(true);
  }, [query, data]);

  const handleSelect = (item: (typeof data)[0]) => {
    setSelectedItem(item);
    onSelect(item);
    setShowDropdown(false);
    Keyboard.dismiss();
    setTimeout(() => {
      onQueryChange(item.displayText);
    }, 100);
  };

  const renderDropdownItem = ({ item }) =>
    item.disabled ? (
      <List.Item
        title={item.displayText}
        titleStyle={[styles.titleText, { color: COLORS.GRAY_LIGHT }]}
        style={[styles.viewText, { backgroundColor: COLORS.WHITE }]}
      />
    ) : (
      <TouchableOpacity onPress={() => handleSelect(item)}>
        <List.Item
          title={item.displayText}
          titleStyle={[
            styles.titleText,
            {
              color:
                selectedItem?.displayText === item.displayText ? COLORS.APP_COLOR : COLORS.BLACK,
            },
          ]}
          style={[
            styles.viewText,
            {
              backgroundColor:
                selectedItem?.displayText === item.displayText
                  ? COLORS.APP_COLOR + '20'
                  : COLORS.GRAY_VERY_LIGHT,
            },
          ]}
        />
      </TouchableOpacity>
    );

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          label={label}
          value={query}
          autoCorrect
          onChangeText={(text) => {
            if (isSearchEnabled) {
              onQueryChange(text);
              if (text === '') {
                setSelectedItem(null);
                setShowDropdown(false);
                onSelect(null);
              }
            }
          }}
          placeholder={placeholder}
          mode="outlined"
          style={[styles.input, { color: textColor }]}
          outlineStyle={styles.outlineStyle}
          right={
            query.length > 0 ? (
              <TextInput.Icon
                icon="close"
                onPress={() => {
                  onQueryChange('');
                  setSelectedItem(null);
                  setShowDropdown(false);
                  onSelect(null);
                }}
              />
            ) : null
          }
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
          editable
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" style={styles.loader} />
      ) : (
        showDropdown && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={
                filteredData.length > 0
                  ? filteredData
                  : [
                      {
                        displayText: TEXTS.alertMessages.noDataFound,
                        disabled: true,
                      },
                    ]
              }
              renderItem={renderDropdownItem}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator
              style={styles.list}
            />
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  dropdownContainer: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_COLOR,
    borderRadius: 10,
    maxHeight: 200,
    marginTop: 5,
    paddingBottom: 4,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  list: {
    paddingVertical: 4,
  },
  loader: {
    marginTop: 10,
  },
  outlineStyle: {
    borderRadius: 10,
  },
  titleText: {
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  viewText: {
    marginVertical: 4,
    marginHorizontal: 6,
    borderRadius: 6,
  },
});

export default AutocompleteInput;
