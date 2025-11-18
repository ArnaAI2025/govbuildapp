import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Added vector icons import
import type { ExpandableViewProps } from '../../utils/interfaces/IComponent';
import { convertDateFormat } from '../../utils/helper/helpers';
import { COLORS } from '../../theme/colors';
import { fontSize, height, iconSize } from '../../utils/helper/dimensions';
import { TEXTS } from '../../constants/strings';
import { FONT_FAMILY } from '../../theme/fonts';

const ExpandableView: React.FC<ExpandableViewProps> = ({
  to,
  subject,
  createdUtc,
  succeeded,
  data,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const expandAnim = new Animated.Value(0);
  const sanitizedHtml = data.replace(/<label/g, '<span').replace(/<\/label>/g, '</span>');
  const toggleExpand = () => {
    console.log('Data --->', data);

    setIsExpanded(!isExpanded);
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand}>
        <View style={styles.headerContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.row}>
              <Text style={[styles.titleStyle, styles.toText]} numberOfLines={1}>
                {to}
              </Text>
              <Text style={[styles.titleStyle, styles.dateText]}>
                {convertDateFormat(createdUtc)}
              </Text>
            </View>
            <Text
              style={[
                styles.titleStyle,
                styles.statusText,
                { color: succeeded ? COLORS.SUCCESS_GREEN : COLORS.ERROR },
              ]}
            >
              {succeeded ? TEXTS.alertMessages.success : TEXTS.alertMessages.failed}
            </Text>
            <Icon
              name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={iconSize(0.03)}
              color={COLORS.BLACK}
              style={styles.arrowIcon}
            />
          </View>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.expandedContainer}>
          <Text style={styles.titleStyle}>{subject}</Text>
          <RenderHtml source={{ html: sanitizedHtml }} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // borderRadius: 10, // Added border radius to main container
    overflow: 'hidden', // Ensures content respects border radius
  },
  titleStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  toText: {
    width: '50%',
  },
  dateText: {
    marginLeft: 5,
  },
  statusText: {
    marginLeft: 5,
  },
  arrowIcon: {
    marginLeft: 6,
    color: COLORS.APP_COLOR,
  },
  expandedContainer: {
    padding: 10,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1, // Optional: adds a separator line
    borderTopColor: COLORS.LIST_CARD_BG,
  },
});

export default ExpandableView;
