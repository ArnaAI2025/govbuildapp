import React, { useCallback, useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import IMAGES from '../../../theme/images';
import { styles } from './dashboarddrawerStyles';
import { navigate } from '../../../navigation/Index';
import { TEXTS } from '../../../constants/strings';
import { useBiometricStore } from '../../../store/biometricStore';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { getIsUpdateLater, getIsVersionUpdateOffline } from '../../../session/SessionManager';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import { CustomConfirmationDialog } from '../../../components/dialogs/CustomConfirmationDialog';
import { SvgImages } from '../../../theme';
import { iconSize } from '../../../utils/helper/dimensions';
import {
  // AppUpdateDialog,
  checkAppVersion,
  mandatoryUpdateDialog,
} from '../../../utils/checkAppVersion';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../../../store/useAuthStore';
import { useWindowDimensions } from 'react-native';
import { closeDatabase } from '../../../database/DatabaseService';
import { stopSyncing } from '../../../services/SyncService';

const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation } = props;
  const { height } = useWindowDimensions();
  const spacing = height * 0.015; // 1.5% vertical spacing
  const { isNetworkAvailable } = useNetworkStatus();
  const isBiometricEnabled = useBiometricStore((state) => state?.isBiometricEnabled);
  const { logout } = useAuthStore();
  const setBiometricStatus = useBiometricStore.getState().setBiometricStatus;
  const [dialogConfig, setDialogConfig] = useState({
    visible: false,
    title: '',
    description: '',
    confirmLabel: '',
    cancelLabel: '',
    onCancel: () => {},
    onConfirm: () => {},
  });
  const permissionRequiredPayload = {
    visible: true,
    title: TEXTS.alertMessages.permissionRequired,
    description: TEXTS.alertMessages.noPermissionAlertMessage,
    confirmLabel: 'OK',
    cancelLabel: '',
    onCancel: () => setDialogConfig((prev) => ({ ...prev, visible: false })),
    onConfirm: () => setDialogConfig((prev) => ({ ...prev, visible: false })),
  };
  const [isCaseAccess, setIsCaseAccess] = useState(false);
  const [isScheduleAccess, setIsScheduleAccess] = useState(false);
  const [isDailyInspectionAccess, setIsDailyInspectionAccess] = useState(false);
  const [isLicenseAccess, setIsLicenseAccess] = useState(false);
  const [isParcleAccess, setIsParcleAccess] = useState(false);
  const [, setIsUpdateLater] = useState(false);
  const [isFormSubmissionAccess, setIsFormSubmissionAccess] = useState(false);

  useEffect(() => {
    const isUpdate = getIsUpdateLater();
    if (typeof isUpdate !== 'undefined') {
      setIsUpdateLater(isUpdate);
      if (isNetworkAvailable) {
        checkAppVersion(isUpdate);
      } else {
        const isVersion = getIsVersionUpdateOffline();
        if (isVersion) {
          mandatoryUpdateDialog();
        }
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // setTimeout(() => {
      getUserAccessPermissions();
      // }, 3000);
    }, []),
  );
  const Spacer = ({ gap = spacing }: { gap?: number }) => <View style={{ height: gap }} />;

  const getUserAccessPermissions = async () => {
    setIsCaseAccess(false);
    setIsScheduleAccess(false);
    setIsDailyInspectionAccess(false);
    setIsLicenseAccess(false);
    setIsParcleAccess(false);
    setIsFormSubmissionAccess(false);
  };
  // This below commented code i will remove in future
  // useEffect(() => {
  //   const myTabData = async () => {
  //     if (isNetworkAvailable) {
  //       try {
  //         // const client = new GovbuiltClientCaseService({
  //         //   baseUrl: authData?.value?.uRL?.url,
  //         //   headers: () => ({
  //         //     Authorization: authData?.access_token,
  //         //   }),
  //         // });
  //         // const data =await client.getGlobalCaseSetting.get();
  //         // if (data.ok) {
  //         //   // global.isShowTaskStatusLogTab = data.data.isShowTaskStatusLogTab;
  //         // } else {
  //         //   console.error("Failed to fetch global case settings:", data);
  //         // }
  //         const Payload = {
  //           url: authData?.value?.uRL?.url + URL.GET_GLOBAL_CASE_SETTING,
  //         };
  //         const Response = await GET_DATA(Payload);
  //         if (Response?.status === 200) {
  //           // const data = Response.data?.data;
  //         } else {
  //         }
  //       } catch (error) {
  //         console.error("Error fetching global case settings:", error);
  //       }
  //     } else {
  //     }
  //   };
  //   myTabData();
  // }, [isNetworkAvailable]);

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Image style={styles.drawerLogoStyle} source={IMAGES.DRAWER_LOGO} />
      </View>
      <View style={styles.drawerLogoBottomHeight} />
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isDailyInspectionAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.dailyInspections}
            </Text>
          )}
          icon={() =>
            isDailyInspectionAccess ? (
              <SvgImages.DAILY_INSPECTION_GRAY
                width={iconSize(0.03)}
                height={iconSize(0.03)}
                style={{ marginLeft: 10 }}
              />
            ) : (
              <SvgImages.DAILY_INSPECTION
                width={iconSize(0.03)}
                height={iconSize(0.03)}
                style={{ marginLeft: 10 }}
              />
            )
          }
          onPress={() => {
            navigation.toggleDrawer();
            if (isDailyInspectionAccess) {
              setDialogConfig(permissionRequiredPayload);
            } else {
              navigate('DailyInspection');
            }
          }}
        />
        <Spacer />
        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isCaseAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.myCase}
            </Text>
          )}
          icon={() => (
            <SvgImages.MY_CASE
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              style={{ marginLeft: 10 }}
              fill={isCaseAccess ? COLORS.GRAY_MEDIUM : COLORS.APP_COLOR}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            if (isCaseAccess) {
              setDialogConfig(permissionRequiredPayload);
            } else {
              navigate('MyCaseScreen');
            }
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isLicenseAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.licenses}
            </Text>
          )}
          icon={() => (
            <SvgImages.LICENSE
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              fill={isLicenseAccess ? COLORS.GRAY_MEDIUM : COLORS.APP_COLOR}
              style={{ marginLeft: 10 }}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            if (isLicenseAccess) {
              setDialogConfig(permissionRequiredPayload);
            } else {
              navigate('LicenseScreen');
            }
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
              {TEXTS.sideDrawerText.newForm}
            </Text>
          )}
          icon={() => (
            <SvgImages.NEW_FORM
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              style={{ marginLeft: 10 }}
              fill={COLORS.APP_COLOR}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();

            navigate('NewFormScreen');
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isFormSubmissionAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.formSubmissions}
            </Text>
          )}
          icon={() => (
            <SvgImages.FORM_SUBMISSION
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              fill={isFormSubmissionAccess ? COLORS.GRAY_MEDIUM : COLORS.APP_COLOR}
              style={{ marginLeft: 10 }}
            />
            // <Image
            //   style={[styles.drawerIconStyle, { tintColor: "#2563EB" }]}
            //   source={IMAGES.DRAWER_FORM_SUBMISSION}
            // />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            // if (isFormSubmissionAccess) {

            // setDialogConfig(permissionRequiredPayload);
            navigate('AdvanceFormSubmission');
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
              {TEXTS.sideDrawerText.reports}
            </Text>
          )}
          icon={() => (
            <SvgImages.Reports
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              fill={COLORS.APP_COLOR}
              style={{ marginLeft: 10 }}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            if (isNetworkAvailable) {
              navigate('ReportScreen');
            } else {
              ToastService.show("You're offline. Reports feature may not work.", COLORS.ERROR);
            }
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isScheduleAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.mySchedule}
            </Text>
          )}
          icon={() => (
            <SvgImages.MY_SHEDULE
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              fill={isScheduleAccess ? COLORS.GRAY_MEDIUM : COLORS.APP_COLOR}
              style={{ marginLeft: 10 }}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            if (isNetworkAvailable) {
              isScheduleAccess
                ? setDialogConfig(permissionRequiredPayload)
                : ToastService.show(
                    'This feature is currently under development and will be available soon.',
                    COLORS.STANDARAD_ORANGE,
                  );

              // navigate("MyScheduleScreen");
            } else {
              ToastService.show(TEXTS.alertMessages.offlineMsg, COLORS.ERROR);
            }
          }}
        />
        <Spacer />

        <DrawerItem
          label={() => (
            <Text
              style={[
                styles.drawerTextStyle,
                {
                  color: isParcleAccess ? COLORS.GRAY_MEDIUM : COLORS.BLACK,
                },
              ]}
            >
              {TEXTS.sideDrawerText.parcels}
            </Text>
          )}
          icon={() => (
            <SvgImages.PARCELS
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              fill={isParcleAccess ? COLORS.GRAY_MEDIUM : COLORS.APP_COLOR}
              style={{ marginLeft: 10 }}
            />
            // <Image
            //   style={[
            //     styles.drawerIconStyle,
            //     {
            //       tintColor: isParcleAccess
            //         ? COLORS.GRAY_MEDIUM
            //         : COLORS.APP_COLOR,
            //     },
            //   ]}
            //   source={IMAGES.DRAWER_PARCELS}
            // />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            if (isParcleAccess) {
              setDialogConfig(permissionRequiredPayload);
            } else {
              ToastService.show(
                'This feature is currently under development and will be available soon.',
                COLORS.STANDARAD_ORANGE,
              );
            }
          }}
        />
        <Spacer />

        {isBiometricEnabled && (
          <>
            <DrawerItem
              label={() => (
                <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
                  {TEXTS.sideDrawerText.deactivateBiometric}
                </Text>
              )}
              icon={() => (
                <Image
                  style={[styles.drawerIconStyle, { tintColor: COLORS.APP_COLOR }]}
                  source={IMAGES.DRAWER_REPORTS}
                />
              )}
              onPress={() => {
                navigation.toggleDrawer();
                // setShowBiometricDialog(true);
                setDialogConfig({
                  visible: true,
                  title: TEXTS.alertMessages.biometricLogin,
                  description: TEXTS.alertMessages.deactivateBiometric,
                  confirmLabel: TEXTS.alertMessages.yes,
                  cancelLabel: TEXTS.alertMessages.cancel,
                  onCancel: () => setDialogConfig((prev) => ({ ...prev, visible: false })),
                  onConfirm: () => {
                    setDialogConfig((prev) => ({ ...prev, visible: false }));
                    setBiometricStatus(false);
                    navigate('DashboardDrawerScreen');
                    ToastService.show(
                      TEXTS.alertMessages.successfullyDeactivated,
                      COLORS.SUCCESS_GREEN,
                    );
                  },
                });
              }}
            />
            <Spacer />
          </>
        )}

        {/* ) : (
        //   <DrawerItem
        //     label={() => (
        //       <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
        //         {TEXTS.sideDrawerText.activateBiometric}
        //       </Text>
        //     )}
        //     icon={() => (
        //       <Image
        //         style={[
        //           styles.drawerIconStyle,
        //           { tintColor: COLORS.APP_COLOR },
        //         ]}
        //         source={IMAGES.DRAWER_REPORTS}
        //       />
        //     )}
        //     onPress={() => {
        //       navigation.toggleDrawer();
        //       // setShowBiometricDialog(true);
        //       setDialogConfig({
        //         visible: true,
        //         title: TEXTS.alertMessages.biometricLogin,
        //         description: TEXTS.alertMessages.activateBiometric,
        //         confirmLabel: TEXTS.alertMessages.yes,
        //         cancelLabel: TEXTS.alertMessages.cancel,
        //         onCancel: () =>
        //           setDialogConfig((prev) => ({ ...prev, visible: false })),
        //         onConfirm: async () => {
        //           setDialogConfig((prev) => ({ ...prev, visible: false }));
        //           navigate("DashboardDrawerScreen");
        //           // setBiometricStatus(false);
        //           // loginWithBiometrics();
        //           // ToastService.show(
        //           //   TEXTS.alertMessages.successfullyActivated,
        //           //   COLORS.SUCCESS_GREEN
        //           // );
        //         },
        //       });
        //     }}
        //   />
      )}
       <Spacer />
      */}

        {/* {isUpdateLater && (
          <DrawerItem
            label={() => (
              <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
                {TEXTS.sideDrawerText.appUpdateAvailable}
              </Text>
            )}
            icon={() => (
              <SvgImages.APP_UPDATE
                width={iconSize(0.03)}
                height={iconSize(0.03)}
                style={{ marginLeft: 10 }}
              />
            )}
            onPress={() => {
              navigation.toggleDrawer();
              AppUpdateDialog(2);
            }}
          />
        )} */}

        <DrawerItem
          label={() => (
            <Text style={[styles.drawerTextStyle, { color: COLORS.BLACK }]}>
              {TEXTS.sideDrawerText.logout}
            </Text>
          )}
          icon={() => (
            <SvgImages.LOGOUT
              width={iconSize(0.03)}
              height={iconSize(0.03)}
              style={{ marginLeft: 10 }}
            />
          )}
          onPress={() => {
            navigation.toggleDrawer();
            setDialogConfig({
              visible: true,
              title: TEXTS.alertMessages.logout,
              description: TEXTS.alertMessages.logoutAlert,
              confirmLabel: TEXTS.alertMessages.yes,
              cancelLabel: TEXTS.alertMessages.cancel,
              onCancel: () => setDialogConfig((prev) => ({ ...prev, visible: false })),
              onConfirm: async () => {
                setDialogConfig((prev) => ({ ...prev, visible: false }));
                logout();
                // saveBaseUrl("");
                // saveAccessToken("");
                // saveUserRole("");
                // saveLicenseUserRole("");
                stopSyncing(); // stop sync loop
                await closeDatabase();
                navigate('LoginScreen');

                // setBiometricStatus(false);
              },
            });
          }}
        />
      </DrawerContentScrollView>

      {/* Modal */}
      <CustomConfirmationDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.confirmLabel}
        cancelLabel={dialogConfig.cancelLabel}
        onCancel={dialogConfig.onCancel}
        onConfirm={dialogConfig.onConfirm}
      />
    </View>
  );
};

export default DrawerContent;
