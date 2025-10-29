import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useOrientation } from '../../../utils/useOrientation';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import NoData from '../../../components/common/NoData';
import { ChildParcelListItem } from './ChildParcelListItem';
import { ChildParcelModel } from '../../../utils/interfaces/ISubScreens';
import { useParcelStore } from '../ParcelScreen';
import { ParcelService } from '../ParcelService';

const ChildParcelScreen: React.FC<{
  ParcelNumber: string;
}> = ({ ParcelNumber }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { setChildParcels } = useParcelStore();

  useEffect(() => {
    let isMounted = true;
    const fetchChildParcels = async () => {
      setLoading(true);
      const result = await ParcelService.fetchChildParcels(ParcelNumber, setLoading);
      if (isMounted) {
        setChildParcels(result);
      }
      setLoading(false);
    };
    if (isFocused && isNetworkAvailable) {
      fetchChildParcels();
    }
    return () => {
      isMounted = false;
    };
  }, [isFocused, ParcelNumber, isNetworkAvailable, setChildParcels]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <View style={{ flex: 1, paddingTop: 20 }}>
        <FlatList
          data={useParcelStore.getState().childParcels}
          renderItem={({ item }) => (
            <ChildParcelListItem rowData={item as ChildParcelModel} orientation={orientation} />
          )}
          keyExtractor={(item) => item.id?.toString() || ''}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <NoData
              containerStyle={{
                marginTop: orientation === 'PORTRAIT' ? '45%' : '',
              }}
            />
          }
        />
      </View>
    </View>
  );
};

export default ChildParcelScreen;
