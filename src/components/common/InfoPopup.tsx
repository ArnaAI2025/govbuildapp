import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { height } from '../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY } from '../../theme/fonts';

interface MyPopoverProps {
  infoMsg: string;
}

export const MyPopover: React.FC<MyPopoverProps> = ({ infoMsg }) => {
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
          <TouchableOpacity
            onPress={() => {
              openMenu();
            }}
          >
            <Icon
              name="information"
              size={20}
              color={COLORS.APP_COLOR}
              //style={styles.smallIconStyle}
            />
          </TouchableOpacity>
        }
      >
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipText}>{infoMsg}</Text>
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tooltipCard: {
    // Dark background like tooltips
    borderRadius: 6,
    maxWidth: WINDOW_WIDTH * 0.5,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },

  cardContent: {
    padding: 0, // Remove default extra padding
  },

  tooltipText: {
    color: COLORS.WHITE, // White text
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});
