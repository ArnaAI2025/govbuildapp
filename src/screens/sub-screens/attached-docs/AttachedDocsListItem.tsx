import React, { useState, useCallback } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View, Text, Linking } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Card, Menu } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Checkbox from 'expo-checkbox'; // Import expo-checkbox
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
import globalStyles from '../../../theme/globalStyles';
import { confirmAction } from '../../../components/dialogs/CustomConfirmationDialog';

interface AttachedDocsListItemProps {
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

export const AttachedDocsListItem: React.FC<AttachedDocsListItemProps> = ({
  rowData,
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
  const isFolder = rowData?.isFolder === 1;
  const [menuVisible, setMenuVisible] = useState(false);

  const fileType = isFolder
    ? 'folder'
    : (rowData as DocumentModel).fileName?.split('.').pop() || 'folder';
  const displayText =
    fileType === 'folder'
      ? (rowData.name ?? 'Unnamed Folder')
      : ((rowData as DocumentModel).fileName ?? 'Unnamed File');

  const handlePress = async () => {
    if (fileType === 'folder') {
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
      setFolderId(Number(rowData.id));
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
    console.log('Download action triggered for:', (rowData as DocumentModel).fileName);
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      checkFileDomain((rowData as DocumentModel).url).then((file: any) =>
        downloadFile(file, (rowData as DocumentModel).fileName, setLoading),
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
      ToastService.show('This feature is only available online.', COLORS.WARNING_ORANGE);
    }
  }, [rowData, navigation, caseDataById]);

  const handleDelete = useCallback(async () => {
    console.log('Delete action triggered for:', (rowData as DocumentModel).fileName);
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      handleDeleteDoc(rowData as DocumentModel);
      setMenuVisible(false);
    } else {
      ToastService.show('This feature is only available online.', COLORS.WARNING_ORANGE);
    }
  }, [rowData, handleDeleteDoc]);

  return (
    <Card style={globalStyles.cardStyle}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Icon
              name={getIconNameForFileType(fileType)}
              size={iconSize(0.05)}
              color={getColorForFileType(fileType)}
              style={{
                width: iconSize(0.04),
                height: iconSize(0.06),
                marginTop: 10,
              }}
            />
            <View style={styles.textContainer}>
              <Text style={styles.headingStyle} numberOfLines={1}>
                {displayText}
              </Text>
            </View>
          </View>
          {fileType !== 'folder' && !isOffline && (
            <View style={styles.actionButtons}>
              {Boolean((rowData as DocumentModel)?.laserficheEntryId) && (
                <TouchableOpacity onPress={handleOpenLaserfiche}>
                  <Image
                    style={styles.smallIconStyle}
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
                      name="menu"
                      size={23}
                      color={COLORS.APP_COLOR}
                      style={styles.smallIconStyle}
                    />
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: 8,
                }}
              >
                <Menu.Item leadingIcon="download" onPress={handleDownload} title="Download" />
                <Menu.Item leadingIcon="pencil" onPress={handleEdit} title="Edit Title" />
                {!(rowData as DocumentModel).inspectionContentItemId && (
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
                {(rowData as DocumentModel).laserficheEntryId !== 0 && (
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
            <TouchableOpacity onPress={handleEditFolder}>
              <Icon
                name="square-edit-outline"
                size={20}
                color={COLORS.APP_COLOR}
                style={styles.smallIconStyle}
              />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 15,
            paddingVertical: 5,
            marginBottom: 18,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={styles.documentTypeContainer}>
            <Text
              style={[
                styles.statusStyle,
                {
                  color: COLORS.BLACK,
                  marginRight: 5,
                  fontFamily: FONT_FAMILY.MontserratSemiBold,
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
            />
            <Text style={[styles.statusStyle, { marginLeft: 10 }]}>Show on FE</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10, // Added padding for better spacing
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 10,
  },
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.03),
    flexShrink: 1,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  documentTypeContainer: {
    flexDirection: 'column',
    // marginTop: ,
    // alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  smallIconStyle: {
    marginBottom: height(0.03),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratRegular,
  },
});
