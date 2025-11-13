import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { contactService } from '../ContactAndContractService';
import { convertDate, formatDate, normalizeBool } from '../../../../utils/helper/helpers';
import ScreenWrapper from '../../../../components/common/ScreenWrapper';
import Loader from '../../../../components/common/Loader';
import CustomDropdown from '../../../../components/common/CustomDropdown';
import Checkbox from 'expo-checkbox';
import { COLORS } from '../../../../theme/colors';
import { fontSize, height, iconSize, modalProps } from '../../../../utils/helper/dimensions';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Contractor,
  LicenseForContract,
  LicenseType,
} from '../../../../utils/interfaces/ISubScreens';
import { TEXTS } from '../../../../constants/strings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/Types';
import { FONT_FAMILY, FONT_SIZE } from '../../../../theme/fonts';
import { DatePickerInput } from '../../../../components/common/DatePickerInput';
import { HintText } from '../../../../components/common/EditCaseLicenseInfo';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PublishButton from '../../../../components/common/PublishButton';
import { TextInput } from 'react-native-paper';
import { useNetworkStatus } from '../../../../utils/checkNetwork';

type AddContractScreenProps = NativeStackScreenProps<RootStackParamList, 'AddContract'>;
const AddCaseAndLicenseContractor: React.FC<AddContractScreenProps> = ({ navigation, route }) => {
  const isStatusReadOnly = normalizeBool(route?.params?.caseData?.isStatusReadOnly);
  const notesRef = useRef<any>(null);
  const { isNetworkAvailable } = useNetworkStatus();
  const [selectedTypes, setSelectedTypes] = useState<LicenseType>();
  const [allowAccess, setAllowAccess] = useState(false);
  const [endDatePicker, setEndDatePicker] = useState(false);
  const [types, setTypes] = useState<LicenseType[]>([]);
  const [endDate, setEndDate] = useState('');
  const [licenseList, setLicenseList] = useState<LicenseForContract[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<LicenseForContract | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [caseLicenseId] = useState(route?.params?.caseData?.contentItemId);
  const [contractorData, setContractorData] = useState<Contractor>({
    applicantName: '',
    businessName: '',
    email: null,
    number: '',
    phoneNumber: '',
    licenseId: '',
    documentId: '',
  });
  useEffect(() => {
    initialize();
  }, [navigation, route.params.param]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setTimeout(() => {
        notesRef.current?.setNativeProps?.({ text: notes }); // refresh text
        notesRef.current?.scrollTo?.({ y: 0, animated: false }); // scroll to top
      }, 100);
    }
  }, []);

  const initialize = async () => {
    const [licenseTypes, contractorLicense] = await Promise.all([
      contactService.fetchLicenseTypes(isNetworkAvailable),
      route.params.param?.contractorId
        ? contactService.fetchLicenseByContentId(
            route.params.param.contractorId,
            isNetworkAvailable,
          )
        : Promise.resolve(null),
    ]);

    setTypes(licenseTypes);

    if (route.params.param) {
      const data = route.params.param;
      setContractorData({
        ...data,
        endDate: data?.endDate ? formatDate(data.endDate) : null,
      });
      setAllowAccess(data?.isAllowAccess || false);

      setNotes(data?.notes || '');
      setEndDate(data?.endDate ? convertDate(data?.endDate) : '');

      if (contractorLicense) {
        const matchingType = licenseTypes.find(
          (type) => type.id === contractorLicense?.data?.licenseTypeId,
        );
        if (matchingType) {
          setSelectedTypes(matchingType);
          fetchLicenses(matchingType);
        }
      }
    }
  };

  const fetchLicenses = async (types: LicenseType) => {
    if (!types?.id) return;
    // Show cached or empty list instantly
    setLicenseList((prev) => (prev.length ? prev : []));
    // Fetch in background
    await contactService
      .fetchLicensesByType(types.id, isNetworkAvailable)
      .then((licenses) => {
        setLicenseList(licenses);

        if (route.params.param?.contractorId) {
          const selected = licenses.find(
            (l) => l.contentItemId === route?.params?.param?.contractorId,
          );
          if (selected) {
            setSelectedLicense(selected?.contentItemId);
            updateContractorDataFromLicense(selected);
          }
        }
      })
      .catch((err) => {console.error('Error loading licenses:', err)} );
  };

  const updateContractorDataFromLicense = (license: LicenseForContract) => {
    setContractorData((prev) => ({
      ...prev,
      applicantName: `${license?.applicantFirstName} ${license?.applicantLastName}`,
      businessName: license?.businessName,
      number: license?.number,
      phoneNumber: license?.phoneNumber,
      email: license?.email,
      licenseId: license?.contentItemId,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const type =
      route.params.type === 'Case' || route.params.type === 'License' ? route.params.type : 'Case';
    await contactService.saveContractor(
      {
        ...contractorData,
        isAllowAccess: allowAccess,
        notes: notes,
        endDate,
        licenseTypeIds: selectedTypes?.id,
        contractorId: contractorData.licenseId,
      },
      caseLicenseId,
      type,
    );
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      <ScreenWrapper title={TEXTS.subScreens.contactAndContract.contractorHeading}>
        <DateTimePickerModal
          isVisible={endDatePicker}
          mode="date"
          onConfirm={(date) => {
            setEndDatePicker(false);
            setEndDate(convertDate(date));
          }}
          onCancel={() => setEndDatePicker(false)}
          modalPropsIOS={modalProps}
        />
        <KeyboardAwareScrollView
          nestedScrollEnabled={true}
          extraScrollHeight={150}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 10 }}
        >
          <View style={{ zIndex: 2 }}>
            <View style={{ marginTop: 15 }}>
              <CustomDropdown
                data={types ?? []}
                labelField="displayText"
                valueField="id"
                required
                value={selectedTypes?.id}
                onChange={(selectedValue) => {
                  setSelectedTypes(selectedValue?.value);
                  fetchLicenses(selectedValue?.value);
                }}
                label={TEXTS.subScreens.contactAndContract.licenseType}
                placeholder={TEXTS.subScreens.contactAndContract.licenseTypePlaceholder}
                zIndexPriority={2}
                disabled={isStatusReadOnly}
              />
            </View>
          </View>

          <View style={{ zIndex: 1, marginTop: 15 }}>
            <CustomDropdown
              data={licenseList ?? []}
              labelField="displayText"
              valueField="contentItemId"
              value={selectedLicense}
              required
              onChange={(item) => {
                setSelectedLicense(item?.value?.contentItemId);
                updateContractorDataFromLicense(item?.value);
              }}
              label={TEXTS.subScreens.contactAndContract.license}
              placeholder={TEXTS.subScreens.contactAndContract.licensePlaceholder}
              zIndexPriority={2}
              disabled={isStatusReadOnly}
            />
          </View>
          <DatePickerInput
            label={TEXTS.subScreens.contactAndContract.endDate}
            value={endDate}
            onChange={(pickDate) => {
              setEndDate(convertDate(pickDate));
            }}
            hintText="The end date of the access."
            containerStyle={{ marginTop: 5 }}
            disabled={isStatusReadOnly}
            editable={!isStatusReadOnly}
          />
          <View style={[styles.wrapper, { marginTop: 15 }]}>
            <Text style={[styles.floatingLabel]}>{'Notes'}</Text>
            <TextInput
              ref={notesRef}
              // selection={{ start: 0, end: 0 }}
              mode="outlined"
              placeholder="Type your notes here..."
              value={notes}
              onChangeText={setNotes}
              multiline
              scrollEnabled
              style={styles.input}
              autoCorrect
              activeOutlineColor={COLORS.APP_COLOR}
              textAlignVertical="top"
              theme={{ roundness: 12 }}
              disabled={isStatusReadOnly}
            />
          </View>
          <View>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={allowAccess}
                onValueChange={setAllowAccess}
                color={allowAccess ? COLORS.APP_COLOR : undefined}
                disabled={isStatusReadOnly}
              />
              <TouchableOpacity
                onPress={() => {
                  setAllowAccess(!allowAccess);
                }}
                disabled={isStatusReadOnly}
              >
                <Text style={[styles.title, { marginLeft: 10 }]}>
                  {TEXTS.subScreens.contactAndContract.isAllowAccess}
                </Text>
              </TouchableOpacity>
            </View>
            <HintText hintText="The Contractor have ability to see case, permit types, form letters on FE" />
          </View>
          <PublishButton
            textName={route.params.addNew ? 'Save' : 'Update'}
            buttonStyle={{ marginTop: 15 }}
            onPress={handleSave}
            disabled={isStatusReadOnly}
          />
        </KeyboardAwareScrollView>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flatList: {
    marginTop: 15,
  },
  pickerContainer: {
    zIndex: 3,
  },
  picker: {
    borderWidth: 0,
    marginBottom: 5,
    borderRadius: 0,
    backgroundColor: COLORS.BLACK,
    height: height(0.05),
  },
  pickerLabel: {
    fontSize: fontSize(0.022),
  },
  pickerPlaceholder: {
    fontSize: 12,
  },
  pickerSelectedLabel: {
    fontSize: 12,
  },
  arrowIcon: {
    tintColor: COLORS.GRAY_MEDIUM,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    marginTop: 15,
  },
  title: {
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.BLACK,
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
  input: {
    minHeight: 80,
    maxHeight: 300,
    paddingVertical: 12,
    paddingHorizontal: 12,
    lineHeight: 24,
    backgroundColor: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    justifyContent: 'flex-start',
    textAlignVertical: 'top', // critical for multiline
  },
  formInput: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    minHeight: height(0.1),
    backgroundColor: COLORS.BLACK,
  },
  calendarIcon: {
    height: iconSize(0.03),
    width: iconSize(0.03),
  },
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
});

export default AddCaseAndLicenseContractor;
