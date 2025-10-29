import React, { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Types';
import { useOrientation } from '../../../utils/useOrientation';
import { InspectionService } from './InspectionService';
import Loader from '../../../components/common/Loader';
import { renderItemStatus } from './InspectionFlagItem';
import { COLORS } from '../../../theme/colors';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import NoData from '../../../components/common/NoData';
import SwitchToggle from 'react-native-switch-toggle';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import FloatingActionButton from '../../../components/common/FloatingActionButton';
import { useInspectionStore } from '../../../store/useInspectionScheduleStore';
import { sortData } from '../../../utils/helper/inspectionUtils';
import { InspectionRowItem } from './InspectionRowItem';
import RenderItemChevronStatus from '../../../components/common/ChevronStatus';
import DeviceInfo from 'react-native-device-info';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { normalizeBool } from '../../../utils/helper/helpers';

type InspectionsScreenProps = NativeStackScreenProps<RootStackParamList, 'InspectionsScreen'>;

const InspectionsScreen: React.FC<InspectionsScreenProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;
  const {
    inspections,
    inspectionTypes,
    inspectionStatus,
    isLoading,
    isShowSchedule,
    sortOrder,
    caseOrLicenseData,
    setInspections,
    setInspectionTypes,
    setInspectionStatus,
    setLoading,
    setSortOrder,
    setCaseOrLicenseData,
    setIsShowSchedule,
  } = useInspectionStore();

  const isAllowViewInspection = route.params.isAllowViewInspection;
  const type = route.params.type;
  const hasNotch = DeviceInfo.hasNotch();
  useEffect(() => {
    const fetchData = async () => {
      setCaseOrLicenseData(route.params.param);
      setIsShowSchedule(route.params.isShowSchedule);
      setInspectionStatus(route.params.caseDataById?.appointmentStatus ?? []);

      const inspections = await InspectionService.fetchInspections(
        route.params.param.contentItemId,
        type as 'Case' | 'License',
        isNetworkAvailable,
        setLoading,
      );
      setInspections(inspections);

      if (isNetworkAvailable) {
        const types = await InspectionService.fetchInspectionTypes(
          route.params.param,
          type as 'Case' | 'License',
          isNetworkAvailable,
        );
        setInspectionTypes(types);
      }
    };
    if (isFocused) fetchData();
  }, [isFocused, route.params.param, type, navigation]);

  const sortedData = useMemo(() => sortData(inspections, sortOrder), [inspections, sortOrder]);

  return (
    <ScreenWrapper title="Inspections">
      <Loader loading={isLoading} />
      {isNetworkAvailable && isShowSchedule && (
        <FloatingActionButton
          onPress={() =>
            navigation.navigate('InspectionSchedule', {
              param: route.params.caseDataById,
              type: type,
              isAllowViewInspection,
              isNew: true,
              caseData: caseOrLicenseData,
              comeFromInspectionList: true,
            })
          }
          disabled={normalizeBool(caseOrLicenseData?.isStatusReadOnly)}
        />
      )}
      <View style={styles.content}>
        {sortedData.length > 0 ? (
          <View
            style={{
              marginTop:
                orientation === 'PORTRAIT'
                  ? hasNotch
                    ? height(-0.056)
                    : height(-0.049)
                  : height(-0.054),
              alignItems: 'flex-end',
              alignSelf: 'flex-end',
              zIndex: -1,
              marginBottom: height(0.02),
              width: '50%',
            }}
          >
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by date</Text>
              <SwitchToggle
                switchOn={sortOrder === 'date_desc'}
                onPress={() => setSortOrder(sortOrder === 'date_desc' ? 'date_asc' : 'date_desc')}
                circleColorOff={COLORS.VERY_GRAY_LIGHT}
                circleColorOn={COLORS.WHITE}
                backgroundColorOn={COLORS.APP_COLOR}
                backgroundColorOff={COLORS.GRAY_MEDIUM}
                containerStyle={styles.toggleContainer}
                circleStyle={styles.toggleCircle}
              />
            </View>
          </View>
        ) : null}

        {isNetworkAvailable &&
          isShowSchedule &&
          (route?.params?.caseDataById?.isRequireInspectionsTakePlaceinAboveOrder ||
            route?.params?.caseDataById?.isRequireInspectionsTakePlaceInAboveOrder) && (
            <View style={{ marginTop: height(0.02) }}>
              <View style={styles.flagContainer}>
                {inspectionTypes.map((item) => (
                  <RenderItemChevronStatus item={item} />
                ))}
              </View>
              <View style={styles.flagContainer}>
                {inspectionStatus.map((item) => (
                  <View key={item.id}>{renderItemStatus({ item }) ?? null}</View>
                ))}
              </View>
            </View>
          )}

        {sortedData.length > 0 ? (
          <FlatList
            data={sortedData}
            contentContainerStyle={{
              paddingBottom: height(0.12),
              paddingTop: height(0.008),
            }}
            renderItem={({ item }) => (
              <InspectionRowItem
                rowData={item}
                orientation={orientation}
                navigation={navigation}
                isOnline={isNetworkAvailable}
                type={type as 'Case' | 'License'}
                caseDataById={route.params.caseDataById}
                caseOrLicenseData={caseOrLicenseData!}
              />
            )}
            keyExtractor={(item) => item.contentItemId || `${item.subject}-${item.appointmentDate}`}
            extraData={{ sortOrder, dataLength: sortedData.length }}
          />
        ) : (
          <NoData />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  flagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  sortContainer: { flexDirection: 'row', alignItems: 'center' },
  sortLabel: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.025),
    fontWeight: 'bold',
    marginRight: 4,
  },
  switch: { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] },
  scheduleButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    width: WINDOW_WIDTH * 0.25,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  toggleContainer: {
    width: 45,
    height: 25,
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 10,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});

export default InspectionsScreen;
