import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MenuProvider } from 'react-native-popup-menu';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { RootStackParamList } from '../../../navigation/Types';
import Loader from '../../../components/common/Loader';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { TEXTS } from '../../../constants/strings';
import { COLORS } from '../../../theme/colors';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { fontSize } from '../../../utils/helper/dimensions';
import FloatingInput from '../../../components/common/FloatingInput';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import { LicenseDetailsService } from './LicenseDetailsService';
import { useIsFocused } from '@react-navigation/native';
import { show2Decimals } from '../../../utils/helper/helpers';
import { TeamMember } from '../../../utils/interfaces/ISubScreens';
import PublishButton from '../../../components/common/PublishButton';
import AutocompleteInput from 'react-native-autocomplete-input';
import CustomMultiSelectDropdown from '../../../components/common/MultiSelectDropdown';
import Checkbox from 'expo-checkbox';
import useAuthStore from '../../../store/useAuthStore';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

interface LicenseDetailsScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'LicenseDetailsScreen'> {}
const LicenseDetailsScreen: React.FC<LicenseDetailsScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const { param } = route.params;
  const ownerName = route?.params?.param?.licenseOwner;
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState<string>('');
  const [formData, setFormData] = useState({
    testScore: '',
    licenseFee: '',
    liabilityDate: '',
    workerCompDate: '',
    issueDate: '',
    effectiveDate: '',
    assignTeamMembers: [] as string[],
    isAllowAssigned: false,
    licenseOwner: '',
  });
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [caseOwnerSuggestions, setCaseOwnerSuggestions] = useState<TeamMember[]>([]);

  const [, setCaseOwnerSearch] = useState<string>('');
  const [, setCaseOwnerId] = useState<string>('');
  const [activeDateField, setActiveDateField] = useState<keyof typeof formData | null>(null);

  // Reusable updater (For both boolean and string values)
  const updateFormData = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  useEffect(() => {
    const fetchOwnerData = async () => {
      setLoading(true);
      const { authData } = useAuthStore.getState();
      const userId = authData?.adminRole?.teamMember?.userId || '';
      setUserId(userId);
      const data = await LicenseDetailsService.fetchLicenseData(
        param?.contentItemId,
        isNetworkAvailable,
      );
      const assignedMember =
        typeof data?.assignedUsers === 'string'
          ? data.assignedUsers
              .split(',')
              .map((user) => user.trim())
              .filter((user) => user !== '')
          : []; //For sequre handle code
      setFormData({
        ...formData,
        testScore: String(data?.testScore ?? ''),
        licenseFee: String(show2Decimals(data?.licenseFee) ?? ''),
        liabilityDate: data?.liabilityInsuranceExpDate ?? '',
        workerCompDate: data?.workersCompExpDate ?? '',
        issueDate: data?.issueDate ?? '',
        effectiveDate: data?.effectiveDate ?? '',
        licenseOwner: data?.licenseOwner ?? '',
        assignTeamMembers: assignedMember,
        isAllowAssigned: Boolean(data?.viewOnlyAssignUsers) ?? false,
      });

      // setSelectedTeamMembers(assignedMember);
      // setTeamMembers(data?.assignedUsers);
      setCaseOwnerSearch(data?.licenseOwner);
      setSelectedOwnerId(data.licenseOwner);
      setLoading(false);
    };
    fetchOwnerData();
    fetchDropdownDetails();
  }, [isFocused, param?.contentItemId, isNetworkAvailable]);

  const fetchDropdownDetails = async () => {
    try {
      const fetchedTeamMembers = await LicenseDetailsService.fetchTeamMember(isNetworkAvailable);
      setTeamMembers(fetchedTeamMembers);
    } catch (error) {
      console.log('Dropdown Error---->', error);
    }
  };
  const callSaveApi = async () => {
    try {
      setLoading(true);
      await LicenseDetailsService.saveLicenseData(
        formData,
        param?.contentItemId,
        ownerName,
        userId,
        isNetworkAvailable,
      );
      setLoading(false);
    } catch (error) {
      recordCrashlyticsError('Error saveLicenseData:---->>>', error);
      console.error('Error saving:---->>>', error);
      ToastService.show(TEXTS.subScreens.contactAndContract.savingError, COLORS.ERROR);
    }
  };
  const dateFields = [
    {
      key: 'liabilityDate',
      label: TEXTS.subScreens.licenseDetails.liabilityInsuranceExpirationDate,
      hintText: TEXTS.subScreens.licenseDetails.liabilityInsuranceExpirationDateHint,
    },
    {
      key: 'workerCompDate',
      label: TEXTS.subScreens.licenseDetails.workerCompInsuranceExpirationDate,
      hintText: TEXTS.subScreens.licenseDetails.workerCompInsuranceExpirationDateHint,
    },
    {
      key: 'issueDate',
      label: TEXTS.subScreens.licenseDetails.issueDate,
      hintText: TEXTS.subScreens.licenseDetails.issueDateHint,
    },
    {
      key: 'effectiveDate',
      label: TEXTS.subScreens.licenseDetails.effectiveDate,
      hintText: TEXTS.subScreens.licenseDetails.effectiveDateHint,
    },
  ] as const;

  // Handle case owner search
  const handleCaseOwnerSearch = useCallback(
    async (query: string) => {
      updateFormData('licenseOwner', query || '');
      if (query.length === 0) {
        setCaseOwnerId('');
        setSelectedOwnerId(null);
        setCaseOwnerSuggestions([]);
        return;
      }

      if (query.length > 1) {
        try {
          const results = await LicenseDetailsService.searchCaseOwner(query, isNetworkAvailable);
          setCaseOwnerSuggestions(results || []);
        } catch (error) {
          recordCrashlyticsError('Case owner search error:', error);
          console.error('Case owner search error:', error);
        }
      }
    },
    [isNetworkAvailable],
  );

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      <MenuProvider customStyles={{ backdrop: styles.backdrop }}>
        <DateTimePickerModal
          isVisible={!!activeDateField}
          mode="date"
          onConfirm={(pickDate) => {
            if (activeDateField) {
              updateFormData(activeDateField, pickDate.toISOString());
            }
            setActiveDateField(null);
          }}
          onCancel={() => setActiveDateField(null)}
        />

        <ScreenWrapper title="License Details">
          <KeyboardAwareScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            <View pointerEvents={!isNetworkAvailable ? 'none' : 'auto'}>
              <FloatingInput
                label={TEXTS.subScreens.licenseDetails.testScore}
                value={formData?.testScore}
                numberOfLines={1}
                onChangeText={(text) => updateFormData('testScore', text)}
                placeholder={TEXTS.subScreens.licenseDetails.testScorePlaceholder}
                hintText={TEXTS.subScreens.licenseDetails.testScoreHints}
              />
              <FloatingInput
                label={TEXTS.subScreens.licenseDetails.licenseFee}
                value={formData?.licenseFee}
                numberOfLines={1}
                onChangeText={(text) => updateFormData('licenseFee', text)}
                placeholder={TEXTS.subScreens.licenseDetails.licenseFeePlaceholder}
                keyboardType="numeric"
                leftIcon="currency-usd"
                hintText={TEXTS.subScreens.licenseDetails.licenseFeeHints}
                style={{ marginTop: 10 }}
              />

              {dateFields.map((field) => (
                <DatePickerInput
                  key={field.key}
                  label={field.label}
                  value={formData[field.key]}
                  onChange={(date) => updateFormData(field.key, date ? date.toISOString() : '')}
                  hintText={field?.hintText}
                />
              ))}

              <CustomMultiSelectDropdown
                data={teamMembers?.map((item) => ({
                  item: `${item?.firstName} ${item?.lastName}`,
                  id: item?.userId,
                }))}
                labelField="item"
                valueField="id"
                value={formData?.assignTeamMembers}
                onChange={(item) => {
                  setFormData({
                    ...formData,
                    assignTeamMembers: item,
                  });
                }}
                label={TEXTS.license.teamMember}
                placeholder={TEXTS.license.teamMemberPlaceholder}
                zIndexPriority={1}
                hintText="The Assigned Users of the form."
                containerStyle={{ marginTop: 15 }}
                // editable={!isNetworkAvailable}
              />
            </View>
            <View style={styles.assignedView} pointerEvents={!isNetworkAvailable ? 'none' : 'auto'}>
              <Checkbox
                value={formData?.isAllowAssigned}
                onValueChange={(newValue) => {
                  setFormData({
                    ...formData,
                    isAllowAssigned: newValue,
                  });
                }}
                style={styles.checkBox}
                color={formData?.isAllowAssigned ? COLORS.APP_COLOR : undefined}
              />
              <View style={styles.flexStyle}>
                <Text style={[styles.titleStyle, { marginLeft: 5 }]}>
                  {TEXTS.license.allowAssigned}{' '}
                </Text>
              </View>
            </View>

            {isNetworkAvailable && (
              <View style={[{ zIndex: 2 }]}>
                <Text style={styles.label}>License Owner</Text>
                <AutocompleteInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  scrollEnabled={true}
                  style={styles.autocompleteInput}
                  inputContainerStyle={styles.autocompleteContainer}
                  data={caseOwnerSuggestions}
                  value={formData?.licenseOwner}
                  onChangeText={handleCaseOwnerSearch}
                  placeholder="Search License Owner"
                  placeholderTextColor={COLORS.BLACK}
                  clearButtonMode="while-editing"
                  flatListProps={{
                    keyExtractor: (_, idx) => idx.toString(),
                    style: {
                      maxHeight: 150,
                      borderRadius: 10,
                      position: 'relative',
                    },
                    nestedScrollEnabled: true,
                    renderItem: ({ item }) => {
                      const isSelected =
                        selectedOwnerId?.toLowerCase() === item?.userId?.toLowerCase(); // 🔹 compare directly
                      return (
                        <TouchableOpacity
                          style={[
                            styles.autocompleteItem,
                            {
                              backgroundColor: isSelected
                                ? COLORS.APP_COLOR // blue highlight when selected
                                : COLORS.GRAY_VERY_LIGHT,
                            },
                          ]}
                          onPress={() => {
                            setCaseOwnerId(item.userId);
                            setSelectedOwnerId(item.userId);
                            updateFormData('licenseOwner', item.normalizedUserName || '');
                            setCaseOwnerSuggestions([]);
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected ? COLORS.WHITE : COLORS.BLACK,
                              fontSize: FONT_SIZE.Font_12,
                              fontFamily: FONT_FAMILY.MontserratMedium,
                              flexShrink: 1,
                            }}
                          >
                            {item?.normalizedUserName}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  }}
                />
              </View>
            )}
            <PublishButton
              buttonStyle={{ marginTop: 19 }}
              onPress={callSaveApi}
              disabled={!isNetworkAvailable}
            />
          </KeyboardAwareScrollView>
        </ScreenWrapper>
      </MenuProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  assignedView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:15,
  },
  checkBox: { borderRadius: 5 },
  flexStyle: { flexDirection: 'row', alignItems: 'center' },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  editInputFieldStyle: { marginTop: 11 },
  autocompleteInput: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 1,
    borderWidth: 1,
    fontSize: FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratMedium,
    height: 52,
    borderRadius: 10,
    borderColor: COLORS.GRAY_DARK,
    paddingLeft: 10,
  },
  autocompleteListContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    maxHeight: 150,
    zIndex: 9999,
    elevation: 5,
  },
  autocompleteContainer: {
    borderWidth: 0,
  },
  autocompleteItem: {
    backgroundColor: COLORS.GRAY_VERY_LIGHT,
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    margin: 10,
  },
  label: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    marginBottom: 5,
  },
  autocompleteList: {
    maxHeight: 200,
  },
});

export default LicenseDetailsScreen;
