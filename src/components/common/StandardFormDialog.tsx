import React, { useState } from 'react';
import { Modal, FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Checkbox from 'expo-checkbox';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';
import { StandardFormDialogProps } from '../../utils/interfaces/IComponent';
import { TEXTS } from '../../constants/strings';
import { FONT_FAMILY } from '../../theme/fonts';

const StandardFormDialog: React.FC<StandardFormDialogProps> = ({
  visible,
  forms,
  onClose,
  onSelect,
}) => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const handleSelect = (form: string) => {
    setSelectedForm(form);
    onSelect(form);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{TEXTS.subScreens.attachedItem.selectForm}</Text>
          <FlatList
            data={forms}
            keyExtractor={(item) => item.contentItemId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleSelect(item.DisplayText)}
              >
                <Checkbox
                  value={selectedForm === item.DisplayText}
                  onValueChange={() => handleSelect(item.DisplayText)}
                  color={selectedForm === item.DisplayText ? COLORS.APP_COLOR : undefined}
                />
                <Text style={styles.itemText}>{item.DisplayText}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{TEXTS.alertMessages.noDataFound}</Text>
            }
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{TEXTS.caseScreen.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.GRAY_DARK,
  },
  dialog: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 16,
    maxHeight: height(0.6),
  },
  title: {
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.TEXT_COLOR,
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemText: {
    fontSize: fontSize(0.022),
    color: COLORS.TEXT_COLOR,
    marginLeft: 12,
    flex: 1,
  },
  emptyText: {
    fontSize: fontSize(0.022),
    color: COLORS.TEXT_COLOR,
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: COLORS.APP_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: fontSize(0.022),
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default StandardFormDialog;
