// src/screens/PaymentScreen.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { PaymentItemRow } from './PaymentItemRow';
import { Payment, PaymentScreenProps } from '../../../../utils/interfaces/ISubScreens';
import { PaymentAndAccountingDetailsService } from '../PaymentAndAccountingDetailsService';
import NoData from '../../../../components/common/NoData';
import Loader from '../../../../components/common/Loader';
import { useNetworkStatus } from '../../../../utils/checkNetwork';

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payment[]>([]);
  const { isNetworkAvailable } = useNetworkStatus();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (route.param?.contentItemId) {
        const payments = await PaymentAndAccountingDetailsService.fetchPayments(
          route.param.contentItemId,
          route.type,
          isNetworkAvailable,
        );
        setData(payments);
        setLoading(false);
      }
    };
    fetchData();
  }, [route.param?.contentItemId, route.type]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={({ item }) => <PaymentItemRow item={item} />}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData />
      )}
    </View>
  );
};

export default PaymentScreen;
