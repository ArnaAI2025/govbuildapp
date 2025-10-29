import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import { LogService } from '../LogService';
import Loader from '../../../../components/common/Loader';
import NoData from '../../../../components/common/NoData';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import { TEXTS } from '../../../../constants/strings';
import globalStyles from '../../../../theme/globalStyles';

const BillingStatus: React.FC<{ route: string }> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchStatusChangeLog(route, 'BillingStatus', setLoading);
      setData(result);
    };
    fetchData();
  }, [route]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      {data.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={({ item: rowData }) => {
            const userEmail = rowData.userEmail ? ` (${rowData.userEmail})` : '';
            return (
              <View style={globalStyles.cardContainer}>
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.statusChangeLog.dateLabel}
                  line={1}
                  title={rowData.date || ''}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.statusChangeLog.userNameLabel}
                  line={1}
                  title={(rowData.userName || '') + userEmail}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.statusChangeLog.previousStatusLabel}
                  line={1}
                  title={rowData.changeFrom || ''}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.statusChangeLog.statusLabel}
                  line={1}
                  title={rowData.changeTo || ''}
                />
              </View>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData />
      )}
    </View>
  );
};

export default BillingStatus;
