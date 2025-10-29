import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { cardBorder, height } from '../../../utils/helper/dimensions';
import { CustomTextViewWithImage } from '../../../components/common/CustomTextViewWithImage';
import { StatusChangeItemRowProps } from '../../../utils/interfaces/IComponent';
import { TEXTS } from '../../../constants/strings';

export const StatusChangeItemRow = ({ rowData }: StatusChangeItemRowProps) => {
  return (
    <Card style={styles.container}>
      <View style={styles.subContainer}>
        <View>
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.statusChangeLog.dateLabel}
            line={1}
            title={rowData.date || ''}
          />
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.statusChangeLog.userNameLabel}
            line={1}
            title={rowData.userName || ''}
          />
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.statusChangeLog.previousStatusLabel}
            line={1}
            title={rowData.changeFrom || ''}
          />
          <CustomTextViewWithImage
            heading={TEXTS.subScreens.statusChangeLog.statusLabel}
            line={1}
            title={rowData.changeTo || ''}
          />
        </View>
      </View>
    </Card>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    marginLeft: 2,
    marginRight: 2,
  },
  subContainer: { padding: height(0.02) },
});
