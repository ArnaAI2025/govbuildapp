import React from 'react';
import { Alert, Platform } from 'react-native';
import type { DocumentPickerResponse} from 'react-native-document-picker';
import DocumentPicker, { types } from 'react-native-document-picker';
import * as ImagePicker from 'expo-image-picker';
import CustomAlertDialog from '../../components/dialogs/CustomAlertDialog';
import { fetchFileExtensionData } from '../../database/sub-screens/attached-docs/attachedDocsDAO';
import {
  storeFormFiles,
  updateFormFileIfExist,
} from '../../database/sub-screens/attached-items/attachedItemsDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

// Define interfaces for type safety
interface FileObject {
  formId: string | undefined;
  fileId: string | undefined;
  mimeType: string;
  localUrl: string;
  name: string;
  isMultipal: boolean | number;
}

interface ImageFileUploadPicProps {
  visible: boolean;
  onClose: () => void;
  setLoading: (loading: boolean) => void;
  config: Config;
}

interface Config {
  isMultipal: boolean | number;
  id: string | undefined;
  setIsImage: React.Dispatch<React.SetStateAction<any[]>>;
  fromId: string | undefined;
  pageReload: () => void;
  filePattern?: string;
}

// Main component
const ImageFileUploadPic = ({ visible, onClose, setLoading, config }: ImageFileUploadPicProps) => {
  const handleCameraAction = async () => {
    try {
      await cameraOpen(
        config.isMultipal,
        config.setIsImage,
        config.id,
        config.fromId,
        config.pageReload,
        setLoading,
        config.filePattern,
      );
    } catch (error) {
      recordCrashlyticsError('Error during camera action:', error);
      console.error('Error during camera action:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    } finally {
      onClose();
    }
  };

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'photos':
          await openGallery(
            config.isMultipal,
            config.setIsImage,
            config.id,
            config.fromId,
            config.pageReload,
            setLoading,
            config.filePattern,
          );
          onClose();
          break;
        case 'folder':
          await openDocPicker(
            config.isMultipal,
            config.setIsImage,
            config.id,
            config.fromId,
            config.pageReload,
            setLoading,
            config.filePattern,
          );
          onClose();
          break;
        case 'camera':
          await handleCameraAction();
          break;
        default:
          onClose();
          break;
      }
    } catch (error) {
      recordCrashlyticsError('Error handling action:', error);
      console.error('Error handling action:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
    }
  };

  return <CustomAlertDialog visible={visible} onClose={onClose} onAction={handleAction} />;
};

// Helper functions
async function cameraOpen(
  isMultipal: boolean | number,
  setIsImage: React.Dispatch<React.SetStateAction<any[]>>,
  id: string | undefined,
  fromId: string | undefined,
  pageReload: () => void,
  setLoading: (loading: boolean) => void,
  // filePattern?: string
): Promise<void> {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    const isMulti = isMultipal === 0 ? false : true;

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', "You've refused to allow this app to access your camera!");
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: false,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      console.log('User cancelled the camera operation or no assets returned.');
      return;
    }

    const result = pickerResult.assets[0];
    if (!result.uri) {
      console.log('No URI returned from camera.');
      return;
    }

    const type = result.uri.split('.');
    const mimeType = `${result.type}/${type[type.length - 1]}`;

    const fileObject: FileObject = {
      formId: fromId,
      fileId: id,
      mimeType,
      localUrl: result.uri,
      name: `${Date.now()}.${type[type.length - 1]}`,
      isMultipal,
    };
    setLoading(true);
    if ((Platform.OS === 'android' || Platform.OS === 'ios') && isMulti) {
      await storeFormFiles(fileObject);
    } else {
      await updateFormFileIfExist(id, fileObject);
    }
    pageReload();
  } catch (error) {
    recordCrashlyticsError('Camera error:', error);
    console.error('Camera error:', error);
    throw error;
  }
}

async function openDocPicker(
  isMultipal: boolean | number,
  setIsImage: React.Dispatch<React.SetStateAction<any[]>>,
  id: string | undefined,
  fromId: string | undefined,
  pageReload: () => void,
  setLoading: (loading: boolean) => void,
  // filePattern?: string
): Promise<void> {
  try {
    const isMulti = isMultipal === 0 ? false : true;
    const allowedExtensions: string[] = [];

    const result = await fetchFileExtensionData();
    if (result.length > 0 && result[0]?.data) {
      allowedExtensions.push(...JSON.parse(result[0]?.data));
    }

    const pickerResult = await DocumentPicker.pick({
      type: [types.allFiles],
      allowMultiSelection: isMulti,
      copyTo: Platform.OS === 'android' ? 'cachesDirectory' : 'documentDirectory',
    });

    const validFiles: FileObject[] = [];
    const invalidFiles: string[] = [];

    pickerResult.forEach((file: DocumentPickerResponse) => {
      const fileExtension = file.name?.split('.').pop()?.toLowerCase() || '';
      if (allowedExtensions.includes(`.${fileExtension}`)) {
        validFiles.push({
          mimeType: file.type || 'application/octet-stream',
          localUrl: file.fileCopyUri || file.uri,
          name: file.name || `file_${Date.now()}`,
          formId: fromId,
          fileId: id,
          isMultipal,
        });
      } else {
        invalidFiles.push(file.name || 'unknown file');
      }
    });

    if (invalidFiles.length > 0) {
      Alert.alert(
        'Invalid Selection',
        `The following files have unsupported extensions and were not uploaded: \n${invalidFiles.join(
          ', ',
        )}`,
      );
    }

    if (validFiles.length > 0) {
      setLoading(true);

      for (const file of validFiles) {
        if ((Platform.OS === 'android' || Platform.OS === 'ios') && isMulti) {
          await storeFormFiles(file);
        } else {
          await updateFormFileIfExist(id, file);
        }
      }
      pageReload();
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled the picker');
    } else {
      recordCrashlyticsError('Document picker error:', err);
      console.error('Document picker error:', err);
      throw err;
    }
  }
}

async function openGallery(
  isMultipal: boolean | number,
  setIsImage: React.Dispatch<React.SetStateAction<any[]>>,
  id: string | undefined,
  fromId: string | undefined,
  pageReload: () => void,
  setLoading: (loading: boolean) => void,
  // filePattern?: string
): Promise<void> {
  try {
    const isMulti = isMultipal === 0 ? false : true;
    const allowedExtensions: string[] = [];

    const result = await fetchFileExtensionData();
    if (result.length > 0 && result[0]?.data) {
      allowedExtensions.push(...JSON.parse(result[0]?.data));
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', "You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: false,
      quality: 1,
      allowsMultipleSelection: isMulti,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      console.log('User cancelled the gallery operation or no assets returned.');
      return;
    }

    const validFiles: FileObject[] = [];
    const invalidFiles: string[] = [];

    pickerResult.assets.forEach((file: ImagePicker.ImagePickerAsset) => {
      const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || '';
      if (allowedExtensions.includes(`.${fileExtension}`)) {
        validFiles.push({
          mimeType: file.type || 'application/octet-stream',
          localUrl: file.uri,
          name: file.fileName || `file_${Date.now()}`,
          formId: fromId,
          fileId: id,
          isMultipal,
        });
      } else {
        invalidFiles.push(file.fileName || 'unknown file');
      }
    });

    if (invalidFiles.length > 0) {
      Alert.alert(
        'Invalid Selection',
        `The following files have unsupported extensions and were not uploaded: \n${invalidFiles.join(
          ', ',
        )}`,
      );
    }

    if (validFiles.length > 0) {
      setLoading(true);
      for (const file of validFiles) {
        if ((Platform.OS === 'android' || Platform.OS === 'ios') && isMulti) {
          await storeFormFiles(file);
        } else {
          await updateFormFileIfExist(id, file);
        }
      }

      pageReload();
    }
  } catch (err) {
    recordCrashlyticsError('Gallery error:', err);
    console.error('Gallery error:', err);
    throw err;
  }
}

export default ImageFileUploadPic;
