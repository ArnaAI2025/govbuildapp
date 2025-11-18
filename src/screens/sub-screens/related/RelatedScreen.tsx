import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { RelatedCase } from '../../../utils/interfaces/ISubScreens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Types';
import { fetchRelatedCases } from './RelatedService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import NoData from '../../../components/common/NoData';
import { height } from '../../../utils/helper/dimensions';
import Loader from '../../../components/common/Loader';
import { HeadingViewWithList } from './HeadingViewWithList';
import { TEXTS } from '../../../constants/strings';
import { useNetworkStatus } from '../../../utils/checkNetwork';

type RelatedScreenProps = NativeStackScreenProps<RootStackParamList, 'RelatedScreen'>;

const RelatedScreen: React.FC<RelatedScreenProps> = ({ route, navigation }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [allChildCase, setAllChildCase] = useState<RelatedCase[]>([]);
  const [allParentCase, setAllParentCase] = useState<RelatedCase[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (route.params.param?.contentItemId) {
        setLoading(true);
        const { allChildCase, allParentCase } = await fetchRelatedCases(
          route.params.param.contentItemId,
          route?.params?.type,
          isNetworkAvailable,
        );
        setAllChildCase(allChildCase);
        setAllParentCase(allParentCase);
      }
      setLoading(false);
    };
    fetchData();
  }, [route.params.param?.contentItemId]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper
        title={
          route.params.type === 'Case'
            ? TEXTS.subScreens.related.heading
            : TEXTS.subScreens.subLicense.heading
        }
      >
        <Loader loading={isLoadingAPI} />
        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            nestedScrollEnabled
            style={{ paddingBottom: 20, flex: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {allChildCase.length === 0 && allParentCase.length === 0 ? (
              <View style={{ height: height(0.9) }}>
                <NoData />
              </View>
            ) : (
              <View>
                <HeadingViewWithList
                  title={TEXTS.subScreens.related.parent}
                  list={allParentCase}
                  navigation={navigation}
                />
                <HeadingViewWithList
                  title={TEXTS.subScreens.related.child}
                  list={allChildCase}
                  navigation={navigation}
                />
              </View>
            )}
          </KeyboardAwareScrollView>
        </View>
      </ScreenWrapper>
    </View>
  );
};

export default RelatedScreen;
