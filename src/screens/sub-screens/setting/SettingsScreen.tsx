import React, { useEffect, useState, useCallback } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AutocompleteInput } from 'react-native-autocomplete-input';
import Checkbox from 'expo-checkbox';
import { MenuProvider } from 'react-native-popup-menu';

import { SettingsModel, TeamMember } from '../../../utils/interfaces/ISubScreens';
import { settingsFormData, SyncModelParam } from '../../../utils/params/commonParams';
import { generateUniqueID, getNewUTCDate, normalizeBool } from '../../../utils/helper/helpers';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import FloatingInput from '../../../components/common/FloatingInput';
import CustomMultiSelectDropdown from '../../../components/common/MultiSelectDropdown';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { RootStackParamList } from '../../../navigation/Types';
import useAuthStore from '../../../store/useAuthStore';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import { SettingsService } from './SettingService';
import Loader from '../../../components/common/Loader';
import PublishButton from '../../../components/common/PublishButton';
import { TEXTS } from '../../../constants/strings';
import { ToastService } from '../../../components/common/GlobalSnackbar';
interface SettingsScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'SettingsScreen'> {}

// Main component
const SettingsScreen: React.FC<SettingsScreenProps> = ({ route, navigation }) => {
  const { param } = route.params;
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;

  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [, setSettings] = useState<SettingsModel | null>(null);
  const [permitIssuedDate, setPermitIssuedDate] = useState<string>('');
  const [permitExpirationDate, setPermitExpirationDate] = useState<string>('');
  const [assignAccess, setAssignAccess] = useState<string>('');
  const [projectValuation, setProjectValuation] = useState<string>('');
  const [restrictToAssigned, setRestrictToAssigned] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [caseOwnerSearch, setCaseOwnerSearch] = useState<string>('');
  const [caseOwnerId, setCaseOwnerId] = useState<string>('');
  const [caseOwnerSuggestions, setCaseOwnerSuggestions] = useState<TeamMember[]>([]);
  const [fieldErrors, setFieldErrors] = useState({
    assigneeTeamMember: false,
  });
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // Initialize component data
  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch user ID
      const { authData } = useAuthStore.getState();
      const userId = authData?.adminRole?.teamMember?.userId || '';
      setUserId(userId);

      // Set initial case owner
      setCaseOwnerSearch(param?.ownerName || '');

      // Fetch team members and settings
      const [fetchedTeamMembers, fetchedSettings] = await Promise.all([
        SettingsService.fetchTeamMembers(setIsLoading, isNetworkAvailable),
        SettingsService.fetchSettings(param?.contentItemId, isNetworkAvailable),
      ]);
      setTeamMembers(fetchedTeamMembers);

      if (fetchedSettings) {
        setSettings(fetchedSettings);
        populateSettingsData(fetchedSettings);
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [param?.contentItemId, param?.ownerName, isNetworkAvailable]);

  // Populate settings data
  const populateSettingsData = useCallback((data: SettingsModel) => {
    setPermitIssuedDate(data?.permitIssuedDate || '');
    setPermitExpirationDate(data?.permitExpirationDate || '');
    setRestrictToAssigned(data?.viewOnlyAssignUsers ?? false);
    setAssignAccess(data.assignAccess || '');
    setProjectValuation(data.projectValuation || '');
    setCaseOwnerId(data.caseOwner || '');
    setSelectedTeamMembers(data?.assignedUsers?.split(','));
  }, []);

  // Handle case owner search
  const handleCaseOwnerSearch = useCallback(async (query: string) => {
    setCaseOwnerSearch(query);
    if (query.length === 0) {
      setCaseOwnerId('');
      setCaseOwnerSuggestions([]);
      return;
    }

    if (query.length > 1) {
      try {
        const results = await SettingsService.searchCaseOwner(query, isNetworkAvailable);
        setCaseOwnerSuggestions(results || []);
      } catch (error) {
        console.error('Case owner search error:', error);
      }
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    const formData = settingsFormData({
      permitIssuedDate,
      permitExpirationDate,
      viewOnlyAssignUsers: restrictToAssigned,
      assignedUsers: selectedTeamMembers?.join(','),
      assignAccess,
      contentItemId: param.contentItemId,
      projectValuation,
      caseOwner: caseOwnerId,
      syncModel: SyncModelParam(
        false,
        false,
        getNewUTCDate(),
        generateUniqueID(),
        param.contentItemId,
        null,
      ),
    });

    setIsLoading(true);
    await SettingsService.saveSettings(
      formData,
      param.contentItemId,
      userId,
      setIsLoading,
      isNetworkAvailable,
      navigation,
    );
    setIsLoading(false);
  }, [
    permitIssuedDate,
    permitExpirationDate,
    restrictToAssigned,
    selectedTeamMembers,
    assignAccess,
    param?.contentItemId,
    projectValuation,
    caseOwnerId,
    userId,
    navigation,
  ]);

  // Validate and trigger save
  const validateAndSave = useCallback(() => {
    if (selectedTeamMembers?.length === 0) {
      ToastService.show('The Case Assign Team Members field is required.', COLORS.ERROR);
      setFieldErrors({
        ...fieldErrors,
        assigneeTeamMember: true,
      });
      return;
    } else {
      setFieldErrors({
        ...fieldErrors,
        assigneeTeamMember: false,
      });
    }

    if (
      !!restrictToAssigned &&
      !selectedTeamMembers?.some((member: any) =>
        typeof member === 'string' ? member === userId : member.id === userId,
      )
    ) {
      Alert.alert(
        'Confirmation',
        TEXTS.alertMessages.caseAssignTeamMember,
        [
          { text: 'OK', onPress: saveSettings },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else {
      saveSettings();
    }
  }, [restrictToAssigned, selectedTeamMembers, userId, saveSettings]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <MenuProvider customStyles={{ backdrop: styles.backdrop }}>
        <ScreenWrapper title={TEXTS.subScreens.setting.heading}>
          <View style={styles.content}>
            <KeyboardAwareScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View pointerEvents={isForceSync ? 'none' : 'auto'}>
                <View style={{ marginTop: 10 }}>
                  <DatePickerInput
                    label={TEXTS.subScreens.setting.permitIssuedDate}
                    value={permitIssuedDate}
                    onChange={(date) => setPermitIssuedDate(date ? date.toISOString() : '')}
                    hintText={TEXTS.subScreens.setting.permitIssueHints}
                    containerStyle={styles.dateInput}
                    disabled={param.isStatusReadOnly}
                    editable={!param.isStatusReadOnly}
                  />
                </View>
                <View style={{ marginTop: 5 }}>
                  <DatePickerInput
                    label={TEXTS.subScreens.setting.permitExpirationDate}
                    value={permitExpirationDate}
                    onChange={(date) => setPermitExpirationDate(date ? date.toISOString() : '')}
                    minimumDate={permitIssuedDate ? new Date(permitIssuedDate) : undefined}
                    hintText={TEXTS.subScreens.setting.permitExpirationHints}
                    containerStyle={styles.dateInput}
                    disabled={param.isStatusReadOnly}
                    editable={!param.isStatusReadOnly}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <FloatingInput
                    label={TEXTS.subScreens.setting.projectValuation}
                    value={projectValuation}
                    numberOfLines={1}
                    onChangeText={setProjectValuation}
                    placeholder={TEXTS.subScreens.setting.projectValuationPlaceholder}
                    keyboardType="numeric"
                    leftIcon="currency-usd"
                    hintText={TEXTS.subScreens.setting.projectValuationHints}
                    disabled={param.isStatusReadOnly}
                  />
                </View>
                {isNetworkAvailable && (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        zIndex: 2,
                        opacity: param?.isStatusReadOnly ? 0.4 : 1,
                      },
                    ]}
                    pointerEvents={param?.isStatusReadOnly ? 'none' : 'auto'}
                  >
                    <Text style={styles.label}>{TEXTS.subScreens.setting.caseOwner}</Text>
                    {/* <Autocomplete
                      autoCapitalize="none"
                      autoCorrect={false}
                      scrollEnabled={true}
                      style={styles.autocompleteInput}
                      inputContainerStyle={styles.autocompleteContainer}
                      data={caseOwnerSuggestions}
                      value={caseOwnerSearch}
                      onChangeText={handleCaseOwnerSearch}
                      placeholder={TEXTS.subScreens.setting.caseOwnerPlaceholder}
                      placeholderTextColor={COLORS.BLACK}
                      flatListProps={{
                        keyExtractor: (_, idx) => idx.toString(),
                        renderItem: ({ item }) => (
                          <TouchableOpacity
                            style={styles.autocompleteItem}
                            onPress={() => {
                              setCaseOwnerId(item.userId);
                              setCaseOwnerSearch(item.normalizedUserName || "");
                              setCaseOwnerSuggestions([]);
                            }}
                          >
                            <Text>{item.normalizedUserName}</Text>
                          </TouchableOpacity>
                        ),
                      }}
                    /> */}

                    <AutocompleteInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      scrollEnabled={true}
                      style={styles.autocompleteInput}
                      inputContainerStyle={styles.autocompleteContainer}
                      data={caseOwnerSuggestions}
                      value={caseOwnerSearch}
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
                            selectedOwnerId?.toLowerCase() === item.userId?.toLowerCase();

                          return (
                            <TouchableOpacity
                              style={[
                                styles.autocompleteItem,
                                {
                                  backgroundColor: isSelected
                                    ? COLORS.APP_COLOR
                                    : COLORS.VERY_GRAY_LIGHT,
                                },
                              ]}
                              onPress={() => {
                                setCaseOwnerId(item.userId);
                                setSelectedOwnerId(item.userId);
                                setCaseOwnerSearch(item.normalizedUserName || '');
                                setCaseOwnerSuggestions([]);
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
                <View style={{ zIndex: 1, marginTop: 20 }}>
                  <CustomMultiSelectDropdown
                    data={teamMembers?.map((item) => ({
                      item: `${item?.firstName} ${item?.lastName}`,
                      id: item?.userId,
                    }))}
                    labelField="item"
                    valueField="id"
                    value={selectedTeamMembers}
                    onChange={(item) => {
                      setSelectedTeamMembers(item);
                      setFieldErrors((prev) => ({
                        ...prev,
                        assigneeTeamMember: item?.length < 0,
                      }));
                    }}
                    label={TEXTS.subScreens.setting.assignedTeamMember}
                    placeholder={TEXTS.subScreens.setting.assignedTeammenberPlaceholder}
                    zIndexPriority={1}
                    disabled={
                      normalizeBool(param.assignTeamMemberDisable) ||
                      normalizeBool(param?.isStatusReadOnly)
                    }
                    hintText={TEXTS.subScreens.setting.assignedTeamHint}
                    error={fieldErrors.assigneeTeamMember}
                  />
                </View>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    value={!!restrictToAssigned}
                    disabled={!!param?.isStatusReadOnly}
                    onValueChange={setRestrictToAssigned}
                    color={!!restrictToAssigned ? COLORS.APP_COLOR : undefined}
                  />
                  <TouchableOpacity
                    onPress={() => setRestrictToAssigned(!restrictToAssigned)}
                    disabled={!!param?.isStatusReadOnly}
                  >
                    <Text style={styles.checkboxLabel}>
                      {TEXTS.subScreens.setting.viewOnlyAssignUsers}
                    </Text>
                  </TouchableOpacity>
                </View>
                <PublishButton
                  disabled={!!param?.isStatusReadOnly || isForceSync}
                  buttonStyle={{ marginTop: 15 }}
                  onPress={validateAndSave}
                />
              </View>
            </KeyboardAwareScrollView>
          </View>
        </ScreenWrapper>
      </MenuProvider>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height(0.1),
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  inputContainer: {
    marginTop: 10,
  },
  label: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    marginBottom: 5,
  },
  hint: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.018),
    marginLeft: 2,
  },
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height(0.02),
  },
  checkboxLabel: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    width: WINDOW_WIDTH * 0.25,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default SettingsScreen;
