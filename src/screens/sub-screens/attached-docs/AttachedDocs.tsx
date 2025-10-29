import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { RecyclerListView, DataProvider, LayoutProvider, BaseScrollView } from 'recyclerlistview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Types';
import { useOrientation } from '../../../utils/useOrientation';
import { DocumentModel, Folder } from '../../../utils/interfaces/IAttachedDocs';
import { DocumentService } from './AttachedDocsService';
import { AttachedDocsItem } from './AttachedDocsItem';
import OpenDocPickerDialog from '../../../components/common/OpenDocPickerDialog';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { COLORS } from '../../../theme/colors';
import NoData from '../../../components/common/NoData';
import {
  fontSize,
  height,
  iconSize,
  isTablet,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import FloatingInput from '../../../components/common/FloatingInput';
import { FONT_FAMILY } from '../../../theme/fonts';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import Loader from '../../../components/common/Loader';
import { normalizeBool } from '../../../utils/helper/helpers';

type AttachedDocsProps = NativeStackScreenProps<RootStackParamList, 'AttachedDocs'>;

const ViewTypes = {
  FULL: 0,
};

const AttachedDocs: React.FC<AttachedDocsProps> = ({ route, navigation }) => {
  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const isForceSync = normalizeBool(route?.params?.isForceSync);

  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;

  const [isGridView, setIsGridView] = useState(true);
  const [data, setData] = useState<Array<Folder | DocumentModel>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [folderId, setFolderId] = useState(0);
  const [isFolderUpdate, setIsFolderUpdate] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const listView = useRef<RecyclerListView<any, any>>(null);
  const IsDefaultAttachDocShowOnFECheck =
    route?.params?.caseSettingData?.isDefaultAttachDocShowOnFE;
  const layoutProvider = useMemo(
    () => layoutMaker(orientation, isGridView, !isNetworkAvailable),
    [orientation, isGridView, isNetworkAvailable],
  );

  const dataProvider = useMemo(() => dataProviderMaker(data), [data]);
  const [fieldError, setError] = useState<boolean>(false);

  const isCase = route?.params?.type == 'Case' ? true : false;
  const contentItemId = route?.params?.param?.contentItemId;
  const isStatusReadOnly = normalizeBool(route?.params?.param?.isStatusReadOnly);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, contentItemId, isCase]);

  useEffect(() => {
    if (listView.current) {
      listView.current.forceRerender();
    }
  }, [orientation, isGridView]);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await DocumentService.fetchAllFoldersAndFiles(
      contentItemId,
      isCase,
      isNetworkAvailable,
    );
    setData(result);
    setIsLoading(false);
  };

  const handleAddFolder = async () => {
    if (!inputValue) {
      setError(true);
      ToastService.show('Please enter folder name', COLORS.SUCCESS_GREEN);
      return;
    }
    console.log('Adding/Updating folder:', inputValue);
    const result = await DocumentService.addOrUpdateFolder(
      inputValue?.trimStart(),
      folderId,
      contentItemId,
      0,
      isCase,
      setLoading,
      isNetworkAvailable,
      route?.params?.param,
      false,
    );
    if (result) {
      setError(false);
      setInputValue('');
      setModalVisible(false);
      setIsFolderUpdate(false);
      setFolderId(0);
      setTimeout(async () => {
        fetchData();
      }, 300);
    }
  };

  const handleDeleteDoc = async (selectedData: DocumentModel) => {
    try {
      setLoading(true);
      const success = await DocumentService.deleteDocument(
        contentItemId,
        selectedData?.contentItemId,
        isCase,
        isNetworkAvailable,
      );
      if (success) {
        setTimeout(async () => {
          fetchData();
        }, 300);
        ToastService.show('Document deleted successfully', COLORS.SUCCESS_GREEN);
      }
    } catch (error) {
      console.error('Error in handleDeleteDoc:', error);
      ToastService.show('Error deleting document', COLORS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadApi = async (files: any[]): Promise<void> => {
    const fileNames = files.map((file) => (file?.fileName || file?.name).split('.')[0] || '');
    const fileTypes = files.map((file) => file.mimeType || '');
    const fileUrls = files.map((file) => file.uri || file.localUrl || '');
    const originalTypes = files.map((file) => file.originalType || '');
    const fileDataArray = files;

    navigation.navigate('AttachedDocsUpdateAndAdd', {
      isOffline: !isNetworkAvailable,
      caseData: contentItemId,
      docsData: null,
      isUpdate: false,
      fileData: fileDataArray,
      fileNames,
      fileTypes,
      fileUrls,
      folderID: 0,
      contentId: contentItemId,
      isAllowEditFilename: true,
      contentData: route?.params?.caseDataById,
      isCase: isCase,
      originalTypes,
      IsDefaultAttachDocShowOnFECheck,
    });
  };

  const rowRenderer = (type: any, item: Folder | DocumentModel) => {
    return (
      <AttachedDocsItem
        rowData={item}
        orientation={orientation}
        navigation={navigation}
        handleDeleteDoc={handleDeleteDoc}
        isOffline={!isNetworkAvailable}
        setModalVisible={setModalVisible}
        setFolderId={setFolderId}
        setIsFolderUpdate={setIsFolderUpdate}
        setInputValue={setInputValue}
        caseDataById={route?.params?.caseDataById}
        setLoading={setLoading}
        isGridView={isGridView}
        isCase={isCase}
        isForceSync={isForceSync}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {alertVisible && (
        <OpenDocPickerDialog
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          config={{
            flag: 1,
            comment: '',
            FileUploadApi,
            isEdit: false,
            index: '',
            id: '',
          }}
        />
      )}
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setInputValue('');
          setIsFolderUpdate(false);
        }}
      >
        <View style={styles.viewWrapper}>
          <View style={styles.modalView}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>
                {isFolderUpdate ? 'Update Folder' : 'Create Folder'}
              </Text>
            </View>
            <FloatingInput
              label={'Folder name'}
              value={inputValue}
              style={styles.textInput}
              onChangeText={setInputValue}
              placeholder={'Enter folder name...'}
              keyboardType="default"
              numberOfLines={5}
              error={fieldError}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddFolder}>
                <Text style={styles.labelStyle}>{isFolderUpdate ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.GRAY_DARK }]}
                onPress={() => {
                  setModalVisible(false);
                  setInputValue('');
                  setError(false);
                  setIsFolderUpdate(false);
                }}
              >
                <Text style={styles.labelStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScreenWrapper title="Attached Docs">
        <Loader loading={isLoading} />
        <View style={styles.viewStyles}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  opacity: isStatusReadOnly || isForceSync ? 0.4 : 1,
                },
              ]}
              onPress={() => setAlertVisible(true)}
              disabled={isStatusReadOnly || isForceSync}
            >
              <Icon name="file-plus" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  opacity: isStatusReadOnly || isForceSync ? 0.4 : 1,
                },
              ]}
              onPress={() => setModalVisible(true)}
              disabled={isStatusReadOnly || isForceSync}
            >
              <Icon name="folder-plus" size={26} color={COLORS.WHITE} />
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end', flex: 1 }}>
              <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
                <Icon
                  name={isGridView ? 'view-grid' : 'view-list'}
                  size={26}
                  color={COLORS.APP_COLOR}
                  style={styles.iconStyle}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, marginTop: 20 }}>
            {data.length > 0 ? (
              <RecyclerListView
                ref={listView}
                style={{
                  flex: 1,
                }}
                scrollViewProps={{
                  refreshControl: (
                    <RefreshControl
                      refreshing={isLoading}
                      onRefresh={() =>
                        DocumentService.fetchAllFoldersAndFiles(
                          contentItemId,
                          isCase,
                          isNetworkAvailable,
                        ).then((result) => {
                          setData(result);
                        })
                      }
                    />
                  ),
                  keyboardShouldPersistTaps: 'handled',
                }}
                externalScrollView={ExternalScrollView}
                contentContainerStyle={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                // layoutProvider={isGridView ? gridLayoutProvider : layoutProvider}
                layoutProvider={layoutProvider}
                dataProvider={dataProvider}
                rowRenderer={rowRenderer}
                canChangeSize={true}
              />
            ) : (
              <NoData />
            )}
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
};

const layoutMaker = (orientation: string, isGrid: boolean, isOffline: boolean) =>
  new LayoutProvider(
    () => ViewTypes.FULL,
    (type, dim) => {
      const screenWidth = orientation === 'PORTRAIT' ? WINDOW_WIDTH : WINDOW_HEIGHT;

      const spacing = 10;
      const sidePadding = 15;
      const rowSpacing = 12;

      if (isGrid) {
        const availableWidth = screenWidth - sidePadding * 2 - spacing;
        dim.width = availableWidth / 2;
        // dim.height = isTablet ? height(0.13) + rowSpacing : height(0.15) + rowSpacing;
        if (isTablet) {
          dim.height = isOffline ? height(0.15) + rowSpacing : height(0.13) + rowSpacing;
        } else {
          //  dim.height = height(0.13) + rowSpacing;
          dim.height = isOffline ? height(0.15) + rowSpacing : height(0.15) + rowSpacing;
        }
      } else {
        dim.width = screenWidth - sidePadding * 2;
        if (isTablet) {
          dim.height = isOffline ? height(0.13) + rowSpacing : height(0.13) + rowSpacing;
        } else {
          //  dim.height = height(0.13) + rowSpacing;
          dim.height = isOffline
            ? Platform.OS === 'ios'
              ? height(0.15) + rowSpacing
              : height(0.17) + rowSpacing
            : Platform.OS === 'ios'
              ? height(0.15) + rowSpacing
              : height(0.17) + rowSpacing;
        }
      }
    },
  );

const dataProviderMaker = (data: Array<Folder | DocumentModel>) =>
  new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(data);

class ExternalScrollView extends BaseScrollView {
  scrollTo = (...args: any[]) => {
    if (this._scrollViewRef) this._scrollViewRef.scrollTo(...args);
  };
  private _scrollViewRef: any;

  render() {
    const { style, ...restProps } = this.props as any;
    return (
      <ScrollView
        {...restProps}
        ref={(scrollView) => (this._scrollViewRef = scrollView)}
        style={[style, { flex: 1 }]}
        contentContainerStyle={{
          paddingHorizontal: 10,
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  viewStyles: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: height(0.01),
    alignItems: 'center',
    gap: 10,
    margin: 10,
  },
  actionButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.04),
    width: WINDOW_WIDTH * 0.1,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: { width: iconSize(0.025), height: iconSize(0.025) },
  viewWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: WINDOW_WIDTH * 0.85,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: height(0.025),
    elevation: 5,
  },
  headerContainer: {
    paddingBottom: height(0.015),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: height(0.015),
  },
  headerText: {
    fontSize: fontSize(0.04),
    fontFamily: FONT_FAMILY.MontserratBold,
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    marginBottom: height(0.025),
    marginTop: height(0.01),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: height(0.015),
  },
  modalButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.045),
    width: WINDOW_WIDTH * 0.3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  labelStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
  },
});

export default AttachedDocs;
