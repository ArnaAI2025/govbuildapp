import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { AttechedItemsRowViewProps } from '../../../utils/interfaces/ISubScreens';
import { formatDate, getTimeAgo } from '../../../utils/helper/helpers';
import { TEXTS } from '../../../constants/strings';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { FONT_FAMILY } from '../../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTimeInfoToolTip } from '../../../components/common/DateTimeInfoTooltip';
import globalStyles from '../../../theme/globalStyles';

const AttechedItemsRowView: React.FC<AttechedItemsRowViewProps> = ({
  rowData,
  navigation,
  isOnline,
  downloadForm,
  offlineData,
  type,
  baseUrl,
  isForceSync,
}) => {
  const checkOfflineData = (contentItemId: string, offlineData: any[]) => {
    return offlineData.find((data) => data.id === contentItemId);
  };
  //This is for future use if you want to handle download functionality
  const isDownload = isOnline && checkOfflineData(rowData.contentItemId, offlineData)?.submission;

  const isUpdate = isOnline && checkOfflineData(rowData.contentItemId, offlineData)?.isUpdate;

  const isAbleToDownload = isOnline && !!checkOfflineData(rowData.contentItemId, offlineData);

  const handlePress = () => {
    if (isOnline) {
      navigation.navigate('OpenInWebView', {
        paramKey: 'params',
        param: `~${rowData.editLink}`,
        title: 'Edit',
      });
    } else {
      if (rowData.submission) {
        navigation.navigate('EditAttachItem', {
          paramKey: 'params',
          type: type,
          param: rowData,
          caseId: rowData.isCase === 1 ? rowData.contentItemId : '',
          licenseId: rowData.isCase === 1 ? '' : rowData.contentItemId,
        });
        // ToastService.show(
        //   `Attached item edit feature is under the testing for ${type}`,
        //   COLORS.WARNING_ORANGE
        // );
      } else {
        ToastService.show(TEXTS.subScreens.attachedItem.onlineAttchedItems, COLORS.WARNING_ORANGE);
      }
    }
  };
  return (
    <TouchableOpacity
      style={globalStyles.cardContainer}
      disabled={isForceSync}
      onPress={handlePress}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.infoContainer}>
            {/* <Text style={[styles.title, { marginRight: 10, flex: 1 color: "#888"}]}> */}
            {rowData.createdUtc && (
              <>
                <DateTimeInfoToolTip
                  createdBy={rowData?.author}
                  createdOn={formatDate(rowData.createdUtc, 'MM/DD/YYYY hh:mm A')}
                />
                <Text style={[styles.title, { marginRight: 10, flex: 1, color: '#888' }]}>
                  {getTimeAgo(rowData?.createdUtc ?? '')}
                </Text>
              </>
            )}

            {/* </Text> */}
            {/* <Icon name="account" size={20} color={COLORS.APP_COLOR} />
              <Text style={[styles.title, { flex: 1 }]} numberOfLines={1}>
                {TEXTS.caseScreen.createBy} {rowData.author}
              </Text> */}
          </View>
        </View>
        {rowData.createdUtc && <View style={styles.divider} />}
        <Text style={[styles.title, styles.displayText]}>{rowData.displayText}</Text>
        <View
          style={[styles.infoContainer, { justifyContent: 'space-between', paddingHorizontal: 10 }]}
        >
          <Text style={styles.contentType}>{rowData.contentType}</Text>
          {rowData.contentType === 'AdvancedFormSubmissions' &&
            isOnline &&
            !isUpdate &&
            isAbleToDownload && (
              <TouchableOpacity onPress={() => downloadForm(rowData.contentItemId)}>
                <Icon
                  name={isDownload ? 'refresh' : 'download'}
                  size={24}
                  color={COLORS.APP_COLOR}
                />
              </TouchableOpacity>
            )}
          {rowData.contentType === 'FormLettersFilled' && isOnline && (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`${baseUrl}${rowData.displayLink}`);
              }}
            >
              <Icon name="share-variant" size={24} color={COLORS.APP_COLOR} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: WINDOW_WIDTH,
    height: 0.5,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  smallIcon: {
    width: iconSize(0.014),
    height: iconSize(0.014),
    tintColor: COLORS.APP_COLOR,
  },
  icon: {
    width: iconSize(0.022),
    height: iconSize(0.022),
    tintColor: COLORS.APP_COLOR,
  },
  title: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.026),
    fontFamily: FONT_FAMILY.MontserratMedium,
    marginLeft: 5,
  },
  displayText: {
    fontSize: fontSize(0.035),
    padding: height(0.02),
  },
  contentType: {
    fontSize: fontSize(0.025),
    paddingHorizontal: 10,
    padding: 10,
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.GRAY_DARK,
  },
  mainCard: {
    flex: 1,
    borderRadius: 5,
    elevation: 5,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    marginLeft: 2,
    marginRight: 2,
    backgroundColor: COLORS.WHITE,
  },
});

export default AttechedItemsRowView;
