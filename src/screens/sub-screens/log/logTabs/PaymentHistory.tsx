import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import type { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import { LogService } from '../LogService';
import Loader from '../../../../components/common/Loader';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import NoData from '../../../../components/common/NoData';
import globalStyles from '../../../../theme/globalStyles';
import { TEXTS } from '../../../../constants/strings';
import { useNetworkStatus } from '../../../../utils/checkNetwork';

const PaymentHistory: React.FC<{
  route: string;
  navigation: any;
  isCase: boolean;
}> = ({ route, isCase }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);
  const {isNetworkAvailable} = useNetworkStatus();

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchPaymentHistory(route, isCase, setLoading, isNetworkAvailable);
      setData(result);
    };
    fetchData();
  }, [route, isCase]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      {data.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          scrollEnabled
          renderItem={({ item: rowData }) => (
            <View style={globalStyles.cardContainer}>
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.dateLabel}
                line={1}
                title={rowData.modifiedUtc || ''}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.userNameLabel}
                line={1}
                title={`${rowData.modifiedBy || ''} (${rowData.modifiedByEmail || ''})`}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.accountingDetailLabel}
                line={1}
                title={rowData.accountingDetailId || ''}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.statusLabel}
                line={1}
                title={rowData.status || ''}
              />

              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.totalCostLabel}
                line={1}
                title={
                  rowData?.totalCost
                    ? `$${rowData?.totalCost?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '$0.00'
                }
              />

              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.paidAmountLabel}
                line={1}
                title={
                  rowData.paidAmount
                    ? `$${rowData.paidAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '$0.00'
                }
              />

              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingLog.noteLabel}
                line={1}
                title={rowData.note || ''}
              />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData />
      )}
    </View>
  );
};

export default PaymentHistory;
