import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../../theme/colors';
import { fontSize, iconSize, width, WINDOW_WIDTH } from '../../../../utils/helper/dimensions';
import type { ContactItemRowProps } from '../../../../utils/interfaces/ISubScreens';
import IMAGES from '../../../../theme/images';
import { doCall } from '../../../../utils/helper/helpers';
import globalStyles from '../../../../theme/globalStyles';
import { FONT_FAMILY } from '../../../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ContactItemRow: React.FC<ContactItemRowProps> = ({
  rowData,
  navigation,
  type,
  caseLicenseID,
  caseLicenseData,
  isForceSync,
  isStatusReadOnly,
}) => (
  <View style={globalStyles.cardContainer}>
    <TouchableOpacity
      onPress={() => {
        const data = {
          addNew: false,
          param: rowData,
          type: type,
          caseLicenseID: caseLicenseID,
          caseLicenseData,
          isForceSync: isForceSync,
        };
        navigation.navigate('AddContact', data);
      }}
    >
      <View style={styles.container}>
        <View style={styles.nameContainer}>
          <Icon name="account" size={28} color={COLORS.APP_COLOR} />
          <Text style={styles.name} numberOfLines={2}>
            {rowData?.firstName || rowData?.lastName
              ? `${rowData?.firstName ?? ''} ${rowData?.lastName ?? ''}`.trim()
              : 'Unnamed Contact'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoContainer}>
          <Image
            tintColor={COLORS.APP_COLOR}
            style={styles.icon}
            source={IMAGES.EMAIL_ICON}
            resizeMode="contain"
          />
          <Text style={styles.infoText}>{rowData.email || 'N/A'}</Text>
        </View>

        <TouchableOpacity
          hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
          onPress={() => {
            if (!isForceSync && rowData?.phoneNumber != '') {
              doCall(rowData?.phoneNumber);
            }
          }}
          style={styles.infoContainer}
          disabled={isStatusReadOnly}
        >
          <Image
            tintColor={COLORS.APP_COLOR}
            style={styles.icon}
            source={IMAGES.PHONE_ICON}
            resizeMode="contain"
          />

          <Text style={styles.infoText}>{rowData.phoneNumber || 'N/A'}</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Image
              tintColor={COLORS.APP_COLOR}
              style={styles.icon}
              source={IMAGES.LOCATION_ICON}
              resizeMode="contain"
            />
            <Text style={styles.infoText}>{rowData.mailingAddress || 'N/A'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => {
              const data = {
                addNew: false,
                param: rowData,
                type: type,
                caseLicenseID: caseLicenseID,
                caseLicenseData,
                isForceSync: isForceSync,
              };
              navigation.navigate('AddContact', data);
            }}
          >
            {!isStatusReadOnly ? (
              <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
            ) : (
              <Icon name={'arrow-right'} size={24} color={COLORS.APP_COLOR} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 0,
    borderRadius: 10, // Rounded corners to match the image
    borderWidth: 0,
    elevation: 3, // Subtle shadow for a raised effect (adjusted from 5 to 3 for a lighter look)
    marginHorizontal: 5, // Slightly increased for better spacing
    marginVertical: 5,
    backgroundColor: COLORS.WHITE, // Ensure white background
  },
  container: {
    flexDirection: 'column',
    padding: WINDOW_WIDTH * 0.01,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: WINDOW_WIDTH * 0.015, // Reduced vertical padding for tighter spacing
  },
  name: {
    fontSize: fontSize(0.04), // Larger font size for the title
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    color: COLORS.BLACK,
    marginLeft: 5,
  },
  divider: {
    width: '100%', // Relative width for better adaptability
    height: 0.5,
    backgroundColor: COLORS.APP_COLOR,
    marginVertical: 5, // Added vertical margin for better separation
  },
  infoContainer: {
    flexDirection: 'row',
    paddingVertical: WINDOW_WIDTH * 0.01, // Adjusted padding for tighter spacing
    alignItems: 'center',
  },
  icon: {
    width: iconSize(0.018),
    height: iconSize(0.018),
    marginRight: 5, // Added margin for better spacing between icon and text
  },
  personIcon: {
    width: iconSize(0.022),
    height: iconSize(0.022),
    marginRight: 5, // Added margin for better spacing between icon and text
  },
  infoText: {
    fontSize: fontSize(0.03), // Slightly larger font size for better readability
    color: COLORS.GRAY_DARK, // Lighter color to match the subtext style in the image
    marginRight: width(0.02),
  },
  editIcon: {
    marginLeft: '10%',
  },
});
