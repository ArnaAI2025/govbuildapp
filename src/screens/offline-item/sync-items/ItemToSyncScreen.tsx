import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useOrientation } from '../../../utils/useOrientation';
import { fetchFormForSyncScreen } from '../../../database/sync-offline-to-server/syncOfflineToServerDAO';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import OfflineSyncItemView from './OfflineSyncItemView';
import NoData from '../../../components/common/NoData';
import { useIsFocused } from '@react-navigation/native';
import { buildCaseArray, buildLicenseArray } from '../OfflineSyncService';
import { normalizeBool } from '../../../utils/helper/helpers';
import { getNavigationState, saveNavigationState, storage } from '../../../session/SessionManager';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

interface ItemData {
  id: string;
  ListType: 'Case' | 'License' | 'Form';
  DisplayText: string;
  Status: string;
  Type: string;
  isForceSync: number;
  isPermission: number;
  modifiedUtc?: string;
}

interface ItemToSyncScreenProps {
  isActive?: boolean;
}

const LAST_SYNC_MODIFIED_KEY = 'LAST_SYNC_MODIFIED_UTC';

const ItemToSyncScreen: React.FC<ItemToSyncScreenProps> = ({ isActive }) => {
  const [data, setData] = useState<ItemData[][]>([]);
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { isNetworkAvailable } = useNetworkStatus();
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList<any>>(null);

  const fetchItemToSyncData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const formData = await fetchFormForSyncScreen();
      const caseArrays = await buildCaseArray();
      const licenseArrays = await buildLicenseArray();

      const formArray = Array.isArray(formData)
        ? formData.map((data: any) => ({
            id: data.localId,
            Owner: data.Owner,
            isPublished: normalizeBool(data?.isDraft) === true ? false : true,
            ListType: 'Form' as const,
            DisplayText: data.DisplayText,
            Status: data.caseStatus,
            Type: data.ContentType === 'AdvancedForm' ? 'Advanced Form' : data.ContentType,
            isForceSync: data.isForceSync,
            isPermission: data?.isPermission,
            modifiedUtc: data?.CreatedUtc,
            SyncedArea: [
              {
                id: data.contentItemId,
                name: 'Form',
                isCase: false,
                parentId: data.contentItemId,
                isForceSync: data.isForceSync ?? 0,
                modifiedUtc: data.CreatedUtc ?? null,
              },
            ],
          }))
        : [];

      const combinedArray = [...caseArrays, ...licenseArrays, ...formArray];

      // Sort by modifiedUtc (latest first)
      combinedArray.sort(
        (a, b) => new Date(b.modifiedUtc).getTime() - new Date(a.modifiedUtc).getTime(),
      );

      // Save latest modified timestamp
      const latestModifiedUtc = combinedArray[0]?.modifiedUtc || null;
      if (latestModifiedUtc) {
        storage.set(LAST_SYNC_MODIFIED_KEY, latestModifiedUtc);
      }

      const itemToSyncData = combinedArray.map((item) => [item]);
      setData(itemToSyncData);
    } catch (error) {
      recordCrashlyticsError('Error loading sync data:', error)
      console.error('Error loading sync data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Helper to get the latest modifiedUtc directly from DB
   */
  const getLatestModifiedUtcFromDB = useCallback(async (): Promise<string | null> => {
    try {
      const formData = await fetchFormForSyncScreen();
      const caseArrays = await buildCaseArray();
      const licenseArrays = await buildLicenseArray();
      const combinedArray = [
        ...caseArrays,
        ...licenseArrays,
        ...(Array.isArray(formData) ? formData : []),
      ];

      combinedArray.sort(
        (a, b) => new Date(b.modifiedUtc).getTime() - new Date(a.modifiedUtc).getTime(),
      );
      return combinedArray[0]?.modifiedUtc || null;
    } catch (error) {
      recordCrashlyticsError('Error checking modifiedUtc:', error)
      console.error('Error checking modifiedUtc:', error);
      return null;
    }
  }, []);

  /**
   * On tab change or screen reactivation
   */
  useEffect(() => {
    if (isActive) {
      (async () => {
        const state = getNavigationState();
        const lastStoredUtc = storage.getString(LAST_SYNC_MODIFIED_KEY);
        const latestDbModifiedUtc = await getLatestModifiedUtcFromDB();

        const hasNewUpdate =
          latestDbModifiedUtc &&
          lastStoredUtc &&
          new Date(latestDbModifiedUtc).getTime() > new Date(lastStoredUtc).getTime();

        if (!state || hasNewUpdate) {
          await fetchItemToSyncData();
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          saveNavigationState(false);
        } else {
          saveNavigationState(false);
        }
      })();
    } else {
      setData([]);
    }
  }, [isActive]);

  /**
   * On focus change (like navigating back)
   */
  useEffect(() => {
    if (isActive && isFocused) {
      (async () => {
        const state = getNavigationState();
        const lastStoredUtc = storage.getString(LAST_SYNC_MODIFIED_KEY);
        const latestDbModifiedUtc = await getLatestModifiedUtcFromDB();

        const hasNewUpdate =
          latestDbModifiedUtc &&
          lastStoredUtc &&
          new Date(latestDbModifiedUtc).getTime() > new Date(lastStoredUtc).getTime();

        if (!state || hasNewUpdate) {
          await fetchItemToSyncData();
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          saveNavigationState(false);
        } else {
          saveNavigationState(false);
        }
      })();
    }
  }, [isFocused]);

  return (
    <View style={[styles.container]}>
      <Loader loading={isLoadingAPI} />
      {data && data.length > 0 ? (
        <FlatList
          ref={flatListRef}
          style={styles.list}
          data={data}
          renderItem={({ item }) => (
            <OfflineSyncItemView
              data={item}
              orientation={orientation}
              loadData={fetchItemToSyncData}
              isLoadingAPI={isLoadingAPI}
              setLoading={setLoading}
              isOnline={isNetworkAvailable}
            />
          )}
          showsVerticalScrollIndicator={false}
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
});

export default ItemToSyncScreen;
