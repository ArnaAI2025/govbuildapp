import React, { memo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Types';
import { downloadForm, fetchAttachedItems, getOfflineDataById } from './AttachedItemsService';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import AttechedItemsRowView from './AttachedItemsRowView';
import { COLORS } from '../../../theme/colors';
import { FONT_SIZE } from '../../../theme/fonts';
import type { AttachedItem } from '../../../utils/interfaces/ISubScreens';
import FloatingActionButton from '../../../components/common/FloatingActionButton';
import { TEXTS } from '../../../constants/strings';
import NoData from '../../../components/common/NoData';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { getBaseUrl } from '../../../session/SessionManager';
import { height } from '../../../utils/helper/dimensions';
import { normalizeBool } from '../../../utils/helper/helpers';

type AttechedItemsScreenProps = NativeStackScreenProps<RootStackParamList, 'AttechedItems'>;

const AttechedItems: React.FC<AttechedItemsScreenProps> = ({ route, navigation }) => {
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const { param: caseData, type } = route?.params;
  const isCase = route?.params.type === 'Case';
  const isFocused = useIsFocused();
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
  const [offlineData, setOfflineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = getBaseUrl();

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const items = await fetchAttachedItems(caseData.contentItemId, isCase, isNetworkAvailable);
      setAttachedItems(items);
      //This is for future use if you want to handle offline data
      const offlineItems = await getOfflineDataById(caseData?.contentItemId);
      setOfflineData(offlineItems);
      setIsLoading(false);
    };

    if (isFocused) {
      fetchItems();
    }
  }, [isFocused, caseData?.contentItemId, isNetworkAvailable]);

  const handleDownloadForm = async (contentItemId: string) => {
    setIsLoading(true);
    const success = await downloadForm(contentItemId, isNetworkAvailable);
    if (success) {
      const items = await fetchAttachedItems(caseData.contentItemId, isCase, isNetworkAvailable);
      setAttachedItems(items);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <ScreenWrapper title={TEXTS.subScreens.attachedItem.heading}>
        <View style={styles.container}>
          <FloatingActionButton
            onPress={() =>
              navigation.navigate('AddForm', {
                caseData,
                type,
              })
            }
            disabled={normalizeBool(caseData?.isStatusReadOnly) || isForceSync}
          />
          {attachedItems.length > 0 ? (
            <FlatList
              data={attachedItems}
              renderItem={({ item }) => (
                <AttechedItemsRowView
                  rowData={item}
                  navigation={navigation}
                  isOnline={isNetworkAvailable}
                  downloadForm={handleDownloadForm}
                  offlineData={offlineData}
                  type={type}
                  baseUrl={baseUrl ?? ''}
                  isForceSync={isForceSync}
                />
              )}
              contentContainerStyle={{ paddingBottom: height(0.12) }}
              keyExtractor={(_, index) => index.toString()}
            />
          ) : (
            <NoData message={TEXTS.subScreens.attachedItem.noItems} />
          )}
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.APP_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.Font_14,
  },
});

export default memo(AttechedItems);
