import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Checkbox } from 'expo-checkbox';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { RootStackParamList } from '../../../navigation/Types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { convertDateToISO, formatAllTypesDate, formatDate } from '../../../utils/helper/helpers';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import FloatingInput from '../../../components/common/FloatingInput';
import { COLORS } from '../../../theme/colors';
import {
  fontSize,
  height,
  iconSize,
  isIPad,
  modalProps,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { LocationService } from './LocationService';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import { GOOGLE_PLACE_API_KEY } from '../../../constants/url';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PublishButton from '../../../components/common/PublishButton';

type AddContactsScreenProps = NativeStackScreenProps<RootStackParamList, 'AddMultiLocation'>;

const AddLocationScreen: React.FC<AddContactsScreenProps> = ({ route, navigation }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [parcelId, setParcelId] = useState<string>(
    route.params.isEdit ? route.params.data?.parcelId || '' : '',
  );
  const [address, setAddress] = useState<string>(
    route.params.isEdit ? route.params.data?.address || '' : '',
  );
  const [isManualLocation, setManualLocation] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<string>(
    route.params.isEdit ? route.params.data?.latitude || '' : '',
  );
  const [longitude, setLongitude] = useState<string>(
    route.params.isEdit ? route.params.data?.longitude || '' : '',
  );
  const [endDate, setEndDate] = useState<string>(
    route.params.isEdit && route.params.data?.endDate
      ? formatDate(route.params.data.endDate.toString(), 'DD-MM-YYYY')
      : '',
  );
  const [convertedEndDate, setConvertedEndDate] = useState<string>(
    route.params.isEdit && route.params.data?.endDate
      ? convertDateToISO(route.params.data.endDate)
      : '',
  );
  const [endDatePickerOpen, setEndDatePickerOpen] = useState<boolean>(false);
  const contentId = route.params.contentId;
  const ref = useRef<any>(null);

  useEffect(() => {
    ref.current?.setAddressText(route.params.isEdit ? route.params.data?.address || '' : '');
  }, [route.params.isEdit, route.params.data?.address]);

  useEffect(() => {
    if (route.params.isEdit && route.params.data) {
      setLatitude(route.params.data.latitude?.toString() || '');
      setLongitude(route.params.data.longitude?.toString() || '');
    }
  }, [route.params.isEdit, route.params.data]);

  const validateInputs = () => {
    if (!parcelId && !address) {
      ToastService.show('At least one of Parcel Id or Address is required', COLORS.ERROR);
      return false;
    }
    return true;
  };

  const saveUpdateApi = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const success = await LocationService.saveOrUpdateLocation(
        route.params.isEdit,
        parcelId,
        address,
        convertedEndDate,
        contentId,
        latitude || '0',
        longitude || '0',
        route.params.data?.contentItemId || '',
        setLoading,
      );
      if (success) {
        //   ToastService.show("Location save successfully", COLORS.SUCCESS_GREEN);
        ToastService.show(
          `Location ${route.params.isEdit ? 'updated' : 'added'} successfully`,
          COLORS.SUCCESS_GREEN,
        );
        navigation.goBack();
      }
    } catch (error) {
      ToastService.show(`Error saving location${error}`, COLORS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <DateTimePickerModal
        isVisible={endDatePickerOpen}
        mode="date"
        modalPropsIOS={modalProps}
        onConfirm={(pickDate) => {
          setEndDatePickerOpen(false);
          const formattedDate = formatDate(pickDate.toISOString(), 'DD-MM-YYYY');
          setEndDate(formattedDate);
          setConvertedEndDate(convertDateToISO(pickDate));
        }}
        onCancel={() => setEndDatePickerOpen(false)}
      />
      <ScreenWrapper
        title={TEXTS.subScreens.location.heading}
        //  rightIcon={route.params.isEdit ? IMAGES.DELETE : undefined}
        //  onRightIconPress={route.params.isEdit ? handleDelete : undefined}
      >
        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            nestedScrollEnabled={true}
            extraScrollHeight={150}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FloatingInput
              label={TEXTS.subScreens.location.parcelIdLabel}
              value={parcelId}
              numberOfLines={1}
              onChangeText={setParcelId}
              keyboardType="default"
              required={address != '' ? false : true}
            />
            <View style={styles.inputViewStyle}>
              <Text style={styles.titleStyle}>
                {TEXTS.subScreens.location.addressLabel}{' '}
                {parcelId === '' && <Text style={{ color: COLORS.ERROR }}>*</Text>}
              </Text>
              <GooglePlacesAutocomplete
                ref={ref}
                placeholder={TEXTS.subScreens.location.googlePlacesPlaceholder}
                fetchDetails={true}
                query={{
                  key: GOOGLE_PLACE_API_KEY,
                  language: 'en',
                }}
                onPress={(data, details) => {
                  if (details) {
                    setAddress(details.formatted_address);
                    setLatitude(details.geometry.location.lat.toString());
                    setLongitude(details.geometry.location.lng.toString());
                  }
                }}
                textInputProps={{
                  onChangeText: (text) => {
                    setAddress(text);
                    if (text === '') {
                      setLatitude('');
                      setLongitude('');
                    }
                  },
                  value: address,
                }}
                styles={{
                  textInputContainer: styles.googlePlacesContainer,
                  textInput: styles.googlePlacesInput,
                  predefinedPlacesDescription: {
                    color: COLORS.APP_COLOR,
                  },
                }}
              />
            </View>
            <View style={styles.inputViewStyle}>
              <DatePickerInput
                label={'End date'}
                value={formatAllTypesDate(endDate)}
                onChange={(pickDate) => {
                  setEndDatePickerOpen(false);
                  const formattedDate = formatDate(pickDate.toISOString(), 'DD-MM-YYYY');
                  setEndDate(formattedDate);
                  setConvertedEndDate(convertDateToISO(pickDate));
                }}
              />
            </View>
            <View style={styles.inputViewStyle}>
              <FloatingInput
                label={TEXTS.subScreens.location.latitudeLabel}
                value={latitude}
                numberOfLines={1}
                onChangeText={setLatitude}
                rightIcon="sync"
                keyboardType="numeric"
                editable={isManualLocation}
                style={!isManualLocation ? { backgroundColor: COLORS.GRAY_LIGHT } : undefined}
              />
            </View>
            <View style={styles.inputViewStyle}>
              <FloatingInput
                label={TEXTS.subScreens.location.longitudeLabel}
                value={longitude}
                numberOfLines={1}
                onChangeText={setLongitude}
                rightIcon="sync"
                keyboardType="numeric"
                editable={isManualLocation}
                style={!isManualLocation ? { backgroundColor: COLORS.GRAY_LIGHT } : undefined}
              />
            </View>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={isManualLocation}
                onValueChange={() => setManualLocation(!isManualLocation)}
                color={isManualLocation ? COLORS.APP_COLOR : undefined}
              />
              <TouchableOpacity onPress={() => setManualLocation(!isManualLocation)}>
                <Text style={[styles.titleStyle, { marginLeft: 10 }]}>Set Manual Lat/Lng</Text>
              </TouchableOpacity>
            </View>

            <PublishButton
              textName={
                route.params.isEdit ? TEXTS.subScreens.location.submitButton.update : 'Save'
              }
              buttonStyle={{ marginTop: 15 }}
              onPress={saveUpdateApi}
            />
            {/* <View style={[styles.inputViewStyle, { flex: 1 }]}>
              <View style={styles.buttonContainer}></View>
            </View> */}
          </KeyboardAwareScrollView>
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    marginBottom: 5,
    marginLeft: 5,
  },
  formInput: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    height: height(0.05),
    backgroundColor: COLORS.BLACK,
  },
  labelStyles: {
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  inputStyle: {
    color: COLORS.GRAY_DARK,
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 5,
  },
  calendarStyle: {
    width: iconSize(0.03),
    height: iconSize(0.03),
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: height(0.06),
    borderColor: COLORS.GRAY_DARK,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  inputViewStyle: {
    marginBottom: 10, // Adds gap between inputs/dropdowns
    // // zIndex: 1,
    marginTop: 10,
    paddingHorizontal: 0.001 * WINDOW_WIDTH,
  },
  googlePlacesContainer: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: 'stretch',
    height: isIPad ? height(0.041) : height(0.052),
    backgroundColor: COLORS.WHITE,
  },
  googlePlacesInput: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    backgroundColor: COLORS.WHITE,
    height: Platform.OS == 'android' ? height(0.065) : isIPad ? height(0.043) : height(0.054),
    borderColor: COLORS.GRAY_DARK,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.05),
    width: WINDOW_WIDTH * 0.35,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  calendarIcon: {
    height: iconSize(0.03),
    width: iconSize(0.03),
  },
});

export default AddLocationScreen;
