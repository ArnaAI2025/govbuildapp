import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useOrientation } from '../../../utils/useOrientation';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import NoData from '../../../components/common/NoData';
import type { SubmissionParcelModel } from '../../../utils/interfaces/ISubScreens';
import { useParcelStore } from '../ParcelScreen';
import { ParcelService } from '../ParcelService';
import { CaseParcelListItem } from './CaseParcelListItem';

const SubmissionParcelScreen: React.FC<{
  ParcelNumber: string;
}> = ({ ParcelNumber }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { setSubmission } = useParcelStore();

  useEffect(() => {
    let isMounted = true;
    const fetchSubmissionParcels = async () => {
      setLoading(true);
      const result = await ParcelService.fetchSubmissionParcels(ParcelNumber, setLoading);
      if (isMounted) {
        setSubmission(result);
      }
      console.log('result -->', result);
      setLoading(false);
    };
    if (isFocused && isNetworkAvailable) {
      fetchSubmissionParcels();
    }
    return () => {
      isMounted = false;
    };
  }, [isFocused, ParcelNumber, isNetworkAvailable, setSubmission]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <View style={{ flex: 1, paddingTop: 20 }}>
        <FlatList
          data={useParcelStore.getState().submission}
          renderItem={({ item }) => (
            <CaseParcelListItem
              rowData={item as SubmissionParcelModel}
              orientation={orientation}
              isForSubmission
            />
          )}
          keyExtractor={(item, index) => index.toString() || ''}
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

export default SubmissionParcelScreen;
