import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { HeadingViewWithListProps } from '../../../utils/interfaces/ISubScreens';
import RelatedListItem from './RelatedListItem';
import { fontSize, height, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';

export const HeadingViewWithList: React.FC<HeadingViewWithListProps> = ({
  title,
  list,
  navigation,
}) => {
  console.log('HeadingViewWithList props:', { title, list, navigation });

  return (
    <View style={styles.container}>
      {list.length > 0 ? (
        <View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.divider} />
          <FlatList
            data={list}
            renderItem={({ item }) => RelatedListItem(item)}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      ) : (
        <View />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: height(0.02) },
  title: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.05),
    fontWeight: '500',
    marginLeft: 5,
    marginBottom: 5,
  },
  divider: {
    width: WINDOW_WIDTH,
    height: 0.5,
    backgroundColor: COLORS.GRAY_MEDIUM,
    marginBottom: 10,
  },
});
