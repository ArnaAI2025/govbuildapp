import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import OfflineItemView from './OfflineItemView';
import { useOrientation } from '../../../utils/useOrientation';
import { fetchCasesFromDB } from '../../../database/my-case/myCaseSync';
import { COLORS } from '../../../theme/colors';
import { useUnifiedCaseStore } from '../../../store/caseStore';
import useNetworkStore from '../../../store/networkStore';
import { fetchAllLicenseFromDB } from '../../../database/license/licenseDAO';
import Loader from '../../../components/common/Loader';
import NoData from '../../../components/common/NoData';
import { getCaseByCidData } from '../OfflineSyncService';
import { useIsFocused } from '@react-navigation/native';
import { getNavigationState, saveNavigationState } from '../../../session/SessionManager';

interface ItemData {
  id: string;
  ListType: 'Case' | 'License';
  DisplayText: string;
  Status: string;
  Type: string;
  isForceSync: number;
}

interface AllOfflineViewScreenProps {
  isActive?: boolean;
}

const AllOfflineView: React.FC<AllOfflineViewScreenProps> = ({ isActive }) => {
  const [data, setData] = useState<ItemData[][]>([]);
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { isNetworkAvailable } = useNetworkStore();
  const [btnLoad, setBtnLoad] = useState(false);
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList<any>>(null);
  const { allDataSync, setAllDataSync } = useUnifiedCaseStore.getState();

  useEffect(() => {
    // Effect 1: Runs when isActive changes — no dependency on isFocused
    if (isActive) {
      const navigationState = getNavigationState();
      if (!navigationState) {
        console.log('Fetching offline data (tab became active)');
        fetchOfflineData().then(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
      } else {
        console.log('Navigation state true → skipping fetch');
        saveNavigationState(false);
      }
    } else {
      // Clear list when tab is inactive
      setData([]);
    }
  }, [isActive]); // runs only when tab changes

  useEffect(() => {
    // Effect 2: Runs only when the screen comes into focus
    if (isFocused && isActive) {
      const navigationState = getNavigationState();
      if (!navigationState) {
        console.log('Fetching offline data (screen refocused)');
        fetchOfflineData().then(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
      } else {
        console.log('Navigation state true → no refresh on refocus');
        saveNavigationState(false);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAllDataSync(allDataSync || 0);
      if (allDataSync === 0) {
        clearInterval(timer);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const fetchOfflineData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const caseData = await fetchCasesFromDB();
      const licenseData = await fetchAllLicenseFromDB();

      const caseArray =
        caseData?.map((data: any) => ({
          id: data.contentItemId,
          ListType: 'Case' as const,
          DisplayText: data.displayText,
          Status: data.caseStatus,
          Type: data.caseType,
          isForceSync: data.isForceSync,
          modifiedUtc: data.modifiedUtc,
          createdUtc: data.createdUtc,
        })) || [];

      const licenseArray =
        licenseData?.map((data: any) => ({
          id: data.contentItemId,
          ListType: 'License' as const,
          DisplayText: data.displayText,
          Status: data.licenseStatus,
          Type: data.licenseType,
          isForceSync: data.isForceSync,
          modifiedUtc: data.modifiedUtc,
          createdUtc: data.createdUtc,
        })) || [];

      const combinedArray = [...caseArray, ...licenseArray];
      combinedArray.sort(
        (a, b) => new Date(b.modifiedUtc).getTime() - new Date(a.modifiedUtc).getTime(),
      );
      const itemToSyncData = combinedArray.map((item) => [item]);
      setData(itemToSyncData);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error loading offline data:', error.message);
      } else {
        console.error('Error loading offline data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getCaseByCID = async (caseId: string, type: 'Case' | 'License') => {
    try {
      setBtnLoad(true);
      await getCaseByCidData(caseId, type, isNetworkAvailable);
      setBtnLoad(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching case/license:', error);
    }
  };

  return (
    <View style={[styles.container]}>
      {isLoadingAPI ? (
        <Loader loading={isLoadingAPI} />
      ) : data && data.length > 0 ? (
        <FlatList
          ref={flatListRef}
          style={styles.list}
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OfflineItemView
              data={item}
              orientation={orientation}
              getCaseByCID={getCaseByCID}
              isSyncAllData={allDataSync}
              isOnline={isNetworkAvailable}
              btnLoad={btnLoad}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
    width: '100%',
  },
  footer: {
    borderRadius: 10,
    backgroundColor: COLORS.GRAY_DARK,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  syncingFooter: {
    borderRadius: 10,
    backgroundColor: COLORS.SUCCESS_GREEN,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerText: {
    color: COLORS.WHITE,
  },
});

export default AllOfflineView;
