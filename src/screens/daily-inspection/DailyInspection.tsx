import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../../navigation/Types';
import { useOrientation } from '../../utils/useOrientation';
import { useDailyInspectionStore } from '../../store/useDailyInspectionStore';
import { DailyInspectionModel } from '../../utils/interfaces/ISubScreens';
import { DailyInspectionService } from './DailyInspectionService';
import { TEXTS } from '../../constants/strings';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import IMAGES from '../../theme/images';
import { fontSize, height, iconSize, width } from '../../utils/helper/dimensions';
import DraggableFlatList from 'react-native-draggable-flatlist';
import DailyInspectionListItem from './components/DailyInspectionListItem';
import NoData from '../../components/common/NoData';
import { COLORS } from '../../theme/colors';
import DatePicker from '../../utils/helper/DateRangePicker';
import { formatDate } from '../../utils/helper/helpers';
import FloatingInput from '../../components/common/FloatingInput';
import CustomDropdown from '../../components/common/CustomDropdown';
import { getLoggedInUserId } from '../../session/SessionManager';
import { AdvanceFilterDialog } from './components/AdvanceFilterDialog';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import useNetworkStore from '../../store/networkStore';
import { goBack } from '../../navigation/Index';
import AllInspectionDialog from './components/AllInspectionDialog';
import { ToastService } from '../../components/common/GlobalSnackbar';
import PublishButton from '../../components/common/PublishButton';

type DailyInspectionScreenProps = NativeStackScreenProps<RootStackParamList, 'DailyInspection'>;
const ITEMS_PER_PAGE = 10;
const DailyInspection: React.FC<DailyInspectionScreenProps> = ({ navigation }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const {
    data,
    fullData,
    isLoadingAPI,
    filterDate,
    endDate,
    selectedTeamMember,
    teamMembers,
    filterCount,
    advanceFilter,
    isIncomplete,
    noInspectorAssigned,
    isAllowInspectorDragDrop,
    isAllowOwnInspector,
    isSameInspector,
    isShowStatus,
    caseOrLicenseNumber,
    caseOrLicenseType,
    onDragEnd,
    isCreateRoute,
    createRouteList,
    isInspectionUpdated,
    setData,
    setFullData,
    setAllData,
    setLoading,
    setFilterDate,
    setEndDate,
    setSelectedTeamMember,
    setTeamMembers,
    setSelectedTeam,
    setFilterCount,
    setAdvanceFilter,
    setIsAllowInspectorDragDrop,
    setIsAllowOwnInspector,
    setIsSameInspector,
    setShowStatus,
    setCaseOrLicenseNumber,
    setCaseOrLicenseType,
    setOnDragEnd,
    setIsCreateRoute,
    setSelectedInspectionType,
    setSelectedStatus,
    setSelectedCaseType,
    setSelectedCaseTypeCategory,
    setSelectedLicenseType,
    setSelectedLicenseTypeCategory,
    setIsIncomplete,
    setNoInspectorAssigned,
    setCreateRouteList,
    setIsInspectionUpdated,
  } = useDailyInspectionStore();

  const { isNetworkAvailable } = useNetworkStore();
  const [showDatePickerRange, setShowDatePickerRange] = useState(false);
  const [openAdvanceFilter, setOpenAdvanceFilter] = useState(false);
  const [showInspectionDialog, setShowInspectionDialog] = useState(false);
  const [checked, setChecked] = useState<DailyInspectionModel[]>([]);
  const [userId, setUserId] = useState('');
  const [showFilterSearch, setShowFilterSearch] = useState<boolean>(true);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibleData, setVisibleData] = useState<DailyInspectionModel[]>([]); // New state for visible records
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE); // Tracks number of visible records
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasNotch = DeviceInfo.hasNotch();
  const [teamFilterDisable] = useState(false);
  const isFilterApplied = isNetworkAvailable
    ? (selectedTeamMember?.id !== '' && selectedTeamMember?.id !== undefined) ||
      (filterDate !== '' && filterDate !== undefined) ||
      (endDate !== '' && endDate !== undefined) ||
      filterCount > 0
    : selectedTeamMember?.id !== '' && selectedTeamMember?.id !== undefined;

  useEffect(() => {
    if (isInspectionUpdated) {
      fetchInspections(selectedTeamMember?.id);
    }
  }, [isFocused, isNetworkAvailable]);

  const resetFilters = () => {
    setSelectedTeamMember({ id: '', displayText: '' });
    setSelectedTeam([]);
    setFilterDate(new Date().toISOString());
    setEndDate(new Date().toISOString());
    setAdvanceFilter({
      inspectorBy: userId,
      type: '',
      status: '',
      caseType: '',
      licenseType: '',
      caseTypeCategory: '',
      licenseTypeCategory: '',
    });
    setSelectedInspectionType([]);
    setSelectedStatus([]);
    setSelectedCaseType([]);
    setSelectedCaseTypeCategory([]);
    setSelectedLicenseType([]);
    setSelectedLicenseTypeCategory([]);
    setIsIncomplete(false);
    setNoInspectorAssigned(false);
    setFilterCount(0);
    setData([]);
    setFullData([]);
    setAllData([]);
    setVisibleData([]); // Reset visible data
    setVisibleCount(ITEMS_PER_PAGE); //
    setOnDragEnd(false);
    const defaultTeamMember = teamMembers.find((member) => member.id === userId) || {
      id: '',
      displayText: '',
    };
    setSelectedTeamMember(defaultTeamMember);
    setIsSameInspector(defaultTeamMember.id === userId);
    setSelectedTeam(defaultTeamMember.id ? [defaultTeamMember] : []);
  };
  const hardResetFilters = () => {
    setSelectedTeamMember({ id: '', displayText: '' });
    setSelectedTeam([]);
    setFilterDate(new Date().toISOString());
    setEndDate(new Date().toISOString());
    setAdvanceFilter({
      inspectorBy: '',
      type: '',
      status: '',
      caseType: '',
      licenseType: '',
      caseTypeCategory: '',
      licenseTypeCategory: '',
    });
    setSelectedInspectionType([]);
    setSelectedStatus([]);
    setSelectedCaseType([]);
    setSelectedCaseTypeCategory([]);
    setSelectedLicenseType([]);
    setSelectedLicenseTypeCategory([]);
    setIsIncomplete(false);
    setNoInspectorAssigned(false);
    setFilterCount(0);
    setData([]);
    setFullData([]);
    setAllData([]);
    setVisibleData([]); // Reset visible data
    setVisibleCount(ITEMS_PER_PAGE); //
    setOnDragEnd(false);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const userId = getLoggedInUserId();
        setUserId(userId);

        // Fetch team members
        const teamMembers = await DailyInspectionService.fetchTeamMembers(
          setLoading,
          isNetworkAvailable,
        );
        setTeamMembers(teamMembers);

        const defaultTeamMember = teamMembers.find((member) => member.id === userId) || {
          id: '',
          displayText: '',
        };
        if (!selectedTeamMember?.id) {
          setSelectedTeamMember(defaultTeamMember);
          setIsSameInspector(defaultTeamMember.id === userId);
          setAdvanceFilter((prev) => ({
            ...prev,
            inspectorBy: defaultTeamMember.id,
          }));
          setSelectedTeam(defaultTeamMember.id ? [defaultTeamMember] : []);
          setFilterCount(1);
        }

        await fetchInspections(selectedTeamMember?.id || userId);
      } catch (error) {
        console.error('Error in initialize:', error);
      }
    };
    initialize();
  }, [isNetworkAvailable]);

  const fetchInspections = async (
    teamMemberId: string = '',
    startDate: string = filterDate,
    endDateValue: string = endDate,
  ) => {
    try {
      setOnDragEnd(false);
      setIsInspectionUpdated(false);
      setLoading(true);
      const inspectorId = teamMemberId;
      const result = await DailyInspectionService.fetchInspections(
        startDate,
        endDateValue,
        advanceFilter,
        noInspectorAssigned,
        isNetworkAvailable,
        inspectorId,
      );

      const processedData = isIncomplete
        ? DailyInspectionService.filterIncompleteStatus(result.data)
        : result.data;
      setData(isNetworkAvailable ? processedData : result.data);
      setFullData(result.data);
      setAllData(result.data);
      setVisibleData(processedData.slice(0, ITEMS_PER_PAGE));
      setVisibleCount(ITEMS_PER_PAGE);
      setIsAllowInspectorDragDrop(result.isAllowInspectorDragDrop);
      setIsAllowOwnInspector(result.isAllowOwnInspector);
      setShowStatus(result.isShowStatus);
      setCaseOrLicenseNumber(result.isShowCaseOrLicenseNumber);
      setCaseOrLicenseType(result.isShowCaseOrLicenseType);
      setIsCreateRoute(DailyInspectionService.checkLocationForRouteCreate(result.data));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    const contentItemIds = fullData?.map((item) => item?.contentItemId);
    const success = await DailyInspectionService.updateOrder(
      contentItemIds,
      setLoading,
      isNetworkAvailable,
    );
    if (success) {
      await fetchInspections(advanceFilter?.inspectorBy);
    }
  };
  const handleLoadMore = useCallback(() => {
    if (visibleCount >= data.length || isLoadingMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextCount = Math.min(visibleCount + ITEMS_PER_PAGE, data.length);
      setVisibleData(data.slice(0, nextCount));
      setVisibleCount(nextCount);
      setIsLoadingMore(false);
    }, 500);
  }, [visibleCount, data, isLoadingMore]);

  const redirectDefaultMap = () => {
    setMenuVisible(false);
    const routeList: DailyInspectionModel[] = [];
    let baseUrl =
      Platform.OS === 'ios'
        ? 'http://maps.apple.com/maps?saddr=Current+Location&daddr='
        : 'https://www.google.com/maps/dir/?api=1&origin=Current+Location';

    const seen = new Set();
    let waypoints: string[] = [];
    let destination: string | null = null;

    for (let i = 0; i < fullData?.length; i++) {
      const object = fullData[i];
      if (object?.location) {
        try {
          const location = JSON.parse(object?.location);
          let point = null;

          if (location?.Address && location.Address.trim() !== '') {
            point = encodeURIComponent(location.Address.trim());
          } else if (
            location?.Latitude &&
            location?.Longitude &&
            location?.Latitude !== '' &&
            location?.Longitude !== ''
          ) {
            const lat = parseFloat(location.Latitude);
            const long = parseFloat(location.Longitude);
            if (!isNaN(lat) && !isNaN(long) && lat !== 0 && long !== 0) {
              point = `${lat},${long}`;
            }
          }

          if (point) {
            if (!seen.has(point)) {
              seen.add(point);
              routeList.push(object);
              setCreateRouteList(routeList);
              if (!destination) {
                destination = point; // first valid point = destination
              } else {
                waypoints.push(point); // rest are waypoints
              }
            }
          }
        } catch (error) {
          console.warn('Invalid JSON location:', object?.location, error);
        }
      }
    }

    if (routeList.length > 15) {
      setChecked([]);
      setShowInspectionDialog(true);
    } else {
      if (Platform.OS === 'ios') {
        let appleUrl = baseUrl + [destination, ...waypoints].join('+to:');
        Linking.openURL(appleUrl);
      } else {
        let googleUrl =
          baseUrl +
          `&destination=${destination}&waypoints=${waypoints.join('|')}&travelmode=driving`;
        Linking.openURL(googleUrl);
      }
    }
  };

  const onConfirmRange = async (output: any) => {
    setShowDatePickerRange(false);
    const start = formatDate(output?.startDate);
    const end = formatDate(output?.endDate);
    setFilterDate(start);
    setEndDate(end);
    setTimeout(() => {
      fetchInspections(advanceFilter?.inspectorBy, start, end);
    }, 500);
  };

  const handleCaseByCID = (caseId: string, type: string, flag: number, inspectionId?: string) => {
    DailyInspectionService.getCaseByCID(
      caseId,
      type,
      flag,
      setLoading,
      navigation,
      inspectionId,
      isNetworkAvailable,
    );
  };

  const onCancelRange = () => {
    setShowDatePickerRange(false);
  };

  const renderFooterLoader = () => (
    <View style={{ paddingVertical: '15%' }}>
      <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
    </View>
  );

  return (
    <ScreenWrapper
      title={TEXTS.subScreens.dailyInspection.heading}
      onBackPress={() => {
        hardResetFilters();
        goBack();
      }}
    >
      <Loader loading={isLoadingAPI} />

      <AllInspectionDialog
        setShowInspectionDialog={setShowInspectionDialog}
        showInspectionDialog={showInspectionDialog}
        inspectionList={createRouteList}
        checked={checked}
        setChecked={setChecked}
      />
      <DatePicker
        language="en"
        modalStyles={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        isVisible={showDatePickerRange}
        mode={'range'}
        onCancel={onCancelRange}
        onConfirm={onConfirmRange}
        colorOptions={{
          selectedDateBackgroundColor: COLORS.APP_COLOR,
          headerColor: COLORS.APP_COLOR,
          weekDaysColor: COLORS.APP_COLOR,
          confirmButtonColor: COLORS.APP_COLOR,
          headerTextColor: COLORS.WHITE,
        }}
      />
      <AdvanceFilterDialog
        openAdvanceFilter={openAdvanceFilter}
        setOpenAdvanceFilter={setOpenAdvanceFilter}
        fetchInspections={() => fetchInspections(advanceFilter.inspectorBy)}
        resetFilters={resetFilters}
      />

      <View
        style={[
          styles.headerContainer,
          {
            marginTop:
              orientation === 'PORTRAIT'
                ? hasNotch
                  ? height(-0.056)
                  : Platform.OS == 'ios'
                    ? height(-0.049)
                    : height(-0.065)
                : height(-0.054),
          },
        ]}
      >
        {isNetworkAvailable ? (
          <TouchableOpacity
            onPress={() => setOpenAdvanceFilter(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <View style={styles.filterIconContainer}>
              <Image source={IMAGES.FILTER_ICON} style={styles.icon} />
              {filterCount > 0 && <View style={styles.filterBadge} />}
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowFilterSearch(!showFilterSearch)}>
            <View
              style={{
                alignItems: 'center',
                marginTop: height(0.002),
              }}
            >
              <Icon
                name={showFilterSearch ? 'filter-off' : 'filter'}
                size={26}
                color={COLORS.APP_COLOR}
              />
              {isFilterApplied && <View style={styles.filterBadge} />}
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {isNetworkAvailable && (
          <>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setShowFilterSearch(!showFilterSearch)}>
                <View
                  style={{
                    alignItems: 'center',
                    marginRight: width(0.03),
                  }}
                >
                  <Icon
                    name={showFilterSearch ? 'filter-off' : 'filter'}
                    size={24}
                    color={COLORS.APP_COLOR}
                  />
                  {isFilterApplied && <View style={styles.filterBadge} />}
                </View>
              </TouchableOpacity>
            </View>

            {data.length > 0 && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(true);
                    }}
                  >
                    <Icon name="dots-vertical" size={24} color={COLORS.APP_COLOR} />
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: 8,
                }}
              >
                {isCreateRoute && (
                  <Menu.Item
                    leadingIcon="transit-connection-variant"
                    onPress={redirectDefaultMap}
                    title="Create Route"
                  />
                )}
                {isNetworkAvailable && (
                  <Menu.Item
                    leadingIcon="tray-arrow-down"
                    onPress={() =>
                      DailyInspectionService.downloadCSV(
                        filterDate,
                        endDate,
                        selectedTeamMember?.id || '',
                        isNetworkAvailable,
                      ).then(() => {
                        ToastService.show('Data exported successfully', COLORS.SUCCESS_GREEN);
                        setMenuVisible(false);
                      })
                    }
                    title="Download CSV"
                  />
                )}
              </Menu>
            )}
          </>
        )}
      </View>
      {showFilterSearch && (
        <View style={styles.filterSearchContainer}>
          <View style={styles.dropdownContainer}>
            {isNetworkAvailable && (
              <TouchableOpacity onPress={() => setShowDatePickerRange(true)}>
                <FloatingInput
                  label={'Date range'}
                  value={TEXTS.subScreens.dailyInspection.dateRangePlaceholder(filterDate, endDate)}
                  numberOfLines={1}
                  onChangeText={() => {}}
                  keyboardType="default"
                  customRightIcon={IMAGES.CALENDER_ICON}
                  onIconPress={() => setShowDatePickerRange(true)}
                  pointerEvents="none"
                  editable={false}
                />
              </TouchableOpacity>
            )}
          </View>
          <View>
            <CustomDropdown
              placeholder={TEXTS.subScreens.dailyInspection.chooseInspector}
              label={TEXTS.subScreens.dailyInspection.chooseInspector}
              disabled={
                teamFilterDisable || noInspectorAssigned || advanceFilter.inspectorBy?.includes(',')
              }
              labelField={'displayText'}
              valueField={'id'}
              data={[{ id: '', displayText: 'Filter by Inspector' }, ...teamMembers]}
              //  showClearIcon={false}

              //  showClearIcon={false}

              onChange={(selectedValue) => {
                const newTeamMember = selectedValue?.value;
                setSelectedTeamMember(newTeamMember);
                setIsSameInspector(newTeamMember?.id === userId);
                setAdvanceFilter({
                  ...advanceFilter,
                  inspectorBy: newTeamMember?.id,
                });
                setSelectedTeam(newTeamMember?.id ? [newTeamMember] : []);
                fetchInspections(newTeamMember?.id);
              }}
              value={selectedTeamMember?.id || ''}
            />
          </View>
        </View>
      )}
      {onDragEnd && (
        <View style={{ alignItems: 'flex-end' }}>
          <PublishButton
            buttonStyle={{ width: width(0.25), height: height(0.04) }}
            textName={TEXTS.subScreens.dailyInspection.updateOrder}
            onPress={handleUpdateOrder}
            textStyle={{ fontSize: fontSize(0.025) }}
          />
        </View>
      )}
      <View style={{ flex: 1 }}>
        {isAllowInspectorDragDrop || (isAllowOwnInspector && isSameInspector) ? (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <DraggableFlatList
              showsVerticalScrollIndicator={false}
              activationDistance={8}
              data={visibleData}
              keyExtractor={(item, index) => `${item?.contentItemId}-${index}`}
              renderItem={({ item, drag, isActive }) => (
                <View
                  style={{
                    backgroundColor: isActive ? '#f0f0f0' : '#fff',
                  }}
                >
                  <DailyInspectionListItem
                    rowData={item}
                    getCaseByCID={handleCaseByCID}
                    drag={drag}
                    isDraggable={true}
                    isOnline={isNetworkAvailable}
                    isShowStatus={isShowStatus}
                    caseOrLicenseNumber={caseOrLicenseNumber}
                    caseOrLicenseType={caseOrLicenseType}
                    orientation={orientation}
                  />
                </View>
              )}
              onDragEnd={({ data }) => {
                setOnDragEnd(true);
                setVisibleData(data); // Update visibleData
                setData(data); // Update full dataset
                setFullData(data);
              }}
              contentContainerStyle={{
                paddingBottom: showFilterSearch ? height(0.02) : height(0.02),
              }}
              ListEmptyComponent={
                <NoData
                  containerStyle={{
                    marginTop:
                      orientation === 'PORTRAIT'
                        ? showFilterSearch
                          ? '20%'
                          : '36%'
                        : showFilterSearch
                          ? ''
                          : '13%',
                  }}
                />
              }
              ListFooterComponent={
                isLoadingMore && visibleCount < data.length ? renderFooterLoader() : null
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              initialNumToRender={ITEMS_PER_PAGE}
              maxToRenderPerBatch={ITEMS_PER_PAGE}
            />
          </GestureHandlerRootView>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={visibleData}
            contentContainerStyle={{
              paddingBottom: showFilterSearch ? height(0.02) : height(0.02),
            }}
            renderItem={({ item }) => (
              <DailyInspectionListItem
                rowData={item}
                getCaseByCID={handleCaseByCID}
                drag={() => {}}
                isDraggable={false}
                isOnline={isNetworkAvailable}
                isShowStatus={isShowStatus}
                caseOrLicenseNumber={caseOrLicenseNumber}
                caseOrLicenseType={caseOrLicenseType}
                orientation={orientation}
              />
            )}
            keyExtractor={(item, index) => `${item?.contentItemId}-${index}`}
            ListEmptyComponent={
              <NoData
                containerStyle={{
                  marginTop:
                    orientation === 'PORTRAIT'
                      ? showFilterSearch
                        ? '20%'
                        : '35%'
                      : showFilterSearch
                        ? ''
                        : '10%',
                }}
              />
            }
            ListFooterComponent={
              isLoadingMore && visibleCount < data.length ? renderFooterLoader() : null
            }
            onEndReached={handleLoadMore}
            initialNumToRender={ITEMS_PER_PAGE}
            maxToRenderPerBatch={ITEMS_PER_PAGE}
            removeClippedSubviews={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  iconStyle: {
    width: iconSize(0.022),
    height: iconSize(0.022),
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.026),
  },
  pickerViewStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY_HEADING,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: COLORS.WHITE,
    maxHeight: height(0.05),
    minHeight: height(0.05),
  },
  datePicker: {
    height: height(0.05),
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.GRAY_HEADING,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: height(0.005),
  },
  button: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabIcon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    tintColor: COLORS.WHITE,
  },
  filterSearchContainer: {
    flexDirection: 'column',
    marginBottom: height(0.012),
  },
  dropdownContainer: {
    marginBottom: height(0.012),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: height(0.025),
    paddingHorizontal: 10,
    width: '50%',
  },
  filterButton: {
    height: height(0.035),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.RED,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: COLORS.APP_COLOR,
  },
});

export default DailyInspection;
