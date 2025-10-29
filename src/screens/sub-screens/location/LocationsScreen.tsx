import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { RootStackParamList } from '../../../navigation/Types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrientation } from '../../../utils/useOrientation';
import { useIsFocused } from '@react-navigation/native';
import { LocationService } from './LocationService';
import { AdressModel } from '../../../utils/interfaces/ISubScreens';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import NoData from '../../../components/common/NoData';
import { TEXTS } from '../../../constants/strings';
import FloatingActionButton from '../../../components/common/FloatingActionButton';
import { LocationListItem } from './LocationListItem';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { normalizeBool } from '../../../utils/helper/helpers';

type LocationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Locations'>;

const Locations: React.FC<LocationsScreenProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [, setIsOnline] = useState<boolean>(false);
  const [data, setData] = useState<AdressModel[]>([]);
  const { isNetworkAvailable } = useNetworkStatus();
  const isFocused = useIsFocused();
  const contentItemId = route.params.param?.contentItemId || '';
  const isStatusReadOnly = route.params.param?.isStatusReadOnly;

  const callDeleteLocationApi = async (contentId: string) => {
    setLoading(true);
    const success = await LocationService.deleteLocation(contentId, setLoading);
    if (success) {
      setData((prevData) => {
        const newData = prevData.filter((item) => item.contentItemId !== contentId);
        return [...newData];
      });
    } else {
      console.log('Deletion failed for ID:', contentId);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const result = await LocationService.fetchLocations(contentItemId, setLoading, setIsOnline);
      if (isMounted) {
        setData(result);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isFocused, contentItemId]);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      {isNetworkAvailable && (
        <FloatingActionButton
          onPress={() =>
            navigation.navigate('AddMultiLocation', {
              isEdit: false,
              contentId: contentItemId,
              isOnline: isNetworkAvailable,
            })
          }
          disabled={normalizeBool(isStatusReadOnly)}
        />
      )}
      <ScreenWrapper title={TEXTS.subScreens.location.heading}>
        <View style={{ flex: 1 }}>
          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={({ item: rowData }) => (
                <LocationListItem
                  rowData={rowData}
                  orientation={orientation}
                  navigation={navigation}
                  callDeleteLocationApi={callDeleteLocationApi}
                  isOnline={isNetworkAvailable}
                  contentItemId={contentItemId}
                  isStatusReadOnly={isStatusReadOnly}
                />
              )}
              keyExtractor={(item) => (item.id ? item.id.toString() : '')}
            />
          ) : (
            <NoData />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default Locations;
