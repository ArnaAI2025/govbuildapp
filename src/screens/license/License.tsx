import type { FunctionComponent} from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { styles } from './licenseStyles';
import { useNetworkStatus } from '../../utils/checkNetwork';
import { useIsFocused } from '@react-navigation/native';
import { useOrientation } from '../../utils/useOrientation';
import useAuthStore from '../../store/useAuthStore';
import { fetchLicenseService } from './LicenseService';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { TEXTS } from '../../constants/strings';
import { COLORS } from '../../theme/colors';
import InfoCard from '../../components/common/InfoCard';
import NoData from '../../components/common/NoData';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Loader from '../../components/common/Loader';
import { ListHeader } from '../../components/filters/CaseLicenseFilterHeader';
import type { LicenseData } from '../../utils/interfaces/zustand/ILicense';
import { goBack, navigate } from '../../navigation/Index';
import { useLicenseStore } from '../../store/useLicenseStore';
import { getNavigationState, getUserRole, saveNavigationState } from '../../session/SessionManager';
import { normalizeBool } from '../../utils/helper/helpers';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

type Props = Record<string, never>;
const LicenseScreen: FunctionComponent<Props> = () => {
  const { isNetworkAvailable } = useNetworkStatus();
  const flatListRef = useRef<FlatList<LicenseData>>(null);
  const isFocused = useIsFocused();
  const skipLoaderRef = useRef(false);
  const orientation = useOrientation();
  const authData = useAuthStore((state) => state.authData);
  const userID = authData?.adminRole?.teamMember?.userId;
  const [isSearching, setIsSearching] = useState(false);

  const {
    licenseData,
    filters,
    pageNo,
    isLoading,
    allowEditLicense,
    isFetchingMore,
    openFilter,
    hasMoreData,

    setFilters,
    setPageNo,
    setOnline,
    setLicenseData,
    resetFilters,
    setLoading,
    setAllowEditLicense,
    setMyLicenseOnly,
    setSelectedTeamMember,
    setIsFetchingMore,
    setOpenFilter,
    setHasMoreData,
  } = useLicenseStore();

  useEffect(() => {
    setOnline(isNetworkAvailable);
  }, [isNetworkAvailable]);

  const loadData = async (shouldResetFilters = false) => {
    skipLoaderRef.current = false;
    setPageNo(1);
    setHasMoreData(true);

    if (shouldResetFilters) {
      setFilters({
        teamMember: { userId: filters.isMyLicenseOnly ? '' : getUserRole() },
      });
    }

    await LicenseApiCall(true);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    saveNavigationState(false);
  };

  useEffect(() => {
    // Initial load
    (async () => {
      const state = getNavigationState();
      if (!state) {
        await loadData(true);
      } else {
        saveNavigationState(false);
      }
    })();
  }, []);

  // Handle re-focus
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
    LicenseApiCall(true);
  }, [filters]);

  const sortByModifiedDate = (data: any[] = []) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a?.modifiedUtc ?? 0).getTime() || 0;
      const dateB = new Date(b?.modifiedUtc ?? 0).getTime() || 0;
      return dateB - dateA;
    });
  };
  const LicenseApiCall = useCallback(
    async (resetPage = false) => {
      if (!hasMoreData && !resetPage) return;
      const isSearch = !!filters.search;
      if (!skipLoaderRef.current && resetPage) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      try {
        const currentPage = resetPage ? 1 : pageNo;
        if (!isNetworkAvailable) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
        const {
          licenseData: newLicenseData,
          isMyLicenseOnly,
          isAllowEditLicense,
          selectedTeamMember,
        } = await fetchLicenseService(filters, currentPage, isSearch, isNetworkAvailable, userID);
        if (currentPage === 1) {
          // setLicenseData(newLicenseData);
          setLicenseData(sortByModifiedDate(newLicenseData));
        } else {
          const mergedData = [...licenseData, ...newLicenseData];
          setLicenseData(sortByModifiedDate(mergedData));
        }
        setMyLicenseOnly(isMyLicenseOnly);
        setAllowEditLicense(isAllowEditLicense);
        setSelectedTeamMember(selectedTeamMember);
        // Only increment if more data received
        if (newLicenseData?.length > 0) {
          setPageNo(currentPage + 1);
        } else {
          setHasMoreData(false);
        }
      } catch (error) {
        recordCrashlyticsError('Error loading license --->', error);
        console.error('Error loading license --->', error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
        setIsSearching(false);
        skipLoaderRef.current = false;
      }
    },
    [
      licenseData,
      filters,
      pageNo,
      setLicenseData,
      setLoading,
      setPageNo,
      setMyLicenseOnly,
      setAllowEditLicense,
      setSelectedTeamMember,
      setIsFetchingMore,
      setHasMoreData,
      userID,
      isNetworkAvailable,
    ],
  );

  // Toggle show all license
  const handleToggleShowAll = useCallback(
    (value: boolean) => {
      setPageNo(1);
      setFilters({
        ...filters,
        isMyLicenseOnly: value,
        teamMember: value ? { userId: '' } : { userId: getUserRole() },
      });
      if (value) resetFilters(false);
    },
    [setFilters],
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
          });
        }
      }, 250); // delay in ms
    },
    [filters, setFilters, setPageNo],
  );

  const applyFilters = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      setOpenFilter(false);
      setPageNo(1);
    },
    [setFilters, setPageNo],
  );

  const handleCardPress = (item: LicenseData) => {
    if (!allowEditLicense) {
      ToastService.show(TEXTS.alertMessages.dontHaveAction, COLORS.ORANGE);
      return;
    }
    const isEditable = normalizeBool(item?.isEditable);
    const isAssigned = item.assignedUsers?.includes(userID);
    if (isEditable && !item.viewOnlyAssignUsers) {
      navigate('EditLicenseScreen', {
        contentItemId: item?.contentItemId,
        licenseData: item,
      });
    } else if (isEditable && item.viewOnlyAssignUsers && isAssigned) {
      navigate('EditLicenseScreen', {
        contentItemId: item?.contentItemId,
        licenseData: item,
      });
    } else {
      Alert.alert('Access Restricted', TEXTS.alertMessages.privateLicenseMsg);
    }
  };

  const renderLicenseCard = ({ item }: { item: LicenseData }) => (
    <InfoCard
      cardType="license"
      item={item}
      onPress={() => {
        handleCardPress(item);
      }}
      orientation={orientation}
    />
  );

  const renderEmptyComponent = () =>
    !isLoading ? (
      <NoData
        message={TEXTS.license.noLicensemsg}
        containerStyle={{ marginTop: orientation === 'PORTRAIT' ? '36%' : '13%' }}
      />
    ) : null;

  const renderFooterLoader = () =>
    isFetchingMore ? (
      <View style={{ paddingVertical: '15%' }}>
        <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
      </View>
    ) : null;

  return (
    <ScreenWrapper
      title={TEXTS.license?.license}
      onBackPress={() => {
        resetFilters(true);
        setPageNo(1);
        goBack();
      }}
    >
      <Loader loading={isLoading} />
      <View style={styles.container}>
        <ListHeader
          filters={filters}
          isNetworkAvailable={isNetworkAvailable}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          onToggleShowAll={handleToggleShowAll}
          onApplyFilters={applyFilters}
          onSearch={handleSearch}
          orientation={orientation}
          headerType="License"
        />
        <View style={styles.listContainer}>
          {isSearching ? (
            <View style={{ paddingVertical: '10%' }}>
              <Loader loading={isSearching} overlayMode={false} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={licenseData}
              keyExtractor={(item, index) =>
                item?.contentItemId ? String(item.contentItemId) : `license-${index}`
              }
              renderItem={renderLicenseCard}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={renderFooterLoader}
              onEndReached={() => {
                if (!isFetchingMore && !isLoading && hasMoreData) {
                  LicenseApiCall(false);
                }
              }}
              onEndReachedThreshold={0.5}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default LicenseScreen;
