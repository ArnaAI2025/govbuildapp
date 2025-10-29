import React from 'react';
import { View, Modal, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { loginWithBiometrics } from '../../../services/BiometricService';
import { fontSize, height, iconSize, marginTopAndBottom } from '../../../utils/helper/dimensions';
import { TEXTS } from '../../../constants/strings';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import { COLORS } from '../../../theme/colors';
import IMAGES from '../../../theme/images';

type BiometricsPromptDialogProps = {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onSuccess: () => void;
  onSkip: () => void;
};

export const BiometricsPromptDialog: React.FC<BiometricsPromptDialogProps> = ({
  visible,
  setVisible,
  onSuccess,
  onSkip,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={[
        'portrait',
        'portrait-upside-down',
        'landscape',
        'landscape-left',
        'landscape-right',
      ]}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image source={IMAGES.BIOMATRIX_ICON} style={styles.icon} resizeMode="contain" />
          <Text style={styles.title}>{TEXTS.alertMessages.enableBiometric}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                setVisible(false);
                onSkip();
              }}
            >
              <Text style={styles.textStyle}>{"I'll do it later"}</Text>
              {/* <Text style={styles.skipText}>{"I'll do it later"}</Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enableBtn}
              onPress={() => {
                setVisible(false);
                loginWithBiometrics(onSuccess);
              }}
            >
              <Text style={styles.textStyle}>{'Enable'}</Text>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            style={styles.enableBtn}
            onPress={() => {
              setVisible(false);
              loginWithBiometrics(onSuccess);
            }}
          >
            <Text style={styles.enableText}>Enable</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              setVisible(false);
              onSkip();
            }}
          >
            <Text style={styles.skipText}>I'll do it later</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  container: {
    margin: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    width: iconSize(0.1),
    height: iconSize(0.1),
  },
  title: {
    fontSize: fontSize(0.04),
    fontFamily: FONT_FAMILY.MontserratMedium,
    textAlign: 'center',
    marginTop: 10,
  },
  enableBtn: {
    // backgroundColor: COLORS.APP_COLOR,
    // height: height(0.035),
    // width: width(0.4),
    // marginTop: marginTopAndBottom(0.06),
    // borderRadius: 5,
    // justifyContent: "center",
    // alignItems: "center",
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  enableText: {
    fontSize: FONT_SIZE.Font_12,
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  skipBtn: {
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    // backgroundColor: COLORS.GRAY_MEDIUM,
    backgroundColor: COLORS.GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  skipText: {
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    width: '100%',
    marginTop: marginTopAndBottom(0.06),
  },
  textStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
});
