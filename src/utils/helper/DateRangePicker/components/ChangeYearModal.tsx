import React, { useState } from 'react';
import {
  ColorValue,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal, // <-- using built-in Modal
} from 'react-native';
import type { Dispatch, SetStateAction, FC } from 'react';
import { COLORS } from '../../../../theme/colors';

export type ChangeYearModalProps = {
  colorOptions: {
    primary: ColorValue;
    backgroundColor: ColorValue;
  };
  dismiss: () => void;
  displayTime: Date;
  isVisible: boolean;
  setDisplayTime: Dispatch<SetStateAction<Date>>;
};

const ChangeYearModal: FC<ChangeYearModalProps> = ({
  colorOptions,
  displayTime,
  isVisible,
  dismiss,
  setDisplayTime,
}: ChangeYearModalProps) => {
  const { primary, backgroundColor } = colorOptions;
  const [year, setYear] = useState(displayTime.getFullYear());

  const handleConfirm = () => {
    const newDate = new Date(displayTime);
    newDate.setFullYear(year);
    setDisplayTime(newDate);
    dismiss();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor }]}>
          <TouchableOpacity onPress={() => setYear((prev) => prev - 1)} style={styles.btn}>
            <Image
              style={styles.iconStyle}
              source={require('../../../../assets/images/up_arrow_new.png')}
            />
            <Text style={styles.prevYearText}>{year - 1}</Text>
          </TouchableOpacity>

          <Text style={[styles.yearText, { color: primary }]}>{year}</Text>

          <TouchableOpacity onPress={() => setYear((prev) => prev + 1)} style={styles.btn}>
            <Text style={styles.nextYearText}>{year + 1}</Text>
            <Image
              style={styles.iconStyle}
              source={require('../../../../assets/images/arrow_down.png')}
            />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={dismiss} style={styles.actionBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.actionBtn}>
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangeYearModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    width: 250,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  prevYearText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  nextYearText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: COLORS.APP_COLOR,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
  },
  confirmText: {
    color: COLORS.APP_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
