import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import { LogService } from '../LogService';
import Loader from '../../../../components/common/Loader';
import globalStyles from '../../../../theme/globalStyles';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import NoData from '../../../../components/common/NoData';
import { TEXTS } from '../../../../constants/strings';

const TaskStatus: React.FC<{ route: string; navigation: any }> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchStatusChangeLog(route, 'TaskStatus', setLoading);
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
                  heading={TEXTS.subScreens.taskChangeLog.dateLabel}
                  line={1}
                  title={rowData.date || ''}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.taskChangeLog.taskLabel}
                  line={1}
                  title={rowData.title || ''}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.taskChangeLog.userNameLabel}
                  line={1}
                  title={(rowData.userName || '') + userEmail}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.taskChangeLog.previousStatusLabel}
                  line={1}
                  title={rowData.changeFrom || ''}
                />
                <CustomTextViewWithImage
                  heading={TEXTS.subScreens.taskChangeLog.statusLabel}
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

export default TaskStatus;
