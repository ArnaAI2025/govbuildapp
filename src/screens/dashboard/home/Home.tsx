import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import Loader from '../../../components/common/Loader';
import { styles } from './homeStyles';
import { COLORS } from '../../../theme/colors';
import DashboardCard from '../../../components/common/DashboardCard';
import { TEXTS } from '../../../constants/strings';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { navigate } from '../../../navigation/Index';
import { SvgImages } from '../../../theme';
import {
  getBaseUrl,
  getWasOnline,
  saveOfflineUtcDate,
  setWasOnline,
} from '../../../session/SessionManager';
import { GET_DATA } from '../../../services/ApiClient';
import { URL } from '../../../constants/url';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  syncOfflineToServerDatabase,
  syncServerToOfflineDatabase,
} from '../../../services/SyncService';
import { fetchCasesFromDB } from '../../../database/my-case/myCaseSync';
import { ProgressBar } from 'react-native-paper';
import {
  fetchAllCommentToSync,
  fetchAllContactToSync,
  fetchAllDocCountToSync,
  fetchCaseForSyncScreenCount,
  fetchCaseToForceSync,
  fetchEditAttachSyncCount,
  fetchFormForSyncScreenCount,
  fetchLicenseForSyncScreenCount,
  fetchLicenseToForceSync,
  fetchPermissionSyncFailCase,
  fetchPermissionSyncFailLicense,
  fetchPermissionSyncFailSetting,
  fetchSettingSyncCount,
} from '../../../database/sync-offline-to-server/syncOfflineToServerDAO';
import FloatingActionButton from '../../../components/common/FloatingActionButton';
import { useOrientation } from '../../../utils/useOrientation';
import moment from 'moment';
import { isIPad } from '../../../utils/helper/dimensions';
import IMAGES from '../../../theme/images';

type Props = Record<string, never>;

const HomeScreen: FunctionComponent<Props> = () => {
  const { isNetworkAvailable } = useNetworkStatus();
  const orientation = useOrientation();
  const [loading] = useState(false);
  const isFocused = useIsFocused();
  const [myCase, setMyCases] = useState(0);
  const [newTask, setNewTask] = useState(0);
  const [offlineData, setOfflineData] = useState(0);
  const [dailyAppointments, setDailyAppointments] = useState(0);
  const [isCaseAccess, setIsCaseAccess] = useState(false);
  const [isScheduleAccess, setIsScheduleAccess] = useState(false);
  const [isDailyInspectionAccess, setIsDailyInspectionAccess] = useState(false);
  const [isLicenseAccess, setIsLicenseAccess] = useState(false);
  const [isParcleAccess, setIsParcleAccess] = useState(false);
  const [, setForceSyncCount] = useState(0);
  const [, setFailSyncCount] = useState(0);
  const [isFormSubmissionAccess, setIsFormSubmissionAccess] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [, setSyncTotal] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(false);
  const isFirstLoad = useRef(true);
  const progressAnim = useRef(new Animated.Value(0)).current; // Controls opacity and translateY
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const generalColor = COLORS.LIST_CARD_BG;
  const wasOnline = useRef<boolean>(getWasOnline());

  useEffect(() => {
    // Check for online-to-offline transition
    if (wasOnline.current && !isNetworkAvailable) {
      const utcDate = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      // alert(utcDate);
      saveOfflineUtcDate(utcDate);
    }
    wasOnline.current = isNetworkAvailable;
    setWasOnline(isNetworkAvailable);
  }, [isNetworkAvailable]);
  // Animation effect for progress bar
  useEffect(() => {
    if (syncProgress !== null) {
      // Show progress bar with animation
      setIsProgressVisible(true);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300, // 300ms for smooth slide-in
        useNativeDriver: true,
      }).start();
    } else if (isProgressVisible) {
      // Hide progress bar with animation
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300, // 300ms for smooth slide-out
        useNativeDriver: true,
      }).start(() => {
        setIsProgressVisible(false); // Remove from render tree after animation
      });
    }
  }, [syncProgress]);

  useFocusEffect(
    useCallback(() => {
      CountAPICall();
      checkTotalSyncCount();
      getUserAccessPermissions();
      // Trigger sync on first load if network is available
      if (isFirstLoad.current && isNetworkAvailable) {
        isFirstLoad.current = false;
        handleManualSync();
      }
    }, [isNetworkAvailable, isFocused]),
  );

  const isUserLogged = true;

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isUserLogged) {
          return true;
        }
        return false;
      };
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }
      return () => {
        if (Platform.OS === 'android') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, [isUserLogged]),
  );

  const CountAPICall = async () => {
    try {
      if (isNetworkAvailable) {
        const baseUrl = getBaseUrl();
        const payload = {
          url: `${baseUrl}${URL.DASHBOARD_ALL_COUNT}`,
        };
        const response = await GET_DATA(payload);
        if (response?.status === 200) {
          const data = response?.data?.data || {};
          setDailyAppointments(data.dailyAppointments || 0);
          setMyCases(data.myCase || 0);
          setNewTask(data.newTask || 0);
        }
      } else {
        setNewTask(0);
        const caseData = await fetchCasesFromDB();
        setMyCases(caseData?.length || 0);
      }
    } catch (error) {
      console.error('Error in APICall:------>', error);
    }
  };

  // const handleScroll = useCallback(
  //   (event: any) => {
  //     if (syncProgress != null) return;

  //     const currentScrollY = event.nativeEvent.contentOffset.y;

  //     // Trigger only on pull-down gesture beyond threshold
  //     if (currentScrollY < -30) {
  //       if (!isRefreshing.current && isNetworkAvailable) {
  //         isRefreshing.current = true;
  //         ToastService.show("Refreshing home screen...", COLORS.ORANGE);

  //         const refreshData = async () => {
  //           try {
  //             await CountAPICall();
  //             await checkTotalSyncCount();
  //             ToastService.show(
  //               "Data refreshed successfully!",
  //               COLORS.SUCCESS_GREEN
  //             );
  //           } catch (error) {
  //             console.error("Error refreshing data:", error);
  //             ToastService.show("Failed to refresh data.", COLORS.ERROR);
  //           } finally {
  //             isRefreshing.current = false;
  //           }
  //         };

  //         refreshData();
  //       }
  //     }

  //     lastScrollY.current = currentScrollY;
  //   },
  //   [isNetworkAvailable, syncProgress]
  // );

  const OfflineItemsCount = async () => {
    try {
      console.log('Offline count is called ');
      let syncCount = 0;
      let forceSyncCount1 = 0;
      let allFailSyncCount = 0;

      const licenseForceSync = await fetchLicenseToForceSync();
      forceSyncCount1 += licenseForceSync?.length || 0;
      setForceSyncCount(forceSyncCount1);

      const caseForceSync = await fetchCaseToForceSync();
      forceSyncCount1 += caseForceSync?.length || 0;
      setForceSyncCount(forceSyncCount1);

      const permissionSyncFailCase = await fetchPermissionSyncFailCase();
      allFailSyncCount += permissionSyncFailCase || 0;
      setFailSyncCount(allFailSyncCount);

      const permissionSyncFailLicense = await fetchPermissionSyncFailLicense();
      allFailSyncCount += permissionSyncFailLicense || 0;
      setFailSyncCount(allFailSyncCount);

      const permissionSyncFailSetting = await fetchPermissionSyncFailSetting();
      allFailSyncCount += permissionSyncFailSetting || 0;
      setFailSyncCount(allFailSyncCount);

      const caseSyncCount = await fetchCaseForSyncScreenCount();
      syncCount += caseSyncCount || 0;
      setOfflineData(syncCount);

      // const caseSettingForceSync = await fetchSettingToForceSync();
      // syncCount += caseSettingForceSync || 0;
      // setOfflineData(syncCount);

      const settingsSync = await fetchSettingSyncCount();
      syncCount += settingsSync || 0;
      setOfflineData(syncCount);

      const licenseSyncCount = await fetchLicenseForSyncScreenCount();
      syncCount += licenseSyncCount || 0;
      setOfflineData(syncCount);

      const commentsSync = await fetchAllCommentToSync();
      syncCount += commentsSync || 0;
      setOfflineData(syncCount);

      const contactsSync = await fetchAllContactToSync();
      syncCount += contactsSync || 0;
      setOfflineData(syncCount);

      const editAttachSync = await fetchEditAttachSyncCount();
      syncCount += editAttachSync || 0;
      setOfflineData(syncCount);

      const docsSync = await fetchAllDocCountToSync();
      syncCount += docsSync || 0;
      setOfflineData(syncCount);

      const formSyncCount = await fetchFormForSyncScreenCount();
      syncCount += formSyncCount || 0;
      setOfflineData(syncCount);

      return syncCount;
    } catch (error) {
      console.error('error in OfflineItemsCount:', error);
      return 0;
    }
  };

  const checkTotalSyncCount = async () => {
    try {
      const offlineItemCount = await OfflineItemsCount();
      setOfflineData(offlineItemCount);
    } catch (error) {
      console.error('Error in Total Count:---->', error);
    }
  };

  const getUserAccessPermissions = async () => {
    setIsCaseAccess(false);
    setIsScheduleAccess(false);
    setIsDailyInspectionAccess(false);
    setIsLicenseAccess(false);
    setIsParcleAccess(false);
    setIsFormSubmissionAccess(false);
  };

  // Manual sync trigger function for server-to-offline
  const handleManualSync = async () => {
    if (isNetworkAvailable && syncProgress === null) {
      // setTimeout(() => {
      //   ToastService.show(
      //     "Starting server-to-offline sync...",
      //     COLORS.ORANGE
      //   );
      // }, 2000);
      setLoading(true);
      setSyncProgress(0);
      await syncServerToOfflineDatabase((percent) => {
        setSyncProgress(percent);
        if (percent === 100) {
          setTimeout(() => {
            setSyncProgress(null);
            setLoading(false);
          }, 1000); // Delay to allow animation to complete
        }
      });
    }
  };
  // Offline-to-server sync with automatic server-to-offline sync on success
  const handleOfflineToServerSync = async () => {
    if (isNetworkAvailable && syncProgress === null) {
      ToastService.show('Starting offline-to-server sync...', COLORS.ORANGE);
      setSyncProgress(0);
      const result = await syncOfflineToServerDatabase(
        OfflineItemsCount,
        isNetworkAvailable,
        setSyncProgress,
        setSyncTotal,
      );
      TEXTS.offlineSync.SuccessMsg;
      // Check if offline-to-server sync was successful
      if (result && isNetworkAvailable) {
        // Trigger server-to-offline sync automatically
        ToastService.show(TEXTS.offlineSync.SuccessMsg, COLORS.ORANGE);
        ToastService.show('Starting server-to-offline sync...', COLORS.ORANGE);
        //setSyncProgress(0);
        // await syncServerToOfflineDatabase((percent) => {
        //   setSyncProgress(percent);
        //   if (percent === 100) setTimeout(() => setSyncProgress(null), 1000);
        // });
        // Update offline data count after sync
        await checkTotalSyncCount();
      }
    }
  };

  const data = [
    {
      image: SvgImages.DAILY_INSPECTION,
      value: TEXTS.home.dailyInspections,
      disabled: isDailyInspectionAccess,
      onPress: () => navigate('DailyInspection'),
    },
    {
      image: SvgImages.MY_CASE,
      value: TEXTS.home.myCases,
      disabled: isCaseAccess,
      onPress: () => navigate('MyCaseScreen'),
    },
    {
      image: SvgImages.LICENSE,
      value: TEXTS.home.licenses,
      disabled: isLicenseAccess,
      onPress: () => navigate('LicenseScreen'),
    },
    {
      image: SvgImages.NEW_FORM,
      value: TEXTS.home.newForm,
      onPress: () => {
        navigate('NewFormScreen');
      },
    },
    {
      image: SvgImages.FORM_SUBMISSION,
      value: TEXTS.home.formSubmissions,
      disabled: isFormSubmissionAccess,
      onPress: () => navigate('AdvanceFormSubmission'),
    },
    {
      image: SvgImages.Reports,
      value: TEXTS.home.reports,
      onPress: () => {
        if (isNetworkAvailable) {
          navigate('ReportScreen');
        } else {
          ToastService.show("You're offline. Reports feature may not work.", COLORS.ERROR);
        }
      },
    },
    {
      image: SvgImages.MY_SHEDULE,
      value: TEXTS.home.mySchedule,
      disabled: isScheduleAccess,
      onPress: () => {
        if (isNetworkAvailable) {
          // ToastService.show(
          //   "This feature is currently under development and will be available soon.",
          //   COLORS.STANDARAD_ORANGE
          // );
          navigate('MyScheduleScreen');
        } else {
          ToastService.show("You're offline. My Schedule feature may not work.", COLORS.ERROR);
        }
      },
    },
    {
      image: IMAGES.PARCELS,
      value: TEXTS.home.parcels,
      disabled: isParcleAccess,
      onPress: () => {
        if (isNetworkAvailable) {
          navigate('ParcelScreen');
          // ToastService.show(
          //   "This feature is currently under development and will be available soon.",
          //   COLORS.STANDARAD_ORANGE
          // );
        } else {
          ToastService.show("You're offline. Parcels feature may not work.", COLORS.ERROR);
        }
      },
    },
  ];

  // Number of columns: 2 for portrait, 3 for landscape
  const numColumns = orientation === 'LANDSCAPE' ? 3 : 2;

  return (
    <>
      <View style={styles.container}>
        <Loader loading={loading} />

        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewStyle}
          scrollEventThrottle={16}
        >
          <View style={styles.cardContainer}>
            <View style={styles.flexColumn}>
              <View style={styles.flexRow}>
                <DashboardCard
                  heading={newTask ?? 0}
                  value={TEXTS.home.newAsgmts}
                  isNew={true}
                  onPress={() => {
                    if (isNetworkAvailable) {
                      navigate('MyCaseScreen', {
                        paramKey: 'params',
                        screenName: 'newTask',
                      });
                    } else {
                      ToastService.show(
                        TEXTS.alertMessages.notAvailableInOffline,
                        COLORS.WARNING_ORANGE,
                      );
                    }
                  }}
                />
                <DashboardCard
                  heading={offlineData}
                  value={TEXTS.home.offlineItems}
                  isNew={true}
                  onPress={() => {
                    navigate('OfflineSyncScreen');
                  }}
                />
                <DashboardCard
                  heading={myCase}
                  value={TEXTS.home.myCases}
                  isNew={false}
                  onPress={() => {
                    navigate('MyCaseScreen');
                  }}
                />
                <DashboardCard
                  heading={dailyAppointments}
                  value={TEXTS.home.todayAppts}
                  isNew={false}
                  onPress={() => {
                    navigate('DailyInspection');
                  }}
                />
              </View>
            </View>

            <FlatList
              data={data}
              key={numColumns} // re-render when orientation changes
              numColumns={numColumns}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={[styles.cardWrapper, { flex: 1 / numColumns }]}>
                  <DashboardCard
                    showImage={true}
                    image={item.image}
                    value={item.value}
                    disabled={item.disabled}
                    backgroundColor={item.disabled ? COLORS.GRAY_MEDIUM : generalColor}
                    iconColor={item.disabled ? COLORS.SONIC_SILVER : COLORS.APP_COLOR}
                    customStyle={{
                      color: item.disabled ? COLORS.SONIC_SILVER : COLORS.APP_COLOR,
                    }}
                    onPress={item.onPress}
                  />
                </View>
              )}
            />
          </View>
        </ScrollView>
        {/* Sync Progress Indicator with Animation */}
        {isNetworkAvailable && isProgressVisible && (
          <Animated.View
            style={[
              styles.syncOnlineToOfflineContainer,
              {
                opacity: progressAnim,
                transform: [
                  {
                    translateY: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0], // Slide up from 50px below
                    }),
                  },
                ],
                bottom: offlineData != 0 ? 30 : 0,
              },
            ]}
          >
            <Text style={styles.syncOnlineToOfflineText}>
              {`Syncing... ${syncProgress}% completed`}
            </Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={syncProgress !== null ? syncProgress / 100 : 0}
                color={COLORS.APP_COLOR}
                style={styles.progressBar}
              />
            </View>
          </Animated.View>
        )}
        {/* {isNetworkAvailable && offlineData === 0 && ( */}
        {isNetworkAvailable && (
          <FloatingActionButton
            onPress={() => handleManualSync()}
            isLoading={isLoading}
            customIcon="sync"
            // contanerstyle={{ bottom: offlineData != 0 ? 67 : 30 }}
            contanerstyle={{
              bottom: isIPad ? (offlineData != 0 ? '12%' : 30) : offlineData != 0 ? 67 : 30,
            }}
          />
        )}

        {/* Offline-to-Online Sync Button */}
        {isNetworkAvailable && offlineData != 0 && syncProgress === null && (
          <TouchableOpacity
            style={[styles.syncBtnView, { marginBottom: orientation === 'PORTRAIT' ? '6%' : '2%' }]}
            onPress={handleOfflineToServerSync}
          >
            <Text style={styles.syncBtnText}>{TEXTS.offlineSync.startSyncing}</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default HomeScreen;
