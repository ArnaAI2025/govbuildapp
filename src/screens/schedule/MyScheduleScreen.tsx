import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import type { ScheduleModel } from '../../utils/interfaces/ISubScreens';
import { convertDate, convertDateToISO, formatDate } from '../../utils/helper/helpers';
import { create } from 'zustand';
import type { RootStackParamList } from '../../navigation/Types';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { ScheduleService } from './ScheduleService';
import { TEXTS } from '../../constants/strings';
import { FONT_FAMILY } from '../../theme/fonts';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useOrientation } from '../../utils/useOrientation';
import { useNetworkStatus } from '../../utils/checkNetwork';
import NoData from '../../components/common/NoData';
import { MyScheduleItemView } from './MyScheduleItemView';
import { fontSize, height } from '../../utils/helper/dimensions';
import { DatePickerInput } from '../../components/common/DatePickerInput';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Zustand store for schedule state management
interface ScheduleStore {
  schedules: ScheduleModel[];
  startDate: string;
  endDate: string;
  setSchedules: (schedules: ScheduleModel[]) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  clearFilters: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  schedules: [],
  startDate: '',
  endDate: '',
  setSchedules: (schedules) => set({ schedules }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  clearFilters: () =>
    set({
      startDate: formatDate(new Date().toISOString(), 'MM/DD/YYYY'),
      endDate: formatDate(new Date().toISOString(), 'MM/DD/YYYY'),
    }),
}));

type MyScheduleScreenProps = NativeStackScreenProps<RootStackParamList, 'MyScheduleScreen'>;

const MyScheduleScreen: React.FC<MyScheduleScreenProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { schedules, startDate, endDate, setStartDate, setEndDate, setSchedules } =
    useScheduleStore();
  const paramData = route.params?.param || 'All';

  useEffect(() => {
    if (isFocused) {
      setSchedules([]);
      const today = convertDate(new Date().toISOString());
      setStartDate(today);
      setEndDate(today);

      // Fetch using the new dates
      fetchSchedules(today, today);
    }
  }, [isFocused, isNetworkAvailable, navigation]);

  const fetchSchedules = async (start: string, end: string) => {
    if (!isNetworkAvailable) {
      ToastService.show('Internet required for My Schedule', COLORS.ERROR);
      navigation.goBack();
      return;
    }
    setLoading(true);
    setSchedules([]);

    const result = await ScheduleService.fetchSchedules(
      paramData === 'All' ? start : convertDate(new Date().toISOString()),
      paramData === 'All' ? end : convertDate(new Date().toISOString()),
      setLoading,
      isNetworkAvailable,
    );
    console.log('Fetched schedules:', result);

    setSchedules(result);
    setLoading(false);
  };
  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <ScreenWrapper
        title={TEXTS.subScreens.schedule.heading}
        onBackPress={() => {
          setStartDate('');
          setEndDate('');
          setSchedules([]);
          navigation.goBack();
        }}
      >
        <View style={{ flex: 1 }}>
          {paramData === 'All' && (
            <View style={styles.filterContainer}>
              <View style={styles.inputContainer}>
                <DatePickerInput
                  label={TEXTS.subScreens.schedule.startDateLabel}
                  value={startDate}
                  onChange={(pickDate) => {
                    const formattedDate = convertDate(pickDate.toISOString());
                    setStartDate(formattedDate);
                    if (pickDate > new Date(convertDateToISO(endDate))) {
                      setEndDate(formattedDate);
                    }
                  }}
                />
              </View>
              <View style={[styles.inputContainer, { marginLeft: 10 }]}>
                <DatePickerInput
                  label={TEXTS.subScreens.schedule.endDateLabel}
                  value={endDate}
                  onChange={(pickDate) => {
                    setEndDate(convertDate(pickDate.toISOString()));
                  }}
                  minimumDate={new Date(convertDateToISO(startDate))}
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => {
                  fetchSchedules(startDate, endDate);
                }}
              >
                <Icon name="magnify" size={32} color={COLORS.BLUE_COLOR} />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <FlatList
              data={schedules}
              renderItem={({ item }) => (
                <MyScheduleItemView
                  rowData={item}
                  orientation={orientation}
                  navigation={navigation}
                />
              )}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <NoData
                  containerStyle={{
                    marginTop: orientation === 'PORTRAIT' ? '36%' : '13%',
                  }}
                />
              }
            />
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
  },
  filterButton: {
    marginLeft: 5,
    marginBottom: height(0.012),
    //borderRadius: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default MyScheduleScreen;
