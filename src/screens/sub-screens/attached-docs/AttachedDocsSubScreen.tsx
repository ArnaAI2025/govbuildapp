import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
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
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import { RecyclerListView, DataProvider, LayoutProvider, BaseScrollView } from 'recyclerlistview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AttachedDocsItem } from './AttachedDocsItem';
import { RootStackParamList } from '../../../navigation/Types';
import { useOrientation } from '../../../utils/useOrientation';
import { DocumentModel, Folder } from '../../../utils/interfaces/IAttachedDocs';
import { DocumentService } from './AttachedDocsService';
import Loader from '../../../components/common/Loader';
import OpenDocPickerDialog from '../../../components/common/OpenDocPickerDialog';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { COLORS } from '../../../theme/colors';
import NoData from '../../../components/common/NoData';
import { checkFileDomain, downloadFile } from '../../../utils/helper/fileHandlers';
import { fontSize, height, iconSize, isTablet } from '../../../utils/helper/dimensions';
import IMAGES from '../../../theme/images';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import FloatingInput from '../../../components/common/FloatingInput';
import { FONT_FAMILY } from '../../../theme/fonts';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { goBack } from '../../../navigation/Index';
import { normalizeBool } from '../../../utils/helper/helpers';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

type AttachedDocsSubScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AttachedDocsSubScreen'
>;

const ViewTypes = {
  FULL: 0,
};

const AttachedDocsSubScreen: React.FC<AttachedDocsSubScreenProps> = ({ route, navigation }) => {
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;

  const orientation = useOrientation();
  const isFocused = useIsFocused();
  const [isGridView, setIsGridView] = useState(route?.params?.isGridView || false);
  const [data, setData] = useState<Array<Folder | DocumentModel>>([]);
  const [docData] = useState<DocumentModel | null>(null);
  const [isLoadingAPI, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [folderId, setFolderId] = useState(0);
  const [isFolderUpdate, setIsFolderUpdate] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [folderHierarchy, setFolderHierarchy] = useState<
    { name: string; id: string; data: Array<Folder | DocumentModel> }[]
  >([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['22%', '33%'], []);
  const listView = useRef<RecyclerListView<any, any>>(null);
  // const layoutProvider = useRef(layoutMaker(orientation)).current;
  const layoutProvider = useMemo(
    () => layoutMaker(orientation, isGridView, !isNetworkAvailable),
    [orientation, isGridView, isNetworkAvailable],
  );
  const dataProvider = useMemo(() => dataProviderMaker(data), [data]);
  const [fieldError, setError] = useState<boolean>(false);

  const isCase = route?.params?.isCase;
  const contentItemId = route?.params?.caseDataById?.contentItemId;
  const isStatusReadOnly = normalizeBool(route?.params?.caseDataById?.isStatusReadOnly);

  // Initialize folder hierarchy
  useEffect(() => {
    if (route?.params?.param) {
      setFolderHierarchy((prev) => {
        // Avoid duplicate entries
        if (prev.some((item) => item.id === route.params.param.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            name: route.params.param.name,
            id: route.params.param.id,
            data: route.params.data,
          },
        ];
      });
    }
  }, [route?.params?.param?.id, route?.params?.param?.name, route?.params?.data]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, contentItemId, route?.params?.param?.id, isCase]);

  const fetchData = async () => {
    setLoading(true);

    const result = await DocumentService.fetchFolderFilesByParent(
      contentItemId ?? '',
      route?.params?.param?.id,
      isCase,
      isNetworkAvailable,
    );

    if (isNetworkAvailable) {
      setData([...result]);
    } else {
      const parentId = route?.params?.param?.id;

      const previousData = Array.isArray(route.params.data)
        ? route.params.data
        : [route.params.data];

      const filteredPreviousData = previousData.filter((item) => item.id !== parentId);

      const combined = [...filteredPreviousData, ...result];

      const filteredData = getUnique(combined, 'id');
      setData(filteredData);
    }

    setLoading(false);
  };

  const handleAddFolder = async () => {
    if (!inputValue) {
      ToastService.show('Please enter folder name', COLORS.ERROR);
      setError(true);
      return;
    }
    const result = await DocumentService.addOrUpdateFolder(
      inputValue?.trimStart(),
      folderId,
      contentItemId ?? '',
      route?.params?.param?.id,
      isCase,
      setLoading,
      isNetworkAvailable,
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
      recordCrashlyticsError('Error in handleDeleteDoc:',error);
      console.error('Error in handleDeleteDoc:', error);
      ToastService.show('Error deleting document', COLORS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handlePresentModalClose = useCallback(() => bottomSheetModalRef.current?.close(), []);

  const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} />, []);

  const FileUploadApi = async (files: any[], folderId: string): Promise<void> => {
    const fileNames = files.map((file) => (file?.fileName || file?.name).split('.')[0] || '');
    const fileTypes = files.map((file) => file.mimeType || '');
    const fileUrls = files.map((file) => file.uri || file.localUrl || '');
    const fileDataArray = files;
    const originalTypes = files.map((file) => file.originalType || '');

    navigation.navigate('AttachedDocsUpdateAndAdd', {
      isOffline: !isNetworkAvailable,
      caseData: contentItemId,
      docsData: null,
      isUpdate: false,
      fileData: fileDataArray,
      fileNames,
      fileTypes,
      fileUrls,
      folderID: folderId,
      contentId: contentItemId,
      isAllowEditFilename: true,
      contentData: route?.params?.caseDataById,
      isCase: isCase,
      originalTypes,
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

  // Handle back navigation to parent folder
  const handleBackPress = () => {
    if (folderHierarchy.length > 1) {
      const parentFolder = folderHierarchy[folderHierarchy.length - 2];
      setFolderHierarchy((prev) => prev.slice(0, -1));
      navigation.navigate('AttachedDocsSubScreen', {
        param: { id: parentFolder.id, name: parentFolder.name },
        data: parentFolder.data,
        caseDataById: route?.params?.caseDataById,
        isCase: isCase,
        isGridView,
        isForceSync: isForceSync,
      });
    } else {
      goBack();
    }
  };

  function getUnique(array: any, key: any) {
    if (typeof key !== 'function') {
      const property = key;
      key = function (item: any) {
        return item[property];
      };
    }
    return Array.from(
      array
        .reduce(function (map: Map<any, any>, item: any) {
          const k = key(item);
          if (!map.has(k)) map.set(k, item);
          return map;
        }, new Map())
        .values(),
    );
  }

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        {alertVisible && (
          <OpenDocPickerDialog
            visible={alertVisible}
            onClose={() => setAlertVisible(false)}
            config={{
              flag: 1,
              comment: route.params.param.id,
              FileUploadApi,
              isEdit: false,
              index: '',
              id: '',
            }}
          />
        )}
        <Modal animationType="none" transparent visible={isModalVisible}>
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
        <ScreenWrapper title="Attached Docs" onBackPress={handleBackPress}>
          <Loader loading={isLoadingAPI} />
          <View style={styles.viewStyles}>
            <View style={styles.breadcrumbContainer}>
              {/* <TouchableOpacity onPress={handleBackPress}>
                <Icon name="arrow-left" size={20} color={COLORS.APP_COLOR} />
              </TouchableOpacity> */}
              <Text style={styles.breadcrumbText}>
                {folderHierarchy.map((folder) => folder.name).join(' / ')}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    opacity: isStatusReadOnly || isForceSync ? 0.4 : 1,
                  },
                ]}
                onPress={() => setAlertVisible(true)}
                disabled={isForceSync || normalizeBool(isStatusReadOnly)}
              >
                <Icon name="file-plus" size={24} color={COLORS.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    marginLeft: 10,
                    opacity: isStatusReadOnly || isForceSync ? 0.4 : 1,
                  },
                ]}
                onPress={() => setModalVisible(true)}
                disabled={isForceSync || normalizeBool(isStatusReadOnly)}
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
                  scrollViewProps={{
                    refreshControl: (
                      <RefreshControl refreshing={isLoadingAPI} onRefresh={fetchData} />
                    ),
                  }}
                  externalScrollView={ExternalScrollView}
                  // layoutProvider={
                  //   isGridView ? gridLayoutProvider : layoutProvider
                  // }
                  layoutProvider={layoutProvider}
                  dataProvider={dataProvider}
                  rowRenderer={rowRenderer}
                  canChangeSize={true}
                />
              ) : (
                <NoData />
              )}
              <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
              >
                <View style={styles.contentContainer}>
                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <Text style={styles.actionTitle}>Actions</Text>
                    <TouchableOpacity onPress={handlePresentModalClose}>
                      <Image
                        style={[styles.smallIconStyle, { tintColor: COLORS.GRAY_MEDIUM }]}
                        source={IMAGES.CLOSE_ICON}
                      />
                    </TouchableOpacity>
                  </View>
                  {docData && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          checkFileDomain(docData.url).then((file: any) =>
                            downloadFile(file, docData.fileName, setLoading),
                          );
                          handlePresentModalClose();
                        }}
                      >
                        <BottomSheetItem type={1} title="Download" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('AttachedDocsUpdateAndAdd', {
                            docsData: docData,
                            isUpdate: true,
                            fileStructure: folderHierarchy.map((folder) => folder.name),
                            contentId: contentItemId ?? '',
                            isAllowEditFilename: route.params.caseDataById
                              ? !(
                                  (route.params.caseDataById.isePlanSoftModuleEnabled &&
                                    docData.ePlanSoftDocumentId) ||
                                  (route.params.caseDataById.isLaserficheModuleEnabled &&
                                    docData.laserficheEntryId) ||
                                  (route.params.caseDataById.bluebeamProjectId &&
                                    docData.bluebeamDocumentId)
                                )
                              : true,
                            caseData: route.params.caseDataById,
                            isCase: isCase,
                          });
                          handlePresentModalClose();
                        }}
                      >
                        <BottomSheetItem type={2} title="Edit Title" />
                      </TouchableOpacity>
                      {!docData.inspectionContentItemId && (
                        <TouchableOpacity
                          onPress={() => {
                            handleDeleteDoc(docData);
                            handlePresentModalClose();
                          }}
                        >
                          <BottomSheetItem type={3} title="Delete" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </BottomSheetModal>
            </View>
          </View>
        </ScreenWrapper>
      </View>
    </BottomSheetModalProvider>
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
              ? height(0.15)
              : height(0.17) + rowSpacing
            : Platform.OS === 'ios'
              ? height(0.15)
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
        style={Array.isArray(style) || typeof style === 'object' ? style : undefined}
      />
    );
  }
}

const BottomSheetItem = ({ type, title }: { type: number; title: string }) => (
  <View style={styles.bottomSheetItem}>
    <Image
      style={styles.smallIconStyle}
      source={
        type === 1 ? IMAGES.DOWNLOAD_ICON : type === 2 ? IMAGES.EDIT_PENCIL_ICON : IMAGES.DELETE
      }
    />
    <Text style={[styles.titleStyle, { marginLeft: 20 }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  viewStyles: { flex: 1, margin: 10 },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: height(0.01),
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    width: WINDOW_WIDTH * 0.1,
    borderRadius: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    fontSize: fontSize(0.025),
    gap: 5,
  },
  iconStyle: { width: iconSize(0.025), height: iconSize(0.025) },
  titleStyle: { color: COLORS.BLACK, fontSize: fontSize(0.028) },
  smallIconStyle: { width: iconSize(0.02), height: iconSize(0.02) },
  actionTitle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.035),
    fontWeight: '700',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: WINDOW_WIDTH * 0.05,
    flexDirection: 'column',
  },
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
  bottomSheetItem: {
    flexDirection: 'row',
    borderBottomColor: COLORS.GRAY_LIGHT,
    borderBottomWidth: 1,
    alignItems: 'center',
    height: height(0.07),
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
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height(0.015),
    paddingHorizontal: 10,
    backgroundColor: COLORS.LIST_CARD_BG,
    borderRadius: 8,
  },
  breadcrumbText: {
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    color: COLORS.BLUE_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default AttachedDocsSubScreen;
