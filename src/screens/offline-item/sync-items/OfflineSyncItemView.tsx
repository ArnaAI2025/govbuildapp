import React, { Dispatch, SetStateAction, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  fetchFormForByLocalId,
  getFormListById,
} from '../../../database/sub-screens/attached-items/attachedItemsDAO';
import { navigate } from '../../../navigation/Index';
import { fetchLocalCasebyId } from '../../../database/my-case/myCaseSync';
import { fetchLocalLicenseById } from '../../../database/license/licenseSync';
import globalStyles from '../../../theme/globalStyles';
import {
  cardBorder,
  fontSize,
  height,
  width,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import {
  updateIsEditedByAdminNotesId,
  updateIsEditedByCaseID,
  updateIsEditedByCaseSettingId,
  updateIsEditedByContactId,
  updateIsEditedByLicenseID,
} from '../../../database/offline-item/offlineItemSync';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import TextHeadingAndTitleView from '../../../components/common/TextHeadingAndTitleView';
import { TEXTS } from '../../../constants/strings';
import { normalizeBool, StatusColorCodes } from '../../../utils/helper/helpers';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';
import IMAGES from '../../../theme/images';
import { syncServerToOfflineDatabase } from '../../../services/SyncService';
import { processForceSyncQueue } from '../OfflineSyncService';
import { OfflineItemDeleteDialog } from '../../../components/dialogs/OfflineItemDeleteDialog';
import { SyncType } from '../../../utils/syncUtils';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

interface ItemData {
  id: string;
  ListType: 'Case' | 'License' | 'Form';
  DisplayText: string;
  Status: string;
  Type: string;
  isForceSync: number;
  isPermission: number;
}

interface OfflineSyncItemViewProps {
  data: ItemData[];
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  loadData: () => Promise<void>;
  isLoadingAPI: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  isOnline: boolean;
}

const OfflineSyncItemView: React.FC<OfflineSyncItemViewProps> = ({
  data,
  // orientation,
  loadData,
  setLoading,
  isOnline,
}) => {
  const rowData = data[0];
  const customMappings: Record<string, string> = {
    attachment: 'Attached Docs',
    admin_notes: 'Admin Notes',
    comment: 'Public Comments',
  };

  const formatName = (str: string) => {
    const lower = str.toLowerCase();
    if (customMappings[lower]) {
      return customMappings[lower];
    }
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const syncedAreasItem = rowData?.SyncedArea?.sort(
    (a, b) => new Date(b.modifiedUtc || b.updatedUtc) - new Date(a.modifiedUtc || a.updatedUtc),
  )
    .map((s) => formatName(s.name))
    .join(', ');

  const isForceSyncApply = rowData?.SyncedArea?.some(
    (s: any) => normalizeBool(s.isForceSync) === true,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [subMenuVisible, setSubMenuVisible] = useState(false);

  const deleteOfflineItem = async (rowData: any) => {
    try {
      setLoading(true);
      if (rowData.isCase) {
        switch (rowData.name) {
          case SyncType.CASE:
            await updateIsEditedByCaseID(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline Case Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          case SyncType.SETTINGS:
            console.log('Setting is calling.....');
            await updateIsEditedByCaseSettingId(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline Case Setting Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          case SyncType.CONTACTS:
            await updateIsEditedByContactId(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline Case Contact Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          case SyncType.ADMIN_NOTES:
            await updateIsEditedByAdminNotesId(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline Case Admin Note Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          default:
            console.warn(`Unhandled case type:----> ${rowData.name}`);
        }
      } else {
        switch (rowData.name) {
          case SyncType.LICENSE:
            await updateIsEditedByLicenseID(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline License Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          case SyncType.CONTACTS:
            await updateIsEditedByContactId(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline License Contact Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          case SyncType.ADMIN_NOTES:
            await updateIsEditedByAdminNotesId(rowData.id);
            setTimeout(() => {
              loadData();
              syncServerToOfflineDatabase();
            }, 500);
            ToastService.show('Offline License Admin Note Deleted', COLORS.SUCCESS_GREEN);
            setSubMenuVisible(false);
            setModalVisible(false);
            break;
          default:
            console.warn(`Unhandled non-case type: ${rowData.name}`);
        }
      }
    } catch (err) {
      recordCrashlyticsError('Error performing action:',err)
      console.error('Error performing action:', err);
      setSubMenuVisible(false);
      setModalVisible(false);
    } finally {
      setLoading(false);
      // setSubMenuVisible(false);
      // setModalVisible(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (rowData.ListType === 'Form') {
        const formSubData = await fetchFormForByLocalId(rowData?.id);
        const fromData = await getFormListById(formSubData[0]?.id);
        if (fromData.length > 0) {
          const formFullData = {
            id: formSubData[0].localId,
            submission: formSubData[0].Submission,
            container: fromData[0].AdvancedForm_Container,
          };
          navigate('EditFormWebView', {
            type: '',
            param: formFullData,
            caseId: '',
            licenseId: '',
            caseLicenseObject: '',
            flag: 1,
          });
        }
      } else {
        type CaseItem = { contentItemId: string };
        type LicenseItem = { contentItemId: string };

        if (rowData.ListType === 'Case') {
          const [caseData] = (await fetchLocalCasebyId(rowData.id)) as CaseItem[];
          if (caseData) {
            navigate('EditCaseScreen', {
              caseId: caseData.contentItemId,
              myCaseData: caseData,
            });
          }
        } else {
          const [licenseData] = (await fetchLocalLicenseById(rowData.id)) as LicenseItem[];
          if (licenseData) {
            navigate('EditLicenseScreen', {
              contentItemId: licenseData.contentItemId,
              licenseData,
            });
          }
        }
      }
    } catch (error) {
      recordCrashlyticsError('Error handling edit:',error)
      console.error('Error handling edit:', error);
    }
  };

  let type = '';
  switch (rowData.ListType) {
    case 'Form':
      type = 'Form Type';
      break;
    case 'Case':
      type = TEXTS.caseScreen.caseType;
      break;
    case 'License':
      type = 'License Type';
      break;
    default:
      type = '';
      break;
  }

  const actions = [
    {
      label: 'View',
      style: styles.applyButton,
      onPress: async () => {
        setModalVisible(false);
        if (rowData.ListType === 'Case') {
          const caseData = await fetchLocalCasebyId(rowData.id);
          navigate('EditCaseScreen', {
            caseId: caseData[0].contentItemId ?? '',
            myCaseData: caseData[0],
            isForceSync: true,
          });
        } else if (rowData.ListType === 'License') {
          const licenseData = await fetchLocalLicenseById(rowData.id);
          navigate('EditLicenseScreen', {
            contentItemId: licenseData[0]?.contentItemId,
            licenseData: licenseData[0],
            isForceSync: true,
          });
        }
      },
    },
    {
      label: 'Delete Offline Version',
      style: styles.applyButton,
      onPress: () => setSubMenuVisible(true),
    },
    {
      label: 'Force Sync',
      style: styles.applyButton,
      onPress: async () => {
        setModalVisible(false);
        try {
          setLoading(true);
          await processForceSyncQueue(rowData, loadData);
        } finally {
          setLoading(false);
        }
      },
    },
    {
      label: 'Cancel',
      style: styles.closeButton,
      onPress: () => setModalVisible(false),
    },
  ];

  return (
    <View style={globalStyles.cardContainer}>
      <TouchableOpacity onPress={() => ''} activeOpacity={1}>
        <TextHeadingAndTitleView
          heading={`${rowData.ListType} - ${rowData.DisplayText ?? ''}`}
          value=""
        />
        {rowData.Type != undefined ? (
          <TextHeadingAndTitleView
            variant="small"
            heading={`${type} -`}
            value={rowData.Type ?? 'N/A'}
          />
        ) : null}
        {rowData?.SyncedArea != undefined ? (
          <TextHeadingAndTitleView
            variant="small"
            heading={`${'Synced area'} -`}
            numberOfLine={4}
            value={syncedAreasItem ?? 'N/A'}
          />
        ) : null}

        <View style={styles.badgeContainer}>
          <View style={{ flexDirection: 'row' }}>
            {rowData.Status !== undefined ? (
              <View
                style={[styles.statusBadge, { backgroundColor: StatusColorCodes(rowData.Status) }]}
              >
                <Text style={styles.statusText}>{`Status - ${rowData.Status ?? ''}`}</Text>
              </View>
            ) : null}

            {rowData?.isPublished !== undefined ? (
              <View style={styles.publishBadge}>
                <Text style={styles.formText}>
                  {rowData?.isPublished ? TEXTS.caseScreen.published : TEXTS.caseScreen.draft}
                </Text>
              </View>
            ) : null}

            {/* {rowData?.Owner !== undefined ? (
              <View style={styles.subContainer}>
                <Icon name="account" size={20} color={COLORS.APP_COLOR} />
                <Text style={styles.subText}>{rowData?.Owner}</Text>
              </View>
            ) : null} */}
          </View>
          <View style={styles.buttonContainer}>
            {isForceSyncApply && isOnline ? (
              <TouchableOpacity
                hitSlop={{ left: 20, right: 20, bottom: 20, top: 20 }}
                style={styles.editButtonContainer}
                // onPress={handleForceSync}
                onPress={() => {
                  setModalVisible(true);
                }}
              >
                <Icon name="sync" size={24} color={COLORS.BLUE_COLOR} />
                <Text style={styles.forceSyncText}>Force Sync</Text>
              </TouchableOpacity>
            ) : null}
            {!isOnline && (
              <TouchableOpacity
                hitSlop={{ left: 20, right: 20, bottom: 20, top: 20 }}
                onPress={handleEdit}
                style={styles.editButtonContainer}
              >
                <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* {rowData.isPermission === 1 && (
          <Text style={styles.permissionText}>
            You no longer have access to this item. Your changes are not saved.
            Please, check your permissions and try again.
          </Text>
        )} */}
      </TouchableOpacity>

      <OfflineItemDeleteDialog
        visible={modalVisible}
        title={!subMenuVisible ? 'Warning' : 'Delete Offline Version'}
        description={
          !subMenuVisible
            ? 'The web version is newer than your offline version.'
            : rowData?.SyncedArea.length === 1
              ? ''
              : 'Please confirm which version(s) you want to delete.'
        }
        // onDismiss={() => {
        //   setModalVisible(false);
        //   setSubMenuVisible(false);
        // }}
        actions={[]}
      >
        <View style={{ rowGap: 15, alignItems: 'center', marginTop: 15 }}>
          {!subMenuVisible ? (
            <>
              {actions.map((action, idx) => (
                <TouchableOpacity key={idx} style={action.style} onPress={action.onPress}>
                  <Text style={styles.textStyle}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              {rowData?.SyncedArea?.map((area, idx) => (
                <TouchableOpacity
                  key={area.id ?? idx}
                  style={styles.applyButton}
                  // style={
                  //   area.isForceSync ? styles.applyButton : styles.closeButton
                  // }
                  onPress={() => {
                    Alert.alert(
                      'Confirm Delete',
                      'Are you sure you want to delete this offline item?',
                      [
                        {
                          text: 'Cancel',
                        },
                        {
                          text: 'Delete',
                          onPress: () => deleteOfflineItem(area),
                        },
                      ],
                      { cancelable: true },
                    );
                  }}
                >
                  <Text style={styles.textStyle}>{formatName(area?.name ?? '')}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeButton} onPress={() => setSubMenuVisible(false)}>
                <Text style={styles.textStyle}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </OfflineItemDeleteDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    margin: height(0.01),
  },
  cardContent: {
    flexDirection: 'column',
  },
  divider: {
    width: '100%',
    marginVertical: 5,
    height: 0.5,
    backgroundColor: COLORS.GRAY_MEDIUM,
  },
  details: {
    padding: '3%',
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  forceSyncButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    borderRadius: 5,
    alignItems: 'center',
    width: width(0.2),
    justifyContent: 'center',
  },
  forceSyncText: {
    color: COLORS.APP_COLOR,
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: fontSize(0.02),
  },
  editButtonContainer: {
    alignItems: 'center',
  },
  editButton: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.03),
  },
  permissionText: {
    marginTop: 10,
    fontSize: fontSize(0.025),
    fontFamily: FONT_FAMILY.MontserratMedium,
    color: COLORS.ERROR,
  },
  container: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.APP_COLOR,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    backgroundColor: COLORS.LIST_CARD_BG,
  },
  portrait: {
    width: WINDOW_WIDTH - WINDOW_WIDTH * 0.05,
  },
  landscape: {
    width: WINDOW_HEIGHT - WINDOW_WIDTH * 0.058,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    columnGap: 6, // Optional: spacing between badges
    rowGap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  publishBadge: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  publishText: {
    color: COLORS.BLUE_COLOR,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  editIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  subText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  subContainer: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: '90%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButton: {
    width: '90%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textAlign: 'center',
  },
  formText: {
    color: COLORS.BLUE_COLOR,
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
});

export default OfflineSyncItemView;
