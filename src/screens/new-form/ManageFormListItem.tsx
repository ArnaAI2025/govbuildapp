import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { SubmissionModel } from '../../utils/interfaces/ISubScreens';
import { height, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import TextHeadingAndTitleView from '../../components/common/TextHeadingAndTitleView';
import { navigate } from '../../navigation/Index';
import { getTimeAgo } from '../../utils/helper/helpers';
import { fetchTeamMembers } from '../../database/drop-down-list/dropDownlistDAO';
import { TEXTS } from '../../constants/strings';

interface ManageFormListItemProps {
  rowData?: SubmissionModel;
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
  isNetworkAvailable?: boolean;
}

const ManageFormListItem: React.FC<ManageFormListItemProps> = ({
  rowData,
  orientation,
  isNetworkAvailable,
}) => {
  const [adminTeamName, setAdminTeamName] = useState('');
  useEffect(() => {
    fetchTeamMemberData();
  }, []);

  const fetchTeamMemberData = async () => {
    const result = await fetchTeamMembers();
    let adminTeamName = '';
    const authorId = isNetworkAvailable ? rowData?.Author : rowData?.ownerName;

    if (authorId === 'Admin') {
      adminTeamName = 'Admin';
    } else {
      const matchedUser = result.find((item) => item?.userId === authorId);
      if (matchedUser) {
        adminTeamName = matchedUser.firstName;
      } else {
        adminTeamName = '';
      }
    }
    setAdminTeamName(adminTeamName);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        if (isNetworkAvailable) {
          navigate('NewFormDetailsScreen', {
            type: '',
            param: rowData?.AutoroutePart,
            title: 'New Form',
            data: rowData,
            licenseId: '',
            caseId: '',
            flag: 1,
          });
        } else {
          navigate('NewFormWebView', {
            type: '',
            param: rowData,
            caseId: '',
            licenseId: '',
            caseLicenseObject: '',
            flag: 1,
            isFromNewForm: true,
          });
        }
      }}
      style={[styles.container, orientation === 'PORTRAIT' ? styles.portrait : styles.landscape]}
    >
      <TextHeadingAndTitleView heading={rowData?.DisplayText || ''} value="" />
      <View style={styles.subContainer}>
        <View style={styles.badgeContainer}>
          <View style={[styles.publishBadge]}>
            <Icon name={'file-document-outline'} size={20} color={COLORS.BLUE_COLOR} />
            <Text style={styles.formText}>{'Advanced Form'}</Text>
          </View>
          <View style={[styles.publishBadge, { paddingVertical: 6 }]}>
            <Text style={styles.formText}>
              {rowData?.Published ? TEXTS.caseScreen.published : TEXTS.caseScreen.draft}
            </Text>
          </View>

          <View style={[styles.publishBadge, { borderRadius: 8 }]}>
            <Icon name={'calendar-clock'} size={20} color={COLORS.BLUE_COLOR} />
            <Text style={styles.subText}>{getTimeAgo(rowData?.ModifiedUtc ?? '')}</Text>
          </View>
          {adminTeamName ? (
            <View style={[styles.publishBadge, { borderRadius: 8 }]}>
              <Icon name="account" size={20} color={COLORS.APP_COLOR} />
              <Text style={styles.subText}>{adminTeamName?.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>
        <Icon name={'arrow-right'} size={24} color={COLORS.APP_COLOR} style={styles.arrow} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.APP_COLOR,
    marginVertical: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
    alignSelf: 'center',
    flexDirection: 'column',
    padding: height(0.02),
  },
  portrait: {
    width: WINDOW_WIDTH - WINDOW_WIDTH * 0.05,
  },
  landscape: {
    width: WINDOW_HEIGHT - WINDOW_WIDTH * 0.058,
  },
  content: {
    flexDirection: 'column',
    padding: height(0.02),
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  subText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  formText: {
    color: COLORS.BLUE_COLOR,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  statusText: {
    color: COLORS.APP_COLOR,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 8,
    width: '90%',
  },
  privateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.DARK_RED,
    borderRadius: 4,
    marginTop: 10,
  },
  editIcon: {
    marginLeft: 'auto',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
    marginTop: height(0.005),
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // width: "90%",
    marginTop: 15,
  },
  arrow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});

export default memo(ManageFormListItem);
