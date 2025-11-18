import React from 'react';
import { View, Text } from 'react-native';
import Checkbox from 'expo-checkbox';
import type {
  StandardComment,
  StandardCommentDialogListItemProps,
} from '../../utils/interfaces/ISubScreens';
import { FONT_FAMILY } from '../../theme/fonts';
import { COLORS } from '../../theme/colors';
import type { FilterItem } from '../../utils/interfaces/ICase';
import globalStyles from '../../theme/globalStyles';

const RowView: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <Text style={{ flex: 1, marginTop: 8 }}>
    <Text style={{ fontFamily: FONT_FAMILY.MontserratBold }}>{title}</Text>
    <Text style={{ color: COLORS.BLACK, fontFamily: FONT_FAMILY.MontserratMedium }}>{value}</Text>
  </Text>
);

const getCommentType = (commentTypes: FilterItem[] = [], value: StandardComment): string => {
  let commentTypeString = '';
  const contentItemIds = value.StandardComment.CommentType?.ContentItemIds ?? [];

  commentTypes.forEach((type) => {
    if (contentItemIds.includes(type.id)) {
      commentTypeString += `${type.displayText}, `;
    }
  });

  return commentTypeString.length > 0
    ? commentTypeString.slice(0, -2) // remove trailing ", "
    : commentTypeString;
};

export const StandardCommentDialogListItem: React.FC<StandardCommentDialogListItemProps> = ({
  rowData,
  checked,
  setChecked,
  inspectionCommentType,
}) => {
  const handleCheckboxChange = (newValue: boolean) => {
    const newIds = [...checked];
    const index = newIds.indexOf(rowData.ContentItemId);
    if (index > -1 && !newValue) {
      newIds.splice(index, 1);
    } else if (newValue) {
      newIds.push(rowData.ContentItemId);
    }
    setChecked(newIds);
  };

  return (
    <View style={globalStyles.cardContainer}>
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <RowView title="Title - " value={rowData.DisplayText} />
        <Checkbox
          value={checked.includes(rowData.ContentItemId)}
          onValueChange={handleCheckboxChange}
          color={checked.includes(rowData.ContentItemId) ? COLORS.APP_COLOR : COLORS.GRAY_DARK}
          style={{ borderRadius: 5 }}
        />
      </View>
      <RowView title="Type - " value={getCommentType(inspectionCommentType, rowData)} />
      <RowView title="Short Description - " value={rowData.StandardComment.ShortDescription.Text} />
    </View>
  );
};
