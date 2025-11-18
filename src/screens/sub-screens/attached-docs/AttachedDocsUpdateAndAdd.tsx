import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Checkbox from 'expo-checkbox';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Types';
import { DocumentService } from './AttachedDocsService';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { MenuProvider } from 'react-native-popup-menu';
import FloatingInput from '../../../components/common/FloatingInput';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { COLORS } from '../../../theme/colors';
import { fontSize, height } from '../../../utils/helper/dimensions';
import { FONT_FAMILY } from '../../../theme/fonts';
import type { Status } from '../../../utils/interfaces/IComponent';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { normalizeBool, sortByKey } from '../../../utils/helper/helpers';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import PublishButton from '../../../components/common/PublishButton';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

type AttachedDocsUpdateAndAddProps = NativeStackScreenProps<
  RootStackParamList,
  'AttachedDocsUpdateAndAdd'
>;

const AttachedDocsUpdateAndAdd: React.FC<AttachedDocsUpdateAndAddProps> = ({
  route,
  navigation,
}) => {
  const isStatusReadOnly = normalizeBool(route.params?.isStatusReadOnly);
  const { isNetworkAvailable } = useNetworkStatus();
  const isFocused = useIsFocused();
  const [shortDescription, setShortDescription] = useState(
    route.params.isUpdate ? route.params.docsData?.shortDescription || '' : '',
  );
  const [details, setDetails] = useState(
    route.params.isUpdate ? route.params.docsData?.details || '' : '',
  );
  const [showOnFE, setShowOnFE] = useState(
    route.params.isUpdate
      ? route.params.docsData?.isShowonFE || false
      : route.params.isDefaultAttachDocShowOnFE || false,
  );
  const [fileNames, setFileNames] = useState<string[]>(
    route.params.isUpdate
      ? [route.params.docsData?.fileName.split('.')[0] || '']
      : Array.isArray(route.params.fileNames)
        ? route.params?.fileNames
        : route.params?.fileNames
          ? [route.params?.fileNames.split('.')[0]]
          : [],
  );
  const [fileTypes] = useState<string[]>(
    route.params.isUpdate
      ? [route.params.docsData?.fileName.split('.').pop() || '']
      : Array.isArray(route.params?.fileTypes)
        ? route.params?.fileTypes
        : route.params?.fileTypes
          ? [route.params?.fileTypes]
          : [],
  );
  const [originalTypes] = useState<string[]>(route.params?.originalTypes || '');
  const [fileUrls] = useState<string[]>(
    route.params.isUpdate
      ? [route.params.docsData?.url || '']
      : Array.isArray(route.params.fileUrls)
        ? route.params.fileUrls
        : route.params.fileUrls
          ? [route.params.fileUrls]
          : [],
  );
  const [fileDataArray] = useState<any[]>(
    route.params.isUpdate
      ? []
      : Array.isArray(route.params.fileData)
        ? route.params.fileData
        : route.params.fileData
          ? [route.params.fileData]
          : [],
  );
  const [statusValue, setStatusValue] = useState<Status | null>(null);
  const [typeValue, setTypeValue] = useState(null);
  const [statusItems, setStatusItems] = useState<[]>([]);
  const [typeItems, setTypeItems] = useState<[]>([]);
  const [isLoadingAPI, setLoading] = useState(false);
  const [, setIsFileNameEditable] = useState(true);

  const isCase = route?.params?.isCase ?? false;
  const contentId = route.params.contentId;
  const folderId = route.params.folderID ?? 0;
  const folderStructure = route.params.fileStructure || [];
  const statusId = route.params.docsData?.caseStatusId || route.params.docsData?.licenseStatusId;
  const folderUrl = isCase
    ? folderStructure.length > 0
      ? `/CaseAttachments/${contentId}/${folderStructure.join('/')}`
      : `/CaseAttachments/${contentId}`
    : folderStructure.length > 0
      ? `/LicenseAttachments/${contentId}/${folderStructure.join('/')}`
      : `/LicenseAttachments/${contentId}`;

  useEffect(() => {
    if (route.params.isUpdate && route?.params?.caseData && route.params.docsData) {
      const { isePlanSoftModuleEnabled, isLaserficheModuleEnabled, bluebeamProjectId } =
        route.params.caseData;

      // const { isStatusReadOnly } = route.params.contentData;
      console.log('isStatusReadOnly', route.params.contentData);
      const { ePlanSoftDocumentId, laserficheEntryId, bluebeamDocumentId } = route.params.docsData;
      setIsFileNameEditable(
        !(
          (isePlanSoftModuleEnabled && ePlanSoftDocumentId) ||
          (isLaserficheModuleEnabled && laserficheEntryId) ||
          (bluebeamProjectId && bluebeamDocumentId)
        ),
      );
    }
  }, [route?.params?.isUpdate, route?.params?.caseData, route?.params?.docsData]);

  useEffect(() => {
    const fetchData = async () => {
      const statuses = await DocumentService.fetchDocumentStatus(isCase, isNetworkAvailable);
      const sortedStatusItem = sortByKey(statuses || [], 'displayText');
      setStatusItems(sortedStatusItem);
      if (route?.params?.isUpdate && statusId) {
        const selectedStatus = statuses.find((item) => item?.id === statusId);
        setStatusValue(selectedStatus ?? null);
      }

      const types = await DocumentService.fetchDocumentTypes(isCase, isNetworkAvailable);
      const sortedDocumentItem = sortByKey(types || [], 'displayText');
      setTypeItems(sortedDocumentItem);
      if (route?.params?.isUpdate && route?.params?.docsData?.documentTypeId) {
        const selectedType = types.find(
          (item) => item?.id === route?.params?.docsData?.documentTypeId,
        );
        if (selectedType) setTypeValue(selectedType);
      }
    };
    if (isFocused) fetchData();
  }, [isFocused, route.params.isUpdate, route.params.docsData, isCase]);

  const isValidFileName = (value: string) => !/[\\?/:*."<>|]/.test(value);

  const handleSubmit = async () => {
    if (fileNames.some((name) => !isValidFileName(name))) {
      Alert.alert('File Name cannot contain the following characters: ?/:*."<>|');
      return;
    }
    const docDataArray = fileNames.map((fileName, index) => ({
      contentItemId: route.params.isUpdate ? route.params.docsData?.contentItemId : undefined,
      url: fileUrls[index],
      fileName: `${fileName}.${fileTypes[index]?.split('/')[1] || fileTypes[index]}`,
      statusId: statusValue?.id ?? '',
      documentTypeId: typeValue?.id ?? '',
      documentTypeName: typeValue?.displayText ?? '',
      details,
      shortDescription,
      isShowonFE: showOnFE,
      folderId,
      fileType: originalTypes[index] || fileTypes[index],
    }));
    console.log('docDataArray --->', fileTypes);
    setLoading(true);

    try {
      const uploadPromises = docDataArray.map(async (docData, index) => {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: fileDataArray[index]?.localUrl,
            name: fileDataArray[index]?.name,
            type: fileDataArray[index]?.mimeType,
          } as any);
          console.log(`Uploading file ${index + 1}:`, docData.fileName);
          const result = await DocumentService.addOrUpdateDocument(
            contentId,
            docData,
            route.params.isUpdate,
            isCase,
            formData,
            folderUrl,
            route?.params?.caseData,
            isNetworkAvailable,
          );
          return { success: result, fileName: docData.fileName };
        } catch (error) {
          recordCrashlyticsError(`Error uploading file ${docData.fileName}:`, error);
          console.error(`Error uploading file ${docData.fileName}:`, error);
          return { success: false, fileName: docData.fileName, error };
        }
      });

      const results = await Promise.all(uploadPromises);

      const failedUploads = results.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(
          (result) => `File ${result.fileName}: ${result.error?.message || 'Unknown error'}`,
        );
        ToastService.show(
          `Some files failed to upload:\n${errorMessages.join('\n')}`,
          COLORS.ERROR,
        );
      } else {
        ToastService.show('All files uploaded successfully', COLORS.SUCCESS_GREEN);
        navigation.goBack();
      }
    } catch (error) {
      recordCrashlyticsError('Error in handleSubmit:', error);
      console.error('Error in handleSubmit:', error);
      ToastService.show('An unexpected error occurred during upload', COLORS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      <ScreenWrapper
        title={route.params.isUpdate ? 'Update Document Meta Data' : 'Save Document Meta Data'}
      >
        <MenuProvider style={styles.container}>
          <View style={styles.viewStyles}>
            <KeyboardAwareScrollView
              nestedScrollEnabled
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{}}>
                {fileNames.map((name, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <View style={[styles.inputViewStyle, { flex: 1 }]}>
                      <FloatingInput
                        label={'File Name'}
                        value={name}
                        numberOfLines={1}
                        multiline
                        onChangeText={(text) => {
                          const updatedNames = [...fileNames];
                          updatedNames[index] = text;
                          setFileNames(updatedNames);
                        }}
                        placeholder=""
                        keyboardType="default"
                        disabled={isStatusReadOnly}
                      />
                    </View>
                    <View style={[styles.inputViewStyle, { marginLeft: 5 }]}>
                      <FloatingInput
                        label={'File Type'}
                        value={`.${fileTypes[index]?.split('/')}`}
                        numberOfLines={1}
                        multiline
                        editable={false}
                        disabled
                        onChangeText={() => {}}
                        placeholder=""
                        keyboardType="default"
                      />
                      {/* <Text style={[styles.titleStyle, { margin: 5 }]}>
                        File Type
                      </Text>
                      <View
                        style={[
                          styles.formInput,
                          { justifyContent: "center", paddingLeft: 10 },
                        ]}
                      >
                        <Text
                          style={styles.inputStyle}
                        >{`.${fileTypes[index]}`}</Text>
                      </View> */}
                    </View>
                  </View>
                ))}
              </View>
              <View style={[styles.inputViewStyle, { zIndex: 3 }]}>
                <CustomDropdown
                  data={statusItems}
                  labelField="displayText"
                  valueField="id"
                  value={statusValue?.id}
                  onChange={(item) => setStatusValue(item?.value)}
                  label="Status"
                  placeholder="Select Status"
                  zIndexPriority={4}
                  disabled={isStatusReadOnly}
                />
              </View>
              <View style={[styles.inputViewStyle, { zIndex: 2 }]}>
                <CustomDropdown
                  data={typeItems}
                  labelField="displayText"
                  valueField="id"
                  value={typeValue?.id}
                  onChange={(item) => setTypeValue(item?.value)}
                  label="Document Type"
                  placeholder="Select document type"
                  zIndexPriority={3}
                  disabled={isStatusReadOnly}
                />
              </View>
              <View style={styles.inputViewStyle}>
                <FloatingInput
                  label="Short Description"
                  value={shortDescription}
                  numberOfLines={1}
                  onChangeText={setShortDescription}
                  placeholder=""
                  keyboardType="default"
                  multiline
                  disabled={isStatusReadOnly}
                />
              </View>
              <View style={styles.inputViewStyle}>
                <FloatingInput
                  label="Details"
                  value={details}
                  numberOfLines={1}
                  onChangeText={setDetails}
                  placeholder=""
                  keyboardType="default"
                  multiline
                  disabled={isStatusReadOnly}
                />
              </View>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={showOnFE}
                  onValueChange={setShowOnFE}
                  color={showOnFE ? COLORS.APP_COLOR : undefined}
                  style={styles.checkbox}
                  disabled={isStatusReadOnly}
                />
                <Text style={styles.checkboxLabel}>Show on Front End</Text>
              </View>
              {/* <View style={styles.checkboxContainer}>
                <Checkbox
                  value={isAdminInspection}
                  onValueChange={setIsAdminInspection}
                  color={isAdminInspection ? COLORS.APP_COLOR : undefined}
                  style={styles.checkbox}
                />
                <Text style={styles.checkboxLabel}>
                  Inspection Admin Attachment
                </Text>
              </View> */}
              {/* <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    opacity: isStatusReadOnly ? 0.4 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isLoadingAPI || isStatusReadOnly}
              >
                <Text style={styles.submitButtonText}>
                  {route.params.isUpdate ? "Update Document" : "Add Document"}
                </Text>
              </TouchableOpacity> */}
              <PublishButton
                buttonStyle={{ marginTop: 15, marginBottom: 15 }}
                textName={route.params.isUpdate ? 'Update Document' : 'Add Document'}
                onPress={handleSubmit}
                disabled={isLoadingAPI || isStatusReadOnly}
              />
            </KeyboardAwareScrollView>
          </View>
        </MenuProvider>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewStyles: { flex: 1, margin: 10 },
  inputViewStyle: { marginVertical: 10 },
  titleStyle: {
    color: COLORS.GRAY_HEADING,
    fontSize: fontSize(0.028),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
  inputStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.028),
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  formInput: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.GRAY_DARK,
    backgroundColor: COLORS.WHITE,
    minHeight: height(0.06),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: { marginRight: 10 },
  checkboxLabel: { color: COLORS.BLACK, fontSize: fontSize(0.028) },
  submitButton: {
    backgroundColor: COLORS.APP_COLOR,
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.03),
    fontFamily: FONT_FAMILY.MontserratMedium,
  },
});

export default AttachedDocsUpdateAndAdd;
