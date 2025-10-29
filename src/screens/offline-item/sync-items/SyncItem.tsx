import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BaseScrollView, DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { useOrientation } from '../../../utils/useOrientation';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { height } from '../../../utils/helper/dimensions';
import SyncItemView from './SyncItemView';
import Loader from '../../../components/common/Loader';
import NoData from '../../../components/common/NoData';
import { fetchAllCasesFromDB } from '../../../database/my-case/myCaseDAO';

type RootStackParamList = {
  // Define your navigation stack here
};

interface SyncItemData {
  displayText: string;
  caseType: string;
  location: string;
  isEdited: boolean;
  isSync: boolean;
}

interface SyncItemProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const ViewTypes = {
  FULL: 0,
};

const SyncItem: React.FC<SyncItemProps> = ({ navigation }) => {
  const [data, setData] = useState<SyncItemData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingAPI] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const orientation = useOrientation();
  const isFocused = useIsFocused();

  const layoutProvider = useRef(
    new LayoutProvider(
      () => ViewTypes.FULL,
      (type, dim) => {
        dim.width =
          orientation === 'PORTRAIT'
            ? WINDOW_WIDTH - WINDOW_WIDTH * 0.055
            : WINDOW_HEIGHT - WINDOW_WIDTH * 0.055;
        dim.height = height(0.19);
      },
    ),
  ).current;

  const dataProvider = useMemo(
    () => new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(data),
    [data],
  );

  const loadData = useCallback(
    async (more = false) => {
      try {
        if (more) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        const result = await fetchAllCasesFromDB();
        const safeResult = result ? result : [];
        setData(
          more ? [...data, ...(safeResult as SyncItemData[])] : (safeResult as SyncItemData[]),
        );
      } catch (error) {
        console.error('Error loading sync items:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        if (!loaded) setLoaded(true);
      }
    },
    [data, loaded],
  );

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const rowRenderer = useCallback(
    (
      type: string | number,
      data: SyncItemData,
      // index: number,
      // extendedState?: object
    ) => (
      <SyncItemView
        data={data}
        orientation={orientation}
        navigation={navigation}
        isNetConnected={false}
      />
    ),
    [orientation, navigation],
  );

  if (!loaded && isLoading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Loader loading={isLoadingAPI} />
      {data && data.length > 0 ? (
        <RecyclerListView
          style={styles.list}
          layoutProvider={layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={rowRenderer}
          scrollViewProps={{
            refreshControl: (
              <RefreshControl refreshing={loaded && isLoading} onRefresh={() => loadData()} />
            ),
          }}
          renderFooter={() =>
            isLoadingMore ? <ActivityIndicator style={styles.footerLoader} size="large" /> : null
          }
          onEndReached={() => loadData(true)}
          onEndReachedThreshold={1}
          externalScrollView={ExternalScrollView}
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
  },
  list: {
    width: '100%',
  },
  loader: {
    marginTop: '50%',
    alignSelf: 'center',
  },
  footerLoader: {
    margin: 0,
    alignSelf: 'center',
    flex: 1,
  },
});

class ExternalScrollView extends BaseScrollView {
  private _scrollViewRef: any = null;

  scrollTo = (...args: any[]) => {
    if (this._scrollViewRef) {
      this._scrollViewRef.scrollTo(...args);
    }
  };

  render() {
    const { style, ...restProps } = this.props;
    return (
      <ScrollView
        {...restProps}
        style={style as any}
        ref={(scrollView) => {
          this._scrollViewRef = scrollView;
        }}
      />
    );
  }
}

export default SyncItem;
