import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fontSize } from '../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../theme/fonts';
import { COLORS } from '../../theme/colors';
import React from 'react';

type ExpandableTextProps = {
  text: string;
  numberOfLines?: number; // default = 1
};

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, numberOfLines = 1 }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <Text
        numberOfLines={expanded ? undefined : numberOfLines}
        style={{
          color: COLORS.GRAY_DARK,
          fontSize: fontSize(0.03),
          fontFamily: FONT_FAMILY.MontserratMedium,
          paddingRight: 21,
          flexShrink: 1,
        }}
      >
        {text}
      </Text>
      {text?.length > 30 && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text
            style={{
              color: COLORS.BLUE_COLOR,
              marginTop: 4,
              fontSize: fontSize(0.03),
              fontFamily: FONT_FAMILY.MontserratMedium,
            }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
export default React.memo(ExpandableText);
