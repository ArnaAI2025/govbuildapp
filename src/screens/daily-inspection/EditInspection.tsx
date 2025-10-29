import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, FlatList } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RadioGroup from 'react-native-radio-buttons-group';

import moment from 'moment';
import {
  convertTime,
  convertTime24Hours,
  formatDate,
  getNewUTCDate,
  getTimeDifference,
} from '../../utils/helper/helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { useDailyInspectionStore } from '../../store/useDailyInspectionStore';
import { COLORS } from '../../theme/colors';
import { getBaseUrl } from '../../session/SessionManager';
import { POST_DATA_WITH_TOKEN } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { SyncModelParam } from '../../utils/params/commonParams';
import Loader from '../../components/common/Loader';
import { fontSize, height, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { InspectionService } from '../sub-screens/inspection/InspectionService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import CustomDropdown from '../../components/common/CustomDropdown';
import { DatePickerInput } from '../../components/common/DatePickerInput';
import { InspectionScheduleDropDown } from '../../components/inspection/InspectionSchaduleDropdown';
import { ToastService } from '../../components/common/GlobalSnackbar';
import {
  combineDateTime,
  formatTimeForDisplay,
  getInspectionByIds,
} from '../../utils/helper/inspectionUtils';
import PublishButton from '../../components/common/PublishButton';
import { useNetworkStatus } from '../../utils/checkNetwork';
import { goBack } from '../../navigation/Index';
import { useFocusEffect } from '@react-navigation/native';

type EditInspectionScreenProps = NativeStackScreenProps<RootStackParamList, 'EditInspection'>;

interface TeamMember {
  id: string;
  displayText: string;
}

interface Status {
  id: string;
  displayText: string;
}

const EditInspection: React.FC<EditInspectionScreenProps> = ({ route, navigation }) => {
  const { isLoadingAPI, setLoading, setIsInspectionUpdated } = useDailyInspectionStore();
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember[]>([]);
  const { isNetworkAvailable } = useNetworkStatus();
  const [teamMember, setTeamMember] = useState<TeamMember[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [inspectionDatePicker, setInspectionDatePicker] = useState(false);
  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectPreferredTime, setSelectPreferredTime] = useState('1');
  const [timeDif, setTimeDif] = useState<number | null>(null);
  const [defultTime] = useState(0);
  const inspectionId = route.params?.param?.contentItemId || '';
  const radioButtons = [
    {
      id: '1',
      label: 'Custom',
      value: 'Custom',
      borderColor: COLORS.APP_COLOR,
      color: COLORS.APP_COLOR,
      containerStyle: { flex: 1 },
    },
    {
      id: '2',
      label: 'AM',
      value: 'am',
      borderColor: COLORS.APP_COLOR,
      color: COLORS.APP_COLOR,
      containerStyle: { flex: 1 },
    },
    {
      id: '3',
      label: 'PM',
      value: 'pm',
      borderColor: COLORS.APP_COLOR,
      color: COLORS.APP_COLOR,
      containerStyle: { flex: 1 },
    },
    {
      id: '4',
      label: 'DAY',
      value: 'day',
      borderColor: COLORS.APP_COLOR,
      color: COLORS.APP_COLOR,
      containerStyle: { flex: 1 },
    },
  ];

  const [fieldErrors, setFieldErrors] = useState({
    status: false,
    teamMember: false,
    date: false,
    startTime: false,
    endTime: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (!isNetworkAvailable) {
        goBack();
      }
    }, [isNetworkAvailable, navigation]),
  );

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchTeamMembers(), fetchStatusList(), fetchInspectionData()]);
    };
    fetchData();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      if (isNetworkAvailable) {
        const members = await InspectionService.fetchAllTeamMembers();
        setTeamMember(members);
      }
    } catch (error) {
      console.error('Error in fetchTeamMembers:', error);
    }
  };

  const fetchStatusList = async () => {
    try {
      if (isNetworkAvailable) {
        const status = await InspectionService.fetchAllStatus();
        setStatusList(status);
      }
    } catch (error) {
      console.error('Error in fetchStatusList:', error);
    }
  };

  const fetchInspectionData = async () => {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const inspectionData = await InspectionService.fetchInspectionById(inspectionId);
        if (inspectionData) {
          setInspectionDate(inspectionData.appointmentDate);
          setSelectPreferredTime(
            inspectionData.preferredTime === 'AM'
              ? '2'
              : inspectionData.preferredTime === 'PM'
                ? '3'
                : inspectionData.preferredTime === 'Day'
                  ? '4'
                  : '1',
          );
          if (inspectionData.startTime) {
            setStartTime(formatTimeForDisplay(inspectionData.startTime));
            setStartDateTime(
              combineDateTime(inspectionData.appointmentDate, inspectionData.startTime),
            );
          }
          if (inspectionData.endTime) {
            setEndTime(formatTimeForDisplay(inspectionData.endTime));
            setEndDateTime(combineDateTime(inspectionData.appointmentDate, inspectionData.endTime));
          }
          if (inspectionData.status) {
            setSelectedStatus({
              id: inspectionData.status ?? '',
              displayText: inspectionData.statusLabel || inspectionData.masterStatusLabel,
            });
          }
          if (inspectionData.selectedInspectionBy) {
            setSelectedTeamMember(inspectionData?.selectedInspectionBy);
          }
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error in fetchInspectionData:', error);
    }
  };

  const formValidation = () => {
    if (selectedTeamMember.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        teamMember: true,
      }));
      ToastService.show('Please select inspection team members.', COLORS.ERROR);
    } else if (!selectedStatus) {
      setFieldErrors((prev) => ({
        ...prev,
        status: true,
      }));
      ToastService.show('Please select status.', COLORS.ERROR);
    } else if (!inspectionDate) {
      setFieldErrors((prev) => ({
        ...prev,
        date: true,
      }));
      ToastService.show('Please select inspection date.', COLORS.ERROR);
    } else if (selectPreferredTime === '1' && (!startTime || !endTime)) {
      setFieldErrors((prev) => ({
        ...prev,
        startTime: !startTime ? true : false,
        endTime: !endTime ? true : false,
      }));
      ToastService.show('Please select start time and end time.', COLORS.ERROR);
    } else {
      const format = 'hh:mm A';
      const start = moment(startTime, format);
      const end = moment(endTime, format);
      if (start.isSameOrAfter(end)) {
        ToastService.show('Start time cannot be later than or equal to end time.', COLORS.ERROR);
        setFieldErrors((prev) => ({
          ...prev,
          endTime: true,
        }));
        setEndTime('');
        setEndDateTime('');
        return;
      }
      saveInspection();
    }
  };

  const saveInspection = async () => {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const sTime =
          Platform.OS === 'ios' ? convertTime24Hours(startDateTime) : startDateTime.split('').pop();
        const eTime =
          Platform.OS === 'ios'
            ? convertTime24Hours(endDateTime)
            : endDateTime.toString().includes('T')
              ? convertTime24Hours(endDateTime)
              : endDateTime.split(' ').pop();
        const requestData = {
          InspectionIds: inspectionId,
          InspectorIds: getInspectionByIds(selectedTeamMember),
          StatusId: selectedStatus?.id,
          StatusText: selectedStatus?.displayText,
          InspectionDate: inspectionDate,
          StartTime: sTime,
          EndTime: eTime,
          PreferredTime:
            selectPreferredTime === '1'
              ? 'Custom'
              : selectPreferredTime === '2'
                ? 'AM'
                : selectPreferredTime === '3'
                  ? 'PM'
                  : 'Day',
          IsMultiple: false,
          syncModel: SyncModelParam(false, false, getNewUTCDate(), inspectionId, null),
        };
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_INSPECTION_FROM_REPORT}`,
          body: requestData,
        });
        setLoading(false);
        if (response?.status && response?.data?.status) {
          setIsInspectionUpdated(true);
          ToastService.show('Inspection updated successfully', COLORS.SUCCESS_GREEN);
          navigation.goBack();
        } else {
          Alert.alert(response?.data?.message);
        }
      } else {
        Alert.alert('Please check your internet connection');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error in saveInspection:', error);
    }
  };
  function deleteInspectionType(index) {
    try {
      const tempArray = selectedTeamMember.slice();
      tempArray.splice(index, 1);
      setSelectedTeamMember(tempArray);
    } catch (error) {
      console.error('Error in deleteInspectionType:', error);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <ScreenWrapper title="Schedule">
        <KeyboardAwareScrollView style={{ padding: 10, flex: 1 }}>
          <View style={{ flex: 1 }}>
            {selectedTeamMember.length > 0 && (
              <View>
                <FlatList
                  style={styles.flatList}
                  data={selectedTeamMember}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => {
                        deleteInspectionType(index, 2);
                      }}
                      type="2"
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}

            <CustomDropdown
              data={teamMember ?? []}
              labelField="displayText"
              valueField="id"
              value={''}
              error={fieldErrors.teamMember}
              onChange={(item: any) => {
                if (!selectedTeamMember.some((selected) => selected?.id === item?.value?.id)) {
                  setSelectedTeamMember([...selectedTeamMember, item.value]);
                  setFieldErrors((prev) => ({
                    ...prev,
                    teamMember: false,
                  }));
                }
              }}
              label="Inspection By"
              placeholder="Please select the inspection by"
              zIndexPriority={2}
            />
            <CustomDropdown
              data={statusList ?? []}
              labelField="displayText"
              valueField="id"
              error={fieldErrors.status}
              value={selectedStatus?.id}
              onChange={(item: any) => {
                setSelectedStatus(item?.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  status: false,
                }));
              }}
              label="Status"
              placeholder="Please select the status"
              zIndexPriority={1}
            />
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
              error={fieldErrors.date}
              containerStyle={styles.ispectionDate}
            />
            <Text style={[styles.title, { marginTop: height(0.02) }]}>Preferred Time</Text>
            <RadioGroup
              containerStyle={{ marginTop: 5 }}
              layout="row"
              radioButtons={radioButtons}
              onPress={setSelectPreferredTime}
              selectedId={selectPreferredTime}
              labelStyle={{ fontSize: fontSize(0.03) }}
            />
            {selectPreferredTime === '1' && (
              <View style={{ flexDirection: 'row', marginTop: height(0.02) }}>
                <View style={{ flex: 1 }}>
                  <DatePickerInput
                    mode="time"
                    label="Start time"
                    value={startTime}
                    onChange={(date) => {
                      const formattedDate = formatDate(date.toISOString(), 'YYYY-MM-DD HH:mm');

                      const datePart = formatDate(inspectionDate, 'YYYY-MM-DD');
                      const timePart = convertTime24Hours(moment(date).format('YYYY-MM-DD HH:mm'));
                      const stTime = inspectionDate ? `${datePart} ${timePart}` : formattedDate;
                      setStartDateTime(stTime);
                      setStartTime(convertTime(stTime));
                      if (endDateTime) {
                        setTimeDif(getTimeDifference(stTime, endDateTime, defultTime));
                      }
                      if (defultTime && !endTime) {
                        const inputTimeDate = new Date(formattedDate);
                        inputTimeDate.setMinutes(inputTimeDate.getMinutes() + defultTime);
                        setEndDateTime(
                          `${datePart} ${convertTime24Hours(inputTimeDate.toISOString())}`,
                        );
                        setFieldErrors((prev) => ({
                          ...prev,
                          startTime: false,
                        }));
                      }
                    }}
                    containerStyle={{ width: '100%' }}
                    error={fieldErrors.startTime}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <DatePickerInput
                    mode="time"
                    label="End Time"
                    value={endTime}
                    onChange={(date) => {
                      const formattedDate = formatDate(date.toISOString(), 'YYYY-MM-DD HH:mm');
                      const datePart = formatDate(inspectionDate, 'YYYY-MM-DD');
                      const timePart = convertTime24Hours(moment(date).format('YYYY-MM-DD HH:mm'));
                      const edTime = inspectionDate ? `${datePart} ${timePart}` : formattedDate;
                      const format = 'hh:mm A';
                      const start = moment(startTime, format);
                      const endMoment = moment(date).format(format);
                      const end = moment(endMoment, format);
                      if (start.isSameOrAfter(end)) {
                        ToastService.show(
                          'Start time cannot be later than or equal to end time.',
                          COLORS.ERROR,
                        );
                        setEndTime('');
                        setEndDateTime('');
                        return;
                      }
                      setEndDateTime(edTime);
                      setEndTime(convertTime(edTime));
                      if (startDateTime) {
                        setTimeDif(getTimeDifference(startDateTime, edTime, defultTime));
                      }
                      setFieldErrors((prev) => ({
                        ...prev,
                        endTime: false,
                      }));
                    }}
                    containerStyle={{ width: '100%' }}
                    error={fieldErrors.endTime}
                  />
                  {!!timeDif && !!startTime && !!endTime && (
                    <Text style={styles.title}>
                      These inspection(s) should be completed in {timeDif} hour(s)
                    </Text>
                  )}
                </View>
              </View>
            )}
            <PublishButton
              buttonStyle={{ marginTop: 15, marginBottom: 15 }}
              textName={'Update'}
              onPress={formValidation}
            />
          </View>
        </KeyboardAwareScrollView>
        <DateTimePickerModal
          isVisible={inspectionDatePicker}
          mode="date"
          onConfirm={(pickDate) => {
            setInspectionDate(formatDate(pickDate?.toISOString(), 'yyyy-MM-dd'));
            setInspectionDatePicker(false);
          }}
          onCancel={() => setInspectionDatePicker(false)}
        />
        <DateTimePickerModal
          isVisible={startTimePicker}
          mode="time"
          onConfirm={(pickDate) => {
            const stTime = inspectionDate
              ? `${inspectionDate} ${convertTime24Hours(pickDate?.toISOString())}`
              : pickDate;
            setStartDateTime(stTime);
            setStartTime(convertTime(pickDate));
            setStartTimePicker(false);
            if (endDateTime) {
              setTimeDif(getTimeDifference(stTime, endDateTime, defultTime));
            }
            if (defultTime && !endDateTime) {
              const inputTime = moment(stTime, 'YYYY-MM-DD HH:mm').toDate();
              inputTime.setMinutes(inputTime.getMinutes() + defultTime);
              setEndDateTime(inputTime);
              setEndTime(convertTime(inputTime));
            }
          }}
          onCancel={() => setStartTimePicker(false)}
        />
        <DateTimePickerModal
          isVisible={endTimePicker}
          mode="time"
          onConfirm={(pickDate) => {
            const edTime = inspectionDate
              ? `${inspectionDate} ${convertTime24Hours(pickDate)}`
              : pickDate;
            setEndDateTime(edTime);
            setEndTime(convertTime(pickDate));
            setEndTimePicker(false);
            if (startDateTime) {
              setTimeDif(getTimeDifference(startDateTime, edTime, defultTime));
            }
          }}
          onCancel={() => setEndTimePicker(false)}
        />
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
  },
  pickerViewStyle: {
    borderWidth: 0,
    marginBottom: 5,
    borderRadius: 0,
    backgroundColor: COLORS.BLACK,
    height: height(0.05),
  },
  datePicker: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    alignItems: 'center',
    padding: 5,
    height: height(0.05),
    backgroundColor: COLORS.BLACK,
  },
  inputStyle: {
    color: COLORS.BLACK,
    paddingHorizontal: 5,
    fontSize: fontSize(0.022),
  },
  saveButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    width: WINDOW_WIDTH * 0.25,
    borderRadius: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  ispectionDate: { width: '100%', marginTop: -10 },
  flatList: { marginTop: 5 },
});

export default EditInspection;
