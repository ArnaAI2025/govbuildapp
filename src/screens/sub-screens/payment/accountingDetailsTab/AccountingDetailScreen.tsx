import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { AccountingDetailRowItem } from './AccountingDetailRowItem';
import type {
  AccountingDetail,
  AccountingDetailScreenProps,
  AccountingDetailTitle,
} from '../../../../utils/interfaces/ISubScreens';
import { PaymentAndAccountingDetailsService } from '../PaymentAndAccountingDetailsService';
import Loader from '../../../../components/common/Loader';
import NoData from '../../../../components/common/NoData';
import { CustomTextViewWithImage } from '../../../../components/common/CustomTextViewWithImage';
import { fontSize } from '../../../../utils/helper/dimensions';
import { TEXTS } from '../../../../constants/strings';
import { FONT_FAMILY } from '../../../../theme/fonts';
import styles from '../../../splash/splashStyles';
import { useNetworkStatus } from '../../../../utils/checkNetwork';

const AccountingDetailScreen: React.FC<AccountingDetailScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AccountingDetail[]>([]);
  const [accountingDetailsData, setAccountingDetailsData] = useState<AccountingDetailTitle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (route.param?.contentItemId) {
        const { details, titles } = await PaymentAndAccountingDetailsService.fetchAccountingDetails(
          route.param.contentItemId,
          route.type,
          isNetworkAvailable,
        );
        setData(details);
        setAccountingDetailsData(titles);
        setLoading(false);
      }
    };
    fetchData();
  }, [route.param?.contentItemId]);

  //6 status---> "Paid", "PartiallyPaid","Lien","UnPaid","PayLater","Refunded",
  const paidStatuses = ['Paid', 'PartiallyPaid', 'Lien'];
  const unpaidStatuses = ['UnPaid', 'PayLater'];
  const refundedStatuses = ['Refunded'];
  // Total Paid Amount
  const totalPaidAmount = data.reduce((sum, item) => {
    const isValidStatus = paidStatuses.includes(item.status);
    if (isValidStatus && !item?.isRefunded && item.paidAmount !== 0) {
      return sum + item.paidAmount;
    }
    return sum;
  }, 0);

  // Total Due Amount
  const totalDueAmount = data.reduce((sum, item) => {
    const total = Number(item.totalCost) || 0;
    const paid = Number(item.paidAmount) || 0;
    const status = item.status;
    let due = 0;
    if (paidStatuses.includes(status)) {
      due = total - paid;
    } else if (unpaidStatuses.includes(status)) {
      due = total; // no payment made
    } else if (refundedStatuses.includes(status)) {
      due = total; // total is usually negative, so this reduces due
    }
    return sum + due;
  }, 0);

  // Format amounts
  const formattedPaidAmount = `$${totalPaidAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedDueAmount = `$${totalDueAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />

      {data.length > 0 ? (
        <>
          <View style={styles.totalAmountContainer}>
            {totalPaidAmount > 0 && (
              <CustomTextViewWithImage
                headingStyle={{
                  fontFamily: FONT_FAMILY.MontserratSemiBold,
                  fontSize: fontSize(0.03),
                }}
                titleStyle={{
                  fontFamily: FONT_FAMILY.MontserratBold,
                  fontSize: fontSize(0.027),
                }}
                heading={TEXTS.subScreens.accountingDetails.paidAmountLabel}
                line={1}
                title={formattedPaidAmount ?? '$0.00'}
              />
            )}
            {totalDueAmount > 0 && (
              <CustomTextViewWithImage
                headingStyle={{
                  fontFamily: FONT_FAMILY.MontserratSemiBold,
                  fontSize: fontSize(0.03),
                }}
                titleStyle={{
                  fontFamily: FONT_FAMILY.MontserratBold,
                  fontSize: fontSize(0.027),
                }}
                heading={TEXTS.subScreens.accountingDetails.dueAmountLabel}
                line={1}
                title={formattedDueAmount ?? '$0.00'}
              />
            )}
          </View>
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <AccountingDetailRowItem
                rowData={item}
                accountingDetailsData={accountingDetailsData}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </>
      ) : (
        <NoData message="No Accounting Details." />
      )}
    </View>
  );
};

export default AccountingDetailScreen;
