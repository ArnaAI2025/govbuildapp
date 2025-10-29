import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GOOGLE_PLACE_API_KEY } from '../../constants/url';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelect: (address: string, details: GooglePlaceDetail | null) => void;
  placeholder?: string;
  isFocused?: boolean;
  hintText?: string;
  headerText?: string;
  error?: boolean;
  required?: boolean;
  containerStyle?: object;
}

const CustomGooglePlacesInput = forwardRef<any, Props>(
  (
    {
      value,
      onChangeText,
      onPlaceSelect,
      placeholder = '',
      isFocused = false,
      hintText,
      headerText,
      error = false,
      required = false,
      containerStyle,
    },
    ref,
  ) => {
    return (
      <View style={[containerStyle]}>
        {headerText && (
          <Text
            style={[
              styles.floatingLabel,
              {
                color: error ? COLORS.ERROR : COLORS.DRAWER_TEXT_COLOR,
              },
            ]}
          >
            {headerText}
            {required && <Text style={{ color: 'red' }}> *</Text>}
          </Text>
        )}
        <GooglePlacesAutocomplete
          ref={ref}
          placeholder={placeholder}
          minLength={1}
          textInputProps={{
            value,
            onChangeText: (val) => onChangeText(val),
            placeholderTextColor: '#A4A4A4',
            clearButtonMode: 'while-editing',
            underlineColorAndroid: 'transparent',
            autoCorrect: false,
            autoCapitalize: 'none',
          }}
          listViewDisplayed="auto"
          fetchDetails={true}
          renderDescription={(row) => row.description}
          onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
            const address = details?.formatted_address || data.description || '';
            onPlaceSelect(address, details);
          }}
          query={{
            key: GOOGLE_PLACE_API_KEY,
            language: 'en',
            components: 'country:us',
          }}
          styles={{
            textInputContainer: [
              styles.googlePlacesContainer,
              isFocused && styles.googlePlacesContainerFocused,
            ],
            textInput: [
              styles.googlePlacesInput,
              {
                borderColor: error ? COLORS.ERROR : COLORS.GRAY_DARK,
                borderWidth: error ? 2 : 1,
              },
              isFocused && styles.googlePlacesInputFocused,
            ],
            listView: styles.suggestionsList,
            row: styles.suggestionRow,
            separator: styles.separator,
            description: styles.suggestionText,
          }}
          renderRow={(data) => (
            <View style={styles.suggestionRow}>
              <Icon
                name="map-marker-outline"
                size={18}
                color={COLORS.APP_COLOR}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.suggestionText}>{data.description}</Text>
            </View>
          )}
          nearbyPlacesAPI="GooglePlacesSearch"
          GoogleReverseGeocodingQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}
          filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
          debounce={200}
        />
        {hintText && <Text style={styles.hintTextStyle}>{hintText}</Text>}
      </View>
    );
  },
);

export default CustomGooglePlacesInput;

const styles = StyleSheet.create({
  floatingLabel: {
    fontSize: FONT_SIZE.Font_12,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 1,
  },
  hintTextStyle: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginBottom: 5,
  },
  googlePlacesContainer: {
    borderBottomWidth: 0,
    height: 51,
    backgroundColor: COLORS.WHITE,
  },
  googlePlacesContainerFocused: {
    borderColor: COLORS.APP_COLOR,
  },
  googlePlacesInput: {
    height: 52,
    paddingHorizontal: 12,
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    textAlignVertical: 'center',
  },
  googlePlacesInputFocused: {
    borderColor: COLORS.APP_COLOR,
  },
  suggestionsList: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  suggestionText: {
    color: COLORS.BLACK,
    fontSize: 14,
    fontFamily: FONT_FAMILY.MontserratRegular,
  },
});
