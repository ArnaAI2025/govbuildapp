import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SendMailListItem } from './SendMailListItem';
import { fetchSentEmails } from '../../../services/sub-screens-service/SubScreensCommonService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Types';
import { SentEmail } from '../../../utils/interfaces/ISubScreens';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import NoData from '../../../components/common/NoData';
import { TEXTS } from '../../../constants/strings';
import { useNetworkStatus } from '../../../utils/checkNetwork';

type SendMailScreenProps = NativeStackScreenProps<RootStackParamList, 'SendMailScreen'>;
const SendMailScreen: React.FC<SendMailScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SentEmail[]>([]);

  const isCase = route?.params?.type == 'Case' ? true : false;

  useEffect(() => {
    const fetchData = async () => {
      if (route.params.param?.contentItemId) {
        const emails = await fetchSentEmails(
          route.params.param.contentItemId,
          isCase,
          isNetworkAvailable,
          setLoading,
        );
        setData(emails);
      }
    };
    fetchData();
  }, [route.params.param?.contentItemId]);

  const renderEmptyComponent = () =>
    !isLoadingAPI ? (
      <NoData message={'No Email Available.'} containerStyle={{ marginTop: '45%' }} />
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <ScreenWrapper title={TEXTS.subScreens.sendEmail.heading}>
        <View style={{ flex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={({ item }) => <SendMailListItem rowData={item} />}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={renderEmptyComponent}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default SendMailScreen;
