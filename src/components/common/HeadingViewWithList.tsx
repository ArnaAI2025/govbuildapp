import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fontSize, marginTopAndBottom, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import RelatedListItem from '../../screens/sub-screens/related/RelatedListItem';
import { HeadingViewWithListProps } from '../../utils/interfaces/ISubScreens';

const HeadingViewWithList: React.FC<HeadingViewWithListProps> = ({ title, list }) => {
  return (
    <View>
      {list.length > 0 ? (
        <View>
          <Text style={styles.titleText}>{title}</Text>
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
  titleText: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.05),
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 5,
    marginBottom: 5,
    marginTop: marginTopAndBottom(0.05),
  },
  divider: {
    width: WINDOW_WIDTH,
    height: 0.5,
    backgroundColor: COLORS.GRAY_MEDIUM,
    marginBottom: 10,
  },
});
export default HeadingViewWithList;
