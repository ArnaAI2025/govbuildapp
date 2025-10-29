import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AccountingDetailRowItemProps,
  AccountingDetailTitle,
} from '../../../../utils/interfaces/ISubScreens';
import { cardBorder, fontSize, height } from '../../../../utils/helper/dimensions';
import { formatToCustomDateTimeUTC } from '../../../../utils/helper/helpers';
import { COLORS } from '../../../../theme/colors';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import { ExpandableTextViewProps } from '../../../../utils/interfaces/IComponent';
import { TEXTS } from '../../../../constants/strings';
import globalStyles from '../../../../theme/globalStyles';

export const AccountingDetailRowItem: React.FC<AccountingDetailRowItemProps> = ({
  rowData,
  accountingDetailsData,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getAccountingDetailTitle = (
    accountingDetailsData: AccountingDetailTitle[],
    id: string,
  ): string | null => {
    if (!Array.isArray(accountingDetailsData) || !id) {
      return null;
    }
    const result = accountingDetailsData.find((element) => element.id === id);
    return result ? result.displayText : null;
  };

  const accountingTitle = getAccountingDetailTitle(
    accountingDetailsData,
    rowData.accountingDetailId,
  );

  return (
    <View style={globalStyles.cardContainer}>
      <View>
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.accountingDetails.accountingDetailLabel}
          line={1}
          title={accountingTitle ?? ''}
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.accountingDetails.totalCostLabel}
          line={1}
          title={
            rowData?.totalCost
              ? `$${rowData?.totalCost?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : '$0.00'
          }
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.accountingDetails.paidAmountLabel}
          line={1}
          title={
            rowData?.paidAmount
              ? `$${rowData?.paidAmount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : '$0.00'
          }
        />
        <CustomTextViewWithImage
          heading={TEXTS.subScreens.accountingDetails.statusLabel}
          line={1}
          title={
            rowData.status == 'Lien'
              ? 'Release of Lien'
              : rowData.status == 'PartiallyPaid'
                ? 'Partially Paid'
                : rowData.status == 'PayLater'
                  ? 'Pay Later'
                  : rowData.status
          }
        />
        {(rowData.note || rowData.status === 'Refunded' || rowData.status === 'Returned') && (
          <CustomExpandableTextView
            heading={TEXTS.subScreens.accountingDetails.noteLabel}
            title={rowData.note}
            status={rowData.status}
            date={rowData.modifiedUtc}
          />
        )}
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>
            {isExpanded
              ? TEXTS.subScreens.accountingDetails.expandButton.hideDetails
              : TEXTS.subScreens.accountingDetails.expandButton.showMore}
          </Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.expandedContainer}>
            {rowData.createdUtc && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.createdOnLabel}
                line={1}
                title={formatToCustomDateTimeUTC(rowData.createdUtc)}
              />
            )}
            {rowData.modifiedUtc && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.modifiedOnLabel}
                line={1}
                title={formatToCustomDateTimeUTC(rowData.modifiedUtc)}
              />
            )}
            {rowData.paymentUtc && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.paidOnLabel}
                line={1}
                title={formatToCustomDateTimeUTC(rowData.paymentUtc)}
              />
            )}
            {rowData.createdBy && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.createdByLabel}
                line={1}
                title={rowData.createdBy}
              />
            )}
            {rowData.modifiedBy && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.modifiedByLabel}
                line={1}
                title={rowData.modifiedBy}
              />
            )}
            {rowData.paymentBy && (
              <CustomTextViewWithImage
                heading={TEXTS.subScreens.accountingDetails.paymentByLabel}
                line={1}
                title={rowData.paymentBy}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const CustomExpandableTextView: React.FC<ExpandableTextViewProps> = ({
  heading,
  title,
  // status,
  // date,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 10,
      }}
    >
      <Text style={styles.headingStyleSmall} numberOfLines={1}>{`${heading} - `}</Text>
      <TouchableOpacity
        style={{ paddingRight: 20 }}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.contentStyleSmall} numberOfLines={isExpanded ? undefined : 2}>
          {title || ''}
          {/* {(status === "Refunded" || status === "Returned") &&
            `${title ? "\n" : ""}Payment ${status} on ${
              date ? formatToCustomDateTimeUTC(date) : ""
            }`} */}
        </Text>
        {title && title.length > 100 && (
          <Text style={{ color: COLORS.APP_COLOR }}>{isExpanded ? 'Read less' : 'Read more'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.032),
    fontWeight: '500',
    marginRight: 5,
  },
  contentStyleSmall: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.031),
    paddingRight: 20,
    flexShrink: 1,
  },
  expandButton: {
    marginTop: 10,
    paddingVertical: 5,
  },
  expandText: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.032),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  expandedContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.BOX_COLOR,
    borderRadius: 5,
  },
  rowItem: {
    flex: 1,
    // width:
    //   useOrientation() === "PORTRAIT"
    //     ? WINDOW_WIDTH - WINDOW_WIDTH * 0.058
    //     : WINDOW_HEIGHT - WINDOW_WIDTH * 0.058,
    // padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    marginLeft: 2,
    marginRight: 2,
  },
});
