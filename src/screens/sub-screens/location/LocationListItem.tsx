import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { CustomTextViewWithImage } from '../../../components/common/CustomTextViewWithImage';
import type { AdressModel } from '../../../utils/interfaces/ISubScreens';
import { formatDate, normalizeBool } from '../../../utils/helper/helpers';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { TEXTS } from '../../../constants/strings';
import IMAGES from '../../../theme/images';
import { CustomConfirmationDialog } from '../../../components/dialogs/CustomConfirmationDialog';
import { FONT_FAMILY } from '../../../theme/fonts';
import globalStyles from '../../../theme/globalStyles';

interface LocationListItemProps {
  rowData: AdressModel;
  orientation: string;
  navigation: any;
  callDeleteLocationApi: (contentId: string) => void;
  isOnline: boolean;
  contentItemId: string;
  isStatusReadOnly?: boolean;
}

export const LocationListItem = ({
  rowData,
  navigation,
  callDeleteLocationApi,
  isOnline,
  contentItemId: caseContentId,
  isStatusReadOnly = false,
}: LocationListItemProps) => {
  const [dialogConfig, setDialogConfig] = useState({
    visible: false,
    title: '',
    description: '',
    confirmLabel: '',
    cancelLabel: '',
    onCancel: () => {},
    onConfirm: () => {},
  });
  return (
    <View style={globalStyles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.location.parcelIdLabel}
            line={1}
            title={rowData.parcelId || ''}
          />
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.location.addressLabel}
            line={1}
            title={rowData.address || ''}
          />
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.location.endDateLabel}
            line={1}
            title={rowData.endDate ? formatDate(rowData.endDate, 'MM/DD/YYYY') : ''}
          />
        </View>
        {isOnline && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.buttonStyle, { opacity: isStatusReadOnly ? 0.4 : 1 }]}
              onPress={() => {
                setDialogConfig({
                  visible: true,
                  title: TEXTS.subScreens.location.deleteDialog.title,
                  description: `${TEXTS.subScreens.location.deleteDialog.description} (${rowData.parcelId})?`,
                  confirmLabel: TEXTS.alertMessages.yes,
                  cancelLabel: TEXTS.alertMessages.cancel,
                  onCancel: () => setDialogConfig((prev) => ({ ...prev, visible: false })),
                  onConfirm: () => {
                    setDialogConfig((prev) => ({ ...prev, visible: false }));
                    callDeleteLocationApi(rowData.contentItemId);
                  },
                });
              }}
              disabled={normalizeBool(isStatusReadOnly)}
            >
              <Image style={styles.icon} resizeMode="contain" source={IMAGES.DELETE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonStyle, { opacity: isStatusReadOnly ? 0.4 : 1 }]}
              onPress={() =>
                navigation.navigate('AddMultiLocation', {
                  isEdit: true,
                  data: rowData,
                  contentId: caseContentId,
                  isOnline: isOnline,
                })
              }
              disabled={normalizeBool(isStatusReadOnly)}
            >
              <Image style={styles.icon} resizeMode="contain" source={IMAGES.EDIT_ICON} />
            </TouchableOpacity>
          </View>
        )}
      </View>
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

const styles = StyleSheet.create({
  cardContent: {
    padding: height(0.01),
    flexDirection: 'row',
  },
  textRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  heading: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032),
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginRight: 5,
  },
  content: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    paddingRight: 20,
    flexShrink: 1,
  },
  actionButtons: {
    alignItems: 'flex-end',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 2,
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
    padding: 5,
    minWidth: WINDOW_WIDTH * 0.1,
    textAlign: 'center',
  },
  buttonStyle: {
    padding: 5,
    tintColor: COLORS.APP_COLOR,
  },
  icon: {
    width: iconSize(0.023),
    height: iconSize(0.023),
    tintColor: COLORS.APP_COLOR,
  },
});
