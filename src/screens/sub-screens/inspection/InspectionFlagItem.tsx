import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import type { InspectionType, InspectionStatus } from '../../../utils/interfaces/ISubScreens';
import { COLORS } from '../../../theme/colors';
import { fontSize } from '../../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../../theme/fonts';

interface InspectionFlagItemProps {
  item: InspectionType | InspectionStatus;
}

export const renderItem = ({ item }: InspectionFlagItemProps) => (
  <View style={[styles.container, { backgroundColor: item.color || '#000' }]}>
    <Text style={styles.text}>{item.displayText}</Text>
  </View>
);

export const renderItemStatus = ({ item }: InspectionFlagItemProps) => (
  <View style={styles.container}>
    <Image
      style={{ height: 12, width: 12, tintColor: item?.color }}
      source={require('../../../assets/images/ic_circle.png')}
     />
    <Text style={styles.text}>{item.displayText}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 25,
    marginBottom: 5,
    alignItems: 'center',
    marginRight: 15,
    gap: 1,
  },
  text: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});
