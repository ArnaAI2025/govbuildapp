import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ParcelModel } from '../../utils/interfaces/ISubScreens';
import globalStyles from '../../theme/globalStyles';
import { fontSize, iconSize } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigate } from '../../navigation/Index';
import { openMaps } from '../../utils/helper/helpers';

interface ParcelListItemProps {
  rowData: ParcelModel;
}

export const ParcelListItem: React.FC<ParcelListItemProps> = ({ rowData }) => {
  const handleMapNavigation = () => {
    if (rowData.applicationLocation) {
      const location = JSON.parse(rowData.applicationLocation);
      openMaps(location?.Address, true);
    }
  };

  return (
    <View style={[globalStyles.cardContainer]}>
      <TouchableOpacity
        // onPress={() =>
        //   navigate("ParcelDetailScreen", {
        //     parcelNumber: rowData.parcelNumber ??"",
        //   })
        // }
        onPress={() =>
          navigate('OpenInWebView', {
            paramKey: 'params',
            param: '/OrchardCore.Parcel.Genealogy/ParcelDetails/' + rowData.parcelNumber,
            title: 'Parcel info',
            isNotSkipScreen: true,
          })
        }
      >
        <View style={styles.cardContent}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.textRow}>
              <Icon
                name="package-variant"
                size={22}
                color={COLORS.APP_COLOR}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.headingStyle} numberOfLines={1}>
                {rowData.parcelNumber || ''}
              </Text>
              <TouchableOpacity onPress={() => handleMapNavigation()}>
                <Icon name="map-marker" size={22} color={COLORS.BLUE_COLOR} />
              </TouchableOpacity>
            </View>
            <View style={styles.textRow}>
              <Icon
                name="account"
                size={22}
                color={COLORS.APP_COLOR}
                style={{ marginRight: 6, marginBottom: 4 }}
              />
              <Text style={[styles.contentStyle, { fontSize: fontSize(0.034) }]} numberOfLines={1}>
                {(rowData.ownerFirstName || '') + ' ' + (rowData.ownerLastName || '')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleMapNavigation()} style={styles.textRow}>
              <Icon
                name="map-marker"
                size={22}
                color={COLORS.BLUE_COLOR}
                style={{ marginRight: 6, marginBottom: 4 }}
              />
              <Text
                style={[
                  styles.contentStyle,
                  { color: COLORS.APP_COLOR, fontFamily: FONT_FAMILY.MontserratSemiBold },
                ]}
                numberOfLines={1}
              >
                {rowData.address || ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingStyle: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratMedium,
    flex: 1,
  },
  contentStyle: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    fontFamily: FONT_FAMILY.MontserratRegular,
    paddingRight: 20,
    marginBottom: 5,
    alignItems: 'center',
  },
  icon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    tintColor: COLORS.APP_COLOR,
  },
});
