import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import globalStyles from '../../../../theme/globalStyles';
import { StatusChangeLog } from '../../../../utils/interfaces/ISubScreens';
import { LogService } from '../LogService';
import Loader from '../../../../components/common/Loader';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import NoData from '../../../../components/common/NoData';
import { TEXTS } from '../../../../constants/strings';

const MemberHistory: React.FC<{ route: string; navigation: any }> = ({ route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<StatusChangeLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await LogService.fetchStatusChangeLog(route, 'AssignedUsers', setLoading);
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
          renderItem={({ item: rowData }) => (
            <View style={globalStyles.cardContainer}>
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.teamChangeLog.dateLabel}
                line={1}
                title={rowData.date || ''}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.teamChangeLog.publishedByLabel}
                line={1}
                title={rowData.userName || ''}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.teamChangeLog.previousTeamMembersLabel}
                line={1}
                title={rowData.changeFrom || ''}
              />
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.teamChangeLog.teamMembersLabel}
                line={1}
                title={rowData.changeTo || ''}
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

export default MemberHistory;
