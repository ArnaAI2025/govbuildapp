import React, { useEffect, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNetworkStatus } from '../../utils/checkNetwork';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { fetchCases } from './CaseService';
import { useUnifiedCaseStore } from '../../store/caseStore';
import { useOrientation } from '../../utils/useOrientation';
import { RootStackParamList } from '../../navigation/Types';
import { CaseData } from '../../utils/interfaces/ICase';
import { styles } from './myCaseStyles';
import { TEXTS } from '../../constants/strings';
import { ListHeader } from '../../components/filters/CaseLicenseFilterHeader';
import NoData from '../../components/common/NoData';
import { COLORS } from '../../theme/colors';
import InfoCard from '../../components/common/InfoCard';
import { getNavigationState, getUserRole, saveNavigationState } from '../../session/SessionManager';
import { goBack, navigate } from '../../navigation/Index';
import { useIsFocused } from '@react-navigation/native';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
type MyCaseScreenProps = NativeStackScreenProps<RootStackParamList, 'MyCaseScreen'>;

const MyCaseScreen: React.FC<MyCaseScreenProps> = (route) => {
  const orientation = useOrientation();
  const skipLoaderRef = useRef(false);
  const isFocused = useIsFocused();
  let screenName = route?.route?.params?.screenName ?? 'myCase';
  const { isNetworkAvailable } = useNetworkStatus();
  const {
    cases,
    filters,
    pageNo,
    isLoading,
    isAllowEditCase,
    setCases,
    setFilters,
    setPageNo,
    setOnline,
    resetFilters,
    setIsLoading,
    setIsAllowEditCase,
  } = useUnifiedCaseStore();
  const [isSearching, setIsSearching] = useState(false);
  const [openFilter, setOpenFilter] = React.useState(false);
  const flatListRef = useRef<FlatList<CaseData>>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Sync network status
  useEffect(() => {
    setOnline(isNetworkAvailable);
  }, [isNetworkAvailable, setOnline]);

  const loadData = async (shouldResetFilters = false) => {
    skipLoaderRef.current = false;
    setPageNo(1);
    setHasMoreData(true);

    if (shouldResetFilters) {
      setFilters({
        teamMember: { userId: filters.isMyCaseOnly ? '' : getUserRole() },
      });
    }

    await loadCases(true);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    saveNavigationState(false);
  };

  useEffect(() => {
    // Initial load (on mount)
    (async () => {
      const state = getNavigationState();
      if (!state) {
        await loadData(true);
      } else {
        saveNavigationState(false);
      }
    })();
  }, []);

  // Refresh when screen gains focus
  useEffect(() => {
    if (isFocused) {
      (async () => {
        const state = getNavigationState();
        if (!state) {
          await loadData();
        } else {
          saveNavigationState(false);
        }
      })();
    }
  }, [isFocused]);

  useEffect(() => {
    setPageNo(1);
    setHasMoreData(true);
    loadCases(true);
  }, [filters]);

  const sortByModifiedDate = (data: any[] = []) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a?.modifiedUtc ?? 0).getTime() || 0;
      const dateB = new Date(b?.modifiedUtc ?? 0).getTime() || 0;
      return dateB - dateA;
    });
  };

  // Load cases with pagination
  const loadCases = useCallback(
    async (resetPage = false) => {
      if (!hasMoreData && !resetPage) return;
      const isSearch = !!filters.search;

      if (!skipLoaderRef.current && resetPage) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const currentPage = resetPage ? 1 : pageNo;
        // If offline -> delay slightly so loader is visible
        if (!isNetworkAvailable) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
        const { cases: newCases, isAllowEditCase: isEdit } = await fetchCases(
          filters,
          currentPage,
          isSearch,
          screenName, /// if the new assigement then show new data
          isNetworkAvailable,
        );
        setIsAllowEditCase(isEdit);

        if (currentPage === 1) {
          // setLicenseData(newLicenseData);
          setCases(sortByModifiedDate(newCases));
        } else {
          const mergedData = [...cases, ...newCases];
          setCases(sortByModifiedDate(mergedData));
        }

        // Only increment if more data received
        if (newCases?.length > 0) {
          setPageNo(currentPage + 1);
        } else {
          setHasMoreData(false); // no more data to load
        }
      } catch (error) {
        recordCrashlyticsError('Error loading cases:', error)
        console.error('Error loading cases:', error);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
        setIsSearching(false);
        skipLoaderRef.current = false;
      }
    },
    [cases, filters, pageNo, isNetworkAvailable, setCases, setIsLoading, setPageNo],
  );
  // Handle search input
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (text: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (text.length >= 3 || text.length === 0) {
          skipLoaderRef.current = true;
          setHasMoreData(true); // <-- Reset for new search
          setIsSearching(true);
          setPageNo(1);
          setFilters({
            ...filters,
            search: text,
            // isMyCaseOnly: filters.isMyCaseOnly,
          }); // Preserve isMyCaseOnly
        }
      }, 250); // delay in wait 250 ms (a quarter of a second)
    },
    [filters, setFilters, setPageNo],
  );
  // Toggle show all cases
  const handleToggleShowAll = useCallback(
    (value: boolean) => {
      setPageNo(1);
      setFilters({
        ...filters,
        isMyCaseOnly: value,
        teamMember: value ? { userId: '' } : { userId: getUserRole() },
      });
      if (value) resetFilters(false);
    },
    [setFilters],
  );

  // Apply filters from dialog
  const applyFilters = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      setOpenFilter(false);
      setPageNo(1);
    },
    [setFilters, setPageNo, isNetworkAvailable],
  );

  const handleCardPress = (item: CaseData) => {
    if (isAllowEditCase) {
      const userId = getUserRole();
      if (item.isEditable && item.viewOnlyAssignUsers == false) {
        navigate('EditCaseScreen', {
          caseId: item.contentItemId ?? '',
          myCaseData: item,
        });
      } else if (
        item.isEditable &&
        item.viewOnlyAssignUsers &&
        item.assignedUsers != null &&
        item.assignedUsers.includes(userId) // Check if the user is part of assigned users
      ) {
        navigate('EditCaseScreen', {
          caseId: item.contentItemId ?? '',
          myCaseData: item,
        });
      } else {
        Alert.alert(
          'Access Restricted',
          'The Case has been marked as Private and you do not have access to it. Please ask a user that has access any questions.',
        );
      }
    } else {
      Alert.alert(TEXTS.alertMessages.accessRestricted, TEXTS.alertMessages.editCasePermission);
    }
  };

  const renderEmptyComponent = () =>
    !isLoading ? (
      <NoData
        message={TEXTS.caseScreen.noCasemsg}
        containerStyle={{ marginTop: orientation === 'PORTRAIT' ? '36%' : '13%' }}
      />
    ) : null;

  const renderFooterLoader = () =>
    isFetchingMore ? (
      <View style={{ paddingVertical: '15%' }}>
        <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
      </View>
    ) : null;

  const renderCaseCard = ({ item }: { item: CaseData }) => (
    <InfoCard
      cardType="case"
      item={item}
      onPress={() => handleCardPress(item)}
      orientation={orientation}
      isNetworkAvailable={isNetworkAvailable}
    />
  );

  return (
    <ScreenWrapper
      title={TEXTS.caseScreen.heading}
      onBackPress={() => {
        resetFilters(true);
        setPageNo(1);
        goBack();
      }}
    >
      <Loader loading={isLoading} />
      <ListHeader
        filters={filters}
        isNetworkAvailable={isNetworkAvailable}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        onToggleShowAll={handleToggleShowAll}
        onApplyFilters={applyFilters}
        onSearch={handleSearch}
        orientation={orientation}
        headerType="Case"
      />
      <View style={styles.listContainer}>
        {isSearching ? (
          <View style={{ paddingVertical: '10%' }}>
            <Loader loading={isSearching} overlayMode={false} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            scrollEnabled
            showsVerticalScrollIndicator={false}
            data={cases}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
            onEndReached={() => {
              if (!isFetchingMore && !isLoading && hasMoreData) {
                loadCases(false);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooterLoader}
            ListEmptyComponent={renderEmptyComponent}
            renderItem={renderCaseCard}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default MyCaseScreen;
