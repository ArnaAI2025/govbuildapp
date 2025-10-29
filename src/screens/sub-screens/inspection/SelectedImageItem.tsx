import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { IImageData } from '../../../utils/interfaces/ISubScreens';
import { RootStackParamList } from '../../../navigation/Types';
import { COLORS } from '../../../theme/colors';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY } from '../../../theme/fonts';
import { confirmAction } from '../../../components/dialogs/CustomConfirmationDialog';
import { normalizeBool } from '../../../utils/helper/helpers';

interface SelectedImageItemProps {
  item: IImageData;
  index: number;
  imageDelete: (index: number) => void;
  navigation: NavigationProp<RootStackParamList>;
  editImage?: (index: number) => void;
  isEdit: boolean;
  isStatusReadOnly?: boolean;
}

export const SelectedImageItem: React.FC<SelectedImageItemProps> = ({
  item,
  index,
  imageDelete,
  navigation,
  editImage,
  isEdit = false,
  isStatusReadOnly = false,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() =>
        navigation.navigate('AttachDocPreview', {
          paramKey: 'params',
          url: item.url,
        })
      }
    >
      <Text style={styles.filename} numberOfLines={2}>
        {item?.filename}
      </Text>
    </TouchableOpacity>
    <View style={styles.actions}>
      {isEdit && (
        <TouchableOpacity onPress={() => editImage(index)}>
          <Icon name="pencil" size={20} color={COLORS.APP_COLOR} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        hitSlop={{ left: 35, right: 35, top: 35, bottom: 35 }}
        onPress={() =>
          confirmAction(
            `Are you sure to want to delete this item?`,
            () => imageDelete(index),
            `Delete`,
          )
        }
        disabled={normalizeBool(isStatusReadOnly)}
        style={{ width: 25, alignItems: 'flex-end' }}
      >
        <Icon
          name="delete"
          size={20}
          color={COLORS.APP_COLOR}
          disabled={normalizeBool(isStatusReadOnly)}
        />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    borderRadius: 5,
    marginVertical: height(0.006),
  },
  imageContainer: { flexDirection: 'row', alignItems: 'flex-start', width: '87%' },
  image: {
    width: WINDOW_WIDTH * 0.1,
    height: WINDOW_WIDTH * 0.1,
    borderRadius: 2,
  },
  filename: {
    flex: 1,
    color: COLORS.BLUE_COLOR,
    fontSize: fontSize(0.028),
    marginLeft: 10,

    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  actions: { flexDirection: 'row', gap: 10 },
});
