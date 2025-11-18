import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { fontSize, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { ToastService } from './GlobalSnackbar';
import { TEXTS } from '../../constants/strings';
import * as ImagePicker from 'expo-image-picker';
import {
  clearPermissionDialogActive,
  setPermissionDialogActive,
} from '../../database/DatabaseService';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import NetInfo from '@react-native-community/netinfo';
import type { FileItem, OpenDocPickerDialogProps } from '../../utils/interfaces/IComponent';
import DocumentPicker from 'react-native-document-picker';
import { fetchFileExtensionData } from '../../database/sub-screens/attached-docs/attachedDocsDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

const OpenDocPickerDialog: React.FC<OpenDocPickerDialogProps> = ({ visible, onClose, config }) => {
  const { flag, comment, FileUploadApi, isEdit, index } = config;

  const handleAction = async (action: 'camera' | 'photos' | 'folder') => {
    try {
      let files: FileItem[] | FormData | null = null;
      switch (action) {
        case 'photos':
          // if (flag == 1) await openPhotosPicker(comment, FileUploadApi);
          // else if (flag == 2)
          files = (await CommentOpenPhotosPicker()) ?? null;
          // else if (flag == 3)
          //   await InspectionOpenPhotosPicker(isEdit, FileUploadApi, index, id);
          break;
        case 'folder':
          // if (flag == 1) await openDocPicker(comment, FileUploadApi);
          // else if (flag == 2)
          files = (await commentOpenDocPicker()) ?? null;
          // else if (flag == 3)
          //   await InspectionOpenDocPicker(isEdit, FileUploadApi, index, id);
          break;
        case 'camera':
          // if (flag == 1) await cameraOpen(comment, FileUploadApi);
          // else if (flag == 2)
          await commentCameraOpen(comment, FileUploadApi);
          // else if (flag == 3)
          //   await InspectionCameraOpen(isEdit, FileUploadApi, index, id);
          break;
        default:
          break;
      }

      if (files && files?.length > 0) {
        console.log('Files selected in handleAction:', files);
        if (flag === 1) {
          const formData = files as unknown as FormData;
          FileUploadApi(formData, comment);
        } else if (flag === 2) {
          FileUploadApi(files as FileItem[], comment);
        } else if (flag === 3) {
          const formData = files as unknown as FormData;
          FileUploadApi(formData, isEdit, index);
        }
        setTimeout(() => {
          ToastService.show(
            TEXTS.subScreens.commentWithFileAttached.fileSelectedSuccess,
            COLORS.SUCCESS_GREEN,
          );
        }, 1000); // slight delay avoids modal closing conflict
      }
    } catch (error: any) {
      if (error.message !== 'USER_CANCELLED') {
        recordCrashlyticsError(`${action} error:`, error);
        console.error(`${action} error:`, error);
        ToastService.show(
          error.message || TEXTS.subScreens.commentWithFileAttached.fileSelectionError,
          COLORS.ERROR,
        );
      }
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>
            {TEXTS.subScreens.commentWithFileAttached.selectDocumentTitle}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => handleAction('camera')}>
            <Text style={styles.buttonText}>{TEXTS.subScreens.commentWithFileAttached.camera}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleAction('photos')}>
            <Text style={styles.buttonText}>
              {TEXTS.subScreens.commentWithFileAttached.photosLibrary}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleAction('folder')}>
            <Text style={styles.buttonText}>{TEXTS.subScreens.commentWithFileAttached.folder}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>{TEXTS.subScreens.commentWithFileAttached.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 20,
    width: WINDOW_WIDTH * 0.8,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(0.035),
    color: COLORS.BLACK,
    marginBottom: 20,
    fontFamily: 'MontserratMedium',
  },
  button: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_DARK,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.03),
    fontFamily: 'MontserratRegular',
  },
});

export default OpenDocPickerDialog;

async function CommentOpenPhotosPicker() {
  //comment: any, FileUploadApi: any
  // Set the permission dialog active flag to true
  setPermissionDialogActive(true);

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    ToastService.show(
      'Permission to access the media library is required from device!',
      COLORS.ORANGE,
    );
    return;
  }

  // Clear the permission dialog active flag after the dialog is handled
  clearPermissionDialogActive();

  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      ToastService.show(
        'Permission to access the media library is required from device!',
        COLORS.ORANGE,
      );
      return null;
    }

    const allowedExtensions: string[] = [];
    await fetchFileExtensionData().then((result) => {
      if (result.length > 0 && result) {
        const data = JSON.parse(result[0]?.data);
        allowedExtensions.push(...data);
      }
    });

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    console.log('Picker result:', JSON.stringify(result, null, 2));

    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('User cancelled the picker operation or no assets returned.');
      throw new Error('USER_CANCELLED');
    }

    const validFiles: any[] = [];
    const invalidFiles: string[] = [];

    result.assets.forEach((file) => {
      if (!file.fileName) {
        console.log('Skipping file with no fileName:', file);
        return;
      }
      const fileExtension = file.fileName.split('.').pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
        validFiles.push({
          mimeType: file.mimeType,
          localUrl: file.uri,
          name: file.fileName,
        });
      } else {
        invalidFiles.push(file.fileName);
      }
    });

    if (invalidFiles.length > 0) {
      ToastService.show(
        `The following files have unsupported extensions: \n${invalidFiles.join(', ')}`,
        COLORS.ERROR,
      );
    }

    if (validFiles.length > 0) {
      console.log('Valid files selected:', validFiles);
      return validFiles;
    }
    return null;
  } catch (error: any) {
    recordCrashlyticsError('Error in CommentOpenPhotosPicker:', error);
    console.error('Error in CommentOpenPhotosPicker:', error);
    throw error;
  } finally {
    clearPermissionDialogActive();
  }
}

let isDocumentPickerInProgress = false;

async function commentOpenDocPicker() {
  //comment: any, FileUploadApi: any
  if (isDocumentPickerInProgress) {
    console.warn('Document picker is already running. Wait for it to finish.');
    return;
  }

  // Lock early
  isDocumentPickerInProgress = true;

  try {
    const allowedExtensions: string[] = [];
    await fetchFileExtensionData().then((result) => {
      if (result.length > 0 && result) {
        const data = JSON.parse(result[0]?.data);
        allowedExtensions.push(...data);
      }
    });

    // Small delay to prevent rapid double-trigger
    await new Promise((resolve) => setTimeout(resolve, 100));

    const pickedFiles = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: true,
      copyTo: Platform.OS === 'android' ? 'cachesDirectory' : 'documentDirectory',
    });
    const validFiles: any[] = [];
    const invalidFiles: string[] = [];

    pickedFiles.forEach((file) => {
      const ext = file.name?.split('.').pop()?.toLowerCase();
      if (ext && allowedExtensions.includes(`.${ext}`)) {
        validFiles.push({
          mimeType: ext,
          localUrl: file.fileCopyUri || file.uri,
          name: file.name,
          originalType: file.type,
        });
      } else {
        invalidFiles.push(file?.name ?? '');
      }
    });

    if (invalidFiles.length > 0) {
      ToastService.show(`Unsupported file extensions:\n${invalidFiles.join(', ')}`, COLORS.ERROR);
    }

    if (validFiles?.length > 0) {
      return validFiles;
    }
  } catch (err: any) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled the picker operation.');
    } else {
      recordCrashlyticsError('Error in CommentOpenDocPicker:', err);
      console.error('Error in CommentOpenDocPicker:', err);
    }
  } finally {
    setTimeout(() => {
      isDocumentPickerInProgress = false;
    }, 300); // Short delay to prevent instant retrigger
  }
}

export const fileExtensionDataAPI = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      //  const fileExtentions = fetchFileExtensionData()
      return;
    }

    const url = getBaseUrl();
    const response = await GET_DATA({
      url: `${url}${URL.FILE_EXTENSION_API}`,
    });

    if (response?.data && response?.data?.data?.length > 0) {
      // Directly pass the data to the update function
      return response?.data?.data;
    }
  } catch (error) {
    recordCrashlyticsError('Error in FileExtensionDataAPI:', error);
    console.error('Error in FileExtensionDataAPI:', error);
  }
};

async function commentCameraOpen(comment: any, FileUploadApi: any) {
  // Ask the user for the permission to access the camera
  try {
    // Set the permission dialog active flag to true
    setPermissionDialogActive(true);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      alert('Camera permission is required to take pictures.');
      return;
    }

    // Clear the permission dialog active flag after the dialog is handled
    clearPermissionDialogActive();

    const result = await ImagePicker.launchCameraAsync();
    console.log('comment camera', result);
    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log('User cancelled the camera operation or no assets returned.');
      return;
    }
    var pickerResult = result.assets[0];

    var fileArray = [];

    //  var imgName = 'IMG_' + newID;
    var fileArray = [];
    if (pickerResult.uri != null && pickerResult.uri != '') {
      var type = pickerResult.uri.split('.');
      const parts = pickerResult.uri.split('/'); // Split the string by "/"
      const imgName = parts[parts.length - 1]; // Get the last element of the array

      const mimeType = pickerResult.type + '/' + type[type.length - 1];

      // formData.append("file", { uri: pickerResult.uri, type: mimeType, name: imgName });

      // FileUploadApi(formData, imgName, mimeType, pickerResult.uri, comment);
      const object = {
        mimeType: mimeType,
        localUrl: pickerResult.uri,

        name: imgName,
      };
      fileArray.push(object);
      FileUploadApi(fileArray, comment);
    }

    // if (!pickerResult.cancelled) {
    //     return pickerResult.uri;
    // }
  } catch (error) {
    recordCrashlyticsError('error in open camera', error);
    console.error(error);
  }
}
