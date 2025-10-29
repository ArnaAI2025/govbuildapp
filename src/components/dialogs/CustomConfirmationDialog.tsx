import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { fontSize, height } from '../../utils/helper/dimensions';

type CustomConfirmationDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const CustomConfirmationDialog: React.FC<CustomConfirmationDialogProps> = ({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <Portal>
      <Dialog
        visible={visible}
        // onDismiss={onCancel}
        style={[
          styles.dialog,
          {
            marginHorizontal: isTablet ? width * 0.2 : 16,
            paddingBottom: isTablet ? 16 : 8,
          },
        ]}
      >
        <Dialog.Title style={[styles.title, isTablet && styles.titleTablet]}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={[styles.paragraph, isTablet && styles.paragraphTablet]}>{description}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {cancelLabel ? (
            // <View style={styles.buttonContainer}>
            //   <Button
            //     onPress={onCancel}
            //     mode="outlined"
            //     style={[styles.outlinedButton, isTablet && styles.buttonTablet]}
            //     labelStyle={[
            //       styles.outlinedButtonText,
            //       isTablet && styles.buttonTextTablet,
            //     ]}
            //   >
            //     {cancelLabel}
            //   </Button>
            //   <Button
            //     onPress={onConfirm}
            //     mode="contained"
            //     style={[styles.filledButton, isTablet && styles.buttonTablet]}
            //     labelStyle={[
            //       styles.filledButtonText,
            //       isTablet && styles.buttonTextTablet,
            //     ]}
            //   >
            //     {confirmLabel}
            //   </Button>
            // </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <Text style={styles.textStyle}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={onConfirm}>
                <Text style={styles.textStyle}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.singleButtonContainer}>
              <Button
                onPress={onConfirm}
                mode="contained"
                style={[styles.singleFilledButton, isTablet && styles.singleFilledButtonTablet]}
                labelStyle={[styles.filledButtonText, isTablet && styles.buttonTextTablet]}
              >
                {confirmLabel}
              </Button>
            </View>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_18,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textAlign: 'center',
  },
  titleTablet: {
    fontSize: FONT_SIZE.Font_20,
  },
  paragraph: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginTop: 4,
    textAlign: 'center',
  },
  paragraphTablet: {
    fontSize: FONT_SIZE.Font_16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    width: '100%',
  },
  outlinedButton: {
    borderColor: COLORS.APP_COLOR,
    borderWidth: 1,
    borderRadius: 8,
    width: '48%',
  },
  filledButton: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 8,
    width: '48%',
  },
  outlinedButtonText: {
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.APP_COLOR,
  },
  filledButtonText: {
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.WHITE,
  },
  buttonTablet: {
    width: '46%',
    paddingVertical: 6,
  },
  buttonTextTablet: {
    fontSize: FONT_SIZE.Font_16,
  },
  singleButtonContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  singleFilledButton: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 8,
    paddingHorizontal: 40,
  },
  singleFilledButtonTablet: {
    paddingHorizontal: 80,
  },
  closeButton: {
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
  applyButton: {
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
  textStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
});

export const confirmAction = (message: string, onConfirm: () => void, confirmmessage?: string) => {
  Alert.alert(
    confirmmessage ?? 'Confirmation',
    message,
    [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: onConfirm },
    ],
    { cancelable: true },
  );
};
