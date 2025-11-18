import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize, iconSize } from '../../utils/helper/dimensions';
import type { AddFormItemViewProps } from '../../utils/interfaces/ISubScreens';
import IMAGES from '../../theme/images';
import { FONT_FAMILY } from '../../theme/fonts';
import globalStyles from '../../theme/globalStyles';

const AddFormItemView: React.FC<AddFormItemViewProps> = ({
  item,
  navigation,
  isNetConnected,
  caseLicenseData,
  isMyCase,
}) => {
  const handlePress = () => {
    if (isNetConnected) {
      navigation.navigate('WebViewForForm', {
        type: isMyCase
          ? 'Case' + '/' + caseLicenseData.contentItemId
          : 'License' + '/' + caseLicenseData.contentItemId,
        param: item?.AutoroutePart,
        title: 'Add Form',
        caseId: isMyCase ? caseLicenseData?.contentItemId : '',
        licenseId: !isMyCase ? caseLicenseData?.contentItemId : '',
        data: item,
        flag: 2,
      });
    } else {
      navigation.navigate('NewFormWebView', {
        type: isMyCase ? 'Case' : 'License',
        param: item,
        caseId: isMyCase ? caseLicenseData?.contentItemId : '',
        licenseId: !isMyCase ? caseLicenseData?.contentItemId : '',
        caseLicenseObject: caseLicenseData,
        flag: 2,
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        globalStyles.cardContainer,
        { flexDirection: 'row', justifyContent: 'space-between' },
      ]}
      onPress={handlePress}
    >
      <Text numberOfLines={5} style={styles.displayText}>
        {item.DisplayText}
      </Text>
      <Image
        tintColor={COLORS.APP_COLOR}
        style={styles.icon}
        source={IMAGES.LEFT_ARRAOW}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 16,
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  displayText: {
    fontSize: fontSize(0.029),
    color: COLORS.TEXT_COLOR,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    width: '94%',
  },
  icon: {
    width: iconSize(0.027),
    height: iconSize(0.027),
    transform: [{ rotate: '180deg' }],
  },
});

export default AddFormItemView;
