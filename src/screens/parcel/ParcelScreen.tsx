import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ParcelService } from './ParcelService';
import { create } from 'zustand';
import { RootStackParamList } from '../../navigation/Types';
import { ParcelModel } from '../../utils/interfaces/ISubScreens';
import { useOrientation } from '../../utils/useOrientation';
import { useNetworkStatus } from '../../utils/checkNetwork';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { TEXTS } from '../../constants/strings';
import { COLORS } from '../../theme/colors';
import { ParcelListItem } from './ParcelListItem';
import NoData from '../../components/common/NoData';
import { fontSize, height } from '../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingInput from '../../components/common/FloatingInput';
import DeviceInfo from 'react-native-device-info';
import { goBack } from '../../navigation/Index';

type ParcelScreenProps = NativeStackScreenProps<RootStackParamList, 'ParcelScreen'>;

// Zustand store for parcel state management
interface ParcelStore {
  parcels: ParcelModel[];
  childParcels: ParcelModel[];
  caseChildParcels: ParcelModel[];
  submission: ParcelModel[];
  parcelNumber: string;
  address: string;
  setParcels: (parcels: ParcelModel[]) => void;
  setChildParcels: (childParcels: ParcelModel[]) => void;
  setCaseChildParcels: (caseChildParcels: ParcelModel[]) => void;
  setSubmission: (submission: ParcelModel[]) => void;
  setParcelNumber: (parcelNumber: string) => void;
  setAddress: (address: string) => void;
  clearFilters: () => void;
}

export const useParcelStore = create<ParcelStore>((set) => ({
  parcels: [],
  caseChildParcels: [],
  childParcels: [],
  submission: [],
  parcelNumber: '',
  address: '',
  setParcels: (parcels) => set({ parcels }),
  setChildParcels: (childParcels) => set({ childParcels }),
  setCaseChildParcels: (caseChildParcels) => set({ caseChildParcels }),
  setSubmission: (submission) => set({ submission }),
  setParcelNumber: (parcelNumber) => set({ parcelNumber }),
  setAddress: (address) => set({ address }),
  clearFilters: () => set({ parcelNumber: '', address: '' }),
}));

const ParcelScreen: React.FC<ParcelScreenProps> = (navigation) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const hasNotch = DeviceInfo.hasNotch();
  const [showFilterSearch, setShowFilterSearch] = useState<boolean>(false);
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const { parcels, parcelNumber, address, setParcelNumber, setAddress, setParcels } =
    useParcelStore();

  const isFilterApplied = parcelNumber !== '' || address !== '';
  useFocusEffect(
    useCallback(() => {
      if (!isNetworkAvailable) {
        goBack();
      }
    }, [isNetworkAvailable, navigation]),
  );
  useEffect(() => {
    if (isFocused && isNetworkAvailable) {
      fetchParcels();
    }
  }, [isFocused, isNetworkAvailable]);
  const fetchParcels = async () => {
    setLoading(true);
    const result = await ParcelService.fetchParcels(parcelNumber, address, setLoading);
    setParcels(result);
    setLoading(false);
  };
  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <ScreenWrapper
        title={TEXTS.subScreens.parcel.heading}
        onBackPress={() => {
          setAddress('');
          setParcelNumber('');
          goBack();
        }}
      >
        <View
          style={[
            styles.headerContainer,
            {
              marginTop:
                orientation === 'PORTRAIT'
                  ? hasNotch
                    ? height(-0.056)
                    : Platform.OS == 'ios'
                      ? height(-0.049)
                      : height(-0.065)
                  : height(-0.054),
            },
          ]}
        >
          <TouchableOpacity onPress={() => setShowFilterSearch(!showFilterSearch)}>
            <View
              style={{
                alignItems: 'center',
                marginTop: height(0.002),
              }}
            >
              <Icon
                name={showFilterSearch ? 'filter-off' : 'filter'}
                size={26}
                color={COLORS.APP_COLOR}
              />
              {isFilterApplied && <View style={styles.filterBadge} />}
            </View>
          </TouchableOpacity>
        </View>
        {showFilterSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <FloatingInput
                value={parcelNumber}
                onChangeText={setParcelNumber}
                placeholder={TEXTS.subScreens.parcel.parcelNumberPlaceholder}
                label={TEXTS.subScreens.parcel.parcelNumberLabel}
              />
            </View>
            <View style={[styles.searchInput, { marginLeft: 5 }]}>
              <FloatingInput
                value={address}
                onChangeText={setAddress}
                placeholder={TEXTS.subScreens.parcel.addressPlaceholder}
                label={TEXTS.subScreens.parcel.addressLabel}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                fetchParcels();
              }}
            >
              <Icon name="magnify" size={32} color={COLORS.BLUE_COLOR} />
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flex: 1, marginTop: 15 }}>
          <FlatList
            data={parcels}
            renderItem={({ item }) => <ParcelListItem rowData={item} />}
            keyExtractor={(item, index) => index?.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <NoData
                containerStyle={{
                  marginTop: orientation === 'PORTRAIT' ? '45%' : '',
                }}
              />
            }
          />
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'flex-end',
  },
  searchInput: {
    flex: 1,
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  input: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 5,
    padding: height(0.009),
    height: height(0.04),
    color: COLORS.BLACK,
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  searchButton: {
    //  backgroundColor: COLORS.APP_COLOR,
    // height: height(0.04),
    marginLeft: 5,
    marginBottom: height(0.012),
    //borderRadius: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: height(0.025),
    paddingHorizontal: 10,
    width: '50%',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.RED,
  },
});

export default ParcelScreen;
