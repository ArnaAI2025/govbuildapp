import React, { useEffect, useState } from 'react';
import Autocomplete from 'react-native-autocomplete-input';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { TeamMember } from '../../utils/interfaces/ISubScreens';
import { SettingsService } from '../../screens/sub-screens/setting/SettingService';
import { COLORS } from '../../theme/colors';
import { fontSize } from '../../utils/helper/dimensions';

interface CaseOwnerAutocompleteProps {
  value: string;
  onChange: (text: string, id?: string) => void;
}

export const CaseOwnerAutocomplete: React.FC<CaseOwnerAutocompleteProps> = ({
  value,
  onChange,
}) => {
  const [filterData, setFilterData] = useState<TeamMember[]>([]);

  useEffect(() => {
    const searchCaseOwner = async () => {
      if (value.length > 1) {
        const results = await SettingsService.searchCaseOwner(value);
        setFilterData(results || []);
      } else {
        setFilterData([]);
        if (value.length === 0) {
          onChange('', '');
        }
      }
    };
    searchCaseOwner();
  }, [value, onChange]);

  return (
    <Autocomplete
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
      inputContainerStyle={styles.inputContainer}
      data={filterData}
      value={value}
      onChangeText={(text) => onChange(text)}
      placeholder=""
      placeholderTextColor={COLORS.BLACK}
      flatListProps={{
        keyExtractor: (item, idx) => item.userId || idx.toString(),
        renderItem: ({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onChange(item.normalizedUserName || '', item.userId);
              setFilterData([]);
            }}
          >
            <Text>{item.normalizedUserName}</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: fontSize(0.03),
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 10,
  },
  inputContainer: { borderWidth: 0 },
  item: { padding: 10 },
});
