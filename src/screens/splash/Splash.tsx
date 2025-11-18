import type { FunctionComponent} from 'react';
import React, { useEffect, useRef } from 'react';
import { View, Animated, useWindowDimensions, Easing } from 'react-native';
import styles from './splashStyles';
import IMAGES from '../../theme/images';
import { TEXTS } from '../../constants/strings';
import { navigate } from '../../navigation/Index';
import { Text } from 'react-native-paper';
import useAuthStore from '../../store/useAuthStore';
import { useBiometricStore } from '../../store/biometricStore';
import { useNetworkStatus } from '../../utils/checkNetwork';
import { biometricVerification } from '../../services/BiometricService';
import { checkSessionTimeOut } from '../../session/TokenRefresh';

type Props = Record<string, never>;

const SplashScreen: FunctionComponent<Props> = () => {
  const { isNetworkAvailable } = useNetworkStatus();
  const { width, height } = useWindowDimensions();
  const orientation = height > width ? 'PORTRAIT' : 'LANDSCAPE';
  const hasNavigatedRef = useRef(false);
  const bounceAnim = useRef(new Animated.Value(-300)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const authData = useAuthStore((state) => state.authData);
  useEffect(() => {
    // Parallel animation for smoother start
    Animated.parallel([
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.bounce, // smoother bounce
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const hasPromptedBiometricThisSession = useBiometricStore(
    (state) => state.hasPromptedBiometricThisSession,
  );
  const setSessionPrompted = useBiometricStore((state) => state.setSessionPrompted);
  const isBiometricEnabled = useBiometricStore((state) => state?.isBiometricEnabled);
  const isUserLoggedIn = !!(authData && authData.access_token && authData.isLoggedIn);

  // console.log("Current Time:--->", Date.now());
  // console.log("Token Expire Time:---->", authData?.expireTime);
  // console.log("Expired:------>>>", Date.now() > authData?.expireTime);

  const handleNavigation = async () => {
    // const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    // // Proceed only if you're still on SplashScreen
    // if (currentRoute !== "SplashScreen") return;
    const sessionExpired = await checkSessionTimeOut();
    if (isNetworkAvailable) {
      if (isUserLoggedIn && !sessionExpired) {
        if (isBiometricEnabled && !hasPromptedBiometricThisSession) {
          const isVerified = await biometricVerification();
          if (isVerified) {
            setSessionPrompted(true);
            navigate('DashboardDrawerScreen');
          } else {
            navigate('LoginScreen');
          }
        } else {
          navigate('DashboardDrawerScreen');
        }
      } else {
        navigate('LoginScreen');
      }
    } else {
      if (isUserLoggedIn) {
        if (isBiometricEnabled && !hasPromptedBiometricThisSession) {
          const isVerified = await biometricVerification();
          if (isVerified) {
            setSessionPrompted(true); // Prevent re-prompting
            navigate('DashboardDrawerScreen');
          } else {
            navigate('LoginScreen');
          }
        } else {
          navigate('DashboardDrawerScreen');
        }
      } else {
        navigate('LoginScreen');
      }
    }
  };
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    const timeoutId = setTimeout(() => {
      handleNavigation();
      hasNavigatedRef.current = true;
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     handleNavigation();
  //   }, 3000);
  //   return () => clearTimeout(timeoutId);
  // }, [isUserLoggedIn, isNetworkAvailable, isBiometricEnabled]);

  return (
    <View style={styles.viewStyles}>
      <Animated.Image
        source={IMAGES.LOGO}
        style={[
          orientation === 'PORTRAIT' ? styles.logo : styles.logoLandScape,
          { transform: [{ translateY: bounceAnim }] },
        ]}
      />

      <Animated.View style={[styles.container, { opacity: textFadeAnim }]}>
        <Text style={styles.textStylesBold}>{TEXTS.spalsh.gov}</Text>
        <Text style={styles.textStylesMedium}>{TEXTS.spalsh.builtPlateform}</Text>
      </Animated.View>

      <Animated.Text style={[styles.textStylesContent, { opacity: textFadeAnim }]}>
        {TEXTS.spalsh.licensingSoftware}
      </Animated.Text>
      <Animated.Text style={[styles.textStylesContent1, { opacity: textFadeAnim }]}>
        {TEXTS.spalsh.nextGeneration}
      </Animated.Text>
      <Animated.Text style={[styles.textStylesContent1, { opacity: textFadeAnim }]}>
        {TEXTS.spalsh.CloudPermitting}
      </Animated.Text>
    </View>
  );
};
export default SplashScreen;
