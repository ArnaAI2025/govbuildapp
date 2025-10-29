import { StyleSheet } from 'react-native';
import { height, marginTopAndBottom, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingTop: height(0.022),
    paddingBottom: 20,
    marginTop: marginTopAndBottom(-0.025),
    flexDirection: 'column',
    borderTopLeftRadius: WINDOW_WIDTH * 0.09,
    borderTopRightRadius: WINDOW_WIDTH * 0.09,
  },
});
