import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import type { RootStackParamList } from '../../../navigation/Types';
import Loader from '../../../components/common/Loader';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { TEXTS } from '../../../constants/strings';
import { COLORS } from '../../../theme/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { fontSize } from '../../../utils/helper/dimensions';
import FloatingInput from '../../../components/common/FloatingInput';
import { FONT_FAMILY } from '../../../theme/fonts';
import { OwnerService } from './OwnerService';
import { useIsFocused } from '@react-navigation/native';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import PublishButton from '../../../components/common/PublishButton';
import { getDigitCount } from '../../../utils/helper/helpers';
import { emailRegex } from '../../../utils/validations';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';
interface OwnerScreenProps extends NativeStackScreenProps<RootStackParamList, 'OwnerScreen'> {}

const OwnerScreen: React.FC<OwnerScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus() ?? {};
  const { param } = route.params;
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  // const spacing = deviceHeight * 0.015; // 1.5% vertical spacing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cellNumber: '',
    address: '',
    ownerData: [] as any[],
    mailingAddress: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    phone: false,
    cellNumber: false,
  });
  // const Spacer = ({ gap = spacing }: { gap?: number }) => (
  //   <View style={{ height: gap }} />
  // );

  const updateFormData = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchOwnerData = async () => {
      setLoading(true);
      const data = await OwnerService.fetchOwnerData(param?.contentItemId, isNetworkAvailable);

      setFormData({
        ...formData,
        ownerData: data,
        name: data?.ownerName,
        email: data?.ownerEmail,
        phone: data?.ownerPhoneNumber,
        cellNumber: data?.ownerCellPhone,
        address: data?.ownerAddress,
        mailingAddress: data?.ownerMailingAddress,
      });

      setLoading(false);
    };
    fetchOwnerData();
  }, [isFocused, param?.contentItemId, isNetworkAvailable]);

  const validations = [
    {
      key: 'email',
      condition: !!formData?.email?.trim() && !emailRegex.test(formData.email.trim()),
      message: 'Invalid email',
    },
    {
      key: 'phone',
      condition: !!formData?.phone?.trim() && getDigitCount(formData?.phone) !== 10, //added 14 length because the number is comming in the formate
      message: 'The Phone Number is not valid.',
    },
    {
      key: 'cellNumber',
      condition: !!formData?.cellNumber?.trim() && getDigitCount(formData?.cellNumber) !== 10, //added 14 lenngth because the number is comming in the formate
      message: 'The Cell Number is not valid.',
    },
  ];
  const checkValidation = () => {
    const errors: { [key: string]: boolean } = {};
    let hasError = false;
    for (const item of validations) {
      if (item.condition) {
        if (!hasError) {
          ToastService.show(item.message, COLORS.ERROR);
          hasError = true;
        }
        if (item.key) {
          errors[item.key] = true;
        }
      } else {
        if (item.key) {
          errors[item.key] = false;
        }
      }
    }
    // Ensure all expected keys are initialized
    setFieldErrors((prev) => ({
      ...prev,
      email: errors.email || false,
      phone: errors.phone || false,
      cellNumber: errors.cellNumber || false,
    }));
    if (hasError) return;
    callSaveApi();
  };

  const callSaveApi = async () => {
    try {
      setLoading(true);
      await OwnerService.saveOwnerDetails(formData, param?.contentItemId, isNetworkAvailable);
      setLoading(false);
    } catch (error) {
      recordCrashlyticsError('Error saveOwnerDetails:', error);
      console.error('Error saving:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      <ScreenWrapper title={TEXTS.subScreens.owner.owner}>
        <KeyboardAwareScrollView
          nestedScrollEnabled
          extraScrollHeight={150}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 10 }}
        >
          <FloatingInput
            label={TEXTS.subScreens.owner.name}
            value={formData.name}
            numberOfLines={1}
            onChangeText={(text) => updateFormData('name', text)}
            placeholder={'Name'}
            keyboardType="default"
            hintText={TEXTS.subScreens.owner.nameHint}
          />
          {/* <Spacer /> */}
          <FloatingInput
            label={TEXTS.subScreens.owner.email}
            value={formData.email}
            numberOfLines={1}
            onChangeText={(text) => {
              updateFormData('email', text);
              if (text?.trim() !== '') {
                setFieldErrors((prev) => ({
                  ...prev,
                  email: false,
                }));
              }
            }}
            placeholder={'Email'}
            keyboardType="email-address"
            hintText={TEXTS.subScreens.owner.emailHint}
            error={fieldErrors.email}
            style={styles.marginTop}
          />
          {/* <Spacer /> */}
          <FloatingInput
            label={TEXTS.subScreens.owner.phoneNumber}
            value={formData.phone}
            onChangeText={(text) => {
              updateFormData('phone', text);
              if (text?.trim() !== '') {
                setFieldErrors((prev) => ({
                  ...prev,
                  phone: false,
                }));
              }
            }}
            placeholder={TEXTS.subScreens.owner.phoneNumber}
            keyboardType="phone-pad"
            isPhoneNumber
            hintText={TEXTS.subScreens.owner.phoneNumberHint}
            error={fieldErrors.phone}
            style={styles.marginTop}
          />
          {/* <Spacer /> */}
          <FloatingInput
            label={TEXTS.subScreens.owner.cellNumber}
            value={formData.cellNumber}
            onChangeText={(text) => {
              updateFormData('cellNumber', text);
              if (text?.trim() !== '') {
                setFieldErrors((prev) => ({
                  ...prev,
                  cellNumber: false,
                }));
              }
            }}
            placeholder={TEXTS.subScreens.owner.cellNumber}
            keyboardType="phone-pad"
            isPhoneNumber
            hintText={TEXTS.subScreens.owner.cellNumberHint}
            error={fieldErrors.cellNumber}
            style={styles.marginTop}
          />
          {/* <Spacer /> */}
          <FloatingInput
            label={TEXTS.subScreens.owner.address}
            value={formData.address}
            numberOfLines={1}
            onChangeText={(text) => updateFormData('address', text)}
            placeholder={TEXTS.subScreens.owner.address}
            keyboardType="default"
            hintText={TEXTS.subScreens.owner.addressHint}
            style={styles.marginTop}
          />
          {/* <Spacer /> */}
          <FloatingInput
            label={TEXTS.subScreens.owner.mailingAddress}
            value={formData.mailingAddress}
            numberOfLines={1}
            onChangeText={(text) => updateFormData('mailingAddress', text)}
            placeholder={TEXTS.subScreens.owner.mailingAddress}
            keyboardType="default"
            hintText={TEXTS.subScreens.owner.mailingAddressHint}
            style={styles.marginTop}
          />
          {/* <Spacer /> */}
          {/* <TouchableOpacity
            style={styles.publishButton}
            onPress={checkValidation}
          >
            <Text style={styles.publishText}>
              {TEXTS.subScreens.licenseDetails.publish}
            </Text>
          </TouchableOpacity> */}
          <PublishButton contacinerStyle={styles.marginTop} onPress={checkValidation} />
        </KeyboardAwareScrollView>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marginTop: {
    marginTop: 15,
  },
  publishButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 20,
    marginBottom: 50,
  },
  publishText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
});

export default OwnerScreen;
