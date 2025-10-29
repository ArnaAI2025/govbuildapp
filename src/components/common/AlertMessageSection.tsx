import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import IMAGES from '../../theme/images';
import { COLORS } from '../../theme/colors';
import { height, iconSize } from '../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import HTMLView from 'react-native-htmlview';

interface AlertMessageSectionProps {
  alertData: any[];
  isOnline: boolean;
}

export const AlertMessageSection: React.FC<AlertMessageSectionProps> = ({
  alertData,
  isOnline,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!alertData || alertData?.length === 0) return null;

  return (
    <View style={styles.alertContainer}>
      <TouchableOpacity
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={1}
        style={styles.alertHeader}
      >
        <Text style={styles.alertTitle}>Alerts</Text>
        <Image
          source={isExpanded ? IMAGES.EXPAND_ICON : IMAGES.COLLAPSE_ICON}
          style={styles.icon}
          tintColor={COLORS.APP_COLOR}
        />
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          data={alertData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertItem}>
              <HTMLView
                value={
                  isOnline && item?.commentSubmissionPart
                    ? item?.commentSubmissionPart?.Comment
                    : item?.comment
                }
                textComponentProps={{
                  style: styles.alertText,
                }}
                stylesheet={{
                  div: styles.alertText,
                  p: styles.alertText,
                  span: styles.alertText,
                  text: styles.alertText,
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    borderWidth: 1,
    borderColor: '#E9E9E9',
    marginBottom: height(0.01),
    marginTop: height(0.01),
    borderRadius: 5,
    marginHorizontal: 5,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height(0.015),
    borderRadius: 5,
    backgroundColor: '#E9E9E9',
  },
  alertTitle: {
    flex: 1,
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_16,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  alertText: {
    // color: "#EA868F",
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  icon: {
    width: iconSize(0.022),
    height: iconSize(0.022),
    tintColor: COLORS.BLUE_COLOR,
  },
  alertItem: {
    margin: 10,
    padding: 10,
    marginVertical: height(0.01),
    // backgroundColor: "#52161C", //dark mode
    backgroundColor: COLORS.RED_TRANS,
    borderRadius: 5,
    borderWidth: 0.5,
    // borderColor: "#842029", //dark mode
    borderColor: COLORS.RED,
  },
});
