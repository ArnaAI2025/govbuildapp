import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOrientation } from '../../utils/useOrientation';
import CustomHeader from './CustomHeader';
import { COLORS } from '../../theme/colors';
import { goBack } from '../../navigation/Index';
import { ScreenWrapperProps } from '../../utils/interfaces/IComponent';
import { height } from '../../utils/helper/dimensions';
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  title,
  children,
  onBackPress,
  dateTimeObj = [],
}) => {
  const orientation = useOrientation();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
      <CustomHeader
        title={title}
        orientation={orientation}
        onPress={onBackPress || goBack}
        dateTimeObj={dateTimeObj}
      />
      <View style={styles.subContainer}>{children}</View>
    </View>
  );
};

export default ScreenWrapper;
const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 5,
    marginHorizontal: height(0.004),
    marginVertical: height(0.01),
    flexDirection: 'column',
    zIndex: 999,
  },
});
