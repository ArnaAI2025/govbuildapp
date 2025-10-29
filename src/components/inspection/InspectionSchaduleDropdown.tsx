import { InspectionSchaduleDropdownProps } from '../../utils/interfaces/ICase';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { fontSize, height, width } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import IMAGES from '../../theme/images';

export const InspectionScheduleDropDown: React.FC<InspectionSchaduleDropdownProps> = ({
  rowData,
  index,
  deleteInspectionType,
  type,
}) => {
  return (
    <View style={styles.mainView}>
      <Text style={{ flex: 1 }}>
        <Text style={styles.headingStyleSmall}>{rowData.displayText}</Text>
      </Text>

      <TouchableOpacity
        onPress={() => {
          deleteInspectionType(index, type);
        }}
        style={{ backgroundColor: COLORS.APP_COLOR }}
      >
        <Image resizeMode="contain" style={styles.iconStyle} source={IMAGES.DELETE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height(0.008),
    paddingHorizontal: width(0.03),
    margin: 4,
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: height(0.01),
  },
  headingStyleSmall: {
    color: COLORS.WHITE, // White text for contrast
    fontSize: fontSize(0.03),
    marginRight: 10,
  },

  contentStyleSmall: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    paddingRight: 20,
    flexShrink: 1,
  },
  iconStyle: {
    width: height(0.02),
    height: height(0.02),
    tintColor: COLORS.WHITE,
    marginLeft: 5,
  },
});
