import { View, Text } from 'react-native';
import globalStyles from '../../theme/globalStyles';
import { height } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';

type Props = {
  heading: string;
  value: string;
  variant?: 'default' | 'small' | 'address';
  style?: object;
  numberOfLine?: number;
};

const TextHeadingAndValue: React.FC<Props> = ({
  heading,
  value,
  variant = 'default',
  style,
  numberOfLine = 1,
}) => {
  const isSmall = variant === 'small';
  const isAddress = variant === 'address';

  const headingStyle = isSmall
    ? globalStyles.headingStyleSmall
    : isAddress
      ? globalStyles.headingAddressStyle
      : globalStyles.headingStyle;

  const contentStyle = [
    isSmall
      ? globalStyles.contentStyleSmall
      : isAddress
        ? [globalStyles.contentStyle, { color: COLORS.BLUE_COLOR }]
        : globalStyles.contentStyle,
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: isSmall || isAddress ? height(0.01) : 0,
      }}
    >
      <Text style={[headingStyle, style]} numberOfLines={undefined}>
        {heading}
      </Text>
      <Text style={contentStyle} numberOfLines={numberOfLine}>
        {value}
      </Text>
    </View>
  );
};

export default TextHeadingAndValue;
