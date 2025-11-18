import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/Types';
import { useNetworkStatus } from '../../utils/checkNetwork';
import type { FormStatus, SubmissionModel } from '../../utils/interfaces/ISubScreens';
import { FormSubmissionService } from './FormSubmissionService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { TEXTS } from '../../constants/strings';
import { COLORS } from '../../theme/colors';
import NoData from '../../components/common/NoData';
import { AdvanceFormSubmissionListItem } from './AdvanceFormSubmissionListItem';
import { fontSize, height } from '../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../theme/fonts';
import { useOrientation } from '../../utils/useOrientation';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDropdown from '../../components/common/CustomDropdown';
import FloatingInput from '../../components/common/FloatingInput';
import IMAGES from '../../theme/images';
import Loader from '../../components/common/Loader';
import SwitchToggle from 'react-native-switch-toggle';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

type AdvanceFormSubmissionProps = NativeStackScreenProps<
  RootStackParamList,
  'AdvanceFormSubmission'
>;

const AdvanceFormSubmission: React.FC<AdvanceFormSubmissionProps> = ({}) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const isFocused = useIsFocused();
  const pageNoRef = useRef(1);
  const orientation = useOrientation();
  const hasNotch = DeviceInfo.hasNotch();
  const onEndReachedCalledDuringMomentum = useRef(false);

  const [formStatusList, setFormStatusList] = useState<FormStatus[]>([
    { id: '', displayText: 'All Advanced Form Status' },
  ]);
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const [, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FormStatus>(formStatusList[0]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showFilterSearch, setShowFilterSearch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [toggleState, setToggleState] = useState<boolean>(false);
  // Fetch form status
  useEffect(() => {
    const fetchFormStatus = async () => {
      const result = await FormSubmissionService.fetchFormStatus(isNetworkAvailable);
      setFormStatusList(result ?? []);
    };
    fetchFormStatus();
  }, [isFocused]);

  const isFilterApplied =
    (selectedStatus?.id !== '' && selectedStatus?.id != undefined) || searchText?.length > 0;

  useEffect(() => {
    if (isFocused && !isFetching.current) {
      setPageNo(1);
      fetchSubmissions(1, true);
    }
  }, [isFocused]);

  const fetchSubmissions = useCallback(
    async (
      page: number,
      reset: boolean = false,
      statusId: string = '',
      search: string = searchText,
    ) => {
      // if (isFetching.current) return;
      // isFetching.current = true;

      if (reset) {
        setIsLoading(true); // First load
        setHasMoreData(true); // Reset pagination
      } else {
        setIsFetchingMore(true); // Bottom loader
      }

      try {
        const result = await FormSubmissionService.fetchSubmissions(
          isNetworkAvailable,
          page,
          search,
          statusId,
          !toggleState,
        );
        if (reset) {
          setSubmissions(result);
          pageNoRef.current = 2;
        } else {
          setSubmissions((prev) => [...prev, ...result]);
          pageNoRef.current = page + 1;
        }

        if (result.length > 0) {
          setPageNo(page + 1);
        } else {
          setHasMoreData(false);
        }
      } catch (error) {
        recordCrashlyticsError('Failed to fetch submissions:', error);
        console.error('Failed to fetch submissions:', error);
      } finally {
        if (reset) {
          setIsLoading(false);
        } else {
          setIsFetchingMore(false);
        }
        isFetching.current = false;
      }
    },
    [toggleState, searchText, selectedStatus?.id],
  );

  // Handle status change
  const handleStatusChange = useCallback(
    (item: { value: FormStatus }) => {
      setSelectedStatus(item.value);
      setPageNo(1);
      fetchSubmissions(1, true, item?.value?.id, searchText);
    },
    [fetchSubmissions, searchText],
  );

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Handle search
  const handleSearch = useCallback(
    (text: string) => {
      setIsLoading(true);
      setSearchText(text);
      setIsSearchActive(!!text);

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      if (text.trim().length === 0) {
        fetchSubmissions(1, true, selectedStatus?.id ?? '', '');
        return;
      }

      searchTimeout.current = setTimeout(() => {
        fetchSubmissions(1, true, selectedStatus?.id ?? '', text);
      }, 500); // Reduced debounce delay for better UX
    },
    [fetchSubmissions, selectedStatus?.id],
  );

  const handleToggleShowAll = useCallback(() => {
    setToggleState((prev) => !prev);
  }, []);

  useEffect(() => {
    setPageNo(1);
    fetchSubmissions(1, true, selectedStatus?.id ?? '', searchText);
  }, [toggleState, fetchSubmissions, selectedStatus?.id, searchText]);

  // Memoized renderItem to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }: { item: SubmissionModel }) => (
      <AdvanceFormSubmissionListItem rowData={item} orientation={orientation} />
    ),
    [orientation],
  );

  const renderFooterLoader = () =>
    isFetchingMore ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      {/* <Loader loading={isLoading} overlayMode={true} /> */}
      <ScreenWrapper title={TEXTS.subScreens.advanceFormSubmission.heading}>
        {isNetworkAvailable && (
          <View
            style={{
              marginTop:
                orientation === 'PORTRAIT'
                  ? hasNotch
                    ? height(-0.056)
                    : Platform.OS == 'ios'
                      ? height(-0.049)
                      : height(-0.065)
                  : height(-0.054),
              alignItems: 'flex-end',
              alignSelf: 'flex-end',
              zIndex: -1,
              marginBottom: height(0.02),
              width: '50%',
            }}
          >
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Show All</Text>
              <SwitchToggle
                switchOn={toggleState}
                onPress={handleToggleShowAll}
                circleColorOff={COLORS.VERY_GRAY_LIGHT}
                circleColorOn={COLORS.WHITE}
                backgroundColorOn={COLORS.APP_COLOR}
                backgroundColorOff={COLORS.GRAY_MEDIUM}
                containerStyle={styles.toggleContainer}
                circleStyle={styles.toggleCircle}
              />
              <TouchableOpacity onPress={() => setShowFilterSearch(!showFilterSearch)}>
                <View style={styles.filterIconContainer}>
                  <Icon
                    name={showFilterSearch ? 'filter-off' : 'filter'}
                    size={30}
                    color={COLORS.APP_COLOR}
                  />
                  {isFilterApplied && <View style={styles.filterBadge} />}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {showFilterSearch && (
          <View style={styles.filterSearchContainer}>
            <CustomDropdown
              data={formStatusList ?? []}
              labelField="displayText"
              valueField="id"
              value={selectedStatus?.id}
              onChange={handleStatusChange}
              label={'Advanced Form Status'}
              placeholder={'All advanced form status'}
              zIndexPriority={3}
            />
            <View>
              <FloatingInput
                label="Search"
                value={searchText ?? ''}
                numberOfLines={1}
                onChangeText={handleSearch}
                placeholder="Please search..."
                keyboardType="default"
                customRightIcon={isSearchActive ? IMAGES.CLOSE_ICON : IMAGES.SEARCH_ICON}
                onIconPress={() => {
                  if (isSearchActive) {
                    setIsSearchActive(false);
                    handleSearch('');
                  }
                }}
              />
            </View>
          </View>
        )}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={{ paddingVertical: '10%' }}>
              <Loader loading={isLoading} overlayMode={false} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={submissions}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!isFetchingMore && !isLoading && hasMoreData) {
                  fetchSubmissions(pageNoRef.current, false, selectedStatus?.id ?? '', searchText);
                  onEndReachedCalledDuringMomentum.current = true;
                }
              }}
              onMomentumScrollBegin={() => {
                onEndReachedCalledDuringMomentum.current = false;
              }}
              // onEndReached={() => {
              //   if (!isFetchingMore && !isLoading && hasMoreData) {
              //     fetchSubmissions(
              //       pageNo,
              //       false,
              //       selectedStatus?.id ?? "",
              //       searchText
              //     );
              //   }
              // }}
              ListFooterComponent={renderFooterLoader}
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
            />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    //  marginBottom: height(0.01),
    // marginRight: height(0.005),
    // gap: 6,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    //marginHorizontal: -5,
  },
  switchLabel: {
    color: COLORS.TEXT_COLOR,
    fontFamily: FONT_FAMILY.MontserratBold,
    fontSize: fontSize(0.025),
    // marginLeft: 10,
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
  filterSearchContainer: {
    paddingHorizontal: 10,
    flexDirection: 'column',
    marginBottom: height(0.012),
    zIndex: 2,
  },
  listContainer: { flex: 1 },
  toggleContainer: {
    width: 45,
    height: 25,
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 10,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});

export default AdvanceFormSubmission;
