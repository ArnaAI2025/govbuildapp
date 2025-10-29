import { PermissionsAndroid, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import RNBackgroundDownloader from '@kesha-antonov/react-native-background-downloader';
import { Alert } from 'react-native';
import { getAccessToken, getBaseUrl } from '../../session/SessionManager';
import { COLORS } from '../../theme/colors';
import {
  clearPermissionDialogActive,
  setPermissionDialogActive,
} from '../../database/DatabaseService';
import * as ImagePicker from 'expo-image-picker';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { fileExtensionDataAPI } from '../../components/common/OpenDocPickerDialog';
import { GETAPI_FOR_DOWNLOAD } from '../../services/ApiClient';

export async function openPhotosPicker(comment: any, FileUploadApi: any) {
  // Set the permission dialog active flag to true
  setPermissionDialogActive(true);

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    ToastService.show(
      'Permission Denied',
      'Permission to access the media library is required!',
      COLORS.ORANGE,
    );
    return;
  }

  // Clear the permission dialog active flag after the dialog is handled
  clearPermissionDialogActive();

  const allowedExtensions: any = [];
  await fileExtensionDataAPI().then((result) => {
    if (result) {
      const data = result;
      allowedExtensions.push(...data);
    }
  });

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    base64: false,
    quality: 1,
    // allowsMultipleSelection: Platform.OS == 'android' ? true : 1,
    allowsMultipleSelection: Platform.OS === 'android' ? true : true,
  });
  if (result.canceled || !result.assets || result.assets.length === 0) {
    console.log('User cancelled the camera operation or no assets returned.');
    return;
  }

  console.log('commnent poiucker resiuly', result);
  debugger;
  var pickerResult = result.assets[0];
  console.log(pickerResult);
  const fileExtension = pickerResult?.fileName?.split('.').pop()?.toLowerCase();

  if (allowedExtensions.includes(`.${fileExtension}`)) {
    const formData = new FormData();
    const mimeType = pickerResult.mimeType?.split('/')[1];
    formData.append('file', {
      uri: pickerResult?.uri ?? '',
      name: pickerResult?.fileName ?? '',
      type: mimeType ?? '',
    } as any);

    FileUploadApi(formData, pickerResult.fileName, mimeType, pickerResult.uri, comment);
  } else {
    Alert.alert(
      'Invalid File',
      `The file with extension ${fileExtension} is not allowed to be uploaded.`,
    );
  }
}

export const CommentOpenPhotosPicker = async (comment: string) => {
  console.log('Comment Photos Picker', comment);
};

export const InspectionOpenPhotosPicker = async (
  isEdit: boolean | undefined,
  uploadFn: Function,
  index?: string,
  id?: string,
) => {
  console.log('Inspection Photos Picker', { isEdit, index, id });
};

export const openDocPicker = async (comment: string) => {
  console.log('Open Doc Picker', comment);
};

export const commentOpenDocPicker = async (comment: string) => {
  console.log('Comment Doc Picker', comment);
};

export const InspectionOpenDocPicker = async (
  isEdit: boolean | undefined,
  uploadFn: Function,
  index?: string,
  id?: string,
) => {
  console.log('Inspection Doc Picker', { isEdit, index, id });
};

export const cameraOpen = async (comment: string) => {
  console.log('Camera Open', comment);
};

export const commentCameraOpen = async (comment: string) => {
  console.log('Comment Camera Open', comment);
};

export const InspectionCameraOpen = async (
  isEdit: boolean | undefined,
  uploadFn: Function,
  index?: string,
  id?: string,
) => {
  console.log('Inspection Camera Open', { isEdit, index, id });
};

export const downloadFile = async (
  url: string,
  fileName: string = 'downloaded_file',
  setLoading?: (loading: boolean) => void,
) => {
  try {
    setLoading?.(true);

    if (!url) {
      throw new Error('Invalid file URL');
    }

    // Clean URL: remove duplicate slashes
    const fileUrl = url.replace(/([^:]\/)\/+/g, '$1');

    const dirs = RNBackgroundDownloader.directories;

    if (Platform.OS === 'android') {
      await getDownloadPermissionAndroid(); // ensure WRITE_EXTERNAL_STORAGE permission

      const path = `${dirs.documents}/${fileName}`;

      const task = RNBackgroundDownloader.download({
        id: `file-${Date.now()}`,
        url: fileUrl,
        destination: path,
      })
        .begin((expectedBytes) => {
          console.log(`Starting download of ${fileName}, total size: ${expectedBytes}`);
          ToastService.show(`Downloading file...`, COLORS.WARNING_ORANGE);
        })
        .progress((percent) => {
          console.log(`Downloaded: ${(percent * 100).toFixed(2)}%`);
        })
        .done(() => {
          console.log('Download complete!');
          ToastService.show('File downloaded successfully', COLORS.SUCCESS_GREEN);
        })
        .error((error) => {
          console.error('Download failed:', error);
          Alert.alert('Error', 'An error occurred while downloading the file');
        });

      await task;
    } else {
      // iOS download
      const path = `${dirs.documents}/${fileName}`;

      const task = RNBackgroundDownloader.download({
        id: `file-${Date.now()}`,
        url: fileUrl,
        destination: path,
      })
        .begin((expectedBytes) => {
          console.log(`Starting download of ${fileName}, total size: ${expectedBytes}`);
          ToastService.show(`Downloading file...`, COLORS.WARNING_ORANGE);
        })
        .progress((percent) => {
          console.log(`Downloaded: ${(percent * 100).toFixed(2)}%`);
        })
        .done(() => {
          console.log('Download complete!');
          RNFetchBlob.ios.previewDocument(path);
          ToastService.show('File downloaded successfully!', COLORS.SUCCESS_GREEN);
        })
        .error((error) => {
          console.error('Download failed:', error);
          Alert.alert('Error', 'An error occurred while downloading the file');
        });

      await task;
    }
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert('Error', error?.message || 'An error occurred while downloading the file');
  } finally {
    setLoading?.(false);
  }
};
export async function checkFileDomain(fileurl: string | string[]) {
  if (!fileurl) return null;

  try {
    const url = getBaseUrl();
    if (!url) return null;

    return fileurl.includes('http') ? fileurl : `${url}/${fileurl}`;
  } catch (error) {
    console.error('Error fetching base URL:', error);
    return null;
  }
}

export const getIconNameForFileType = (type: string = ''): string => {
  const normalizedType = type.trim().toLowerCase();
  const fileTypeIconMap: Record<string, string> = {
    pdf: 'file-pdf-box',
    xlsx: 'file-excel',
    xls: 'file-excel',
    csv: 'file-excel',
    ppt: 'file-powerpoint',
    pptx: 'file-powerpoint',
    doc: 'file-word',
    docx: 'file-word',
    txt: 'file-document-outline',
    jpg: 'file-image',
    jpeg: 'file-image',
    png: 'file-image',
    gif: 'file-image',
    zip: 'folder-zip',
    rar: 'folder-zip',
    psd: 'file-image',
    mp4: 'file-video',
    mov: 'file-video',
    mp3: 'file-music',
    json: 'code-json',
    folder: 'folder',
  };

  return fileTypeIconMap[normalizedType] || 'file';
};

export const getColorForFileType = (type: string = ''): string => {
  const normalizedType = type.trim().toLowerCase();

  const fileTypeColorMap: Record<string, string> = {
    pdf: COLORS.RED,
    xlsx: COLORS.SUCCESS_GREEN,
    xls: COLORS.SUCCESS_GREEN,
    csv: COLORS.SUCCESS_GREEN,
    ppt: COLORS.ORANGE,
    pptx: COLORS.ORANGE,
    doc: COLORS.BLUE_COLOR,
    docx: COLORS.BLUE_COLOR,
    txt: COLORS.GRAY_MEDIUM,
    jpg: COLORS.ORANGE,
    jpeg: COLORS.ORANGE,
    png: COLORS.SUCCESS_GREEN,
    gif: COLORS.WARNING_ORANGE,
    zip: COLORS.SONIC_SILVER,
    rar: COLORS.SONIC_SILVER,
    mp4: COLORS.DARK_RED,
    mp3: COLORS.INDIGO,
    json: COLORS.CART,
    folder: COLORS.WARNING_ORANGE,
  };

  return fileTypeColorMap[normalizedType] || COLORS.BLACK;
};

export const downloadDailyInspectionReportFile = async (url: string) => {
  // Get the app's cache directory
  const { fs } = RNFetchBlob;
  const cacheDir =
    Platform.OS == 'ios'
      ? fs.dirs.DocumentDir
      : fs.dirs.DownloadDir + '/' + Math.floor(new Date().getTime());
  // Generate a unique filename for the downloaded image
  const filename = 'Govbuilt' + Date.now() + '.csv';
  const imagePath = `${cacheDir}/${filename}`;
  const token = getAccessToken();
  if (Platform.OS == 'android') {
    getDownloadPermissionAndroid();
  }
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token,
    };

    Platform.select({
      ios: {
        fileCache: true,
        path: imagePath,
        appendExt: filename.split('.').pop(),
      },
      android: {
        fileCache: true,
        path: imagePath,
        appendExt: filename.split('.').pop(),
        addAndroidDownloads: {
          // Related to the Android only
          useDownloadManager: true,
          notification: true,
          path: imagePath,
          description: 'File',
        },
        headers: headers,
      },
    });

    GETAPI_FOR_DOWNLOAD(url, token).then((data1) => {
      RNFetchBlob.fs.writeFile(imagePath, data1, 'utf8');
      if (Platform.OS == 'android') {
        Alert.alert('Downloaded succesfully');
      } else {
        RNFetchBlob.ios.previewDocument(imagePath);
      }
    });
  } catch (error) {
    console.log('download permission request error', error);
    return null;
  }
};

export const getDownloadPermissionAndroid = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version < 29) {
      // For Android 9 and below
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to download files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // For Android 10+
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
