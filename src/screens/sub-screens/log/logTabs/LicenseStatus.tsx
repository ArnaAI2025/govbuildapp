import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import globalStyles from '../../../../theme/globalStyles';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import { LogService } from '../LogService';
import type { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import Loader from '../../../../components/common/Loader';
import NoData from '../../../../components/common/NoData';
import { TEXTS } from '../../../../constants/strings';
import { useNetworkStatus } from '../../../../utils/checkNetwork';

const LicenseStatus: React.FC<{ route: string; navigation: any }> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);
  const {isNetworkAvailable} = useNetworkStatus();

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchLicenseStatus(route, setLoading, isNetworkAvailable);
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
          scrollEnabled
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

export default LicenseStatus;
