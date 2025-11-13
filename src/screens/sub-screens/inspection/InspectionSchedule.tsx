import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RadioGroup from 'react-native-radio-buttons-group';
import Checkbox from 'expo-checkbox';
import { RichEditor } from 'react-native-pell-rich-editor';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { RootStackParamList } from '../../../navigation/Types';
import { COLORS } from '../../../theme/colors';
import { InspectionService } from './InspectionService';
import {
  convertTime,
  convertTime24Hours,
  formatDate,
  generateUniqueID,
  getTimeDifference,
  getTimeDuration,
  logRed,
  normalizeBool,
} from '../../../utils/helper/helpers';
import {
  InspectionScheduleFailAlert,
  verifyTeamMemberDialog,
} from '../../../components/dialogs/VerifyTeamMemberDialog';
import Loader from '../../../components/common/Loader';
import StandardCommentDialog from '../../../components/comments-list/CommentListDialog';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { SelectedImageItem } from './SelectedImageItem';
import FloatingInput from '../../../components/common/FloatingInput';
import { InspectionScheduleDropDown } from '../../../components/inspection/InspectionSchaduleDropdown';
import { DatePickerInput } from '../../../components/common/DatePickerInput';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import {
  getInspectionTypeIds,
  getInspectionByIds,
  getInspectionByName,
  processTime,
  mapPreferredTime,
  formatTimeForDisplay,
  combineDateTime,
} from '../../../utils/helper/inspectionUtils';
import { useInspectionStore } from '../../../store/useInspectionScheduleStore';
import { FONT_FAMILY } from '../../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { radioButtons } from '../../../constants/data';
import { goBack } from '../../../navigation/Index';
import OpenDocPickerDialog from '../../../components/common/OpenDocPickerDialog';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { IImageData } from '../../../utils/interfaces/ISubScreens';
import PublishButton from '../../../components/common/PublishButton';
import { useDailyInspectionStore } from '../../../store/useDailyInspectionStore';
import { useFocusEffect } from '@react-navigation/native';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

type InspectionScheduleProps = NativeStackScreenProps<RootStackParamList, 'InspectionSchedule'>;

const InspectionSchedule: React.FC<InspectionScheduleProps> = ({ route, navigation }) => {
  const RichText = useRef<RichEditor>(null);
  const RichTextAdmin = useRef<RichEditor>(null);
  const { isNetworkAvailable } = useNetworkStatus();
  const { setIsInspectionUpdated } = useDailyInspectionStore();
  const comeFromInspectionList = route.params?.comeFromInspectionList ?? false;
  const type = route.params.type;
  const inspectionId = route.params.inspectionId || '';
  const isNew = route.params.isNew ?? false;
  const isPreferedTime = route?.params?.caseData?.inspectionSchedulingPreferredTime;
  const enableResponsibleParty =
    route?.params?.caseData?.isDoNotAddResponsiblePartybyDefault ?? false;

  const {
    inspectionTypes,
    teamMembers,
    inspectionStatus,
    selectedTypes,
    selectedTeamMembers,
    selectedStatus,
    isLoading,
    inspectionDate,
    startTime,
    endTime,
    startDateTime,
    endDateTime,
    preferredTime,
    location,
    defaultTime,
    timeDif,
    isHideSign,
    signature,
    fullEditorBody,
    adminNotesBody,
    msCalendarId,
    lstInspectionSubmission,
    isGeneral,
    generalImageData,
    adminImageData,
    addResponsible,
    caseOrLicenseData,
    setSelectedTypes,
    setTeamMembers,
    setInspectionStatus,
    setInspectionTypes,
    setSelectedTeamMembers,
    setSelectedStatus,
    setLoading,
    setIsHideSign,
    setSignature,
    setStartTime,
    setEndTime,
    setInspectionDate,
    setStartDateTime,
    setEndDateTime,
    setPreferredTime,
    setLocation,
    setDefaultTime,
    setTimeDif,
    setFullEditorBody,
    setAdminNotesBody,
    setMsCalendarId,
    setLstInspectionSubmission,
    setIsGeneral,
    setGeneralImageData,
    setAdminImageData,
    setAddResponsible,
    resetInspectionState,
    setCaseOrLicenseData,
  } = useInspectionStore();
  const [fieldErrors, setFieldErrors] = useState({
    inpectionType: false,
    status: false,
    teamMember: false,
    date: false,
    startTime: false,
    endTime: false,
  });
  const [openComment, setOpenComment] = React.useState(false);
  const [fileUploading, setFileUploading] = React.useState(false);
  const [checked, setChecked] = React.useState<string[]>([]);
  const [isShowAllType, setShowAllType] = useState(false);
  const [state, setState] = useState<any>({
    alertVisible: false,
    eIndex: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (!isNetworkAvailable) {
        goBack();
      }
    }, [isNetworkAvailable, navigation]),
  );
  useEffect(() => {
    fetchInitialData();
  }, [inspectionId, caseOrLicenseData, route.params.param, type, isNew, navigation]);
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (isNew) {
        await handleNewInspection();
      } else {
        await handleExistingInspection();
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching initial data:', error);
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleNewInspection = async () => {
    resetInspectionState(); // Reset state for new inspections
    setLocation(route?.params?.param?.location ?? '');
    setCaseOrLicenseData(route?.params?.param);
    setPreferredTime(mapPreferredTime(isPreferedTime));
    setAddResponsible(enableResponsibleParty ?? false);
    const appointmentStatusWithLabel = route.params.param.appointmentStatusWithLabel ?? [];
    setInspectionStatus(appointmentStatusWithLabel ?? []);

    const types = await InspectionService.fetchInspectionTypeList(
      caseOrLicenseData ?? route.params.param,
      type,
      '',
      isShowAllType,
      isNetworkAvailable,
    );
    setInspectionTypes(types);
    const members = await InspectionService.fetchTeamMembers(
      caseOrLicenseData ?? route.params.param,
      '',
    );
    setTeamMembers(members);
    const sig = await InspectionService.fetchTeamMemberSignature();
    setSignature(sig ?? '');
    setIsHideSign(!sig);
  };

  const handleExistingInspection = async () => {
    resetInspectionState();
    const appointmentStatusWithLabel = route.params.param.appointmentStatusWithLabel ?? [];
    setInspectionStatus(appointmentStatusWithLabel ?? []);
    const types = await InspectionService.fetchInspectionTypeList(
      caseOrLicenseData ?? route.params.param,
      type,
      getInspectionTypeIds(selectedTypes),
      isShowAllType,
      isNetworkAvailable,
    );
    setInspectionTypes(types);
    const members = await InspectionService.fetchTeamMembers(
      caseOrLicenseData ?? route.params.param,
      getInspectionTypeIds(selectedTypes),
    );
    setTeamMembers(members);
    const signature = await InspectionService.fetchTeamMemberSignature();
    setSignature(signature ?? '');
    setIsHideSign(!signature);

    if (inspectionId) {
      const inspection = await InspectionService.fetchInspectionById(inspectionId);
      if (inspection) {
        setLocation(inspection.location ?? '');
        setMsCalendarId(inspection.msCalendarId ?? '');
        setInspectionDate(inspection.appointmentDate ?? '');
        setPreferredTime(mapPreferredTime(inspection.preferredTime));

        if (inspection.startTime) {
          setStartTime(formatTimeForDisplay(inspection.startTime));
          setStartDateTime(combineDateTime(inspection.appointmentDate, inspection.startTime));
        }
        if (inspection.endTime) {
          setEndTime(formatTimeForDisplay(inspection.endTime));
          setEndDateTime(combineDateTime(inspection.appointmentDate, inspection.endTime));
        }
        // For general document data get as image,video.
        if (inspection.applicantNotesAttachedItems) {
          setGeneralImageData(
            JSON.parse(inspection.applicantNotesAttachedItems).map((note: any) => ({
              filename: note.FileName,
              url: note.URL,
            })),
          );
        }
        // For admin notes document data get as image,video.
        if (inspection.adminNotesAttachedItems) {
          setAdminImageData(
            JSON.parse(inspection.adminNotesAttachedItems).map((note: any) => ({
              filename: note.FileName,
              url: note.URL,
            })),
          );
        }
        if (inspection.selectedInspectionType) {
          setSelectedTypes(inspection.selectedInspectionType);
        }
        if (inspection.selectedInspectionBy) {
          setSelectedTeamMembers(inspection.selectedInspectionBy);
        }

        let selectedStatus =
          appointmentStatusWithLabel.find(
            (status: any) =>
              status.id === inspection.status &&
              (inspection.statusLabel
                ? status.displayText === inspection.statusLabel
                : status.displayText === inspection.masterStatusLabel),
          ) ||
          appointmentStatusWithLabel.find(
            (status: any) =>
              status.displayText === inspection.statusLabel ||
              status.displayText === inspection.masterStatusLabel,
          );

        if (!selectedStatus) {
          selectedStatus = {
            id: inspection.status,
            displayText: inspection.statusLabel || inspection.masterStatusLabel,
          };
        }
        if (selectedStatus) {
          setSelectedStatus(selectedStatus);
        }

        // Set inspection submission
        if (inspection.lstInspectionSubmission) {
          setLstInspectionSubmission(inspection.lstInspectionSubmission);
        }
        if (inspection.body) {
          setFullEditorBody(inspection.body);
          RichText.current?.setContentHTML(inspection.body);
        }
        if (inspection.adminNotes) {
          setAdminNotesBody(inspection.adminNotes);
          RichTextAdmin.current?.setContentHTML(inspection.adminNotes);
        }
        const { defaultTime, timeDifference } = await InspectionService.fetchInspectionDefaultTime(
          getInspectionTypeIds(selectedTypes),
          combineDateTime(inspection.appointmentDate, inspection.startTime),
          combineDateTime(inspection.appointmentDate, inspection.endTime),
        );
        setDefaultTime(defaultTime);
        setTimeDif(timeDifference);
      }
    }
  };
  const deleteInspectionType = async (index: number, types: number) => {
    if (types === 1) {
      const tempTypes = [...selectedTypes];
      if (
        caseOrLicenseData?.isRequireInspectionsTakePlaceinAboveOrder &&
        !route.params.param.isAllowOverrideofInspectionTypeOrder
      ) {
        tempTypes.splice(index);
      } else {
        tempTypes.splice(index, 1);
      }
      setSelectedTypes(tempTypes);
      const inspectionTypeListData = await InspectionService.fetchInspectionTypeList(
        caseOrLicenseData ?? route.params.param,
        type,
        getInspectionTypeIds(tempTypes),
        isShowAllType,
        isNetworkAvailable,
      );
      setInspectionTypes(inspectionTypeListData);
      const members = await InspectionService.fetchTeamMembers(
        caseOrLicenseData ?? route.params.param,
        getInspectionTypeIds(tempTypes),
      );
      setTeamMembers(members);
      const { defaultTime, timeDifference } = await InspectionService.fetchInspectionDefaultTime(
        getInspectionTypeIds(tempTypes),
        startDateTime,
        endDateTime,
      );
      setDefaultTime(defaultTime);
      setTimeDif(timeDifference);
    } else {
      const tempMembers = [...selectedTeamMembers];
      tempMembers.splice(index, 1);
      setSelectedTeamMembers(tempMembers);
    }
  };

  const commentInsert = (selectedComment: string) => {
    const updatedBody = isGeneral
      ? fullEditorBody + selectedComment
      : adminNotesBody + selectedComment;
    if (isGeneral) {
      setFullEditorBody(updatedBody);
      RichText.current?.setContentHTML(updatedBody);
    } else {
      setAdminNotesBody(updatedBody);
      RichTextAdmin.current?.setContentHTML(updatedBody);
    }
  };

  const imageDelete = (index: number) => {
    if (isGeneral) {
      setGeneralImageData(generalImageData.filter((_, i) => i !== index));
    } else {
      setAdminImageData(adminImageData.filter((_, i) => i !== index));
    }
  };
  // const editImage = (index: number) => {
  //   setEindex(index);
  //   setAlertVisible(true);
  // };

  const formValidation = async () => {
    if (selectedTypes.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        inpectionType: true,
      }));
      ToastService.show('Please select inspection types.', COLORS.ERROR);
      return;
    }
    if (selectedTeamMembers.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        teamMember: true,
      }));
      ToastService.show('Please select inspection team members.', COLORS.ERROR);
      return;
    }
    if (!selectedStatus) {
      setFieldErrors((prev) => ({
        ...prev,
        status: true,
      }));
      ToastService.show('Please select status.', COLORS.ERROR);
      return;
    }
    if (!inspectionDate) {
      setFieldErrors((prev) => ({
        ...prev,
        date: true,
      }));
      ToastService.show('Please select inspection date.', COLORS.ERROR);
      return;
    }
    if (preferredTime === '1' && (!startTime || !endTime)) {
      setFieldErrors((prev) => ({
        ...prev,
        startTime: !startTime ? true : false,
        endTime: !endTime ? true : false,
      }));
      ToastService.show(
        !startTime ? 'Please select start time.' : 'Please select end time.',
        COLORS.ERROR,
      );
      return;
    }
    const format = 'hh:mm A';
    const start = moment(startTime, format);
    const end = moment(endTime, format);
    if (start.isSameOrAfter(end)) {
      ToastService.show('Start time cannot be later than end time.', COLORS.ERROR);
      setFieldErrors((prev) => ({
        ...prev,
        endTime: true,
      }));
      setEndTime('');
      setEndDateTime('');
      return;
    }

    if (preferredTime === '1') {
      const { bookedTeamMembers } = await InspectionService.verifyTeamMemberSchedule(
        getInspectionByIds(selectedTeamMembers),
        inspectionDate,
        convertTime24Hours(startDateTime),
        convertTime24Hours(endDateTime),
      );
      if (bookedTeamMembers.length === 0) {
        saveInspection(false);
      } else {
        setLoading(false);
        verifyTeamMemberDialog(saveInspection);
      }
    } else {
      saveInspection(false);
    }
  };

  const saveInspection = async (outlookFailed: boolean) => {
    const newId = generateUniqueID();
    const sTime = processTime(startDateTime, Platform.OS);
    const eTime = processTime(endDateTime, Platform.OS);
    const duration = startDateTime && endDateTime ? getTimeDuration(startDateTime, endDateTime) : 0;
    const subject = await InspectionService.fetchInspectionTitle(
      getInspectionTypeIds(selectedTypes),
    );
    const success = await InspectionService.saveInspection(
      {
        msCalendarId,
        inspectionId: isNew ? newId : inspectionId,
        outlookFailed,
        responsiblePartyEmail: addResponsible ? (caseOrLicenseData?.email ?? null) : null,
        duration,
        licenseNumber: type !== 'Case' ? (caseOrLicenseData?.number ?? null) : null,
        licenseContentItemId: type !== 'Case' ? (caseOrLicenseData?.contentItemId ?? null) : null,
        statusLabel: selectedStatus?.displayText ?? '',
        preferredTime:
          preferredTime === '1'
            ? 'Custom'
            : preferredTime === '2'
              ? 'AM'
              : preferredTime === '3'
                ? 'PM'
                : 'Day',
        location,
        body: fullEditorBody,
        inspectionDate,
        startTime: sTime,
        endTime: eTime,
        statusId: selectedStatus?.id ?? '',
        caseNumber: type === 'Case' ? (caseOrLicenseData?.number ?? null) : null,
        subject,
        teamMemberIds: getInspectionByIds(selectedTeamMembers),
        teamMemberNames: getInspectionByName(selectedTeamMembers),
        typeIds: getInspectionTypeIds(selectedTypes),
        caseContentItemId: type === 'Case' ? (caseOrLicenseData?.contentItemId ?? null) : null,
        adminNotes: adminNotesBody || null,
        adminImages: updateImageJsonKey(adminImageData),
        generalImages: updateImageJsonKey(generalImageData),
        isNew,
        isCase: type === 'Case',
      },
      setLoading,
    );

    if (success) {
      resetInspectionState();
      RichText.current?.setContentHTML('');
      RichTextAdmin.current?.setContentHTML('');
      setIsInspectionUpdated(true);
      navigation.goBack();
    } else {
      InspectionScheduleFailAlert(saveInspection);
    }
  };
  const FileUploadApi = async (
    fileArray: any,
    isEdit: string,
    // index?: number
  ) => {
    try {
      setFileUploading(true);
      const responses = await InspectionService.uploadFile(
        {
          isEdit,
          fileArray,
          contentItemId: caseOrLicenseData?.contentItemId,
          isCase: route.params.type,
        },
        isNetworkAvailable,
      );
      if (responses?.length > 0) {
        const validResponses = responses.filter((res): res is IImageData => !!res?.url);
        if (isGeneral) {
          setGeneralImageData((prevData) => [...prevData, ...validResponses]);
        } else {
          setAdminImageData((prevData) => [...prevData, ...validResponses]);
        }
        setFileUploading(false);
      }
    } catch (error) {
      recordCrashlyticsError('Error uploading file:', error);
      console.error('Error uploading file:', error);
      ToastService.show('Failed to upload file.', COLORS.ERROR);
    } finally {
      setFileUploading(false);
    }
  };

  function updateImageJsonKey(array: any) {
    var tempArray = [];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      tempArray.push({
        FileName: element.filename,
        URL: element.url,
      });
    }
    return tempArray;
  }
  return (
    <ScreenWrapper
      title="Schedule"
      onBackPress={() => {
        RichText.current?.setContentHTML('');
        RichTextAdmin.current?.setContentHTML('');
        goBack();
      }}
    >
      <View style={styles.container}>
        <Loader loading={isLoading} />
        <OpenDocPickerDialog
          visible={state.alertVisible}
          onClose={() => setState((prev) => ({ ...prev, alertVisible: false }))}
          config={{
            flag: 3,
            comment: '',
            FileUploadApi: FileUploadApi,
            isEdit: state?.eIndex == 0 ? false : true,
            index: state?.eIndex,
            id: '',
          }}
        />
        <StandardCommentDialog
          openComment={openComment}
          setOpenComment={() => setOpenComment(false)}
          checked={checked}
          setChecked={setChecked}
          commentInsert={commentInsert}
        />
        <View style={styles.viewStyles}>
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tab} onPress={() => setIsGeneral(true)}>
              <View style={styles.tabContent}>
                <Text style={styles.tabText}>General</Text>
                <View style={[styles.tabIndicator, isGeneral && styles.tabIndicatorActive]} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setIsGeneral(false)}>
              <View style={styles.tabContent}>
                <Text style={styles.tabText}>Admin Notes</Text>
                <View style={[styles.tabIndicator, !isGeneral && styles.tabIndicatorActive]} />
              </View>
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            extraScrollHeight={50}
            enableOnAndroid={true}
            enableResetScrollToCoords={false}
            showsVerticalScrollIndicator={false}
          >
            {isGeneral ? (
              <View>
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Inspection Types{' '}
                      <Text style={{ color: COLORS.ERROR }} accessibilityLabel="required">
                        *
                      </Text>
                    </Text>

                    {caseOrLicenseData?.isAllowOverrideofInspectionTypeOrder &&
                      caseOrLicenseData?.isRequireInspectionsTakePlaceinAboveOrder && (
                        <View style={styles.checkboxContainer}>
                          <Checkbox
                            value={isShowAllType}
                            onValueChange={(newValue) => {
                              setShowAllType(newValue);
                              InspectionService.fetchInspectionTypeList(
                                caseOrLicenseData ?? route.params.param,
                                type,
                                getInspectionTypeIds(selectedTypes),
                                newValue,
                                isNetworkAvailable,
                              ).then(setInspectionTypes);
                            }}
                            color={
                              route.params.param.isAllowOverrideofInspectionTypeOrder
                                ? COLORS.APP_COLOR
                                : undefined
                            }
                            disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                          />
                          <Text style={styles.checkboxText}>Show All Types</Text>
                        </View>
                      )}
                  </View>
                  {selectedTypes.length > 0 && (
                    <View
                      style={{
                        opacity: caseOrLicenseData?.isStatusReadOnly ? 0.4 : 1,
                      }}
                      pointerEvents={caseOrLicenseData?.isStatusReadOnly ? 'none' : 'auto'}
                    >
                      <FlatList
                        style={styles.flatList}
                        data={selectedTypes}
                        renderItem={({ item, index }) => (
                          <InspectionScheduleDropDown
                            rowData={item}
                            index={index.toString()}
                            deleteInspectionType={() => deleteInspectionType(index, 1)}
                            type={'1'}
                          />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        inverted
                      />
                    </View>
                  )}
                  <View style={[styles.dropdownContainer]}>
                    <CustomDropdown
                      data={inspectionTypes ?? []}
                      labelField="displayText"
                      valueField="id"
                      value={''}
                      error={fieldErrors.inpectionType}
                      onChange={(item: any) => {
                        if (!selectedTypes.some((selected) => selected.id === item.value.id)) {
                          setSelectedTypes([...selectedTypes, item.value]);
                          setFieldErrors((prev) => ({
                            ...prev,
                            inpectionType: false,
                          }));
                          InspectionService.fetchInspectionTypeList(
                            caseOrLicenseData ?? route.params.param,
                            type,
                            getInspectionTypeIds([...selectedTypes, item.value]),
                            isShowAllType,
                            isNetworkAvailable,
                          ).then(setInspectionTypes);
                          InspectionService.fetchTeamMembers(
                            caseOrLicenseData ?? route.params.param,
                            getInspectionTypeIds([...selectedTypes, item.value]),
                          ).then(setTeamMembers);
                          InspectionService.fetchInspectionDefaultTime(
                            getInspectionTypeIds([...selectedTypes, item.value]),
                            startDateTime,
                            endDateTime,
                          ).then(({ defaultTime, timeDifference }) => {
                            setDefaultTime(defaultTime);
                            setTimeDif(timeDifference);
                          });
                        }
                      }}
                      label="Inspection Type"
                      placeholder="Please select the inspection type"
                      zIndexPriority={3}
                      disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                    />
                  </View>
                </>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Inspection By{' '}
                    <Text style={{ color: COLORS.ERROR }} accessibilityLabel="required">
                      *
                    </Text>
                  </Text>
                </View>
                {selectedTeamMembers.length > 0 && (
                  <View
                    style={{
                      opacity: caseOrLicenseData?.isStatusReadOnly ? 0.4 : 1,
                    }}
                    pointerEvents={caseOrLicenseData?.isStatusReadOnly ? 'none' : 'auto'}
                  >
                    <FlatList
                      style={styles.flatList}
                      data={selectedTeamMembers}
                      renderItem={({ item, index }) => (
                        <InspectionScheduleDropDown
                          rowData={item}
                          index={index.toString()}
                          deleteInspectionType={() => deleteInspectionType(index, 2)}
                          type="2"
                        />
                      )}
                      keyExtractor={(item) => item.id.toString()}
                    />
                  </View>
                )}

                <View style={[styles.inputWrapper, { zIndex: 2 }]}>
                  <CustomDropdown
                    data={teamMembers ?? []}
                    labelField="displayText"
                    valueField="id"
                    value={''}
                    onChange={(item: any) => {
                      if (
                        !selectedTeamMembers.some((selected) => selected?.id === item?.value?.id)
                      ) {
                        setSelectedTeamMembers([...selectedTeamMembers, item.value]);
                        setFieldErrors((prev) => ({
                          ...prev,
                          teamMember: false,
                        }));
                      }
                    }}
                    label="Inspection By"
                    placeholder="Please select the inspection by"
                    zIndexPriority={2}
                    error={fieldErrors.teamMember}
                    disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                  />
                </View>
                <View style={[styles.inputWrapper, { zIndex: 1 }]}>
                  <CustomDropdown
                    data={inspectionStatus ?? []}
                    labelField="displayText"
                    valueField="id"
                    value={selectedStatus?.id}
                    onChange={(item: any) => {
                      (setSelectedStatus(item?.value),
                        setFieldErrors((prev) => ({
                          ...prev,
                          status: false,
                        })));
                    }}
                    required
                    label="Status"
                    placeholder="Please select the status"
                    zIndexPriority={1}
                    error={fieldErrors.status}
                    disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                  />
                </View>
                <DatePickerInput
                  label="Inspection Date"
                  value={inspectionDate}
                  onChange={(pickDate) => {
                    setInspectionDate(pickDate.toISOString());
                    setFieldErrors((prev) => ({
                      ...prev,
                      date: false,
                    }));
                  }}
                  required
                  containerStyle={styles.ispectionDate}
                  error={fieldErrors.date}
                  editable={!caseOrLicenseData?.isStatusReadOnly}
                  disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                />

                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                  <Text style={styles.sectionTitle}>Preferred Time</Text>
                </View>
                <RadioGroup
                  containerStyle={styles.radioContainer}
                  layout="row"
                  radioButtons={radioButtons}
                  onPress={!caseOrLicenseData?.isStatusReadOnly ? setPreferredTime : () => {}}
                  selectedId={preferredTime}
                />
                {preferredTime === '1' && (
                  <View style={styles.timeSection}>
                    <View style={styles.timePicker}>
                      <DatePickerInput
                        mode="time"
                        label="Start time"
                        value={startTime}
                        required={true}
                        onChange={(date) => {
                          const formattedDate = formatDate(date.toISOString(), 'YYYY-MM-DD HH:mm');

                          const datePart = formatDate(inspectionDate, 'YYYY-MM-DD');
                          const timePart = convertTime24Hours(
                            moment(date).format('YYYY-MM-DD HH:mm'),
                          );
                          const stTime = inspectionDate ? `${datePart} ${timePart}` : formattedDate;
                          logRed(stTime);
                          setStartDateTime(stTime);
                          setStartTime(convertTime(stTime));
                          if (endDateTime) {
                            setTimeDif(getTimeDifference(stTime, endDateTime, defaultTime));
                          }
                          if (defaultTime && !endTime) {
                            const inputTimeDate = new Date(formattedDate);
                            inputTimeDate.setMinutes(inputTimeDate.getMinutes() + defaultTime);
                            // setEndTime(
                            //   convertTime(inputTimeDate.toISOString())
                            // );
                            setEndDateTime(
                              `${datePart} ${convertTime24Hours(inputTimeDate.toISOString())}`,
                            );
                          }
                          setFieldErrors((prev) => ({
                            ...prev,
                            startTime: false,
                          }));
                        }}
                        containerStyle={{ width: '100%' }}
                        error={fieldErrors.startTime}
                        editable={!caseOrLicenseData?.isStatusReadOnly}
                        disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                      />
                    </View>
                    <View style={styles.timePicker}>
                      <DatePickerInput
                        mode="time"
                        label="End Time"
                        value={endTime}
                        required={true}
                        onChange={(date) => {
                          const formattedDate = formatDate(date.toISOString(), 'YYYY-MM-DD HH:mm');
                          const datePart = formatDate(inspectionDate, 'YYYY-MM-DD');
                          const timePart = convertTime24Hours(
                            moment(date).format('YYYY-MM-DD HH:mm'),
                          );
                          const edTime = inspectionDate ? `${datePart} ${timePart}` : formattedDate;
                          const format = 'hh:mm A';
                          const start = moment(startTime, format);
                          const endMoment = moment(date).format(format);
                          const end = moment(endMoment, format);
                          if (start.isSameOrAfter(end)) {
                            ToastService.show(
                              'Start time cannot be later than end time.',
                              COLORS.ERROR,
                            );
                            setEndTime('');
                            setEndDateTime('');
                            return;
                          }
                          setEndDateTime(edTime);
                          setEndTime(convertTime(edTime));
                          if (startDateTime) {
                            setTimeDif(getTimeDifference(startDateTime, edTime, defaultTime));
                          }
                          setFieldErrors((prev) => ({
                            ...prev,
                            endTime: false,
                          }));
                        }}
                        containerStyle={{ width: '100%' }}
                        error={fieldErrors.endTime}
                        editable={!caseOrLicenseData?.isStatusReadOnly}
                        disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                      />
                      {!!timeDif && !!startTime && !!endTime && (
                        <Text style={styles.timeDiff}>
                          These inspections should be completed in {timeDif} hour(s)
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                <View style={{ marginTop: 10 }}>
                  <FloatingInput
                    label="Location"
                    value={location}
                    numberOfLines={1}
                    onChangeText={setLocation}
                    placeholder="Enter Location"
                    keyboardType="default"
                    disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                  />
                </View>
                {inspectionId && lstInspectionSubmission?.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.inspectionForms}>
                      <Text style={styles.formsText}>Inspection Forms</Text>
                    </View>
                    <FlatList
                      data={lstInspectionSubmission}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('OpenInWebView', {
                              paramKey: 'params',
                              param: item.link,
                              title: 'Daily Inspection',
                              isNotSkipScreen: comeFromInspectionList ? false : true,
                            })
                          }
                        >
                          <Text style={styles.formLink}>{item.title}</Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={(_, index) => index.toString()}
                    />
                  </View>
                )}
                {!inspectionId && (
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      value={addResponsible}
                      onValueChange={setAddResponsible}
                      color={addResponsible ? COLORS.APP_COLOR : undefined}
                      disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                    />
                    <Text style={styles.checkboxText}>Add Responsible Party</Text>
                  </View>
                )}
                <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                  <Text style={styles.sectionTitle}>
                    {isGeneral ? 'Notes for Applicant' : 'Admin Notes'}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        caseOrLicenseData?.isStatusReadOnly && { opacity: 0.5 },
                      ]}
                      onPress={() =>
                        setState((prev) => ({
                          ...prev,
                          alertVisible: !state.alertVisible,
                        }))
                      }
                      disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                    >
                      <Icon name="paperclip" size={height(0.025)} color={COLORS.WHITE} />
                    </TouchableOpacity>

                    {!isHideSign && (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          caseOrLicenseData?.isStatusReadOnly && {
                            opacity: 0.5,
                          },
                        ]}
                        disabled={caseOrLicenseData?.isStatusReadOnly || fileUploading}
                        onPress={() => {
                          const fullBody = isGeneral
                            ? fullEditorBody + signature
                            : adminNotesBody + signature;
                          if (isGeneral) {
                            setFullEditorBody(fullBody);
                            RichText.current?.setContentHTML(fullBody);
                          } else {
                            setAdminNotesBody(fullBody);
                            RichTextAdmin.current?.setContentHTML(fullBody);
                          }
                        }}
                      >
                        <Icon name="signature-freehand" size={height(0.025)} color={COLORS.WHITE} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        caseOrLicenseData?.isStatusReadOnly && { opacity: 0.5 },
                      ]}
                      disabled={caseOrLicenseData?.isStatusReadOnly || fileUploading}
                      onPress={() => {
                        setOpenComment(true);
                        setChecked([]);
                      }}
                    >
                      <Icon name="message-text-outline" size={height(0.025)} color={COLORS.WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>
                {(isGeneral ? generalImageData : adminImageData).length > 0 && (
                  <FlatList
                    style={styles.flatList}
                    data={isGeneral ? generalImageData : adminImageData}
                    renderItem={({ item, index }) => (
                      <SelectedImageItem
                        item={item}
                        index={index}
                        imageDelete={imageDelete}
                        navigation={navigation}
                        isEdit={false}
                        isStatusReadOnly={caseOrLicenseData?.isStatusReadOnly}
                        // editImage={editImage}
                      />
                    )}
                    refreshing={fileUploading}
                    keyExtractor={(_, index) => index.toString()}
                  />
                )}
                {fileUploading && (
                  <View style={styles.loadingItem}>
                    <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
                    <Text style={styles.loadingText}>Uploading...</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.editorContainer,
                    { opacity: caseOrLicenseData?.isStatusReadOnly ? 0.4 : 1 },
                  ]}
                >
                  <RichEditor
                    ref={isGeneral ? RichText : RichTextAdmin}
                    initialContentHTML={isGeneral ? fullEditorBody : adminNotesBody}
                    //  androidLayerType="software"
                    useContainer={true}
                    placeholder="Please enter note"
                    onChange={(value) => {
                      if (isGeneral) setFullEditorBody(value);
                      else setAdminNotesBody(value);
                    }}
                    disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                  />
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Admin Notes</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        caseOrLicenseData?.isStatusReadOnly && { opacity: 0.5 },
                      ]}
                      onPress={() =>
                        setState((prev) => ({
                          ...prev,
                          alertVisible: !state.alertVisible,
                        }))
                      }
                      disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                    >
                      <Icon name="paperclip" size={height(0.025)} color={COLORS.WHITE} />
                    </TouchableOpacity>
                    {!isHideSign && (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          caseOrLicenseData?.isStatusReadOnly && {
                            opacity: 0.5,
                          },
                        ]}
                        onPress={() => {
                          const fullBody = isGeneral
                            ? fullEditorBody + signature
                            : adminNotesBody + signature;
                          if (isGeneral) {
                            setFullEditorBody(fullBody);
                            RichText.current?.setContentHTML(fullBody);
                          } else {
                            setAdminNotesBody(fullBody);
                            RichTextAdmin.current?.setContentHTML(fullBody);
                          }
                        }}
                        disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                      >
                        <Icon name="signature-freehand" size={height(0.025)} color={COLORS.WHITE} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        caseOrLicenseData?.isStatusReadOnly && { opacity: 0.5 },
                      ]}
                      onPress={() => {
                        setOpenComment(true);
                        setChecked([]);
                      }}
                      disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                    >
                      <Icon name="message-text-outline" size={height(0.025)} color={COLORS.WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>
                {adminImageData?.length > 0 && (
                  <FlatList
                    style={styles.flatList}
                    data={adminImageData}
                    renderItem={({ item, index }) => (
                      <SelectedImageItem
                        item={item}
                        index={index}
                        imageDelete={imageDelete}
                        navigation={navigation}
                        isEdit={false}
                        // editImage={editImage}
                        isStatusReadOnly={caseOrLicenseData?.isStatusReadOnly}
                      />
                    )}
                    keyExtractor={(_, index) => index.toString()}
                  />
                )}
                {fileUploading && (
                  <View style={styles.loadingItem}>
                    <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
                    <Text style={styles.loadingText}>Uploading...</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.editorContainer,
                    { opacity: caseOrLicenseData?.isStatusReadOnly ? 0.4 : 1 },
                  ]}
                >
                  <RichEditor
                    ref={RichTextAdmin}
                    initialContentHTML={adminNotesBody}
                    // androidLayerType="software"
                    useContainer={true}
                    placeholder="Please enter note"
                    onChange={(value) => setAdminNotesBody(value)}
                    disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
                  />
                </View>
              </View>
            )}
          </KeyboardAwareScrollView>

          <PublishButton
            buttonStyle={{ marginVertical: 15 }}
            // contacinerStyle={{ alignItems: "flex-end" }}
            textName={isNew ? 'Save' : 'Update'}
            onPress={() => {
              formValidation();
            }}
            disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly) || fileUploading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewStyles: { flex: 1, margin: 10 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabContent: { alignItems: 'center' },
  tabText: {
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratBold,
    color: COLORS.BLACK,
  },
  tabIndicator: {
    borderWidth: 1.5,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 20,
    width: WINDOW_WIDTH * 0.44,
    marginTop: 15,
  },
  tabIndicatorActive: { borderColor: COLORS.APP_COLOR },
  saveButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    width: WINDOW_WIDTH * 0.25,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'flex-end',
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
  },
  ispectionDate: { width: '100%', marginTop: -10 },
  //  scrollContent: { flexGrow: 1, paddingBottom: height(0.1) },
  sectionHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: { color: COLORS.BLACK, fontSize: fontSize(0.028), flex: 1 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxText: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
    marginLeft: 10,
  },
  flatList: { marginTop: 5 },
  dropdownContainer: {
    zIndex: 3,
  },
  pickerViewStyle: {
    backgroundColor: COLORS.WHITE,
    height: height(0.05),
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 5,
  },
  inputStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.022),
    paddingHorizontal: 5,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    height: height(0.05),
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 5,
  },
  icon: { width: iconSize(0.03), height: iconSize(0.03) },
  iconStyle: { width: iconSize(0.03), height: iconSize(0.03) },
  radioContainer: { marginTop: 5, fontSize: 1, justifyContent: 'center', alignSelf: 'center' },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timePicker: { width: '48%' },
  timeDiff: { color: COLORS.BLACK, fontSize: fontSize(0.025), marginTop: 10 },
  formInput: {
    backgroundColor: COLORS.WHITE,
    height: height(0.05),
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  inspectionForms: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  formsText: { color: COLORS.GRAY_DARK, fontSize: 16 },
  formLink: {
    color: COLORS.BLUE_COLOR,
    textDecorationLine: 'underline',
    fontSize: fontSize(0.031),
    marginBottom: 10,
  },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  // button: {
  //     justifyContent:'center',
  //   alignItems: 'center',
  //   backgroundColor: COLORS.APP_COLOR,
  //   paddingHorizontal: 10,
  //   paddingVertical: 10,
  //   borderRadius: 5,
  //   marginLeft: 10,
  // },
  button: {
    backgroundColor: COLORS.APP_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: { color: COLORS.WHITE, fontSize: fontSize(0.03) },
  editorContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    padding: 5,
    marginTop: 10,
    minHeight: height(0.1),
  },
  section: { marginTop: 20 },
  teamMemberContainer: {
    marginVertical: 12,
    maxHeight: height(0.25),
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  teamMemberFlatList: {
    flexGrow: 0,
  },
  flatListContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonIcon: {
    width: iconSize(0.025),
    height: iconSize(0.025),
    tintColor: COLORS.WHITE,
  },
  inputWrapper: {
    marginBottom: 10,
    zIndex: 1,
  },
  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    // backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 5,
    marginVertical: 5,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: fontSize(0.025),
    color: COLORS.BLACK,
  },
});

export default InspectionSchedule;
