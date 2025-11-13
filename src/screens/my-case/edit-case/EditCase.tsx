import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Loader from '../../../components/common/Loader';
import FloatingInput from '../../../components/common/FloatingInput';
import CustomDropdown from '../../../components/common/CustomDropdown';
import CustomMultiSelectDropdown from '../../../components/common/MultiSelectDropdown';
import PublishButton from '../../../components/common/PublishButton';
import AddressDialog from '../../../components/common/AddressDialog';
import { GooglePlacePicker } from '../../../components/common/GoogleAddressPicker';
import Checkbox from 'expo-checkbox';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import RenderItemChevronStatus from '../../../components/common/ChevronStatus';
import IMAGES from '../../../theme/images';
import { COLORS } from '../../../theme/colors';
import { fontSize, height } from '../../../utils/helper/dimensions';
import { TEXTS } from '../../../constants/strings';
import { styles } from '../myCaseStyles';
import { SubScreensItemView } from '../../sub-screens/SubScreensItemView';
import { RootStackParamList } from '../../../navigation/Types';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import {
  convertDate,
  createFullAddress,
  formatAllTypesDate,
  generateUniqueID,
  getNewUTCDate,
  normalizeBool,
  show2Decimals,
} from '../../../utils/helper/helpers';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import {
  fetchCaseDataById,
  fetchCaseDropdownData,
  fetchCaseTypeFieldSetting,
  getCaseUniqueNumber,
  updateCaseDetails,
  updateLocation,
  updateMailingAdress,
} from '../CaseService';
import { caseEditFormData, SyncModelParam } from '../../../utils/params/commonParams';
import { useUnifiedCaseStore } from '../../../store/caseStore';
import { RichEditor } from 'react-native-pell-rich-editor';
import { CaseData } from '../../../utils/interfaces/ICase';
import { OFFLINE_TITLES, TABS } from '../../../constants/data';
import { AlertMessageSection } from '../../../components/common/AlertMessageSection';
import { goBack } from '../../../navigation/Index';
import { CustomConfirmationDialog } from '../../../components/dialogs/CustomConfirmationDialog';
import { useFocusEffect } from '@react-navigation/native';
import { validateCaseFields } from '../../../utils/validations';
import { HintText } from '../../../components/common/EditCaseLicenseInfo';
import { saveNavigationState } from '../../../session/SessionManager';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

type EditCaseScreenProps = NativeStackScreenProps<RootStackParamList, 'EditCaseScreen'>;

const EditCaseScreen: React.FC<EditCaseScreenProps> = ({ route, navigation }) => {
  const {
    caseData,
    chevronStatusList,
    dropdownsList,
    caseSettingData,
    isLoading,
    isSchedule,
    isAllowMultipleAddress,
    isAllowViewInspection,
    isShowTaskStatusLogTab,
    showLocationEditDialog,
    showMailingEditDialog,
    permissions,
    alertPopupData,
    setCaseData,
    setChevronStatusList,
    setDropdownsList,
    setCaseSettingData,
    setIsLoading,
    setIsAllowMultipleAddress,
    setIsSchedule,
    setIsAllowViewInspection,
    setIsShowTaskStatusLogTab,
    setShowLocationEditDialog,
    setShowMailingEditDialog,
    resetMailingAddress,
    resetLocation,
    setPermisssions,
    setAlertPopup,
  } = useUnifiedCaseStore();
  const googlePlacePickerRef = useRef<any>(null);
  const [fieldErrors, setFieldErrors] = useState({
    number: false,
    statusId: false,
    caseTypeId: false,
    location: false,
  });
  const caseDataProps: CaseData = route.params?.myCaseData;
  const isForceSync: boolean = route?.params?.isForceSync; //For only force sync
  const scrollRef = useRef<ScrollView>(null);
  const lastNavigatedScreen = useRef<string | null>(null);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [existingData, setExistingData] = useState([]);
  const [locationfieldErrors, setLocationFieldErrors] = useState({
    addressError: false,
  });
  const richText = useRef<RichEditor | null>(null);
  const readOnly = normalizeBool(caseData?.isStatusReadOnly);
  const refreshAttechedItems = route?.params?.refreshAttechedItems;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setCaseData(null);
          setChevronStatusList([]);
          setDropdownsList([]);
          resetMailingAddress();
          resetLocation();
          await fetchCaseDetails().then(() => {
            setTimeout(() => {
              //code for visible all tabs when go back to the screen (if we removed then the subscreen is hiding)
              const lastScreens = visibleTabs.slice(-6).map((tab) => tab.screenName);
              const currentScreen = lastNavigatedScreen.current ?? '';
              if (lastScreens.includes(currentScreen)) {
                const frameId = requestAnimationFrame(() => {
                  if (scrollRef.current && !isLoading) {
                    scrollRef.current.scrollToEnd({ animated: false });
                  }
                });
                return () => cancelAnimationFrame(frameId);
              }
            }, 200);
          });
        } catch (error) {
          recordCrashlyticsError('Error fetching data:',error)
          console.error('Error fetching data:', error);
          setAlertPopup({
            title: 'Error',
            message: 'Failed to load data. Please try again.',
            type: 'error',
          });
        }
      };

      fetchData();
    }, [route?.params?.caseId, caseDataProps, isNetworkAvailable]),
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     setTimeout(() => {
  //        //code for visible all tabs when go back to the screen (if we removed then the subscreen is hiding)
  //     const lastScreens = visibleTabs.slice(-6).map(tab => tab.screenName);
  //      const currentScreen = lastNavigatedScreen.current ?? "";
  //       if (lastScreens.includes(currentScreen)) {
  //       const frameId = requestAnimationFrame(() => {
  //         if (scrollRef.current && !isLoading) {
  //           scrollRef.current.scrollToEnd({ animated: false });
  //         }
  //       });
  //       return () => cancelAnimationFrame(frameId);
  //           }
  //     }, 200);

  //   }, [isLoading])
  // );

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        await fetchCaseDropdown(); // this function uses caseData.caseTypeId internally
      } catch (error) {
        recordCrashlyticsError('Error fetching dropdown data:',error)
        console.error('Error fetching dropdown data:', error);
        setAlertPopup({
          title: 'Error',
          message: 'Failed to load dropdown data. Please try again.',
          type: 'error',
        });
      }
    };
    fetchDropdowns();
  }, [caseData?.caseTypeId, isNetworkAvailable]);

  useEffect(() => {
    googlePlacePickerRef.current?.setAddressText(caseData?.location ?? '');
  }, [googlePlacePickerRef, caseData?.location]);

  const fetchCaseDetails = async () => {
    try {
      setIsLoading(true);
      const { casesDetails, chevronList } = await fetchCaseDataById(
        route.params.caseId,
        isNetworkAvailable,
        caseDataProps,
      );
      setExistingData(casesDetails);
      const caseTypeFieldSettingResponse = await fetchCaseTypeFieldSetting(
        casesDetails?.data?.caseTypeId,
        isNetworkAvailable,
      );
      const multilineData = casesDetails?.data?.isEnableMultiline;
      setCaseData({
        ...casesDetails?.data,
        totalCost: show2Decimals(casesDetails?.data?.totalCost),
        mailingAddressStreetRouteField: casesDetails?.data?.mailingAddressStreetRouteField ?? '',
        mailingAddressCityField: casesDetails?.data?.mailingAddressCityField ?? '',
        mailingAddressStateField: casesDetails?.data?.mailingAddressStateField ?? '',
        mailingAddressCountryField: casesDetails?.data?.mailingAddressCountryField ?? '',
        mailingAddressPostalCodeField: casesDetails?.data?.mailingAddressPostalCodeField ?? '',
        streetRouteField: casesDetails?.data?.streetRouteField ?? '',
        cityField: casesDetails?.data?.cityField ?? '',
        stateField: casesDetails?.data?.stateField ?? '',
        countryField: casesDetails?.data?.countryField ?? '',
        postalCodeField: casesDetails?.data?.postalCodeField ?? '',
        latitudeField: casesDetails?.data?.latitudeField ?? '',
        longitudeField: casesDetails?.data?.longitudeField ?? '',
        isShowTaskStatusLogTab: false,
        selectedInspectionCaseStatus: [],
        isEnableMultiline: multilineData,
        isManualAddress: Boolean(Number(casesDetails?.data?.isManualAddress)) ?? false,
        isLockCaseNumber: casesDetails?.data?.isLockCaseNumber,
        location: casesDetails?.data?.location,
        statusId: casesDetails?.data?.statusId,
        billingStatusId: casesDetails?.data?.billingStatusId,
        caseTypeId: casesDetails?.data?.caseTypeId,
        isAllowEditActualDate: casesDetails?.data?.isAllowEditActualDate,
        isStatusReadOnly: casesDetails.data?.isStatusReadOnly,
        isTypeReadOnly: casesDetails.data?.isTypeReadOnly,
        isAllowStatusChangeOnReadOnly: casesDetails.data?.isAllowStatusChangeOnReadOnly,
        isAllowEditOnTypeReadOnly: casesDetails.data?.isAllowEditOnTypeReadOnly,
        description: casesDetails.data?.description ?? '',
      });
      richText.current?.setContentHTML(casesDetails.data?.description);
      setPermisssions(casesDetails?.permissions);
      setChevronStatusList(chevronList ?? []);
      setCaseSettingData(caseTypeFieldSettingResponse || {});
      setIsAllowViewInspection(casesDetails?.permissions?.isAllowViewInspection);
      setIsShowTaskStatusLogTab(casesDetails?.data?.isShowTaskStatusLogTab || false);
      setAlertPopup(casesDetails?.data?.lstComments || casesDetails?.lstComments);
      checkInspectionSchedule(
        casesDetails?.data?.statusId,
        casesDetails?.data?.selectedInspectionCaseStatus,
      );
    } catch (error) {
      recordCrashlyticsError('Error fetching case details:',error)
      console.error('Error fetching case details:', error);
      setAlertPopup({
        title: 'Error',
        message: 'Failed to load case details. Please try again.',
        type: 'error',
      });
    } finally {
      // setIsLoading(false);
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  const fetchCaseDropdown = async () => {
    try {
      // if (!caseData?.caseTypeId) {
      //   console.log("Skipping fetchCaseDropdown: caseTypeId not available");
      //   return;
      // }
      const { subDropdownsList } = await fetchCaseDropdownData(isNetworkAvailable);
      setDropdownsList(Array.isArray(subDropdownsList) ? subDropdownsList : [subDropdownsList]);
      const selectedCaseType = subDropdownsList?.caseTypes?.find(
        (item: any) => item.id === caseData?.caseTypeId,
      ) || { id: '', displayText: '' };

      const isMultipleAddress = isNetworkAvailable
        ? (selectedCaseType?.content?.CaseType?.IsAllowMutlipleAddress?.Value ?? false)
        : (selectedCaseType.isMultipleLocation ?? false);
      setIsAllowMultipleAddress(isMultipleAddress);
      console.log('selectedCaseType.isMultipleLocation -->', isMultipleAddress);
    } catch (error) {
      recordCrashlyticsError('Error fetching dropdown data:', error)
      console.error('Error fetching dropdown data:', error);
      setAlertPopup({
        title: 'Error',
        message: 'Failed to load dropdown data. Please try again.',
        type: 'error',
      });
    }
  };
  // Check inspection schedule
  const checkInspectionSchedule = (caseStatusId: string, scheduleStatusList: any[]) => {
    setIsSchedule(
      scheduleStatusList?.length > 0
        ? scheduleStatusList.some((element: any) => caseStatusId === element.id)
        : true,
    );
  };

  const tabsWithDynamicTitles = useMemo(() => {
    return TABS.map((tab) => {
      const newTab = { ...tab };
      switch (newTab?.screenName) {
        case 'AttechedItems':
          if (caseSettingData?.attachedItemText) {
            newTab.title = caseSettingData?.attachedItemText;
          }
          break;
        case 'TaskScreen':
          if (caseSettingData?.taskText) {
            newTab.title = caseSettingData?.taskText;
          }
          break;
      }
      return newTab;
    });
  }, [caseSettingData, isNetworkAvailable]);
  // Update location API
  const updateLocationApi = async () => {
    if (isNetworkAvailable) {
      try {
        const SyncModel = SyncModelParam(
          false, //IsOfflineSync always true
          false, //IsOfflineSync always false
          getNewUTCDate(), //utc date when we come on the offline
          generateUniqueID(), //correlationId
          caseData?.contentItemId, //contentItemId
          null,
        );
        setIsLoading(true);
        const updatedLocation = await updateLocation({
          contentItemId: caseData?.contentItemId || '',
          streetAddress: caseData?.streetRouteField || '',
          latitude: caseData?.latitudeField || '',
          longitude: caseData?.longitudeField || '',
          city: caseData?.cityField || '',
          state: caseData?.stateField || '',
          zip: caseData?.postalCodeField || '',
          isManualLocation: caseData?.isManualAddress || false,
          SyncModel: SyncModel,
        });

        if (updatedLocation?.status) {
          setCaseData({
            ...caseData!,
            location: createFullAddress(
              caseData?.streetRouteField ?? '',
              caseData?.cityField ?? '',
              caseData?.stateField ?? '',
              caseData?.postalCodeField ?? '',
            ),
            latitudeField: caseData?.latitudeField || '',
            longitudeField: caseData?.longitudeField || '',
          });
          ToastService.show('Address updated successfully.', COLORS.SUCCESS_GREEN);
          // await fetchCaseDetails();
        } else {
          ToastService.show(updatedLocation?.message || 'Error updating address', COLORS.ERROR);
        }
      } catch (error) {
        recordCrashlyticsError('Error updating location:',error)
        console.error('Error updating location:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCaseData({
        ...caseData!,
        location: createFullAddress(
          caseData?.streetRouteField ?? '',
          caseData?.cityField ?? '',
          caseData?.stateField ?? '',
          caseData?.postalCodeField ?? '',
        ),
        latitudeField: caseData?.latitudeField || '',
        longitudeField: caseData?.longitudeField || '',
      });
    }
  };

  // Update mailing address API
  const updateMailingAddressApi = async () => {
    if (isNetworkAvailable) {
      try {
        const SyncModel = SyncModelParam(
          false, //IsOfflineSync
          false, //IsOfflineSync always false
          getNewUTCDate(), //utc date when we come on the offline
          generateUniqueID(), //correlationId
          caseData?.contentItemId, //contentItemId
          null,
        );
        setIsLoading(true);
        const updatedMailingAddress = await updateMailingAdress({
          contentItemId: caseData?.contentItemId || '',
          streetAddress: caseData?.mailingAddressStreetRouteField || '',
          city: caseData?.mailingAddressCityField || '',
          state: caseData?.mailingAddressStateField || '',
          zip: caseData?.mailingAddressPostalCodeField || '',
          SyncModel: SyncModel,
        });

        if (updatedMailingAddress?.status) {
          setCaseData({
            ...caseData!,
            mailingAddress: createFullAddress(
              caseData?.mailingAddressStreetRouteField ?? '',
              caseData?.mailingAddressCityField ?? '',
              caseData?.mailingAddressStateField ?? '',
              caseData?.mailingAddressPostalCodeField ?? '',
            ),
          });
          ToastService.show('Mailing address updated successfully.', COLORS.SUCCESS_GREEN);
          // await fetchCaseDetails();
        } else {
          ToastService.show(
            updatedMailingAddress?.message || 'Error updating mailing address',
            COLORS.ERROR,
          );
        }
      } catch (error) {
        recordCrashlyticsError('Error updating mailing address:',error)
        console.error('Error updating mailing address:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCaseData({
        ...caseData!,
        mailingAddress: createFullAddress(
          caseData?.mailingAddressStreetRouteField ?? '',
          caseData?.mailingAddressCityField ?? '',
          caseData?.mailingAddressStateField ?? '',
          caseData?.mailingAddressPostalCodeField ?? '',
        ),
      });
    }
  };

  // Handle tab navigation
  const handleTabPress = (screenName: keyof RootStackParamList, tabData: any) => {
    lastNavigatedScreen.current = screenName; // Store the screen being navigated to
    const params = {
      type: tabData.type,
      param: caseData,
      isShowSchedule: isSchedule,
      caseDataById: caseData,
      isAllowViewInspection,
      assignTeamMemberDisable: false,
      permissions: permissions,
      caseSettingData,
      isOnline: isNetworkAvailable,
      isForceSync: isForceSync,
    };

    navigation.navigate(screenName, params);
  };

  // Update case details
  const updateCaseApi = async () => {
    if (!caseData) return;
    try {
      const isValid = validateCaseFields(caseData, isAllowMultipleAddress, setFieldErrors);
      if (!isValid) return;
      setIsLoading(true);
      const caseInputData = caseEditFormData(
        {
          caseName: caseData?.caseName ?? '',
          caseNumberDetail: caseData?.caseNumberDetail ?? '',
          caseNumber: caseData?.number ?? '',
          expectedDate: formatAllTypesDate(caseData?.expectedCaseDate) ?? '',
          actualCaseDate: caseData?.actualCaseDate ?? '',
          caseStatus: caseData?.statusId ?? '',
          billingStatus: caseData?.billingStatusId ?? '',
          caseType: caseData?.caseTypeId ?? '',
          caseTypeName: caseData?.caseType ?? '',
          subTypes: caseData?.subTypes ?? '',
          caseTags: caseData?.caseTag ?? '',
          totalCost: caseData?.totalCost == null ? null : String(caseData.totalCost),
          location: caseData?.location ?? ' ',
          parcelNumber: caseData?.parcelNumber ?? '',
          quickRefNumber: caseData?.quickRefNumber ?? '',
          isApiUpdateQuickRefNumber: true,
          description: caseData?.description ?? '',
          id: caseData?.contentItemId ?? '',
          longitude: caseData?.longitudeField ?? '',
          latitude: caseData?.latitudeField ?? '',
          isManualAddress: Boolean(caseData?.isManualAddress) ?? false,
          statusName:
            dropdownsList[0]?.caseStatuses?.find((item: any) => item.id === caseData?.statusId)
              ?.displayText ?? '',
          isEnableMultiline: Boolean(caseData?.isEnableMultiline) ?? false,
          streetAddress: caseData?.streetRouteField ?? '',
          city: caseData?.cityField ?? '',
          addressState: caseData?.stateField ?? '',
          zip: caseData?.postalCodeField ?? '',
          mailingAddressStreetRouteField: caseData?.mailingAddressStreetRouteField ?? '',
          mailingAddressCityField: caseData?.mailingAddressCityField ?? '',
          mailingAddressPostalCodeField: caseData?.mailingAddressPostalCodeField ?? '',
          mailingAddressStateField: caseData?.mailingAddressStateField ?? '',
          MailingAddress: caseData?.mailingAddress ?? '',
          apartmentSuite: caseData?.apartmentSuite ?? '',
          countryField: caseData?.countryField ?? '',
          mailingAddressCountryField: caseData?.mailingAddressCountryField ?? '',
          caseStatusName: caseData?.caseStatusName ?? '',
          billingStatusName: caseData?.billingStatusName ?? '',
          isAllowEditActualDate: caseData?.isAllowEditActualDate ?? false,
          viewOnlyAssignUsers: caseData?.viewOnlyAssignUsers ?? false,
          displayText: caseData?.displayText ?? '',
          assignedUsers: caseData?.assignedUsers ?? '',
        },
        isNetworkAvailable,
      );
      const response = await updateCaseDetails(
        caseInputData,
        caseData?.contentItemId,
        isNetworkAvailable,
      );
      if (response?.statusCode === 200) {
        ToastService.show(TEXTS.caseScreen.updateCaseSuccessMsg, COLORS.SUCCESS_GREEN);
        saveNavigationState(false);
        goBack();
      }
    } catch (error) {
      recordCrashlyticsError('Error updating case:',error)
      console.error('Error updating case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCaseNumberAPI = async () => {
    try {
      setIsLoading(true);
      const generateUniqueNumber = await getCaseUniqueNumber(
        caseData?.caseTypeId ?? '',
        caseData?.contentItemId ?? '',
        isNetworkAvailable,
      );
      setIsLoading(false);
      if (generateUniqueNumber?.status) {
        setCaseData({
          ...caseData,
          number: generateUniqueNumber?.data?.number,
        });
      }
    } catch (error) {
      setIsLoading(false);
      recordCrashlyticsError('Error fetching case number:',error)
      console.error('Error fetching case number:', error);
    }
  };

  // Render tabs
  const visibleTabs = useMemo(() => {
    return isNetworkAvailable
      ? tabsWithDynamicTitles
      : tabsWithDynamicTitles.filter((tab) => OFFLINE_TITLES.has(tab?.screenName));
  }, [tabsWithDynamicTitles, isNetworkAvailable, permissions]);

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {visibleTabs.map((tab, index) => {
        const tabContent = SubScreensItemView(
          tab,
          isNetworkAvailable,
          caseSettingData,
          isShowTaskStatusLogTab,
          permissions,
          isAllowMultipleAddress,
          isAllowViewInspection,
          caseData,
        );
        if (!tabContent?.type) return null;

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.screenName as keyof RootStackParamList, tab)}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabText}>{tab.title}</Text>
              <Image source={IMAGES.RIGHT_ARROW} style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScreenWrapper
      title={`${TEXTS.caseScreen.editCaseHeading} ${
        readOnly || caseData?.isTypeReadOnly ? '- Read Only' : ''
      }`}
      dateTimeObj={[
        caseData?.ownerName ?? '',
        caseData?.createdUtc ?? '',
        caseData?.authorName ?? caseData?.author ?? '',
        caseData?.modifiedUtc ?? '',
      ]}
      onBackPress={() => {
        if (refreshAttechedItems) {
          goBack();
          goBack();
        } else {
          saveNavigationState(true);
          goBack();
        }
      }}
    >
      <Loader loading={isLoading} />
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View pointerEvents={isForceSync ? 'none' : 'auto'}>
          {isNetworkAvailable && !isLoading && (
            <View style={styles.chevronContainer}>
              {chevronStatusList?.map((item) => (
                <View key={item.id} style={styles.chevronItem}>
                  <RenderItemChevronStatus item={item} />
                </View>
              ))}
            </View>
          )}
          <AlertMessageSection alertData={alertPopupData} isOnline={isNetworkAvailable} />
          <View style={styles.inputViewStyle}>
            <View style={styles.inputWrapper}>
              <FloatingInput
                label={caseSettingData?.caseNumberText?.trim() || TEXTS.caseScreen.casUniqueNumber}
                value={caseData?.number ?? ''}
                numberOfLines={1}
                onChangeText={(value) => {
                  setCaseData({ ...caseData, number: value });
                  if (value?.trim() !== '') {
                    setFieldErrors((prev) => ({
                      ...prev,
                      number: false,
                    }));
                  }
                }}
                keyboardType="default"
                customRightIcon={
                  isNetworkAvailable && caseData?.useAutoCaseNumber && IMAGES.REFRESH_ICON
                }
                hintText="The Number of the case"
                onIconPress={() => {
                  Keyboard.dismiss();
                  setShowConfirmationDialog(true);
                }}
                error={fieldErrors.number}
                disabled={caseData?.isLockCaseNumber || readOnly}
                required={true}
              />
            </View>

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideCaseNumberDetail != undefined &&
              normalizeBool(caseSettingData?.isHideCaseNumberDetail) === false) ? (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={TEXTS.caseScreen.caseNumberDetails}
                  value={caseData?.caseNumberDetail ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) => setCaseData({ ...caseData, caseNumberDetail: value })}
                  placeholder={TEXTS.caseScreen.caseNumberDetailsPlaceholder}
                  keyboardType="default"
                  hintText="The Case Number Detail of the Case."
                  disabled={readOnly}
                />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideCaseName != undefined &&
              normalizeBool(caseSettingData?.isHideCaseName) === false) ? (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={TEXTS.caseScreen.caseName}
                  value={caseData?.caseName ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) => setCaseData({ ...caseData, caseName: value })}
                  placeholder={TEXTS.caseScreen.caseNamePlaceholder}
                  keyboardType="default"
                  hintText="The Name of the case."
                  disabled={readOnly}
                />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}
            <View style={styles.dropdownStyle}>
              {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
              (caseSettingData?.isHideExpectedCloseDate != undefined &&
                normalizeBool(caseSettingData?.isHideExpectedCloseDate) === false) ? (
                <View
                  style={{
                    width: caseSettingData?.isHideExpectedCloseDate ? '100%' : '48%',
                  }}
                >
                  <View>
                    <DatePickerInput
                      label={caseSettingData?.expectedCloseDateText || 'Expected Close Date'}
                      value={formatAllTypesDate(caseData?.expectedCaseDate)}
                      onChange={(pickDate) => {
                        setCaseData({
                          ...caseData,
                          expectedCaseDate: convertDate(pickDate),
                        });
                      }}
                      hintText="The expected close date of the case"
                      editable={!readOnly}
                      disabled={readOnly}
                    />
                  </View>
                </View>
              ) : null}

              <View
                style={{
                  width: caseSettingData?.isHideExpectedCloseDate ? '100%' : '48%',
                }}
              >
                <View>
                  <DatePickerInput
                    label={caseSettingData?.actualCloseDateText || 'Actual Close Date'}
                    value={caseData?.actualCaseDate}
                    onChange={(pickDate) => {
                      setCaseData({
                        ...caseData,
                        actualCaseDate: convertDate(pickDate),
                      });
                    }}
                    hintText="The Actual date of the case."
                    editable={caseData?.isAllowEditActualDate && !readOnly}
                    disabled={!caseData?.isAllowEditActualDate || readOnly}
                  />
                </View>
              </View>
            </View>
            <View style={[styles.inputWrapper, { zIndex: 6 }]}>
              <CustomDropdown
                data={dropdownsList[0]?.caseStatuses ?? []}
                labelField="displayText"
                valueField="id"
                value={caseData?.statusId}
                onChange={(item) => {
                  setCaseData({
                    ...caseData,
                    statusId: item?.value?.id,
                    caseStatusName: item?.value?.displayText,
                  });
                  setFieldErrors((prev) => ({
                    ...prev,
                    statusId: false,
                  }));
                }}
                label={TEXTS.caseScreen.status}
                placeholder={TEXTS.caseScreen.statusPlaceholder}
                zIndexPriority={3}
                hintText="The status of the case."
                error={fieldErrors.statusId}
                required={true}
              />
            </View>

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideBillingStatus != undefined &&
              normalizeBool(caseSettingData?.isHideBillingStatus) === false) ? (
              <View style={[styles.inputWrapper, { zIndex: 5 }]}>
                <CustomDropdown
                  data={dropdownsList[0]?.billingStatus ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={caseData?.billingStatusId}
                  onChange={(item) => {
                    setCaseData({
                      ...caseData,
                      billingStatusId: item?.value?.id,
                      billingStatusName: item?.value?.displayText,
                    });
                  }}
                  label={TEXTS.caseScreen.billingStatus}
                  placeholder={TEXTS.caseScreen.billingStatusPlaceholder}
                  zIndexPriority={2}
                  hintText="The billing status of the case."
                  disabled={readOnly}
                />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}

            {(!isNetworkAvailable && Object.keys(caseSettingData || {}).length === 0) ||
            (caseSettingData?.isHideCaseType != undefined &&
              normalizeBool(caseSettingData?.isHideCaseType) === false) ? (
              <View style={[styles.inputWrapper, { zIndex: 4 }]}>
                <CustomDropdown
                  data={dropdownsList[0]?.caseTypes ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={caseData?.caseTypeId}
                  onChange={(item) => {
                    setIsAllowMultipleAddress(
                      isNetworkAvailable
                        ? (item?.value?.content?.CaseType?.IsAllowMutlipleAddress?.Value ?? false)
                        : item.isMultipleLocation === 1,
                    );
                    setCaseData({
                      ...caseData,
                      caseTypeId: item?.value?.id,
                      caseType: item?.value?.displayText,
                    });
                    setFieldErrors((prev) => ({
                      ...prev,
                      caseTypeId: false,
                    }));
                  }}
                  label={TEXTS.caseScreen.caseType}
                  placeholder={TEXTS.caseScreen.caseTypePlaceholder}
                  zIndexPriority={1}
                  hintText="The case type of the case."
                  error={fieldErrors.caseTypeId}
                  disabled={readOnly || caseSettingData?.isLockCaseType}
                  required={true}
                />
              </View>
            ) : null}

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideCaseSubType != undefined &&
              normalizeBool(caseSettingData?.isHideCaseSubType) === false) ? (
              <View style={[styles.inputWrapper, { zIndex: 3 }]}>
                <CustomMultiSelectDropdown
                  data={dropdownsList[0]?.subTypes ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={caseData?.subTypes?.split(',')?.filter((tag) => tag?.trim() !== '') ?? []}
                  onChange={(values) => setCaseData({ ...caseData, subTypes: values.join(',') })}
                  label={TEXTS.caseScreen.caseSubType}
                  placeholder={TEXTS.caseScreen.caseSubTypePlaceholder}
                  zIndexPriority={1}
                  hintText="The sub type of the case."
                  disabled={readOnly || caseSettingData?.isLockCaseSubType}
                />
              </View>
            ) : null}

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideTag != undefined &&
              normalizeBool(caseSettingData?.isHideTag) === false) ? (
              <View style={[styles.inputWrapper, { zIndex: 2 }]}>
                <CustomMultiSelectDropdown
                  data={dropdownsList[0]?.caseTags ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={caseData?.caseTag?.split(',')?.filter((tag) => tag?.trim() !== '') ?? []}
                  onChange={(values) => setCaseData({ ...caseData, caseTag: values.join(',') })}
                  label={caseSettingData?.caseTagText || TEXTS.caseScreen.caseTag}
                  placeholder={TEXTS.caseScreen.caseTagPlaceholder}
                  zIndexPriority={1}
                  hintText="The tags of the case."
                  disabled={readOnly}
                />
              </View>
            ) : null}

            {/* {typeof caseSettingData != "undefined" &&
          caseSettingData.isHideTotalCost == false ? ( */}
            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideTotalCost != undefined &&
              normalizeBool(caseSettingData?.isHideTotalCost) === false) ? (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={TEXTS.caseScreen.totalCost}
                  value={caseData?.totalCost ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) =>
                    setCaseData({
                      ...caseData,
                      totalCost: value === '' ? '' : value,
                    })
                  }
                  placeholder={TEXTS.caseScreen.totalCostPlaceholder}
                  keyboardType="numeric"
                  leftIcon="currency-usd"
                  hintText="The Total Cost of the case (Please add totalCost api field in the form to calculate)."
                  disabled={readOnly}
                />
              </View>
            ) : null}

            {/* LOCATION FUNCTIONALITY */}
            {!isAllowMultipleAddress ? (
              <View
                pointerEvents={readOnly ? 'none' : 'auto'}
                style={{ opacity: readOnly ? 0.6 : 1 }}
              >
                {Boolean(caseData?.isEnableMultiline) ? (
                  <View style={styles.inputWrapper}>
                    {isNetworkAvailable ? (
                      <View>
                        {Boolean(caseData?.isEnableMultiline) &&
                        caseData?.location != null &&
                        caseData?.location != '' ? (
                          // ONLINE + location exists
                          <TouchableOpacity
                            onPress={() => setShowLocationEditDialog(true)}
                            activeOpacity={0.8}
                            disabled={readOnly}
                          >
                            <FloatingInput
                              label="Location"
                              value={caseData?.location ?? ''}
                              multiline={true}
                              editable={false}
                              required
                              pointerEvents="none"
                              onChangeText={() => {}}
                              style={{ backgroundColor: COLORS.GRAY_LIGHT }}
                              placeholder="Please enter location"
                              keyboardType="default"
                              hintText="The Location field is Required."
                              error={!caseData?.location}
                            />
                          </TouchableOpacity>
                        ) : Boolean(caseData?.isEnableMultiline) &&
                          caseData?.location == '' &&
                          Boolean(caseData?.isManualAddress) ? (
                          // ONLINE + manual mode
                          <TouchableOpacity
                            style={[
                              styles.formInput,
                              {
                                justifyContent: 'center',
                                backgroundColor: COLORS.GRAY_LIGHT,
                              },
                            ]}
                            onPress={() => setShowLocationEditDialog(true)}
                          >
                            <Text
                              style={{
                                color: COLORS.BLACK,
                                paddingHorizontal: 5,
                                fontSize: fontSize(0.022),
                              }}
                            >
                              {caseData?.location}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          // ONLINE + no location + not manual ➝ use Google picker
                          <GooglePlacePicker
                            reff={googlePlacePickerRef}
                            setGoogleAddress={(value) => {
                              setCaseData({
                                ...caseData,
                                streetRouteField: value?.street,
                                cityField: value?.newCity,
                                postalCodeField: value?.zipcode,
                                stateField: value?.state,
                                location: value?.street,
                                countryField: value?.country,
                                latitudeField: value?.latitude,
                                longitudeField: value?.longitude,
                              });
                              setLocationFieldErrors((prev) => ({
                                ...prev,
                                addressError: false,
                              }));
                            }}
                            error={locationfieldErrors.addressError}
                          />
                        )}
                      </View>
                    ) : (
                      // OFFLINE: Always show TouchableOpacity
                      <TouchableOpacity
                        onPress={() => setShowLocationEditDialog(true)}
                        activeOpacity={0.8}
                      >
                        <FloatingInput
                          label="Location"
                          value={caseData?.location ?? ''}
                          multiline={true}
                          editable={false}
                          required
                          pointerEvents="none"
                          onChangeText={() => {}}
                          style={{ backgroundColor: COLORS.GRAY_LIGHT }}
                          placeholder="Please enter location"
                          keyboardType="default"
                          hintText="The Location field is Required."
                          error={!caseData?.location}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  // Condition will true if multiline data is false
                  <View>
                    {Boolean(caseData?.isManualAddress) ? (
                      <FloatingInput
                        label="Location"
                        value={caseData?.location ?? ''}
                        multiline={true}
                        required
                        onChangeText={(value) =>
                          setCaseData({
                            ...caseData,
                            location: value,
                          })
                        }
                        placeholder="Please enter location"
                        keyboardType="default"
                        hintText="The Location field is Required."
                        error={!caseData?.location}
                      />
                    ) : (
                      <></>
                    )}
                  </View>
                )}
                {/* Set manual location checkbox */}
                {Boolean(caseData?.isEnableMultiline) == false && (
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: height(0.02),
                      },
                    ]}
                  >
                    <Checkbox
                      value={caseData?.isManualAddress}
                      onValueChange={(value) => {
                        setCaseData({
                          ...caseData,
                          location: '',
                          isManualAddress: value,
                        });
                      }}
                      color={caseData?.isManualAddress ? COLORS.APP_COLOR : undefined}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setCaseData({
                          ...caseData,
                          location: '',
                          isManualAddress: !caseData?.isManualAddress,
                        });
                      }}
                    >
                      <Text style={[styles.titleStyle, { marginLeft: 10 }]}>
                        Set Manual Location
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}
            {!isAllowMultipleAddress && (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={TEXTS.caseScreen.aptste}
                  value={caseData?.apartmentSuite ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) => setCaseData({ ...caseData, apartmentSuite: value })}
                  placeholder={TEXTS.caseScreen.aptstePlaceholder}
                  keyboardType="default"
                  hintText="The Apt/Ste of the case."
                  disabled={readOnly}
                />
              </View>
            )}

            {/* {caseSettingData?.isHideMailingAddress == false && */}

            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideMailingAddress != undefined &&
              normalizeBool(caseSettingData?.isHideMailingAddress) === false &&
              !isAllowMultipleAddress) ? (
              <View
                pointerEvents={readOnly ? 'none' : 'auto'}
                style={{ opacity: readOnly ? 0.6 : 1 }}
              >
                {Boolean(caseData?.isEnableMultiline) ? (
                  <TouchableOpacity
                    onPress={() => setShowMailingEditDialog(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.inputWrapper}>
                      <FloatingInput
                        label="Mailing Address"
                        value={caseData?.mailingAddress ?? ''}
                        numberOfLines={1}
                        multiline={true}
                        editable={false}
                        pointerEvents="none"
                        style={{ backgroundColor: COLORS.GRAY_LIGHT }}
                        onChangeText={() => {}}
                        placeholder=""
                        keyboardType="default"
                        hintText="The mailing address of the case."
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.inputWrapper}>
                    <FloatingInput
                      label="Mailing Address"
                      value={caseData?.mailingAddress ?? ''}
                      numberOfLines={1}
                      onChangeText={(value) => setCaseData({ ...caseData, mailingAddress: value })}
                      placeholder="Please enter mailing address"
                      keyboardType="default"
                    />
                  </View>
                )}
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}
            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideParcelNumber != undefined &&
              normalizeBool(caseSettingData?.isHideParcelNumber) === false &&
              !isAllowMultipleAddress) ? (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={TEXTS.caseScreen.parcelNumber}
                  value={caseData?.parcelNumber ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) => setCaseData({ ...caseData, parcelNumber: value })}
                  placeholder={TEXTS.caseScreen.parcelNumberPlaceholder}
                  keyboardType="default"
                  hintText="The Parcel Number."
                  disabled={readOnly}
                />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}
            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideQuickRefNumber != undefined &&
              normalizeBool(caseSettingData?.isHideQuickRefNumber) === false &&
              !isAllowMultipleAddress) ? (
              <View style={styles.inputWrapper}>
                <FloatingInput
                  label={caseSettingData?.quickRefNumberText || TEXTS.caseScreen.quickReference}
                  value={caseData?.quickRefNumber ?? ''}
                  numberOfLines={1}
                  onChangeText={(value) => setCaseData({ ...caseData, quickRefNumber: value })}
                  placeholder={TEXTS.caseScreen.quickReferencePlaceholder}
                  keyboardType="default"
                  hintText="The Ref Number of the case."
                  disabled={readOnly}
                />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}
            {(!isNetworkAvailable && Object.keys(caseSettingData).length === 0) ||
            (caseSettingData?.isHideDescription != undefined &&
              normalizeBool(caseSettingData?.isHideDescription) === false) ? (
              <View
                pointerEvents={readOnly ? 'none' : 'auto'}
                style={[styles.inputWrapper, { opacity: readOnly ? 0.4 : 1 }]}
              >
                <Text
                  style={{
                    fontSize: fontSize(0.028),
                    marginBottom: 5,
                  }}
                >
                  Description
                </Text>
                <View style={styles.editorContainer}>
                  <RichEditor
                    ref={richText}
                    androidLayerType="software"
                    initialContentHTML={caseData?.description}
                    useContainer={true}
                    placeholder={TEXTS.caseScreen.descriptionPlaceholder}
                    onChange={(value) => {
                      setCaseData({ ...caseData, description: value });
                    }}
                    disabled={readOnly}
                  />
                </View>
                <HintText hintText="The Description of the Case." />
              </View>
            ) : (
              <View></View> // optional empty fallback
            )}
          </View>
          <PublishButton disabled={isForceSync} onPress={updateCaseApi} />
          {/* {isForceSync == true ? null : <PublishButton onPress={updateCaseApi} />} */}
        </View>
        {/* {caseData?.isAllowEditCase && ( */}

        {/* {isForceSync == true ? (
          <View style={{ paddingBottom: 10 }} />
        ) : (
          renderTabBar()
        )} */}

        {renderTabBar()}
      </ScrollView>
      <CustomConfirmationDialog
        visible={showConfirmationDialog}
        title="Confirmation"
        description="Are you sure you want to overwrite the existing Case number?"
        confirmLabel="OK"
        onCancel={() => setShowConfirmationDialog(false)}
        onConfirm={() => {
          setShowConfirmationDialog(false);
          getCaseNumberAPI();
        }}
      />

      <AddressDialog
        visible={showMailingEditDialog}
        setVisible={setShowMailingEditDialog}
        title="Edit Mailing Address"
        type="MailingAddress"
        fields={{
          street: caseData?.mailingAddressStreetRouteField ?? '',
          city: caseData?.mailingAddressCityField ?? '',
          state: caseData?.mailingAddressStateField ?? '',
          zip: caseData?.mailingAddressPostalCodeField ?? '',
          country: caseData?.mailingAddressCountryField ?? '',
        }}
        setFields={(values) => {
          setCaseData({
            ...caseData,
            mailingAddressStreetRouteField: values.street,
            mailingAddressCityField: values.city,
            mailingAddressStateField: values.state,
            mailingAddressPostalCodeField: values.zip,
            mailingAddressCountryField: values.country,
          });
        }}
        onUpdate={updateMailingAddressApi}
        showCoordinates={false}
        onCancel={() => {
          const caseData = existingData?.data;
          setCaseData({
            ...caseData,
            mailingAddressStreetRouteField: caseData?.mailingAddressStreetRouteField,
            mailingAddressCityField: caseData?.mailingAddressCityField,
            mailingAddressStateField: caseData?.mailingAddressStateField,
            mailingAddressPostalCodeField: caseData?.mailingAddressPostalCodeField,
            mailingAddressCountryField: caseData?.mailingAddressCountryField,
          });
          if (isNetworkAvailable) {
            resetMailingAddress();
            setShowMailingEditDialog(false);
          } else {
            setShowMailingEditDialog(false);
          }
        }}
      />
      <AddressDialog
        visible={showLocationEditDialog}
        setVisible={setShowLocationEditDialog}
        title="Edit Address"
        type="Location"
        fields={{
          street: caseData?.streetRouteField ?? '',
          city: caseData?.cityField ?? '',
          state: caseData?.stateField ?? '',
          zip: caseData?.postalCodeField ?? '',
          country: caseData?.countryField ?? '',
          latitude: caseData?.latitudeField ?? '',
          longitude: caseData?.longitudeField ?? '',
        }}
        setFields={(values) => {
          setCaseData({
            ...caseData,
            streetRouteField: values.street,
            cityField: values.city,
            stateField: values.state,
            postalCodeField: values.zip,
            countryField: values.country,
            latitudeField: values.latitude,
            longitudeField: values.longitude,
          });
        }}
        onUpdate={updateLocationApi}
        onCancel={() => {
          const license = existingData?.data;
          setCaseData({
            ...caseData,
            streetRouteField: license.streetRouteField,
            cityField: license.cityField,
            stateField: license.stateField,
            postalCodeField: license.postalCodeField,
            countryField: license.countryField,
            latitudeField: license.latitudeField,
            longitudeField: license.longitudeField,
          });

          if (isNetworkAvailable) {
            resetLocation();
            setShowLocationEditDialog(false);
          } else {
            setShowLocationEditDialog(false);
          }
        }}
        showCoordinates={true}
        isManualLocation={caseData?.isManualAddress}
        setManualLocation={(value) => setCaseData({ ...caseData, isManualAddress: value })}
      />
    </ScreenWrapper>
  );
};

export default EditCaseScreen;
