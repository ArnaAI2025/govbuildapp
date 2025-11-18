import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Payment } from '../../../../utils/interfaces/ISubScreens';
import {
  convertDate,
  formatDate,
  show2Decimals,
  StatusColorCodes,
} from '../../../../utils/helper/helpers';
import { fontSize, height, cardBorder } from '../../../../utils/helper/dimensions';
import { COLORS } from '../../../../theme/colors';
import globalStyles from '../../../../theme/globalStyles';
import { FONT_FAMILY } from '../../../../theme/fonts';

export const PaymentItemRow = ({ item }: { item: Payment }) => {
  const paymentStatus = item?.paymentStatus;
  const paymentDate = item?.paymentUtc ? convertDate(item.paymentUtc) : '';
  const company = item?.company ? item.company : '';
  const name = item?.name ? item.name : '';
  const orderNumber = item?.orderNumber || 'Unknown Order';
  const totalAmount = item?.totalAmount || 0;
  const paymentType = item?.paymentType || '';

  return (
    <View style={globalStyles.cardContainer}>
      <View style={styles.container}>
        {/* Top Row: Status + Date */}
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: StatusColorCodes(paymentStatus) }]}>
            {paymentStatus}
          </Text>
          <Text style={styles.dateText}>{formatDate(paymentDate, 'MM/DD/YYYY')}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Order Info */}
        <View style={styles.orderRow}>
          {/* <Text style={styles.nameText}>{`${company} (${name})`} - </Text> */}
          <Text style={styles.nameText}>
            {company ? `${company} (${name}) - ` : name ? `${name} - ` : ''}
          </Text>
          <Text style={styles.orderNumberText}>{orderNumber}</Text>
        </View>

        {/* Amount and Payment Type */}
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>{`$${show2Decimals(totalAmount?.toString())}`}</Text>
          <TouchableOpacity>
            <Text style={styles.paymentTypeText}>{paymentType}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: cardBorder(),
    backgroundColor: COLORS.BOX_COLOR,
    elevation: 3,
    marginVertical: height(0.01),
    marginHorizontal: 8,
    padding: 12,
  },
  container: {
    flexDirection: 'column',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize(0.026),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  dateText: {
    fontSize: fontSize(0.026),
    color: COLORS.GRAY_HEADING,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
    marginVertical: 10,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameText: {
    fontSize: fontSize(0.028),
    color: COLORS.GRAY_HEADING,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  orderNumberText: {
    fontSize: fontSize(0.028),
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: fontSize(0.03),
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  paymentTypeText: {
    fontSize: fontSize(0.028),
    color: COLORS.APP_COLOR,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
});
