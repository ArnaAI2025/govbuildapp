import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import { TEXTS } from '../../../constants/strings';
import { COLORS } from '../../../theme/colors';
import { fontSize, height } from '../../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../../theme/fonts';
import type { ParcelModel } from '../../../utils/interfaces/ISubScreens';
import HTMLView from 'react-native-htmlview';
import { ParcelService } from '../ParcelService';
import { show2Decimals } from '../../../utils/helper/helpers';
import NoData from '../../../components/common/NoData';

const ParcelDetails: React.FC<{
  ParcelNumber: string;
}> = ({ ParcelNumber }) => {
  const isFocused = useIsFocused();
  const { isNetworkAvailable } = useNetworkStatus();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<ParcelModel | null>(null);
  useEffect(() => {
    let isMounted = true;
    const fetchParcelDetails = async () => {
      setLoading(true);
      const result = await ParcelService.fetchParcelDetails(ParcelNumber, setLoading);
      if (isMounted) {
        setDetail(result);
      }
      setLoading(false);
    };
    if (isFocused && isNetworkAvailable) {
      fetchParcelDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [isFocused, ParcelNumber, isNetworkAvailable]);

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      <Loader loading={isLoadingAPI} />
      {detail ? (
        <View>
          <DetailView
            title={TEXTS.subScreens.parcel.parcelNumberLabel}
            value={detail.parcelNumber || ''}
            color={0}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.addressLabel}
            value={detail.address || ''}
            color={1}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.ownerNameLabel}
            value={`${detail.ownerFirstName || ''} ${detail.ownerLastName || ''}`.trim()}
            color={0}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.yearBuiltLabel}
            value={detail.yearBuilt || ''}
            color={1}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.parentParcelLabel}
            value={detail.parentParcel || ''}
            color={0}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.propertyTypeLabel}
            value={detail.propertyType || ''}
            color={1}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.marketValueLabel}
            value={detail.marketValue ? `$${show2Decimals(detail?.marketValue)}` : ''}
            color={0}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.tenantNameLabel}
            value={`${detail.currentTenantFirstName || ''} ${detail.currentTenantLastName || ''}`.trim()}
            color={1}
          />
          <DetailView
            title={TEXTS.subScreens.parcel.descriptionLabel}
            value={detail.description || ''}
            color={0}
            isHtml
          />
        </View>
      ) : (
        <NoData />
      )}
    </View>
  );
};

const DetailView: React.FC<{ title: string; value: string; color: number; isHtml?: boolean }> = ({
  title,
  value,
  color,
  isHtml,
}) => {
  return (
    <View
      style={[styles.detailRow, { backgroundColor: color === 1 ? COLORS.GRAY_LIGHT : undefined }]}
    >
      <Text style={styles.headingStyle}>{title}</Text>
      {isHtml ? (
        <HTMLView style={{ flex: 1 }} value={value} />
      ) : (
        <Text style={styles.contentStyle} numberOfLines={5}>
          {value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    height: height(0.05),
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    flex: 1,
  },
  contentStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratRegular,
    flex: 1,
  },
});

export default ParcelDetails;
