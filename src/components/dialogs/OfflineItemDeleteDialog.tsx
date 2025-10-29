import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Dialog, Text } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { fontSize, height } from '../../utils/helper/dimensions';

type Action = {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  color?: string;
};

type CustomDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  actions: Action[];
  // onDismiss?: () => void; // for Cancel
  children?: React.ReactNode;
};

export const OfflineItemDeleteDialog: React.FC<CustomDialogProps> = ({
  visible,
  title,
  description,
  actions,
  // onDismiss,
  children,
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        // onDismiss={onDismiss}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.description}>{description}</Text>
          {children}
        </Dialog.Content>

        <Dialog.Actions style={styles.actionsContainer}>
          {actions.map((action, idx) => {
            const isCancel = action.label.toLowerCase() === 'cancel'; // detect cancel
            return (
              <TouchableOpacity
                key={idx}
                style={isCancel ? styles.closeButton : styles.applyButton}
                onPress={action.onPress}
              >
                <Text style={styles.textStyle}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
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
  description: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'column',
    rowGap: 15,
    paddingBottom: 20,
    width: '100%',
  },
  cancelContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: COLORS.APP_COLOR,
    justifyContent: 'center',
  },
  cancelButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 8,
    marginTop: 8,
    borderColor: COLORS.GRAY_DARK,
  },
  actionLabel: {
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: FONT_SIZE.Font_14,
  },

  // new styles
  closeButton: {
    width: '90%',
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
    width: '90%',
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
