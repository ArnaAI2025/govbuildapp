import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useOrientation } from '../../../utils/useOrientation';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import NoData from '../../../components/common/NoData';
import { CaseParcelListItem } from './CaseParcelListItem';
import { CaseParcelModel } from '../../../utils/interfaces/ISubScreens';
import { useParcelStore } from '../ParcelScreen';
import { ParcelService } from '../ParcelService';

const CaseParcelScreen: React.FC<{
  ParcelNumber: string;
}> = ({ ParcelNumber }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { setCaseChildParcels } = useParcelStore();

  useEffect(() => {
    let isMounted = true;
    const fetchCaseParcels = async () => {
      setLoading(true);
      const result = await ParcelService.fetchCaseParcels(ParcelNumber, setLoading);
      if (isMounted) {
        setCaseChildParcels(result);
      }
      setLoading(false);
      console.log('Case data --->', result);
    };
    if (isFocused && isNetworkAvailable) {
      fetchCaseParcels();
    }
    return () => {
      isMounted = false;
    };
  }, [isFocused, ParcelNumber, isNetworkAvailable, setCaseChildParcels]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <View style={{ flex: 1, paddingTop: 20 }}>
        <FlatList
          data={useParcelStore.getState().caseChildParcels}
          renderItem={({ item }) => (
            <CaseParcelListItem
              rowData={item as CaseParcelModel}
              orientation={orientation}
              parcelNumber={ParcelNumber}
            />
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

export default CaseParcelScreen;
