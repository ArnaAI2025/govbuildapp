import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import HistoryItemView from './HistoryItemView';
import NoData from '../../../components/common/NoData';
import { getSyncHistory } from '../../../database/sync-history/syncHistoryDAO';
import Loader from '../../../components/common/Loader';
import { useIsFocused } from '@react-navigation/native';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

interface SyncHistoryRecord {
  type: string;
  itemId: string;
  itemSubId: string;
  itemName: string;
  updateDate: string;
  subTypeTitle: string;
  itemType: string;
  title: string;
}

interface HistoryScreenProps {
  isActive?: boolean;
}
interface SyncHistoryItem {
  itemId: string;
  itemName: string;
  itemSubId?: string;
  itemType: string;
  subTypeTitle?: string;
  title: string;
  type: string;
  updateDate: string;
}
const HistoryScreen: React.FC<HistoryScreenProps> = ({ isActive }) => {
  const [data, setData] = useState<SyncHistoryRecord[]>([]);
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  // const orientation = useOrientation();
  const isFocused = useIsFocused();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const history: SyncHistoryItem[] = await getSyncHistory();

      const historyData = Object.values(
        history.reduce<Record<string, any>>((acc, item) => {
          if (!acc[item.itemId]) {
            acc[item.itemId] = {
              itemId: item.itemId,
              itemName: item.itemName,
              itemType: item.itemType,
              title: item.title,
              type: item.type,
              updateDate: item.updateDate,
              SyncedArea: [],
            };
          }

          // if (item.itemSubId) {
          acc[item.itemId].SyncedArea.push({
            itemSubId: item.itemSubId,
            subTypeTitle: item.subTypeTitle,
            title: item.title,
            type: item.type,
            updateDate: item.updateDate,
          });
          // }

          if (
            new Date(item.updateDate).getTime() > new Date(acc[item.itemId].updateDate).getTime()
          ) {
            acc[item.itemId].updateDate = item.updateDate;
          }

          return acc;
        }, {}),
      );

      const sortedHistory: SyncHistoryItem[] =
        historyData?.sort(
          (a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime(),
        ) || [];

      // console.log('sortedHistory------->>>>',JSON.stringify(sortedHistory));

      setData(sortedHistory);
    } catch (error) {
      recordCrashlyticsError('Error loading sync history:',error)
      console.error('Error loading sync history:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      loadData();
    } else {
      setData([]);
    }
  }, [isActive, loadData, isFocused]);

  return (
    <View style={[styles.container]}>
      <Loader loading={isLoadingAPI} />
      {data && data.length > 0 ? (
        <FlatList
          style={styles.list}
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryItemView data={item} />}
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
    marginBottom: 20,
  },
});

export default HistoryScreen;
