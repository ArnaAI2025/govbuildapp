import React, { useState, useRef } from 'react';
import type {
  ListRenderItemInfo} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
} from 'react-native';
import { navigate } from '../../navigation/Index';
import { COLORS } from '../../theme/colors';
import { iconSize } from '../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { ToastService } from './GlobalSnackbar';

interface RowData {
  FileName: string;
  Attachment: string;
}

interface ExpandableViewHelperFileProps {
  data: RowData[];
  isNetConnected: boolean;
  style?: object;
}

const ExpandableViewHelperFile: React.FC<ExpandableViewHelperFileProps> = ({
  data,
  isNetConnected,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderItem = ({ item: rowData }: ListRenderItemInfo<RowData>) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (isNetConnected) {
            navigate('AttachDocPreview', {
              paramKey: 'params',
              url: rowData.Attachment,
              fileType: rowData.Attachment.split('.')[1],
            });
          } else {
            ToastService.show("You can't access this in offline mode.", COLORS.WARNING_ORANGE);
          }
        }}
        style={styles.fileItem}
      >
        {/* <Icon
          name={(rowData.FileName)}
          size={iconSize(0.05)}
          color={COLORS.APP_COLOR}
        /> */}
        <Text style={styles.fileName} numberOfLines={1}>
          {rowData.FileName}
        </Text>
      </TouchableOpacity>
    );
  };

  const maxHeight = data.length * 56; // Approximate item height

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.headerText}>{`Attachments (${data.length})`}</Text>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={iconSize(0.035)}
          color={COLORS.APP_COLOR}
        />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.listContainer,
          {
            height: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight],
            }),
            opacity: expandAnim,
          },
        ]}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 6,
    // padding: 12,
    marginTop: 8,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    //paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.BLACK,
  },
  listContainer: {
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  fileName: {
    flex: 1,
    fontSize: FONT_SIZE.Font_14,
    color: COLORS.BLUE_COLOR,
    marginLeft: 10,
  },
});

export default React.memo(ExpandableViewHelperFile);
