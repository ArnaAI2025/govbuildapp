import React, { useState, useCallback } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View, Text, Linking } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Menu } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  checkFileDomain,
  downloadFile,
  getColorForFileType,
  getIconNameForFileType,
} from '../../../utils/helper/fileHandlers';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { DocumentModel, Folder } from '../../../utils/interfaces/IAttachedDocs';
import { RootStackParamList } from '../../../navigation/Types';
import { fontSize, height, iconSize } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import { URL } from '../../../constants/url';
import { FONT_FAMILY } from '../../../theme/fonts';
import { confirmAction } from '../../../components/dialogs/CustomConfirmationDialog';

interface AttachedDocsGridItemProps {
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
}

export const AttachedDocsGridItem: React.FC<AttachedDocsGridItemProps> = ({
  rowData,
  orientation,
  navigation,
  handleDeleteDoc,
  isOffline,
  setModalVisible,
  setFolderId,
  setIsFolderUpdate,
  setInputValue,
  caseDataById,
  setLoading,
}) => {
  const isFolder = rowData?.isFolder == 1 || rowData?.Isfolder == 1;
  const [menuVisible, setMenuVisible] = useState(false);

  const fileType = isFolder
    ? 'folder'
    : 'fileName' in rowData && typeof rowData.fileName === 'string'
      ? rowData.fileName.split('.').pop()?.toLowerCase() || ''
      : 'folder';
  const displayText =
    fileType === 'folder'
      ? (rowData?.name ?? 'Unnamed Folder')
      : ((rowData as DocumentModel)?.fileName ?? 'Unnamed File');

  const handlePress = async () => {
    if (fileType === 'folder') {
      // if (!isOffline) {
      if (rowData.hasOwnProperty('folders')) {
        navigation.navigate('AttachedDocsSubScreen', {
          param: rowData as Folder,
          data: [...(rowData?.folders || []), ...(rowData?.files || [])],
          caseDataById,
        });
      } else {
        navigation.navigate('AttachedDocsSubScreen', {
          param: rowData as Folder,
          data: rowData,
          caseDataById,
        });
      }
      // } else {
      //   loadDocsOffline().then((data: any) => {
      //     navigation.navigate("AttachedDocsSubScreen", {
      //       param: rowData,
      //       data: data,
      //       isNew: true,
      //     });
      //   });
      // }
    } else {
      if (fileType === 'HEIC') {
        Alert.alert(`Cannot open files with the extension .${fileType}`);
      } else {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          navigation.navigate('AttachDocPreview', {
            paramKey: 'params',
            url: (rowData as DocumentModel).url,
            fileType,
          });
        } else {
          Alert.alert('You are currently offline. This item is only available online.');
        }
      }
    }
  };

  const handleEditFolder = async () => {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      setModalVisible(true);
      setFolderId(Number(rowData?.id));
      setIsFolderUpdate(true);
      setInputValue(rowData?.name);
    } else {
      Alert.alert('This feature is only available online.');
    }
  };

  const handleOpenLaserfiche = async () => {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      Linking.openURL((rowData as DocumentModel).laserficheFileUrl || '');
    } else {
      Alert.alert('This feature is only available online.');
    }
  };

  const handleDownload = useCallback(async () => {
    console.log('Download action triggered for:', (rowData as DocumentModel)?.fileName);
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      checkFileDomain((rowData as DocumentModel).url).then((file: any) =>
        downloadFile(file, (rowData as DocumentModel)?.fileName, setLoading),
      );
      setMenuVisible(false);
    } else {
      Alert.alert('This feature is only available online.');
    }
  }, [rowData]);

  const handleEdit = useCallback(async () => {
    console.log('Edit Title action triggered for:', (rowData as DocumentModel).fileName);
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
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
      });
      setMenuVisible(false);
    } else {
      Alert.alert('This feature is only available online.');
    }
  }, [rowData, navigation, caseDataById]);

  const handleDelete = useCallback(async () => {
    console.log('Delete action triggered for:', (rowData as DocumentModel).fileName);
    const netInfo = await NetInfo.fetch();
    if (netInfo?.isConnected) {
      handleDeleteDoc(rowData as DocumentModel);
      setMenuVisible(false);
    } else {
      Alert.alert('This feature is only available online.');
    }
  }, [rowData, handleDeleteDoc]);

  // async function loadDocsOffline() {
  //   let result = await fetchAttachedDocsByFolderID(
  //     rowData.caseContentItemId,
  //     true,
  //     rowData?.id
  //   );
  //   return result;
  // }
  const getCardWidth = () =>
    orientation === 'PORTRAIT' ? (WINDOW_WIDTH - 10 * 5) / 2 : (WINDOW_HEIGHT - 10 * 5) / 2;

  return (
    <Card style={[styles.card, { width: getCardWidth() }]}>
      <TouchableOpacity onPress={handlePress}>
        <View style={[styles.cardContent, isOffline ? { justifyContent: 'center' } : null]}>
          {fileType !== 'folder' && !isOffline && (
            <View style={styles.actionButtons}>
              {Boolean((rowData as DocumentModel).laserficheEntryId) && (
                <TouchableOpacity onPress={handleOpenLaserfiche}>
                  <Image
                    style={styles.smallIcon}
                    resizeMode="contain"
                    source={{
                      uri: `${URL.TENANT_BASE_URL}/OrchardCore.Case/Images/LaserficheLogo.jpg`,
                    }}
                  />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
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
                    <Icon name="menu" size={20} color={COLORS.APP_COLOR} style={styles.icon} />
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: 8,
                }}
              >
                <Menu.Item leadingIcon="download" onPress={handleDownload} title="Download" />
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
            <TouchableOpacity style={styles.editButton} onPress={handleEditFolder}>
              <Icon
                name="square-edit-outline"
                size={20}
                color={COLORS.APP_COLOR}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}

          <Icon
            name={getIconNameForFileType(fileType)}
            size={iconSize(0.05)}
            color={getColorForFileType(fileType)}
            // style={{
            //   alignItems: "center",
            //   flex: 1,
            //   justifyContent: "center",
            // }}
          />
          <Text style={styles.fileLabel} numberOfLines={1}>
            {displayText}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 50,
    width: '40%',
    elevation: 5,
    marginVertical: height(0.01),
    backgroundColor: COLORS.WHITE,
    margin: height(0.002),
  },
  cardContent: {
    height: height(0.18),
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileLabel: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    flexShrink: 1,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    paddingHorizontal: 10,
  },
  smallIcon: {
    width: iconSize(0.018),
    height: iconSize(0.018),
    padding: 10,
  },
  icon: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  editButton: {
    alignSelf: 'flex-end',
  },
});
