import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ContactItemRow } from './ContactItemRow';
import { contactService } from '../ContactAndContractService';
import Loader from '../../../../components/common/Loader';
import { COLORS } from '../../../../theme/colors';
import { height, iconSize } from '../../../../utils/helper/dimensions';
import FloatingActionButton from '../../../../components/common/FloatingActionButton';
import type { Contact, ContactScreenProps } from '../../../../utils/interfaces/ISubScreens';
import NoData from '../../../../components/common/NoData';
import { TEXTS } from '../../../../constants/strings';
import { useNetworkStatus } from '../../../../utils/checkNetwork';
import { normalizeBool } from '../../../../utils/helper/helpers';

const ContactScreen: React.FC<ContactScreenProps> = ({ route, navigation }) => {
  const isForceSync = normalizeBool(route?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const isFocused = useIsFocused();
  const flatListRef = useRef<FlatList>(null);
  const [isLoading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [caseLicenseData] = useState(route.param);
  const prevContactsLength = useRef(0);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await contactService.fetchContacts(
        route?.param.contentItemId,
        route.type,
        isNetworkAvailable,
      );
      setContacts(data);
      setLoading(false);
    };

    fetchData();
  }, [isFocused, route.param.contentItemId, route.type, navigation]);

  useEffect(() => {
    if (
      contacts.length > prevContactsLength.current && // only when new added
      flatListRef.current
    ) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
    prevContactsLength.current = contacts.length; // update tracker
  }, [contacts]);

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <FloatingActionButton
        onPress={() => {
          const data = {
            addNew: true,
            param: null,
            type: route.type,
            caseLicenseID: route.param.contentItemId,
            caseLicenseData,
            isForceSync: route?.isForceSync,
          };
          navigation.navigate('AddContact', data);
        }}
        disabled={normalizeBool(caseLicenseData.isStatusReadOnly) || isForceSync}
      />
      {contacts?.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={contacts}
          contentContainerStyle={{ paddingBottom: height(0.12) }}
          renderItem={({ item }) => (
            <ContactItemRow
              rowData={item}
              navigation={navigation}
              type={route.type}
              caseLicenseID={route.param.contentItemId}
              caseLicenseData={caseLicenseData}
              isForceSync={isForceSync}
              isStatusReadOnly={normalizeBool(caseLicenseData.isStatusReadOnly)}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        <NoData message={TEXTS.subScreens.contactAndContract.noContactFound} />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
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
    elevation: 5, // Android shadow
    shadowColor: COLORS.BLACK, // iOS shadow
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

export default ContactScreen;
