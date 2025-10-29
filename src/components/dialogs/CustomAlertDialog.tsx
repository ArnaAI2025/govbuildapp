import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomAlertDialogProps {
  visible: boolean;
  onClose: () => void;
  onAction: (type: 'photos' | 'folder' | 'camera') => void;
}
const CustomAlertDialog = ({ visible, onClose, onAction }: CustomAlertDialogProps) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>Select Doc from</Text>
          <TouchableOpacity style={styles.alertButton} onPress={() => onAction('photos')}>
            <Text style={styles.buttonText}>Photos Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertButton} onPress={() => onAction('folder')}>
            <Text style={styles.buttonText}>Folder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertButton} onPress={() => onAction('camera')}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertButton: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
  },
  cancelButtonText: {
    color: 'red',
  },
});

export default CustomAlertDialog;
