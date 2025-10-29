import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { contactService } from '../ContactAndContractService';
import Loader from '../../../../components/common/Loader';
import { ContractorTabItem } from './ContractorTabItem';
import { COLORS } from '../../../../theme/colors';
import { fontSize, height, iconSize } from '../../../../utils/helper/dimensions';
import FloatingActionButton from '../../../../components/common/FloatingActionButton';
import {
  CaseAndLicenseContractorTabProps,
  Contractor,
} from '../../../../utils/interfaces/ISubScreens';
import { TEXTS } from '../../../../constants/strings';
import NoData from '../../../../components/common/NoData';
import { useNetworkStatus } from '../../../../utils/checkNetwork';
import { normalizeBool } from '../../../../utils/helper/helpers';

const CaseAndLicenseContractorTab: React.FC<CaseAndLicenseContractorTabProps> = ({
  route,
  navigation,
}) => {
  const isForceSync = normalizeBool(route?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const [isLoading, setLoading] = useState(false);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [caseData] = useState(route.param);
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList>(null);
  const prevContractorsLength = useRef(0); // store previous length

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await contactService.fetchContractors(
        route.param.contentItemId,
        route.type,
        isNetworkAvailable,
      );
      setContractors(data);
      setLoading(false);
    };

    fetchData();
  }, [isFocused, route.param.contentItemId, route.type, navigation]);

  useEffect(() => {
    if (
      contractors.length > prevContractorsLength.current && // only when added
      flatListRef.current
    ) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
    prevContractorsLength.current = contractors.length; // update tracker
  }, [contractors]);

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      {isNetworkAvailable && (
        <FloatingActionButton
          onPress={() =>
            navigation.navigate('AddContract', {
              addNew: true,
              param: null,
              type: route.type,
              caseID: route.param.contentItemId,
              caseData,
            })
          }
          disabled={normalizeBool(caseData.isStatusReadOnly)}
        />
      )}
      {contractors?.length > 0 ? (
        <FlatList
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          data={contractors}
          contentContainerStyle={{ paddingBottom: height(0.12) }}
          renderItem={({ item }) => (
            <ContractorTabItem
              rowData={item}
              navigation={navigation}
              type={route.type}
              caseID={route.param.contentItemId}
              isNetworkAvailable={isNetworkAvailable}
              caseData={caseData}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData message={TEXTS.subScreens.contactAndContract.noContractorFound} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 35,
    backgroundColor: COLORS.APP_COLOR,
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIcon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    marginTop: 2,
    tintColor: COLORS.WHITE,
  },
});

export default CaseAndLicenseContractorTab;
