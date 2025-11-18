// src/screens/TaskRowItem.tsx
import React from 'react';
import { View } from 'react-native';
import { CustomTextViewWithImage } from '../../../components/common/CustomTextViewWithImage';
import type { TaskRowItemProps } from '../../../utils/interfaces/IComponent';
import { TEXTS } from '../../../constants/strings';
import globalStyles from '../../../theme/globalStyles';

export const TaskRowItem = ({ rowData }: TaskRowItemProps) => {
  return (
    <View
      // style={
      //   (styles.headingStyle,
      //   {
      //     width:
      //       orientation === "PORTRAIT"
      //         ? WINDOW_WIDTH - WINDOW_WIDTH * 0.058
      //         : WINDOW_HEIGHT - WINDOW_WIDTH * 0.058,
      //   })
      // }
      style={globalStyles.cardContainer}
    >
      <View>
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.task.teamMemberLabel}
          line={1}
          title={rowData.teamMemberName}
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.task.statusLabel}
          line={1}
          title={rowData.status}
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.task.typeLabel}
          line={1}
          title={rowData.type}
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.task.dueDateLabel}
          line={1}
          title={rowData.dueDate}
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.task.statusChangeDateLabel}
          line={1}
          title={rowData.statusChangeDate}
        />
      </View>
    </View>
  );
};
