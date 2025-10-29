import React, { useState } from 'react';
import { Modal, FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Checkbox from 'expo-checkbox';
import { StandardFolderFileDialogProps } from '../../utils/interfaces/IComponent';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';
import { TEXTS } from '../../constants/strings';
import { FONT_FAMILY } from '../../theme/fonts';

const StandardFolderFileDialog: React.FC<StandardFolderFileDialogProps> = ({
  visible,
  items,
  onClose,
  onSelect,
}) => {
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    setSelectedName(name);
    onSelect(name);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{TEXTS.subScreens.attachedItem.selectFile}</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleSelect(item?.Isfolder === 1 ? item?.name : item?.fileName)}
              >
                <Checkbox
                  value={selectedName === (item.Isfolder === 1 ? item.name : item.fileName)}
                  onValueChange={() =>
                    handleSelect(item?.Isfolder === 1 ? item?.name : item?.fileName)
                  }
                  color={
                    selectedName === (item.Isfolder === 1 ? item.name : item.fileName)
                      ? COLORS.APP_COLOR
                      : undefined
                  }
                />
                <Text style={styles.itemText}>
                  {item.Isfolder === 1 ? item.name : item.fileName}
                </Text>
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

export default StandardFolderFileDialog;
