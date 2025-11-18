import React, { useCallback } from 'react';
import {
  ImageBackground,
  Platform,
  View,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { styles } from './loginStyles';
import Loader from '../../../components/common/Loader';
import { useOrientation } from '../../../utils/useOrientation';
import { height, iconSize } from '../../../utils/helper/dimensions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from 'react-native-paper';
import AutocompleteInput from '../../../components/common/AutocompleteInput';
import FloatingInput from '../../../components/common/FloatingInput';
import { COLORS } from '../../../theme/colors';
import { navigate } from '../../../navigation/Index';
import IMAGES from '../../../theme/images';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { useFocusEffect } from '@react-navigation/native';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import useAuthStore from '../../../store/useAuthStore';
import { TEXTS } from '../../../constants/strings';
import { BiometricsPromptDialog } from '../../../components/dialogs/biometrics/BiometricsPromptDialog';
import { useBiometricStore } from '../../../store/biometricStore';
import useLoginStore from '../../../store/useLoginStore';
import { saveLoginCredentials, getLoginCredentials } from '../../../utils/secureStorage';
 
import {
  callLoginAPIService,
  fetchTenantList,
  handleLoginNavigation,
  handleOfflineLogin,
} from '../LoginService';
import { clearDBDialog } from '../../../components/dialogs/ClearDBDialog';

const LoginScreen: React.FC = () => {
  const { isNetworkAvailable } = useNetworkStatus();
  const { setAuthData, setOfflineAuthData } = useAuthStore.getState();
  const isBiometricEnabled = useBiometricStore((state) => state?.isBiometricEnabled);
  const offlineAuthData = useAuthStore((state) => state?.offlineAuthData);
  const orientation = useOrientation();
  const {
    userEmail,
    userPassword,
    isLoading,
    showBiometricDialog,
    isSelectedTenant,
    tenantData,
    items,
    isNextScreen,
    buttonText,
    loginData,
    query,
    setLoading,
    setUserEmail,
    setUserPassword,
    setShowBiometricDialog,
    setIsSelectedTenant,
    setTenantData,
    setItems,
    setIsNextScreen,
    setButtonText,
    setLoginData,
    setQuery,
  } = useLoginStore();

  const getTenantList = async () => {
    const tenants = await fetchTenantList();
    setItems(tenants);
  };
  useFocusEffect(
    useCallback(() => {
      const loadSavedCredentials = async () => {
        const creds = await getLoginCredentials();
        if (creds) {
          setUserEmail(creds.username);
          setUserPassword(creds.password);
        }
      };

      loadSavedCredentials();

      if (isNetworkAvailable === true) {
        getTenantList();
        if (!isSelectedTenant) {
          setIsNextScreen(false);
          setButtonText('Proceed');
        } else {
          // setIsNextScreen(true);
          // setButtonText('Sign in');
        }
      } else if (isNetworkAvailable === false) {
        setIsNextScreen(true);
        setButtonText('Sign in');
        // for offline
        // setIsNextScreen(true);
        // setButtonText('Sign in');
        setIsSelectedTenant(true);
      } else {
        console.log('Waiting for network status...');
      }
      return () => {};
    }, [isNetworkAvailable, isSelectedTenant]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }
      return () => {
        if (Platform.OS === 'android') {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      };
    }, []),
  );

  // This commented code is required
  const MsSignInAsync = async () => {
    // const config = {
    //   clientId: tenantData.authenticationAppId,
    //   clientSecret: tenantData.clientSecret,
    //   redirectUrl:
    //     Platform.OS == 'ios'
    //       ? tenantData.authenticationCallbackPathiOS + '/'
    //       : tenantData.authenticationCallbackPathAndroid,
    //   additionalParameters: { prompt: 'select_account' },
    //   serviceConfiguration: {
    //     authorizationEndpoint: tenantData.uRL.url + '/connect/authorize',
    //     tokenEndpoint: tenantData.uRL.url + '/connect/token',
    //   },
    //   scopes: ['api', 'profile', 'openid', 'offline_access'],
    //   responseTypes: 'code',
    // };
  };

  const checkUserLogin = async () => {
    console.log('Checking user login...', userEmail, userPassword);
    if (userEmail.trim() != '' && userPassword != '') {
      if (isNetworkAvailable) {
        if (
          offlineAuthData?.username.toUpperCase() === userEmail.trim().toUpperCase() &&
          offlineAuthData?.value?.contentItemId == tenantData?.contentItemId
        ) {
          callLoginAPI(1);
        } else {
          clearDBDialog(callLoginAPI, MsSignInAsync, 2);
        }
      } else {
        const result = handleOfflineLogin(userEmail, userPassword, offlineAuthData);
        if (result.success && result.authData) {
          await saveLoginCredentials(userEmail, userPassword);
          setUserEmail('');
          setUserPassword('');
          setAuthData(result?.authData);
          navigate('DashboardDrawerScreen');
        } else if (result.message) {
          ToastService.show(result.message, COLORS.ERROR);
        }
      }
    } else {
      ToastService.show(TEXTS.alertMessages.SelectEmailPassword, COLORS.ERROR);
    }
  };

  const callLoginAPI = async (type: number) => {
    const result = await callLoginAPIService(
      type,
      userEmail,
      userPassword,
      tenantData,
      isBiometricEnabled,
      setLoading,
      setLoginData,
      setAuthData,
      setOfflineAuthData,
    );
    console.log('Login Result:', result);
    if (result.success) {
      setUserEmail('');
      setUserPassword('');
      if (result.needsBiometricPrompt) {
        setShowBiometricDialog(true);
      } else {
        navigate('DashboardDrawerScreen');
      }
    }
  };

  const navigateDashboard = async () => {
    await handleLoginNavigation({
      loginData,
      setAuthData,
      setOfflineAuthData,
      setShowBiometricDialog,
    });
  };

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      {orientation === 'PORTRAIT' || (Platform.OS === 'ios' && Platform.isPad) ? (
        <View
          style={orientation === 'PORTRAIT' ? styles.headerContainer : styles.container_landscape}
        >
          <ImageBackground
            source={IMAGES.BACKGROUND_IMAGE}
            resizeMode="cover"
            style={
              orientation === 'PORTRAIT'
                ? styles.topbarBackground
                : Platform.OS === 'ios' && Platform.isPad
                  ? styles.topbarBackgroundIpad
                  : styles.topbarBackground1
            }
          >
            <Image style={styles.logo} source={IMAGES.LOGO_TEXT} resizeMode="contain" />
          </ImageBackground>
        </View>
      ) : (
        <View />
      )}
      <View
        style={[
          styles.viewStyles,
          {
            marginTop: orientation == 'PORTRAIT' ? -height(0.05) : 0,
          },
        ]}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraHeight={0}
          contentContainerStyle={styles.keyboardScrollView}
        >
          <View style={styles.viewFlex}>
            <Text
              style={[styles.textStylesWelcome, { marginTop: orientation === 'PORTRAIT' ? 10 : 0 }]}
            >
              {TEXTS.login.welcome}
            </Text>
            <Text style={styles.textStylesContent}>
              {!isNextScreen ? TEXTS.login.validCityCountry : TEXTS.login.validEmailPassword}
            </Text>

            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                marginTop: orientation === 'PORTRAIT' ? '35%' : '9%',
              }}
            >
              {!isNextScreen ? (
                <View>
                  <Text style={[styles.textStyleHint]}>{TEXTS.login.selectSite}</Text>
                  <AutocompleteInput
                    // label={TEXTS.login.selectCityCountry}
                    label={''}
                    placeholder={TEXTS.login.selectSitePlaceholder}
                    data={items}
                    query={query}
                    onQueryChange={(text) => {
                      setQuery(text);
                      if (text.trim() === '') {
                        setIsSelectedTenant(false);
                        setTenantData('');
                      }
                    }}
                    onSelect={(selectedItem: any) => {
                      if (selectedItem) {
                        setIsSelectedTenant(true);
                        setTenantData(selectedItem);
                      } else {
                        setIsSelectedTenant(false);
                        setTenantData('');
                      }
                    }}
                  />
                  {isSelectedTenant == false && (
                    <Text style={[styles.textStyleError]}>{TEXTS.login.requiredCityCountry}</Text>
                  )}
                </View>
              ) : (
                <View style={styles.flexStyle}>
                  <FloatingInput
                    // label={TEXTS.login.email}
                    label={''}
                    value={userEmail}
                    numberOfLines={1}
                    onChangeText={setUserEmail}
                    placeholder={TEXTS.login.emailPlaceholder}
                    keyboardType="default"
                    leftIcon="email"
                  />

                  <FloatingInput
                    // label={TEXTS.login.password}
                    label={''}
                    value={userPassword}
                    numberOfLines={1}
                    onChangeText={setUserPassword}
                    style={{ marginTop: 10 }}
                    placeholder={TEXTS.login.passwordPlaceholder}
                    secureTextEntry
                    leftIcon="lock"
                  />

                  <View style={styles.forgotPasswordView}>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 20, left: 20, right: 20 }}
                      onPress={() => {
                        if (isNetworkAvailable === true) {
                          navigate('ForgotPasswordScreen', {
                            baseUrl: tenantData?.uRL?.url,
                          });
                        } else {
                          ToastService.show(
                            TEXTS.alertMessages.forgotPassOfflineMsg,
                            COLORS.WARNING_ORANGE,
                          );
                        }
                      }}
                    >
                      <Text style={styles.textStyleHint}>{TEXTS.login.forgotPassword}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.flexDirectionRow}>
          {isNextScreen && isNetworkAvailable ? (
            <TouchableOpacity
              activeOpacity={isSelectedTenant ? 0 : 1}
              style={{ height: height(0.05) }}
              onPress={() => {
                setIsNextScreen(false);
                setButtonText('Proceed');
              }}
            >
              <View style={styles.btnView}>
                <Image
                  style={[
                    {
                      tintColor: COLORS.APP_COLOR,
                      width: iconSize(0.04),
                      height: iconSize(0.04),
                      marginRight: 5,
                      transform: [{ rotate: '180deg' }],
                    },
                  ]}
                  source={IMAGES.RIGHT_ARROW}
                />
                <Text style={styles.textStylesProceed}>{'Back'}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {/* This commented code is required for right now , i will remove in future. */}
          {/* <TouchableOpacity
            disabled={!isNetworkAvailable}
            onPress={() => {
              if (isNextScreen) {
                if (!isNetworkAvailable) {
                  setIsSelectedTenant(true);
                } else {
                  setIsNextScreen(false);
                  setButtonText("Proceed");
                }
              }
            }}
          >
            <Image
              style={[
                styles.dotStyle,
                isNextScreen
                  ? { tintColor: COLORS.GRAY_MEDIUM }
                  : { tintColor: COLORS.APP_COLOR },
              ]}
              source={
                isNextScreen == true
                  ? IMAGES.CIRCLE_IMAGE
                  : IMAGES.CIRCLE_ACTIVE_IMAGE
              }
            />
          </TouchableOpacity> */}
          {/* <Image
            style={[
              styles.dotStyle,
              isNextScreen
                ? { tintColor: COLORS.APP_COLOR }
                : { tintColor: COLORS.GRAY_MEDIUM },
            ]}
            source={
              isNextScreen == true
                ? IMAGES.CIRCLE_ACTIVE_IMAGE
                : IMAGES.CIRCLE_IMAGE
            }
          /> */}

          <View style={styles.btnContainer}>
            <TouchableOpacity
              activeOpacity={isSelectedTenant ? 0 : 1}
              // disabled={loginProcess}
              // disabled={showBiometricDialog}
              style={{ height: height(0.05) }}
              onPress={() => {
                if (isSelectedTenant) {
                  setIsNextScreen(true);
                  setButtonText('Sign in');
                  if (isNextScreen) {
                    checkUserLogin();
                  }
                }
              }}
            >
              <View style={styles.btnView}>
                <Text style={styles.textStylesProceed}>{buttonText}</Text>
                <Image
                  style={[
                    styles.nextButton,
                    {
                      tintColor: isSelectedTenant ? COLORS.APP_COLOR : COLORS.GRAY_MEDIUM,
                    },
                  ]}
                  source={IMAGES.RIGHT_ARROW}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BiometricsPromptDialog
        visible={showBiometricDialog}
        setVisible={setShowBiometricDialog}
        onSuccess={navigateDashboard}
        onSkip={navigateDashboard}
      />
    </View>
  );
};

export default LoginScreen;
