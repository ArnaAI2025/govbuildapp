import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { RootStackParamList } from '../../../navigation/Types';
import Loader from '../../../components/common/Loader';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import { SubLicense } from '../../../utils/interfaces/ISubScreens';
import { fetchRelatedLicense } from './SubLicenseService';
import { TEXTS } from '../../../constants/strings';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NoData from '../../../components/common/NoData';
import { fontSize, height, iconSize, marginTopAndBottom } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import IMAGES from '../../../theme/images';
import { CustomTextViewWithImage } from '../../../components/common/CustomTextViewWithImage';
import { FONT_FAMILY } from '../../../theme/fonts';
import globalStyles from '../../../theme/globalStyles';
import { formatDate } from '../../../utils/helper/helpers';

interface SubLicenseScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'SubLicenseScreen'> {}

const SubLicenseScreen: React.FC<SubLicenseScreenProps> = ({ route }) => {
  const { isNetworkAvailable } = useNetworkStatus();
  const { param } = route.params;
  const [isLoading, setLoading] = useState(false);
  const [allChildLicense, setAllChildLicense] = useState<SubLicense[]>([]);
  const [allParentLicense, setAllParentLicense] = useState<SubLicense[]>([]);
  const [title] = useState(route?.params?.caseDataById?.subLicenseName?.trim() || 'Contractors');

  useEffect(() => {
    const fetchData = async () => {
      if (param?.contentItemId) {
        setLoading(true);
        const { allChildLicense, allParentLicense } = await fetchRelatedLicense(
          param.contentItemId,
          isNetworkAvailable,
        );
        setAllChildLicense(allChildLicense ?? []); // fallback to []
        setAllParentLicense(allParentLicense ?? []); // fallback to []
        setLoading(false);
      }
    };
    fetchData();
  }, [param?.contentItemId]);

  const HeadingViewWithList = ({ title, list, type }) => {
    return list.length > 0 ? (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {type === 1 ? (
          <View style={globalStyles.cardContainer}>
            {list[0]?.number?.trim() && (
              <View style={styles.cardHeading}>
                <Text style={styles.cardText}>{list[0]?.number?.trim()}</Text>
              </View>
            )}
            <View style={styles.cardContentWrapper}>
              {list[0]?.assignedUsers && (
                <View
                  style={[styles.contentStyle, styles.row, { backgroundColor: COLORS.BRIGHT_BLUE }]}
                >
                  <Image style={styles.numberIcon} source={IMAGES.DRAWER_LICENSE} />
                  <Text style={[styles.testStyle, styles.ml5]}>
                    {[list[0]?.assignedUsers, list[0]?.assignUserCount].filter(Boolean).join(' + ')}
                  </Text>
                </View>
              )}

              {list[0].status && (
                <View style={[styles.contentStyle, styles.grayBg]}>
                  <Text style={styles.testStyle}>Status - {list[0].status}</Text>
                </View>
              )}
              {list[0].type && (
                <View style={[styles.contentStyle, styles.typeBg]}>
                  <Text style={styles.testStyle}>Type - {list[0].type}</Text>
                </View>
              )}
              {list[0].licenseModifyDate && (
                <View style={[styles.contentStyle, styles.row, styles.grayBg]}>
                  <Image style={styles.icon} source={IMAGES.DRAWER_MY_SCHEDULE} />
                  <Text style={[styles.testStyle, styles.ml5]}>{list[0].licenseModifyDate}</Text>
                </View>
              )}
              {list[0].author && (
                <View style={[styles.contentStyle, styles.row, styles.grayBg]}>
                  <Image style={styles.smallIcon} source={IMAGES.PERSON_ICON} />
                  <Text style={[styles.testStyle, styles.ml5]}>{list[0].author}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={list}
            renderItem={({ item }) => ContractorsListItem(item)}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    ) : null;
  };

  const ContractorsListItem = (rowData) => {
    return (
      // <Card style={styles.cardContainer}>
      <View style={globalStyles.cardContainer}>
        {rowData.applicantFirstName != null &&
        rowData.applicantLastName != null &&
        rowData.number != null ? (
          <CustomTextViewWithImage
            heading="Sub License"
            line={1}
            title={
              rowData.applicantFirstName +
              ' ' +
              rowData.applicantLastName +
              ' (' +
              rowData.number +
              ')'
            }
          />
        ) : (
          <View />
        )}

        {rowData.status != null ? (
          <CustomTextViewWithImage heading="Status" line={1} title={rowData.status} />
        ) : (
          <View />
        )}

        {rowData.endDate != null ? (
          <CustomTextViewWithImage
            heading="End Date"
            line={1}
            title={formatDate(rowData?.endDate, 'MM-DD-YYYY')}
          />
        ) : (
          <View />
        )}

        {rowData.address != null ? (
          <CustomTextViewWithImage heading="Property Location" title={rowData.address} line={1} />
        ) : (
          <View />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <ScreenWrapper title={TEXTS.subScreens.subLicense.heading}> */}
      <ScreenWrapper title={title}>
        <Loader loading={isLoading} />
        <KeyboardAwareScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {allChildLicense.length === 0 && allParentLicense.length === 0 ? (
            <View style={styles.noDataWrapper}>
              <NoData />
            </View>
          ) : (
            <>
              <HeadingViewWithList
                title={TEXTS.subScreens.related.parent}
                list={allParentLicense}
                type={1}
              />
              <HeadingViewWithList title={'Child'} list={allChildLicense} type={2} />
            </>
          )}
        </KeyboardAwareScrollView>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingBottom: 20 },
  noDataWrapper: { height: height(0.9) },

  sectionTitle: {
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    fontSize: fontSize(0.05),
    marginLeft: 5,
    marginBottom: 5,
    marginTop: marginTopAndBottom(0.05),
  },
  cardHeading: {
    paddingVertical: height(0.012),
    paddingHorizontal: height(0.005),
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  cardContainer: {
    borderColor: COLORS.GRAY_DARK,
    backgroundColor: COLORS.WHITE,
    borderRadius: 5,
    elevation: 5,
    marginVertical: height(0.01),
    marginHorizontal: 2,
  },
  cardContentWrapper: {
    // padding: height(0.01),
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  contentStyle: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginRight: 10,
    marginTop: 6,
  },
  testStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  grayBg: { backgroundColor: COLORS.GRAY_LIGHT },
  typeBg: { backgroundColor: COLORS.TYPECOLOR },

  row: { flexDirection: 'row', alignItems: 'center' },
  ml5: { marginLeft: 5 },

  icon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.017),
    height: iconSize(0.017),
  },
  numberIcon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.022),
    height: iconSize(0.018),
    marginRight: 5,
  },
  smallIcon: {
    tintColor: COLORS.BLACK,
    width: iconSize(0.013),
    height: iconSize(0.015),
  },
});

export default SubLicenseScreen;
