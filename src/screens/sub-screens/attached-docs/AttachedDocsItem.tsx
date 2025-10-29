import React, { useState, useCallback } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Linking,
  Platform,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Menu } from 'react-native-paper';
import Checkbox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  checkFileDomain,
  downloadFile,
  getColorForFileType,
  getIconNameForFileType,
} from '../../../utils/helper/fileHandlers';
import { DocumentModel, Folder } from '../../../utils/interfaces/IAttachedDocs';
import { RootStackParamList } from '../../../navigation/Types';
import { fontSize, height, iconSize } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { URL } from '../../../constants/url';
import { FONT_FAMILY } from '../../../theme/fonts';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { confirmAction } from '../../../components/dialogs/CustomConfirmationDialog';
import { normalizeBool } from '../../../utils/helper/helpers';

interface AttachedDocsItemProps {
  rowData: Folder | DocumentModel;
  orientation: string;
  navigation: NavigationProp<RootStackParamList>;
  handleDeleteDoc: (docData: DocumentModel) => void;
  isOffline: boolean;
  setModalVisible: (visible: boolean) => void;
  setFolderId: (id: number) => void;
  setIsFolderUpdate: (update: boolean) => void;
  setInputValue: (value: string) => void;
  caseDataById?: any;
  setLoading?: (loading: boolean) => void;
  isGridView: boolean;
  isCase: boolean;
  isForceSync?: boolean;
}

export const AttachedDocsItem: React.FC<AttachedDocsItemProps> = ({
  rowData,
  // orientation,
  navigation,
  handleDeleteDoc,
  isOffline,
  setModalVisible,
  setFolderId,
  setIsFolderUpdate,
  setInputValue,
  caseDataById,
  setLoading,
  isGridView,
  isCase,
  isForceSync,
}) => {
  const isFolder = rowData?.isFolder === 1 || rowData?.Isfolder === 1;
  const [menuVisible, setMenuVisible] = useState(false);

  const fileType = isFolder
    ? 'folder'
    : 'fileName' in rowData && typeof rowData.fileName === 'string'
      ? rowData.fileName.split('.').pop()?.toLowerCase() || 'folder'
      : 'folder';
  const displayText =
    fileType === 'folder'
      ? (rowData?.name ?? 'Unnamed Folder')
      : ((rowData as DocumentModel)?.fileName ?? 'Unnamed File');

  const handlePress = async () => {
    if (fileType === 'folder') {
      if (rowData.hasOwnProperty('folders')) {
        navigation.navigate('AttachedDocsSubScreen', {
          param: rowData as Folder,
          data: [...(rowData?.folders || []), ...(rowData?.files || [])],
          caseDataById,
          isCase,
          isForceSync,
          isGridView,
        });
      } else {
        navigation.navigate('AttachedDocsSubScreen', {
          param: rowData as Folder,
          data: rowData,
          caseDataById,
          isCase,
          isForceSync,
          isGridView,
        });
      }
    } else {
      if (fileType === 'zip') {
        !isForceSync &&
          Alert.alert(
            'View Not Available',
            'ZIP files cannot be viewed directly. Please download and extract the file to access its contents.',
          );
      } else {
        if (fileType === 'HEIC') {
          Alert.alert(`Cannot open files with the extension .${fileType}`);
        } else {
          if (!isOffline) {
            navigation.navigate('AttachDocPreview', {
              paramKey: 'params',
              url: (rowData as DocumentModel).url,
              fileType,
            });
          } else {
            !isForceSync &&
              Alert.alert('You are currently offline. This item is only available online.');
          }
        }
      }
    }
  };

  const handleEditFolder = async () => {
    if (!isOffline) {
      setModalVisible(true);
      setFolderId(Number(rowData?.id));
      setIsFolderUpdate(true);
      setInputValue(rowData?.name);
    } else {
      Alert.alert('This feature is only available online.');
    }
  };

  const handleOpenLaserfiche = async () => {
    if (!isOffline) {
      Linking.openURL((rowData as DocumentModel).laserficheFileUrl || '');
    } else {
      Alert.alert('This feature is only available online.');
    }
  };

  const handleDownload = useCallback(async () => {
    console.log('Download action triggered for:', (rowData as DocumentModel)?.fileName);
    if (!isOffline) {
      checkFileDomain((rowData as DocumentModel).url).then((file: any) =>
        downloadFile(file, (rowData as DocumentModel)?.fileName, setLoading),
      );
      setMenuVisible(false);
    } else {
      Alert.alert('This feature is only available online.');
    }
  }, [rowData, setLoading]);

  const handleEdit = useCallback(async () => {
    console.log('Edit Title action triggered for:', (rowData as DocumentModel).fileName);
    if (!isOffline) {
      navigation.navigate('AttachedDocsUpdateAndAdd', {
        caseData: caseDataById?.contentItemId,
        docsData: rowData as DocumentModel,
        isUpdate: true,
        contentId: caseDataById?.contentItemId,
        isAllowEditFilename: caseDataById
          ? !(
              (caseDataById?.isePlanSoftModuleEnabled &&
                (rowData as DocumentModel)?.ePlanSoftDocumentId) ||
              (caseDataById?.isLaserficheModuleEnabled &&
                (rowData as DocumentModel)?.laserficheEntryId) ||
              (caseDataById?.bluebeamProjectId && (rowData as DocumentModel)?.bluebeamDocumentId)
            )
          : true,
        isCase: isCase,
        isStatusReadOnly: caseDataById.isStatusReadOnly,
      });
      setMenuVisible(false);
    } else {
      ToastService.show('This feature is only available online.', COLORS.WARNING_ORANGE);
    }
  }, [rowData, navigation, caseDataById]);

  const handleDelete = useCallback(async () => {
    console.log('Delete action triggered for:', (rowData as DocumentModel).fileName);
    if (!isOffline) {
      handleDeleteDoc(rowData as DocumentModel);
      setMenuVisible(false);
    } else {
      ToastService.show('This feature is only available online.', COLORS.WARNING_ORANGE);
    }
  }, [rowData, handleDeleteDoc]);

  //   const getCardWidth = () => {
  //   const availableWidth = orientation === "PORTRAIT" ? WINDOW_WIDTH : WINDOW_HEIGHT;
  //   const margin = availableWidth * 0.055;
  //   const spacing = 10;
  //   if (isGridView) {
  //     return (availableWidth - margin * 2 - spacing * 3) / 2;
  //   }
  //   return availableWidth - margin * 2;
  // };

  return (
    <TouchableOpacity style={[styles.cardContainer, { width: '95%' }]} onPress={handlePress}>
      <View
        style={[
          styles.cardContent,
          isGridView
            ? {
                justifyContent: isOffline ? 'center' : 'flex-start',
                height: isOffline ? height(0.12) : null,
              }
            : { flexDirection: 'row', alignItems: 'center' },
        ]}
      >
        <View style={isGridView ? styles.gridContent : styles.listLeftContent}>
          <Icon
            name={getIconNameForFileType(fileType)}
            size={iconSize(0.05)}
            color={getColorForFileType(fileType)}
          />
          <View style={isGridView ? null : styles.textContainer}>
            <Text
              style={[styles.fileLabel, isGridView ? styles.gridLabel : styles.listLabel]}
              numberOfLines={1}
            >
              {displayText}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: isGridView ? 5 : 0,
          }}
        >
          {isGridView && (
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={
                  isOffline && rowData?.isShowonFE === 0
                    ? false
                    : isOffline && rowData?.isShowonFE === 1
                      ? true
                      : rowData?.isShowonFE
                }
                color={rowData?.isSync ? COLORS.APP_COLOR : undefined}
                style={{ borderRadius: 5 }}
              />
              <Text style={[styles.statusStyle, { marginLeft: 5, fontSize: fontSize(0.025) }]}>
                Show on FE
              </Text>
            </View>
          )}
          {fileType !== 'folder' && !isOffline && (
            <View style={styles.actionButtons}>
              {Boolean((rowData as DocumentModel)?.laserficheEntryId) && (
                <TouchableOpacity onPress={handleOpenLaserfiche}>
                  <Image
                    style={isGridView ? styles.smallIcon : styles.smallIconStyle}
                    resizeMode="contain"
                    source={{
                      uri: `${URL.TENANT_BASE_URL}/OrchardCore.Case/Images/LaserficheLogo.jpg`,
                    }}
                  />
                </TouchableOpacity>
              )}
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Menu icon clicked');
                      setMenuVisible(true);
                    }}
                  >
                    <Icon
                      name="dots-horizontal"
                      size={isGridView ? 23 : 25}
                      color={COLORS.APP_COLOR}
                      style={isGridView ? styles.icon : styles.smallIconStyle}
                    />
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: 8,
                }}
              >
                <Menu.Item
                  leadingIcon="download"
                  onPress={handleDownload}
                  title="Download"
                  disabled={normalizeBool(caseDataById.isStatusReadOnly)}
                />
                <Menu.Item leadingIcon="pencil" onPress={handleEdit} title="Edit Title" />
                {!(rowData as DocumentModel)?.inspectionContentItemId && (
                  <Menu.Item
                    leadingIcon="delete"
                    onPress={() => {
                      confirmAction(
                        `Are you sure to want to delete this document?`,
                        () => handleDelete(),
                        `Delete Task`,
                      );
                    }}
                    title="Delete"
                    disabled={normalizeBool(caseDataById.isStatusReadOnly)}
                  />
                )}
                {(rowData as DocumentModel)?.laserficheEntryId !== 0 && (
                  <Menu.Item
                    leadingIcon="file-document"
                    onPress={handleOpenLaserfiche}
                    title="Laserfiche"
                  />
                )}
              </Menu>
            </View>
          )}
          {fileType === 'folder' && !isOffline && (
            <TouchableOpacity
              style={
                isGridView
                  ? [
                      styles.editButton,
                      {
                        opacity: caseDataById.isStatusReadOnly ? 0.4 : 1,
                      },
                    ]
                  : {
                      opacity: caseDataById.isStatusReadOnly ? 0.4 : 1,
                    }
              }
              onPress={handleEditFolder}
              disabled={normalizeBool(caseDataById.isStatusReadOnly)}
            >
              <Icon
                name="square-edit-outline"
                size={20}
                color={COLORS.APP_COLOR}
                style={isGridView ? styles.icon : styles.smallIconStyle}
                disabled={normalizeBool(caseDataById.isStatusReadOnly)}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isGridView && (
        <View style={styles.listExtraContent}>
          <View style={styles.documentTypeContainer}>
            <Text
              style={[
                styles.statusStyle,
                {
                  color: COLORS.BLACK,
                  marginRight: 5,
                  fontFamily: FONT_FAMILY.MontserratMedium,
                },
              ]}
            >
              Document Type:
            </Text>
            <Text style={styles.statusStyle}>
              {(rowData as DocumentModel)?.documentType || 'N/A'}
            </Text>
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={
                isOffline && rowData?.isShowonFE === 0
                  ? false
                  : isOffline && rowData?.isShowonFE === 1
                    ? true
                    : rowData?.isShowonFE
              }
              color={rowData?.isSync ? COLORS.APP_COLOR : undefined}
              style={{ borderRadius: 5 }}
            />
            <Text style={[styles.statusStyle, { marginLeft: 10 }]}>Show on FE</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.LIST_CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    paddingHorizontal: 0,
  },
  gridContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  listLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 10,
  },
  fileLabel: {
    color: COLORS.BLACK,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    flexShrink: 1,
  },
  gridLabel: {
    fontSize: fontSize(0.031),
    paddingHorizontal: 10,
  },
  listLabel: {
    fontSize: fontSize(0.03),
  },
  // listIcon: {
  //   width: iconSize(0.04),
  //   height: iconSize(0.06),
  //   marginTop: 10,
  // },
  smallIcon: {
    width: iconSize(0.018),
    height: iconSize(0.018),
    padding: 10,
  },
  smallIconStyle: {
    marginBottom: height(0.03),
  },
  icon: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  editButton: {
    alignSelf: 'flex-end',
  },
  listExtraContent: {
    flexDirection: 'column',
    marginLeft: 5,
    marginTop: 10,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height(0.001),
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    marginBottom: height(0.01),
  },
  statusStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratRegular,
  },
});
