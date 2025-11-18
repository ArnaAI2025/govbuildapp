import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type {
  GooglePlaceDetail} from 'react-native-google-places-autocomplete';
import {
  GooglePlacesAutocomplete
} from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GOOGLE_PLACE_API_KEY } from '../../constants/url';
import { height } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import type { GooglePlacePickerProps } from '../../utils/interfaces/IComponent';

export const GooglePlacePicker: React.FC<GooglePlacePickerProps> = ({
  reff,
  setLocation,
  setStreetAddress,
  setCity,
  setState,
  setCountry,
  setZip,
  setAddress,
  setLatitude,
  setLongitude,
  setGoogleAddress,
  hintText = '',
  defaultValue = '',
  locationLable = 'Location',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (defaultValue) {
      setInputValue(defaultValue);
      setTimeout(() => {
        reff?.current?.setAddressText(defaultValue);
      }, 200);
    }
  }, [defaultValue]);

  const handlePlaceSelect = (data: any, details: GooglePlaceDetail | null = null) => {
    if (details) {
      const street = details.formatted_address || '';
      const city =
        details?.address_components.find((c) => c.types.includes('administrative_area_level_2'))
          ?.long_name || '';
      const newCity = city.replace(' County', '');
      const zipcode =
        details?.address_components.find((c) => c.types.includes('postal_code'))?.long_name || '';
      const state =
        details?.address_components.find((c) => c.types.includes('administrative_area_level_1'))
          ?.long_name || '';
      const country =
        details?.address_components.find((c) => c.types.includes('country'))?.long_name || '';
      const latitude = details.geometry.location.lat;
      const longitude = details.geometry.location.lng;
      const googleAddress = {
        street: street,
        newCity: newCity,
        zipcode: zipcode,
        state: state,
        country: country,
        latitude: latitude,
        longitude: longitude,
      };
      setGoogleAddress?.(googleAddress);
      setStreetAddress?.(street);
      setCity?.(newCity);
      setState?.(state);
      setZip?.(zipcode);
      setCountry?.(country || 'USA');
      setLatitude?.(latitude);
      setLongitude?.(longitude);
      setAddress?.(details.formatted_address || '');
      setLocation?.(details.formatted_address || '');
      setInputValue(details.formatted_address || '');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.floatingLabel]}>
        {locationLable} <Text style={{ color: COLORS.ERROR }}>*</Text>
      </Text>
      <GooglePlacesAutocomplete
        ref={reff}
        minLength={2}
        fetchDetails
        enablePoweredByContainer={false}
        isRowScrollable={false}
        query={{
          key: GOOGLE_PLACE_API_KEY,
          language: 'en',
          components: 'country:us',
        }}
        onPress={(data, details = null) => {
          handlePlaceSelect(data, details);
          reff?.current?.blur();
        }}
        placeholder="Enter a location"
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
        styles={{
          textInputContainer: [
            styles.googlePlacesContainer,
            isFocused && styles.googlePlacesContainerFocused,
          ],
          textInput: [styles.googlePlacesInput, isFocused && styles.googlePlacesInputFocused],
          listView: styles.suggestionsList,
          row: styles.suggestionRow,
          separator: styles.separator,
          description: styles.suggestionText,
        }}
        textInputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          value: inputValue,
          onChangeText: (text) => setInputValue(text),
          clearButtonMode: 'while-editing',
          underlineColorAndroid: 'transparent',
          autoCorrect: false,
          autoCapitalize: 'none',
        }}
      />
      {hintText ? <Text style={styles.hintText}>{hintText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginTop: height(0.01),
    borderColor: COLORS.ERROR,
  },
  floatingLabel: {
    fontSize: FONT_SIZE.Font_12,
    color: COLORS.DRAWER_TEXT_COLOR,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 10,
  },
  googlePlacesContainer: {
    flex: 1,
    height: 51,
    backgroundColor: COLORS.WHITE,
  },
  googlePlacesContainerFocused: {
    borderColor: COLORS.APP_COLOR,
  },
  googlePlacesInput: {
    height: 52,
    //height: 54,
    paddingHorizontal: 12,
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.GRAY_DARK,
    borderWidth: 1,
    borderRadius: 12,
    textAlignVertical: 'center',
  },
  googlePlacesInputFocused: {
    borderColor: COLORS.APP_COLOR,
  },
  hintText: {
    fontSize: FONT_SIZE.Font_8,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONT_FAMILY.MontserratMedium,
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
