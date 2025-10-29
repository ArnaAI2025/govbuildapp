import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { RootStackParamList } from '../../../navigation/Types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchLicenseByID,
  fetchLicenseDropdown,
  fetchLicenseNumber,
  fetchLicenseSubtype,
  fetchTeamMember,
  postLicenseDetails,
} from '../LicenseService';
import { TEXTS } from '../../../constants/strings';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import { LICENSE_OFFLINE_TITLES, LICENSE_TABS, PAYMENT_ITEMS } from '../../../constants/data';
import { styles } from './editLicenseStyles';
import IMAGES from '../../../theme/images';
import { convertDate, formatAllTypesDate, normalizeBool } from '../../../utils/helper/helpers';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Loader from '../../../components/common/Loader';
import RenderItemChevronStatus from '../../../components/common/ChevronStatus';
import FloatingInput from '../../../components/common/FloatingInput';
import CustomDropdown from '../../../components/common/CustomDropdown';
import CustomMultiSelectDropdown from '../../../components/common/MultiSelectDropdown';
import PublishButton from '../../../components/common/PublishButton';
import { useLicenseStore } from '../../../store/useLicenseStore';
import { LicenseData } from '../../../utils/interfaces/zustand/ILicense';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import { AlertMessageSection } from '../../../components/common/AlertMessageSection';
import { goBack } from '../../../navigation/Index';
import { LicenseSubScreensItemView } from '../../sub-screens/LicenseSubScreensItemView';
import { CustomConfirmationDialog } from '../../../components/dialogs/CustomConfirmationDialog';
import Checkbox from 'expo-checkbox';
import { TeamMember } from '../../../utils/interfaces/ICase';
import useAuthStore from '../../../store/useAuthStore';
import CustomGooglePlacesInput from '../../../components/common/CustomGooglePlacesInput';
import { emailRegex } from '../../../utils/validations';
import { saveNavigationState } from '../../../session/SessionManager';
type EditLicenseScreenProps = NativeStackScreenProps<RootStackParamList, 'EditLicenseScreen'>;
const EditLicenseScreen: FunctionComponent<EditLicenseScreenProps> = ({ route, navigation }) => {
  const { authData } = useAuthStore.getState();
  const userId = authData?.adminRole?.teamMember?.userId || '';
  const contentItemId = route?.params?.contentItemId;
  const licenseDataProps: LicenseData = route?.params?.licenseData;
  const isForceSync: boolean = route?.params?.isForceSync;
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const googlePlacePickerRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const lastNavigatedScreen = useRef<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inputHeight, setInputHeight] = useState(80);
  const [subTypeFromTypeId, setSubTypeFromTypeId] = useState([]);
  const [requireEmailAddress, setRequireEmailAddress] = useState('');
  const [address, setAddress] = useState<string>('');
  const [, setUnlockExpirationDate] = useState(true);
  const refreshAttechedItems = route?.params?.refreshAttechedItems;

  const {
    licenseEditData,
    permissions,
    isLoading,
    dropdownsList,
    chevronStatusList,
    alertPopupData,
    isAllowViewInspection,
    isSchedule,
    setLicenseEditData,
    setPermisssions,
    setLoading,
    setDropdownsList,
    setChevronStatusList,
    setAlertPopup,
    setIsAllowViewInspection,
    setIsSchedule,
  } = useLicenseStore();
  const [fieldErrors, setFieldErrors] = useState({
    applicantFirstName: false,
    applicantLastName: false,
    email: false,
    statusId: false,
    licenseTypeId: false,
    location: false,
    phoneNumber: false,
    cellNumber: false,
    assigneeTeamMember: false,
  });

  useEffect(() => {
    googlePlacePickerRef.current?.setAddressText(licenseEditData?.location ?? '');
  }, [googlePlacePickerRef, licenseEditData?.location]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          await setChevronStatusList([]);
          await setDropdownsList([]);
          await fetchLicenseDetails().then(() => {
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
          console.error('Error fetching data:', error);
          setAlertPopup({
            title: 'Error',
            message: 'Failed to load data. Please try again.',
            type: 'error',
          });
          // setDataLoaded(true); // Allow scroll restoration even on error
        }
      };

      fetchData();
    }, [contentItemId, licenseDataProps, isNetworkAvailable]),
  );

  useFocusEffect(
    useCallback(() => {
      const fetchDropdowns = async () => {
        try {
          await fetchDropdownDetails();
        } catch (error) {
          console.error('Error fetching dropdown data:', error);
          setAlertPopup({
            title: 'Error',
            message: 'Failed to load dropdown data. Please try again.',
            type: 'error',
          });
        }
      };
      fetchDropdowns();
    }, [licenseEditData?.licenseTypeId, isNetworkAvailable]),
  );

  const fetchLicenseDetails = async () => {
    try {
      setLoading(true);
      const { licenseDetail, chevronList } = await fetchLicenseByID(
        contentItemId,
        licenseDataProps,
        isNetworkAvailable,
      );
      const license = licenseDetail?.data;
      setLicenseEditData({
        ...license,
        licenseUniqNumber: license?.licenseNumber ?? '',
        applicantFirstName: license?.applicantFirstName ?? '',
        applicantLastName: license?.applicantLastName ?? '',
        licenseDescriptor: license?.licenseDescriptor ?? '',
        businessName: license?.businessName ?? '',
        phoneNumber: license?.phoneNumber ?? '',
        cellNumber: license?.cellNumber ?? '',
        email: license?.email ?? '',
        additionalInfo: license?.additionalInfo ?? '',
        parcelNumber: license?.parcelNumber ?? '',
        quickRefNumber: license?.quickRefNumber ?? '',
        expirationDate: license?.expirationDate ?? '',
        isLicenseTypeStatusesOrderedList: license?.isLicenseTypeStatusesOrderedList ?? '',
        setLicenseLocation: license?.licenseLocation ?? '',
        setAdditionalInfo: license?.additionalInfo ?? '',
        setParcelNumber: license?.parcelNumber ?? '',
        setQuickRefNumber: license?.quickRefNumber ?? '',
        paymentReceived: license?.isPaymentReceived ?? '',
        isAllowAssigned: Boolean(license?.viewOnlyAssignUsers) ?? false,
        renewalStatusId: license?.renewalStatus ?? '',
        licenseStatusDisplayText: isNetworkAvailable
          ? license?.selectedStatus?.[0]?.displayText
          : license?.licenseStatus,
        licenseStatusId: license?.statusId ?? '',
        licenseTypeId: license?.licenseTypeId ?? '',
        licenseTypeDisplayText: isNetworkAvailable
          ? license?.licenseTypeName
          : (license?.licenseType ?? ''),
        licenseSubTypeIds: license?.licenseSubType ?? '',
        streetRouteField: license?.data?.streetRouteField ?? '',
        cityField: license?.cityField ?? '',
        stateField: license?.stateField ?? '',
        countryField: license?.countryField ?? '',
        postalCodeField: license?.postalCodeField ?? '',
        latitudeField: license?.latitudeField ?? '',
        longitudeField: license?.longitudeField ?? '',
        location: license?.location ?? '',
        isHideParcelNumber: license?.isHideParcelNumber ?? false,
        isHideQuickRefNumber: license?.isHideQuickRefNumber ?? false,
        licenseTag: license?.licenseTag ?? '',
        displayText: license?.displayText ?? '',
        isBlockApprovedUntilPaymentReceived: license?.isBlockApprovedUntilPaymentReceived ?? false,
        unlockExpirationDate: isNetworkAvailable
          ? license?.selectedType?.[0]?.unlockExpirationDate
          : true,
      });
      const isAllowViewInspection = normalizeBool(
        licenseDetail?.permissions?.isAllowViewInspection,
      );
      const assignedMember =
        typeof license?.assignedUsers === 'string'
          ? license.assignedUsers
              .split(',')
              .map((user) => user.trim())
              .filter((user) => user !== '')
          : []; //For sequre handle code
      setSelectedTeamMembers(assignedMember);
      setPermisssions(licenseDetail?.permissions);
      setAddress(license?.location ?? '');
      setIsAllowViewInspection(isAllowViewInspection);
      setRequireEmailAddress(license?.selectedType?.[0]?.requireEmailAddress ?? false); //Only this state change is required so i used this new state
      setChevronStatusList(chevronList?.data ?? []);
      setAlertPopup(license?.lstComments || licenseDetail?.lstComments);
      checkInspectionSchedule(license?.statusId, license?.selectedInspectionLicenseStatus);
    } catch (error) {
      console.error('Error fetching license details:', error);
      setAlertPopup({
        title: 'Error',
        message: 'Failed to load license details. Please try again.',
        type: 'error',
      });
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  };

  // Check inspection schedule
  const checkInspectionSchedule = (
    licenseStatusId: string,
    scheduleStatusList?: { id: string }[],
  ) => {
    const isValid = Array.isArray(scheduleStatusList) && scheduleStatusList.length > 0;
    setIsSchedule(isValid ? scheduleStatusList.some((item) => item.id === licenseStatusId) : true);
  };

  const fetchDropdownDetails = async () => {
    try {
      const [licenseDropdownData, fetchedTeamMembers, subTypeList] = await Promise.all([
        fetchLicenseDropdown(isNetworkAvailable),
        fetchTeamMember(isNetworkAvailable),
        fetchLicenseSubtype(isNetworkAvailable, licenseEditData?.licenseTypeId),
      ]);
      // Destructure dropdownsList safely
      const { dropdownsList } = licenseDropdownData;

      const licenseType = dropdownsList?.licenseTypes;
      const matchedLicenseType = licenseType.find(
        (type) => type.id === licenseEditData?.licenseTypeId,
      );

      setUnlockExpirationDate(matchedLicenseType?.unlockExpirationDate);

      // Set dropdownss
      setDropdownsList(Array.isArray(dropdownsList) ? dropdownsList : [dropdownsList]);
      // Set sub type list
      setSubTypeFromTypeId(subTypeList);
      // Set team members
      setTeamMembers(fetchedTeamMembers);
    } catch (error) {
      console.log('Dropdown Error---->', error);
    }
  };

  const handleEditChange =
    <K extends keyof LicenseData>(key: K) =>
    (value: LicenseData[K]) => {
      setLicenseEditData({ ...licenseEditData, [key]: value });
    };

  const inputFields = [
    {
      label: TEXTS.license.licenseDescripter,
      value: licenseEditData?.licenseDescriptor ?? '',
      onChangeText: handleEditChange('licenseDescriptor'),
      placeholder: TEXTS.license.enterLicenseDescripter,
      hintText: 'The License Detail.',
      error: false,
      required: false,
    },
    {
      label: TEXTS.license.businessName,
      value: licenseEditData?.businessName ?? '',
      onChangeText: handleEditChange('businessName'),
      placeholder: TEXTS.license.businessNamePlaceholder,
      hintText: 'The Business Name for the license.',
      error: false,
      required: false,
    },
    {
      label: TEXTS.license.firstName,
      value: licenseEditData?.applicantFirstName ?? '',
      onChangeText: (text) => {
        handleEditChange('applicantFirstName')(text);
        if (text?.trim() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            applicantFirstName: false,
          }));
        }
      },
      placeholder: TEXTS.license.firstNamePlaceholder,
      hintText: 'The First Name of the license.',
      error: !!fieldErrors?.applicantFirstName,
      required: true,
    },
    {
      label: TEXTS.license.applicantLastName,
      value: licenseEditData?.applicantLastName ?? '',
      onChangeText: (text) => {
        handleEditChange('applicantLastName')(text);
        if (text?.trim() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            applicantLastName: false,
          }));
        }
      },
      placeholder: TEXTS.license.applicantLastNamePlaceholder,
      hintText: 'The Last Name of the license.',
      error: !!fieldErrors?.applicantLastName,
      required: true,
    },
    {
      label: TEXTS.license.email,
      value: licenseEditData?.email ?? '',
      onChangeText: (text) => {
        handleEditChange('email')(text);
        if (requireEmailAddress) {
          // Only validate when it's required
          if (text?.trim() !== '') {
            setFieldErrors((prev) => ({
              ...prev,
              email: false,
            }));
          }
        } else {
          // Not required → always clear error
          setFieldErrors((prev) => ({
            ...prev,
            email: false,
          }));
        }
      },
      placeholder: TEXTS.license.emailPlaceholder,
      keyboardType: 'email-address',
      hintText: 'The Email Address of the license.',
      error: !!fieldErrors?.email,
      required: requireEmailAddress ? true : false,
    },
    {
      label: TEXTS.license.phoneNumber,
      value: licenseEditData?.phoneNumber ?? '',
      onChangeText: (text) => {
        handleEditChange('phoneNumber')(text);
        if (text?.trim() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            phoneNumber: false,
          }));
        }
      },
      placeholder: TEXTS.license.phoneNumberPlaceholder,
      keyboardType: 'phone-pad',
      hintText: 'The Phone Number for the license.',
      isPhoneNumber: true,
      error: !!fieldErrors?.phoneNumber,
      required: false,
    },
    {
      label: TEXTS.license.cellNumber,
      value: licenseEditData?.cellNumber ?? '',
      onChangeText: (text) => {
        handleEditChange('cellNumber')(text);
        if (text?.trim() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            cellNumber: false,
          }));
        }
      },
      placeholder: TEXTS.license.cellNumberPlaceholder,
      keyboardType: 'phone-pad',
      hintText: 'The Cell Number for the license.',
      isPhoneNumber: true,
      error: !!fieldErrors?.cellNumber,
      required: false,
    },
  ];

  const DROPDOWN_CONFIG = [
    {
      data: dropdownsList[0]?.licenseStatus ?? [],
      value: licenseEditData?.statusId,
      onChange: (item: any) => {
        setLicenseEditData({
          ...licenseEditData,
          statusId: item?.value?.id,
          licenseStatusDisplayText: item?.value?.displayText,
        });
        // Clear the error if status is selected
        if (item?.value?.id?.trim?.() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            statusId: false,
          }));
        }
      },
      label: TEXTS.license.status,
      placeholder: TEXTS.license.statusPlaceholder,
      zIndexPriority: 6,
      hintText: 'The status of the license.',
      error: fieldErrors?.statusId,
      required: true,
    },
    {
      data: dropdownsList[0]?.licenseRenewalStatus ?? [],
      value: licenseEditData?.renewalStatusId,
      onChange: (item: any) =>
        setLicenseEditData({
          ...licenseEditData,
          renewalStatusId: item?.value?.id,
        }),
      label: TEXTS.license.renewalStatus,
      placeholder: TEXTS.license.renewalStatusPlaceholder,
      zIndexPriority: 5,
      hintText: 'The Renewal Status of the license.',
      required: false,
    },
  ];

  const LICENSE_TYPE = [
    {
      data: dropdownsList[0]?.licenseTypes ?? [],
      value: licenseEditData?.licenseTypeId,
      onChange: async (item: any) => {
        setLicenseEditData({
          ...licenseEditData,
          licenseTypeId: item?.value?.id,
          licenseTypeDisplayText: item?.value?.displayText,
        });

        // Clear the error if status is selected
        if (item?.value?.id?.trim?.() !== '') {
          setFieldErrors((prev) => ({
            ...prev,
            licenseTypeId: false,
          }));
        }
      },
      label: TEXTS.license.licenseType,
      placeholder: TEXTS.license.licenseTypePlaceholder,
      zIndexPriority: 4,
      hintText: 'The type of the license.',
      error: fieldErrors?.licenseTypeId,
    },
  ];

  const FLOATING_INPUTS = [
    {
      label: TEXTS.license.parcelNumber,
      value: licenseEditData?.parcelNumber ?? '',
      onChangeText: handleEditChange('parcelNumber'),
      placeholder: TEXTS.license.parcelNumberPlaceholder,
      hintText: 'The Parcel Number for the license.',
      isHidden: licenseEditData?.isHideParcelNumber,
    },
    {
      label: licenseEditData?.quickRefNumberName || TEXTS.license.quickReference,
      value: licenseEditData?.quickRefNumber ?? '',
      onChangeText: handleEditChange('quickRefNumber'),
      placeholder: TEXTS.license.quickReferencePlaceholder,
      hintText: 'The Quick Ref Number for the license.',
      isHidden: licenseEditData?.isHideQuickRefNumber,
    },
  ];
  const validations = [
    {
      key: 'applicantFirstName',
      condition: !licenseEditData?.applicantFirstName?.trim(),
      message: TEXTS.license.applicantFirstNameValidation,
    },
    {
      key: 'applicantLastName',
      condition: !licenseEditData?.applicantLastName?.trim(),
      message: TEXTS.license.applicantLastNameValidation,
    },
    {
      key: 'email',
      condition: requireEmailAddress
        ? !licenseEditData?.email?.trim() || !emailRegex.test(licenseEditData.email.trim())
        : !!licenseEditData?.email?.trim() && !emailRegex.test(licenseEditData.email.trim()),
      message:
        licenseEditData?.email != ''
          ? TEXTS.validationMsg.emailIsInvalid
          : TEXTS.validationMsg.emailIsRequired,
    },
    {
      key: 'statusId',
      condition: !licenseEditData?.statusId,
      message: TEXTS.license.licenseStatusValidation,
    },
    {
      key: 'licenseTypeId',
      condition: !licenseEditData?.licenseTypeId,
      message: TEXTS.license.licenseTypeValidation,
    },
    {
      key: 'location',
      // condition: !licenseEditData?.location?.trim(),
      condition: !address?.trim(),
      message: TEXTS.license.licenseLocationValidation,
    },
    {
      key: 'phoneNumber',
      condition:
        !!licenseEditData?.phoneNumber?.trim() && licenseEditData.phoneNumber.trim().length !== 14, //added 14 length because the number is comming in the formate
      message: 'The Phone Number is not valid.',
    },
    {
      key: 'cellNumber',
      condition:
        !!licenseEditData?.cellNumber?.trim() && licenseEditData?.cellNumber?.trim()?.length !== 14, //added 14 lenngth because the number is comming in the formate
      message: 'The Cell Number is not valid.',
    },
    {
      condition:
        licenseEditData?.isBlockApprovedUntilPaymentReceived &&
        licenseEditData?.licenseStatusDisplayText === 'Approved' &&
        licenseEditData?.paymentReceived === 'no',
      message: TEXTS.license.licenseApprovedUntilPaymentReceived,
    },
    // {
    //   condition: licenseEditData?.isAllowAssigned && teamMembers.length === 0,
    //   message: TEXTS.license.licenseTeamMemberValidation,
    // },
    // {
    //condition: condition for if all inspection is not completed then the license status should not be approved
    //    message:"All inspections are required to be resolved before license is approve."
    // }
  ];
  const checkValidation = () => {
    const errors: { [key: string]: boolean } = {};
    let hasError = false;
    for (const item of validations) {
      if (item.condition) {
        if (!hasError) {
          ToastService.show(item.message, COLORS.ERROR);
          hasError = true;
        }
        if (item.key) {
          errors[item.key] = true;
        }
      } else {
        if (item.key) {
          errors[item.key] = false;
        }
      }
    }
    // Ensure all expected keys are initialized
    setFieldErrors((prev) => ({
      ...prev,
      applicantFirstName: errors.applicantFirstName || false,
      applicantLastName: errors.applicantLastName || false,
      email: errors.email || false,
      statusId: errors.statusId || false,
      licenseTypeId: errors.licenseTypeId || false,
      location: errors.location || false,
      phoneNumber: errors.phoneNumber || false,
      cellNumber: errors.cellNumber || false,
    }));

    if (hasError) return;
    if (!!licenseEditData?.isAllowAssigned && selectedTeamMembers?.length === 0) {
      ToastService.show('The License Assign Team Members field is required.', COLORS.ERROR);
      setFieldErrors({
        ...fieldErrors,
        assigneeTeamMember: true,
      });
      return;
    }

    if (
      !!licenseEditData?.isAllowAssigned &&
      !selectedTeamMembers?.some((member: any) =>
        typeof member === 'string' ? member === userId : member.id === userId,
      )
    ) {
      Alert.alert(
        'Confirmation',
        TEXTS.alertMessages.licenseAssignTeamMember,
        [
          { text: 'OK', onPress: UpdateLicenseApi },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else {
      UpdateLicenseApi();
    }
  };

  const UpdateLicenseApi = async () => {
    try {
      setLoading(true);
      const response = await postLicenseDetails(
        licenseEditData,
        isNetworkAvailable,
        selectedTeamMembers.join(','),
        contentItemId,
        address,
      );
      if (response?.statusCode === 200) {
        ToastService.show(TEXTS.license.updateLicenseSuccessMsg, COLORS.SUCCESS_GREEN);
        saveNavigationState(false);
        goBack();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('ERROR POST LICENSE RESPONSE --->', error);
    }
  };

  const tabsWithDynamicTitles = useMemo(() => {
    return LICENSE_TABS.map((tab) => {
      const newTab = { ...tab };
      return newTab;
    });
  }, [isNetworkAvailable]);

  // Render tabs
  const visibleTabs = useMemo(() => {
    return isNetworkAvailable
      ? tabsWithDynamicTitles
      : tabsWithDynamicTitles.filter((tab) => LICENSE_OFFLINE_TITLES.has(tab.title));
  }, [tabsWithDynamicTitles, isNetworkAvailable, permissions]);

  // Handle tab navigation
  const handleTabPress = (screenName: keyof RootStackParamList, tabData: any) => {
    lastNavigatedScreen.current = screenName; // Store the screen being navigated to
    const params = {
      type: tabData.type,
      param: licenseEditData,
      isShowSchedule: isSchedule,
      caseDataById: licenseEditData,
      isAllowViewInspection,
      assignTeamMemberDisable: false,
      permissions: permissions,
      isOnline: isNetworkAvailable,
      isForceSync: isForceSync,
    };
    navigation.navigate(screenName, params);
  };
  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {visibleTabs.map((tab) => {
        const tabContent = LicenseSubScreensItemView(tab, licenseEditData, isAllowViewInspection);
        // Skip if not visible
        if (!tabContent) return null;
        return (
          <TouchableOpacity
            // key={index}
            style={styles.tabItem}
            onPress={() =>
              handleTabPress(
                tab.screenName as keyof RootStackParamList,
                tabContent, //use tabContent, not raw tab
              )
            }
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabText}>{tabContent.title}</Text>
              <Image source={IMAGES.RIGHT_ARROW} style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const getLicenseNumberAPI = async () => {
    try {
      setLoading(true);
      const generateUniqueNumber = await fetchLicenseNumber(
        licenseEditData?.licenseTypeId ?? '',
        licenseEditData?.licenseDescriptor ?? '',
        isNetworkAvailable,
      );
      setLoading(false);
      if (generateUniqueNumber?.status) {
        setLicenseEditData({
          ...licenseEditData,
          licenseUniqNumber: generateUniqueNumber?.data?.number,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching license number:', error);
    }
  };

  return (
    <ScreenWrapper
      title={TEXTS.license?.licenseEdit}
      dateTimeObj={[
        licenseEditData?.ownerName ?? licenseEditData?.licenseOwner ?? '',
        licenseEditData?.createdUtc ?? '',
        licenseEditData?.authorName ?? licenseEditData?.author ?? '',
        licenseEditData?.modifiedUtc ?? '',
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
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View pointerEvents={isForceSync ? 'none' : 'auto'}>
            <View style={styles.infoContainer}>
              {isNetworkAvailable &&
                !isLoading &&
                licenseEditData?.isLicenseTypeStatusesOrderedList && (
                  <View style={styles.chevronContainer}>
                    {chevronStatusList?.map((item) => (
                      <View style={styles.chevronItem}>
                        <RenderItemChevronStatus item={item} />
                      </View>
                    ))}
                  </View>
                )}
            </View>

            <AlertMessageSection alertData={alertPopupData} isOnline={isNetworkAvailable} />
            <View style={styles.inputViewStyle}>
              {LICENSE_TYPE.map((dropdown) => (
                <View style={{ zIndex: dropdown.zIndexPriority }}>
                  <CustomDropdown
                    // key={index}
                    data={dropdown.data}
                    labelField="displayText"
                    valueField="id"
                    containerStyle={styles.inputFieldStyle}
                    value={dropdown.value}
                    onChange={dropdown.onChange}
                    label={dropdown.label}
                    placeholder={dropdown.placeholder}
                    zIndexPriority={dropdown.zIndexPriority}
                    hintText={dropdown.hintText}
                    error={dropdown?.error}
                    required={true}
                  />
                </View>
              ))}
              <FloatingInput
                label={TEXTS.license.licenseUniqueNumber}
                value={licenseEditData?.licenseUniqNumber ?? ''}
                numberOfLines={1}
                style={{ marginTop: 15 }}
                onChangeText={(value) =>
                  setLicenseEditData({
                    ...licenseEditData,
                    licenseUniqNumber: value,
                  })
                }
                required
                placeholder={TEXTS.license.licenseUniqueNumber}
                rightIcon="sync"
                keyboardType="default"
                // editable={licenseEditData?.isLockLicenseNumber}
                customRightIcon={
                  isNetworkAvailable &&
                  // licenseEditData?.autoNumber &&
                  IMAGES.REFRESH_ICON
                }
                onIconPress={() => {
                  Keyboard.dismiss();
                  setShowConfirmationDialog(true);
                }}
                hintText={'The Number of the license.'}
                disabled={isNetworkAvailable ? false : true}
                // error={!licenseEditData?.licenseUniqNumber?.trim()}
              />

              <View style={{ zIndex: 3 }}>
                <CustomMultiSelectDropdown
                  data={
                    isNetworkAvailable
                      ? (subTypeFromTypeId ?? [])
                      : (dropdownsList[0]?.licenseSubTypes ?? [])
                  }
                  alldata={dropdownsList[0]?.licenseSubTypes}
                  labelField="displayText"
                  valueField="id"
                  value={
                    licenseEditData?.licenseSubType
                      ? licenseEditData?.licenseSubType
                          ?.split(',')
                          ?.filter((tag) => tag?.trim() !== '')
                      : []
                  }
                  onChange={(item: string[]) => {
                    setLicenseEditData({
                      ...licenseEditData,
                      licenseSubType: item.join(','),
                    });
                  }}
                  label={TEXTS.license.licenseSubType}
                  placeholder={TEXTS.license.licenseSubTypePlaceholder}
                  zIndexPriority={1}
                  hintText={'The Sub Types of the license.'}
                  containerStyle={styles.inputFieldStyle}
                />
              </View>

              <View style={{ zIndex: 2 }}>
                <CustomMultiSelectDropdown
                  data={dropdownsList[0]?.licenseTags ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={
                    licenseEditData?.licenseTag
                      ? licenseEditData.licenseTag.split(',').filter((tag) => tag?.trim() !== '')
                      : []
                  }
                  onChange={(item) => {
                    setLicenseEditData({
                      ...licenseEditData,
                      licenseTag: item.join(','),
                    });
                  }}
                  label={TEXTS.license.licenseTag}
                  placeholder={TEXTS.license.licenseTagPlaceholder}
                  zIndexPriority={1}
                  hintText={'The tags of the license.'}
                  containerStyle={styles.inputFieldStyle}
                />
              </View>

              {inputFields?.map((field, index) => (
                <FloatingInput
                  key={index}
                  label={field?.label}
                  value={field?.value}
                  numberOfLines={1}
                  style={styles.inputFieldStyle}
                  onChangeText={field.onChangeText}
                  placeholder={field.placeholder}
                  keyboardType={
                    (field?.keyboardType as
                      | 'default'
                      | 'email-address'
                      | 'numeric'
                      | 'phone-pad') || 'default'
                  }
                  hintText={field.hintText}
                  error={field?.error}
                  isPhoneNumber={field.isPhoneNumber}
                  required={field?.required}
                  customRightIcon={
                    isNetworkAvailable && licenseEditData?.autoNumber && IMAGES.REFRESH_ICON
                  }
                />
              ))}

              {isNetworkAvailable ? (
                <CustomGooglePlacesInput
                  ref={googlePlacePickerRef}
                  value={address}
                  headerText={'License Location'}
                  placeholder={'Enter location'}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (text?.trim() !== '' && fieldErrors.location) {
                      setFieldErrors((prev) => {
                        if (!prev.location) return prev;
                        return { ...prev, location: false };
                      });
                    }
                  }}
                  onPlaceSelect={(selectedAddress) => {
                    setAddress(selectedAddress);
                  }}
                  error={fieldErrors?.location}
                  required={true}
                  hintText={'The Business Address for License is Required.'}
                  containerStyle={styles.inputFieldStyle}
                />
              ) : (
                <FloatingInput
                  label="License Location"
                  value={address ?? ''}
                  numberOfLines={1}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (text?.trim() !== '' && fieldErrors.location) {
                      setFieldErrors((prev) => {
                        if (!prev.location) return prev;
                        return { ...prev, location: false };
                      });
                    }
                  }}
                  placeholder="Please enter location"
                  keyboardType="default"
                  hintText="The Location field is Required."
                  error={fieldErrors?.location}
                  style={styles.inputFieldStyle}
                />
              )}

              {/* <View style={styles.marginTopStyle} /> */}
              {FLOATING_INPUTS.filter((input) => !input.isHidden).map((input, index) => (
                <FloatingInput
                  key={index}
                  label={input.label}
                  value={input.value}
                  style={styles.inputFieldStyle}
                  numberOfLines={1}
                  onChangeText={input.onChangeText}
                  placeholder={input.placeholder}
                  keyboardType={'default'}
                  hintText={input.hintText}
                />
              ))}

              {DROPDOWN_CONFIG.map((dropdown) => (
                <View style={{ zIndex: dropdown.zIndexPriority }}>
                  <CustomDropdown
                    // key={index}
                    data={dropdown.data}
                    labelField="displayText"
                    valueField="id"
                    containerStyle={styles.inputFieldStyle}
                    value={dropdown.value}
                    onChange={dropdown.onChange}
                    label={dropdown.label}
                    placeholder={dropdown.placeholder}
                    zIndexPriority={dropdown.zIndexPriority}
                    hintText={dropdown.hintText}
                    error={dropdown?.error}
                    required={dropdown?.required}
                  />
                </View>
              ))}

              <View style={{ zIndex: 999 }}>
                <CustomDropdown
                  data={PAYMENT_ITEMS}
                  labelField="displayText"
                  valueField="id"
                  showClearIcon={false}
                  zIndexPriority={3}
                  label={TEXTS.license.paymentReceived}
                  value={licenseEditData?.paymentReceived}
                  containerStyle={styles.inputFieldStyle}
                  onChange={(item) => {
                    setLicenseEditData({
                      ...licenseEditData,
                      paymentReceived: item?.value?.id ?? '',
                    });
                  }}
                  placeholder={TEXTS.license.paymentReceivedPlaceholder}
                  hintText="Is Payment Received for the license."
                />
              </View>

              <DatePickerInput
                label={TEXTS.license.expirationDate}
                value={formatAllTypesDate(licenseEditData?.expirationDate)}
                onChange={(pickDate) => {
                  setLicenseEditData({
                    ...licenseEditData,
                    expirationDate: convertDate(pickDate),
                  });
                }}
                editable={licenseEditData?.unlockExpirationDate}
                // editable={unlockExpirationDate}
                hintText="The expiration date of the license."
                containerStyle={{ marginTop: 5 }}
              />

              {!isNetworkAvailable && (
                <>
                  <CustomMultiSelectDropdown
                    data={teamMembers?.map((item) => ({
                      item: `${item?.firstName} ${item?.lastName}`,
                      id: item?.userId,
                    }))}
                    labelField="item"
                    valueField="id"
                    value={selectedTeamMembers}
                    // onChange={setSelectedTeamMembers}
                    onChange={(item) => {
                      setSelectedTeamMembers(item);
                      console.log('item?.length < 0----->>>>', item?.length, item?.length < 0);
                      setFieldErrors((prev) => ({
                        ...prev,
                        assigneeTeamMember: item?.length < 0,
                      }));
                    }}
                    label={TEXTS.license.teamMember}
                    placeholder={TEXTS.license.teamMemberPlaceholder}
                    zIndexPriority={1}
                    hintText="The Assigned Users of the form."
                    containerStyle={styles.inputFieldStyle}
                    error={fieldErrors.assigneeTeamMember}
                  />
                  <View style={styles.assignedView}>
                    <Checkbox
                      value={licenseEditData?.isAllowAssigned}
                      onValueChange={(newValue) => {
                        setLicenseEditData({
                          ...licenseEditData,
                          isAllowAssigned: newValue,
                        });
                      }}
                      style={styles.checkBox}
                      color={licenseEditData?.isAllowAssigned ? COLORS.APP_COLOR : undefined}
                    />
                    <View style={styles.flexStyle}>
                      <Text style={[styles.titleStyle, { marginLeft: 5 }]}>
                        {TEXTS.license.allowAssigned}{' '}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              <View style={[{ marginTop: 15 }]}>
                <Text style={[styles.floatingLabel]}>{'Additional Info'}</Text>
                <TextInput
                  mode="outlined"
                  placeholder={TEXTS.license.descriptionPlaceholder}
                  value={licenseEditData?.additionalInfo ?? ''}
                  onChangeText={(value) => {
                    setLicenseEditData({
                      ...licenseEditData,
                      additionalInfo: value,
                    });
                  }}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { height: inputHeight }]}
                  autoCorrect={true}
                  activeOutlineColor={COLORS.APP_COLOR}
                  textAlignVertical="top"
                  keyboardType="default"
                  onContentSizeChange={(event) => {
                    const contentHeight = event.nativeEvent.contentSize.height;
                    setInputHeight(Math.max(80, contentHeight));
                  }}
                  theme={{
                    roundness: 12,
                  }}
                />
                <Text style={styles.additionalInfo}>The Additional Info of the license.</Text>
              </View>
            </View>
            {/* {isForceSync == true ? null : (
              <View style={{ zIndex: -1 }}>
                <PublishButton onPress={checkValidation} disabled={isLoading} />
              </View>
            )}
            {isForceSync == true ? (
              <View style={{ paddingBottom: 10 }} />
            ) : (
              renderTabBar()
            )} */}
            <PublishButton disabled={isForceSync} onPress={checkValidation} />
          </View>
          {renderTabBar()}
        </ScrollView>
      </View>
      <CustomConfirmationDialog
        visible={showConfirmationDialog}
        title="Confirm"
        description="Are you sure you want to overwrite the existing License number?"
        confirmLabel="OK"
        onCancel={() => setShowConfirmationDialog(false)}
        onConfirm={() => {
          setShowConfirmationDialog(false);
          getLicenseNumberAPI();
        }}
      />
    </ScreenWrapper>
  );
};

export default EditLicenseScreen;
