import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { height } from '../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY } from '../../theme/fonts';

interface DateTimeInfoToolTipProps {
  createdBy: string;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn?: string;
  size?: number;
}

export const DateTimeInfoToolTip: React.FC<DateTimeInfoToolTipProps> = ({
  createdBy,
  createdOn,
  modifiedBy,
  modifiedOn,
  size,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        style={{ marginTop: height(0.022) }}
        contentStyle={{ backgroundColor: COLORS.BLACK_LITE }}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <Icon name="calendar-clock" size={size ?? 20} color={COLORS.APP_COLOR} />
          </TouchableOpacity>
        }
      >
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipText}>Created By: {createdBy || ''}</Text>
          <Text style={styles.tooltipText}>Created On: {createdOn || ''}</Text>

          {(modifiedBy || modifiedOn) && (
            <View style={{ marginTop: height(0.01) }}>
              <Text style={styles.tooltipText}>Modified By: {modifiedBy?.toUpperCase() || ''}</Text>
              <Text style={styles.tooltipText}>Modified On: {modifiedOn || ''}</Text>
            </View>
          )}
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: COLORS.WHITE, // Ensure the tooltip has a background
  },
  tooltipCard: {
    // Dark background like tooltips
    borderRadius: 6,
    maxWidth: WINDOW_WIDTH,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    backgroundColor: COLORS.BLACK_LITE,
  },

  cardContent: {
    padding: 0, // Remove default extra padding
  },

  tooltipText: {
    color: COLORS.WHITE, // White text
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});
