import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native';

import {
  cardBorder,
  fontSize,
  height,
  marginLeftAndRight,
  marginTopAndBottom,
  WINDOW_WIDTH,
} from '../../utils/helper/dimensions';
import { useOrientation } from '../../utils/useOrientation';
import {
  fetchFormioImgswithLocalID,
  fetchFromFileById,
  updateIsDraftAddFormData,
} from '../../database/sub-screens/attached-items/attachedItemsDAO';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import NoData from '../../components/common/NoData';
import ImageFileUploadPic from '../../utils/helper/filePickerUtils';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/Types';
import { goBack } from '../../navigation/Index';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

// Define interfaces for type safe
interface FileData {
  id: string;
  label: string;
  gridKey: string;
  validate_required: string;
  isDataGrid: number;
  isMultipal?: boolean;
  formId?: string;
  fileArray?: Array<{ name: string }>;
}

type FormioFileUploadScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FormioFileUploadScreen'
>;
const FormioFileUploadScreen: React.FC<FormioFileUploadScreenProps> = ({ route }) => {
  const orientation = useOrientation();
  const [allData, setAllData] = useState<FileData[]>([]);
  // const [submissionJSON, setSubmissionJSON] = useState<any>(
  //   route.params.submission
  // );
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [, setIsImage] = useState<any[]>([]);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [rowId, setRowId] = useState<string | undefined>();
  const [formId, setFormId] = useState<string | undefined>();

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const pageReload = () => {
    setTimeout(() => {
      fetchFileData();
      ToastService.show('Files uploaded successfully', COLORS.SUCCESS_GREEN);
      setLoading(false);
    }, 1000);
  };

  const fetchFileData = async () => {
    setAllData([]);
    try {
      const fromImageData = await fetchFormioImgswithLocalID(route.params.param);
      for (const element of fromImageData) {
        const allFiles = await fetchFromFileById(element?.id);
        element.fileArray = allFiles;
        setAllData((prev: any) => [...prev, element]);
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching file data:', error);
      console.error('Error fetching file data:', error);
    }
  };

  const checkReqFiles = async (): Promise<boolean> => {
    try {
      const fromImageData = await fetchFormioImgswithLocalID(route.params.param);
      const promises = fromImageData
        .filter((element: any) => element?.validate_required === 'true')
        .map((element: any) =>
          fetchFromFileById(element.id).then((allFiles) => allFiles?.length > 0),
        );

      const results = await Promise.all(promises);
      return results.every((result) => result);
    } catch (error) {
      recordCrashlyticsError('Error checking required files:', error);
      console.error('Error checking required files:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFileData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoadingAPI} />
      {alertVisible && (
        <ImageFileUploadPic
          visible={alertVisible}
          onClose={handleAlertClose}
          setLoading={(value) => setLoading(value)}
          config={{
            isMultipal: multiple,
            id: rowId,
            setIsImage,
            fromId: formId,
            pageReload,
          }}
        />
      )}
      <ScreenWrapper title="File Upload">
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'column' }} />
          {allData.length > 0 ? (
            <FlatList
              data={allData}
              renderItem={({ item: rowData }: { item: FileData; index: number }) => (
                <View
                  style={{
                    flex: 1,
                    width:
                      orientation === 'PORTRAIT'
                        ? WINDOW_WIDTH - WINDOW_WIDTH * 0.065
                        : WINDOW_WIDTH - WINDOW_WIDTH * 0.06,
                    padding: 0,
                    borderRadius: 5,
                    borderWidth: cardBorder(),
                    elevation: 5,
                    marginBottom: height(0.01),
                    marginTop: height(0.01),
                    marginLeft: 2,
                    marginRight: 2,
                  }}
                >
                  <View
                    style={{
                      width:
                        orientation === 'PORTRAIT'
                          ? WINDOW_WIDTH - WINDOW_WIDTH * 0.06
                          : WINDOW_WIDTH - WINDOW_WIDTH * 0.06,
                      justifyContent: 'center',
                      padding: height(0.018),
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {rowData.validate_required === 'true' ? (
                        <Image
                          style={{ width: 10, height: 10 }}
                          source={require('../../assets/images/asterisk.png')}
                        />
                      ) : (
                        <View />
                      )}
                      <Text style={styles.contentStyle}>
                        {rowData.isDataGrid === 1
                          ? `${rowData.label}: ${rowData.gridKey}`
                          : rowData.label}
                      </Text>
                      <View
                        style={{
                          alignItems: 'flex-end',
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: COLORS.APP_COLOR,
                            height: height(0.035),
                            borderRadius: 5,
                            paddingLeft: 10,
                            paddingRight: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={async () => {
                            try {
                              setMultiple(rowData.isMultipal ?? false);
                              setRowId(rowData.id);
                              setFormId(rowData.formId);
                              setAlertVisible(true);
                            } catch (e) {
                              ToastService.show(String(e), COLORS.ERROR);
                            }
                          }}
                        >
                          <Text style={styles.labelStyle}>Upload Image</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {rowData.fileArray && rowData.fileArray.length > 0 ? (
                      <FlatList
                        data={rowData.fileArray}
                        renderItem={({
                          item: fileData,
                        }: {
                          item: { name: string };
                          index: number;
                        }) => (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: marginLeftAndRight(0.022),
                            }}
                          >
                            <Text style={{ fontSize: fontSize(0.05) }}>•</Text>
                            <Text style={styles.fileText}>{fileData.name}</Text>
                          </View>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                      />
                    ) : (
                      <View />
                    )}
                  </View>
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
            />
          ) : (
            <NoData />
          )}
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.APP_COLOR,
                height: height(0.035),
                borderRadius: 5,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 10,
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
              onPress={() => {
                updateIsDraftAddFormData(route.params.param);
                // navigate("AttechedItems", {
                //   type: route.params.type,
                //   param: route?.params?.caseLicenseObject,
                //   // caseDataById: route?.params?.caseLicenseObject,
                // });
                if (route?.params?.isFromNewForm) {
                  goBack();
                  goBack();
                } else {
                  goBack();
                  goBack();
                  goBack();
                }
              }}
            >
              <Text style={styles.labelStyle}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.APP_COLOR,
                height: height(0.035),
                borderRadius: 5,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 10,
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                marginLeft: 20,
              }}
              onPress={async () => {
                const isReq = await checkReqFiles();
                if (isReq) {
                  ToastService.show('Data Saved!', COLORS.SUCCESS_GREEN);
                  // navigation.replace("AttechedItems", {
                  //   type: route.params.type,
                  //   param: route?.params?.caseLicenseObject,
                  //   // caseDataById: route?.params?.caseLicenseObject,
                  // });
                  if (route?.params?.isFromNewForm) {
                    goBack();
                    goBack();
                  } else {
                    goBack();
                    goBack();
                    goBack();
                  }
                } else {
                  ToastService.show('Please upload required image!', COLORS.ERROR);
                }
              }}
            >
              <Text style={styles.labelStyle}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.025),
  },
  contentStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.031),
    flex: 1,
    paddingRight: 5,
    paddingLeft: 5,
  },
  fileText: {
    color: COLORS.SUCCESS_GREEN,
    fontSize: fontSize(0.028),
    padding: 5,
  },
  viewStyles: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingLeft: WINDOW_WIDTH * 0.025,
    paddingRight: WINDOW_WIDTH * 0.025,
    paddingTop: height(0.022),
    paddingBottom: 20,
    marginTop: marginTopAndBottom(-0.025),
    flexDirection: 'column',
    borderTopLeftRadius: WINDOW_WIDTH * 0.09,
    borderTopRightRadius: WINDOW_WIDTH * 0.09,
  },
});

export default FormioFileUploadScreen;
