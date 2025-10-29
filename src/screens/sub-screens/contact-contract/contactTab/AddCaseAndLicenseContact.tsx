import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Checkbox from 'expo-checkbox';
import { ResponsiblePartyFormData } from '../../../../utils/interfaces/ISubScreens';
import { convertDate, formatDate, normalizeBool } from '../../../../utils/helper/helpers';
import { checkEmailValidation } from '../../../../utils/validations';
import { TEXTS } from '../../../../constants/strings';
import { contactService } from '../ContactAndContractService';
import Loader from '../../../../components/common/Loader';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { fontSize, height, modalProps } from '../../../../utils/helper/dimensions';
import ScreenWrapper from '../../../../components/common/ScreenWrapper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from '../../../../theme/colors';
import FloatingInput from '../../../../components/common/FloatingInput';
import { RootStackParamList } from '../../../../navigation/Types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FONT_FAMILY, FONT_SIZE } from '../../../../theme/fonts';
import { ToastService } from '../../../../components/common/GlobalSnackbar';
import { useNetworkStatus } from '../../../../utils/checkNetwork';
import { DatePickerInput } from '../../../../components/common/DatePickerInput';
import PublishButton from '../../../../components/common/PublishButton';
import { TextInput } from 'react-native-paper';
import CustomGooglePlacesInput from '../../../../components/common/CustomGooglePlacesInput';

type AddContactsScreenProps = NativeStackScreenProps<RootStackParamList, 'AddContact'>;
const AddContacts: React.FC<AddContactsScreenProps> = ({ route, navigation }) => {
  const googlePlacePickerRef = useRef<any>(null);
  const { isNetworkAvailable } = useNetworkStatus();
  const [, setContentItemId] = useState<string>(
    route.params.addNew ? '' : route.params.param?.id || '',
  );
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const [firstName, setFirstName] = useState<string>('');
  const [contactType, setContactType] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [endDate, setEndDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [endDatePickerOpen, setEndDatePickerOpen] = useState<boolean>(false);
  const [, setIsOnline] = useState<boolean>(true);
  const [isPrimary, setPrimary] = useState<boolean>(false);
  const [isAllowAccess, setAllowAccess] = useState<boolean>(false);
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [, setIsNew] = useState<boolean>(false);
  const [inputHeight, setInputHeight] = useState(80);

  useEffect(() => {
    if (route.params.param && !route.params.addNew) {
      const param = route.params.param;
      setAddress(param.mailingAddress || '');

      // force update GooglePlacesAutocomplete text
      setTimeout(() => {
        if (googlePlacePickerRef.current) {
          googlePlacePickerRef.current.setAddressText(param.mailingAddress || '');
        }
      }, 300);
    }
  }, [route.params]);

  const [fieldErrors, setFieldErrors] = useState({
    firstName: false,
    email: false,
    phoneNumber: false,
  });

  const [caseLicenseData] = useState<any>(route.params.caseLicenseData);
  const isStatusReadOnly = normalizeBool(caseLicenseData?.isStatusReadOnly);
  useEffect(() => {
    NetInfo.fetch().then((state) => setIsOnline(state.isConnected ?? false));

    if (route.params.param) {
      const param = route.params.param;
      setContentItemId(
        route.params.addNew
          ? ''
          : route.params.type === 'Case'
            ? param.caseContentItemId || ''
            : param.licenseContentItemId || '',
      );
      if (!route.params.addNew) {
        setIsNew(param.isNew ?? false);
        setBusinessName(param.businessName || '');
        setContactType(param.contactType || '');
        setAllowAccess(param.isAllowAccess == true);
        setPrimary(param.isPrimary == true);
        setEndDate(param.endDate ? formatDate(param.endDate, 'YYYY-MM-DD') : null);
        setNotes(param.notes || '');
        setFirstName(param.firstName || '');
        setLastName(param.lastName || '');
        setEmail(param.email || '');
        setPhone(param.phoneNumber || '');
        setAddress(param.mailingAddress || '');
      }
    }
  }, []);
  const validateInput = async (): Promise<boolean> => {
    if (!firstName) {
      setFieldErrors({
        ...fieldErrors,
        firstName: true,
      });
      ToastService.show(TEXTS.subScreens.contactAndContract.nameValidation, COLORS.ERROR);
      return false;
    }
    if (email && !checkEmailValidation(email)) {
      setFieldErrors({
        ...fieldErrors,
        email: true,
      });
      ToastService.show(TEXTS.subScreens.contactAndContract.emailValidated, COLORS.ERROR);
      return false;
    }
    if (!phone) {
      setFieldErrors({
        ...fieldErrors,
        phoneNumber: true,
      });
      ToastService.show('Phone Number is required.', COLORS.ERROR);
      return false;
    }
    if (phone.length < 14) {
      setFieldErrors({
        ...fieldErrors,
        phoneNumber: true,
      });
      ToastService.show('The Phone Number is not valid.', COLORS.ERROR);
      return false;
    }
    return true;
  };

  const callSaveApi = async () => {
    if (!(await validateInput())) return;
    const formData: ResponsiblePartyFormData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phone,
      MailingAddress: address || null,
      id: route?.params?.param?.id || '0',
      contactType,
      businessName,
      isAllowAccess,
      isPrimary,
      notes,
      endDate,
      type: route.params.type,
      addNew: route.params.addNew,
      CaseContentItemId: route.params.caseLicenseID,
    };

    try {
      await contactService.saveContact(
        formData,
        route.params.type,
        route.params.caseLicenseID,
        route.params.addNew,
        caseLicenseData,
        navigation,
        setLoading,
        isNetworkAvailable,
      );
    } catch (error) {
      console.error('Error saving responsible party:', error);
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
          setEndDate(convertDate(pickDate) ?? null);
        }}
        onCancel={() => setEndDatePickerOpen(false)}
      />

      <ScreenWrapper
        title={
          route.params.addNew
            ? route.params.type === 'Case'
              ? TEXTS.subScreens.contactAndContract.addNew
              : TEXTS.subScreens.contactAndContract.addNewLicense
            : TEXTS.subScreens.contactAndContract.update
        }
      >
        {/* <PublishButton
          buttonStyle={{ width: "35%", height: height(0.04) }}
          contacinerStyle={{ alignItems: "flex-end" }}
          textName={route.params.addNew ? "Save" : "Update"}
          onPress={callSaveApi}
        /> */}
        <KeyboardAwareScrollView
          nestedScrollEnabled={true}
          extraScrollHeight={150}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 10 }}
        >
          <View pointerEvents={isForceSync ? 'none' : 'auto'}>
            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.firstName}
              value={firstName}
              required
              numberOfLines={1}
              onChangeText={(text) => {
                setFirstName(text);
                if (text?.trim() !== '') {
                  setFieldErrors((prev) => ({
                    ...prev,
                    firstName: false,
                  }));
                }
              }}
              placeholder={TEXTS.subScreens.contactAndContract.firstNamePlaceholder}
              keyboardType="default"
              hintText="The First Name of the party."
              error={fieldErrors.firstName}
              disabled={isStatusReadOnly}
            />
            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.lastName}
              value={lastName}
              numberOfLines={1}
              onChangeText={setLastName}
              placeholder={TEXTS.subScreens.contactAndContract.lastNamePlaceholder}
              keyboardType="default"
              hintText="The Last Name of the party."
              disabled={isStatusReadOnly}
            />
            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.email}
              value={email}
              numberOfLines={1}
              onChangeText={(text) => {
                setEmail(text);
                if (text?.trim() !== '') {
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: false,
                  }));
                }
              }}
              placeholder={TEXTS.subScreens.contactAndContract.emailPlaceholder}
              keyboardType="default"
              hintText="The Email of the party."
              error={fieldErrors.email}
              disabled={isStatusReadOnly}
            />
            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.phoneNumber}
              value={phone}
              required
              numberOfLines={1}
              onChangeText={(text) => {
                setPhone(text);
                if (text?.trim() !== '') {
                  setFieldErrors((prev) => ({
                    ...prev,
                    phoneNumber: false,
                  }));
                }
              }}
              placeholder={TEXTS.subScreens.contactAndContract.phoneNumberPlaceholder}
              error={fieldErrors.phoneNumber}
              keyboardType="phone-pad"
              isPhoneNumber={true}
              hintText="The Phone Number of the party."
              disabled={isStatusReadOnly}
            />

            {isNetworkAvailable ? (
              <View
                pointerEvents={isStatusReadOnly ? 'none' : 'auto'}
                style={[styles.wrapper, { opacity: isStatusReadOnly ? 0.4 : 1 }]}
              >
                <CustomGooglePlacesInput
                  ref={googlePlacePickerRef}
                  value={address}
                  headerText={TEXTS.subScreens.contactAndContract.mailingAddress}
                  placeholder={'Enter address'}
                  onChangeText={setAddress}
                  onPlaceSelect={(selectedAddress, details) => {
                    console.log('Selected:------>>>>', selectedAddress, details);
                    setAddress(selectedAddress);
                  }}
                  // isFocused={true}
                  hintText={'The Mailing Address of the party.'}
                />
              </View>
            ) : (
              <FloatingInput
                label={TEXTS.subScreens.contactAndContract.mailingAddress}
                value={address}
                numberOfLines={1}
                onChangeText={setAddress}
                placeholder={TEXTS.subScreens.contactAndContract.mailingAddressPlaceholder}
                keyboardType="default"
                hintText="The Mailing Address of the party."
                disabled={isStatusReadOnly}
              />
            )}

            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.contactType}
              value={contactType}
              numberOfLines={1}
              onChangeText={setContactType}
              placeholder={TEXTS.subScreens.contactAndContract.contactTypePlaceholder}
              keyboardType="default"
              hintText="The Contact Type of the party."
              disabled={isStatusReadOnly}
            />
            <FloatingInput
              label={TEXTS.subScreens.contactAndContract.businessName}
              value={businessName}
              numberOfLines={1}
              onChangeText={setBusinessName}
              placeholder={TEXTS.subScreens.contactAndContract.businessNamePlaceholder}
              keyboardType="default"
              hintText="The Business Name of the party."
              disabled={isStatusReadOnly}
            />

            <DatePickerInput
              label="End Date"
              value={endDate ?? ''}
              onChange={(date) => setEndDate(date ? date.toISOString() : '')}
              hintText="The End Date of the Access."
              disabled={isStatusReadOnly}
              editable={!isStatusReadOnly}
            />
            <View style={styles.checkBoxView}>
              <Checkbox
                value={isPrimary}
                onValueChange={setPrimary}
                color={isPrimary ? COLORS.APP_COLOR : undefined}
                disabled={isStatusReadOnly}
              />
              <TouchableOpacity
                onPress={() => {
                  setPrimary(!isPrimary);
                }}
                disabled={isStatusReadOnly}
              >
                <Text style={[styles.titleStyle, { marginLeft: 10 }]}>
                  {TEXTS.subScreens.contactAndContract.isPrimary}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.hintStyle, { marginTop: 5 }]}>
              {'Set this contact as primary contact.'}
            </Text>
            <View style={styles.checkBoxView}>
              <Checkbox
                value={isAllowAccess}
                onValueChange={setAllowAccess}
                color={isAllowAccess ? COLORS.APP_COLOR : undefined}
                disabled={isStatusReadOnly}
              />
              <TouchableOpacity
                onPress={() => {
                  setAllowAccess(!isAllowAccess);
                }}
                disabled={isStatusReadOnly}
              >
                <Text style={[styles.titleStyle, { marginLeft: 10 }]}>
                  {TEXTS.subScreens.contactAndContract.isAllowAccess}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.hintStyle, { marginTop: 5 }]}>
              {TEXTS.subScreens.contactAndContract.isAllowAccessPlaceholder}
            </Text>
            <View style={[styles.wrapper, { marginTop: 15 }]}>
              <Text style={[styles.floatingLabel]}>{'Notes'}</Text>
              <TextInput
                mode="outlined"
                placeholder="Type your notes here..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, { height: inputHeight }]}
                autoCorrect={true}
                activeOutlineColor={COLORS.APP_COLOR}
                textAlignVertical="top"
                onContentSizeChange={(event) => {
                  const contentHeight = event.nativeEvent.contentSize.height;
                  setInputHeight(Math.max(80, contentHeight));
                }}
                theme={{
                  roundness: 12,
                }}
                disabled={isStatusReadOnly}
              />
            </View>
            {/* <TouchableOpacity style={styles.publishButton} onPress={callSaveApi}>
            <Text style={styles.publishText}>{TEXTS.caseScreen.publish}</Text>
          </TouchableOpacity> */}
            <PublishButton
              buttonStyle={{ marginTop: 15, marginBottom: 15 }}
              textName={route.params.addNew ? 'Save' : 'Update'}
              onPress={callSaveApi}
              disabled={isStatusReadOnly || isForceSync}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
  },
  hintStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.018),
    marginLeft: 2,
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
  inputStyle: {
    color: COLORS.BLACK,
    paddingHorizontal: 5,
    fontSize: fontSize(0.03),
    flex: 1,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    height: height(0.055),
    borderColor: COLORS.GRAY_DARK,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  inputViewStyle: {
    flexDirection: 'column',
    marginTop: height(0.02),
  },
  buttonView: { alignItems: 'center', flex: 1, marginTop: 20 },
  publishButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 20,
    marginBottom: 50,
  },
  publishText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
  checkBoxView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  // new styles
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
    marginLeft: 1,
  },
  input: {
    height: 80, // adjustable
    lineHeight: 24, // spacing between lines
    backgroundColor: COLORS.WHITE,
    // marginVertical: 9,
    marginBottom: 0,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    justifyContent: 'center',
  },
});

export default AddContacts;
