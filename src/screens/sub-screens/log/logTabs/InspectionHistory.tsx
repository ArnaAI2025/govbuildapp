import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import { LogService } from '../LogService';
import Loader from '../../../../components/common/Loader';
import { formatDate } from '../../../../utils/helper/helpers';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import NoData from '../../../../components/common/NoData';
import globalStyles from '../../../../theme/globalStyles';
import { TEXTS } from '../../../../constants/strings';

const InspectionHistory: React.FC<{
  route: string;
  navigation: any;
  isCase: boolean;
}> = ({ route, isCase }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchInspectionHistory(route, isCase, setLoading);
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
          renderItem={({ item: rowData }) => (
            <View style={globalStyles.cardContainer}>
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.dateLabel}
                line={1}
                title={rowData.modifiedDate || ''}
                icon="calendar-month"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.userNameLabel}
                line={1}
                title={rowData.author || ''}
                icon="account"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.typeLabel}
                line={1}
                title={rowData.subject || ''}
                icon="tag-text"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.inspectorLabel}
                line={1}
                title={rowData.scheduleWithName || ''}
                icon="account-search"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.inspectionTypeLabel}
                line={1}
                title={rowData.type || ''}
                icon="clipboard-check"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.statusLabel}
                line={1}
                title={rowData.status || ''}
                icon="progress-check"
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.inspectionLog.appointmentDateLabel}
                line={1}
                title={formatDate(rowData.appointmentDate, 'MM-DD-YYYY')}
                icon="calendar-clock"
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

export default InspectionHistory;
