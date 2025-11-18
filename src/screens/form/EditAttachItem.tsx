import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';
import WebView from 'react-native-webview';

import { DateFormates, replaceAllDateFormat } from '../../utils/helper/helpers';
import {
  deleteImageKeyAndFormId,
  fetchForIoImgsWithLocalKey,
  fetchFormioImgswithLocalID,
  storeEditSubmissionToAttachTable,
  storeFormFilesForSync,
  storeFormIOImageDataNew,
} from '../../database/sub-screens/attached-items/attachedItemsDAO';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import useAuthStore from '../../store/useAuthStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/Types';
import { navigate } from '../../navigation/Index';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

interface FileObject {
  id: string;
  key: string;
  label: string;
  gridKey: string;
  isMultiple: boolean;
  isDataGrid: boolean;
  count: number;
  condition: string;
  isCustomCondition: boolean;
  validate_required: string;
  filePattern: string;
}

interface GridObject {
  gridKey: string;
  gridComponents: string;
  isReq: string;
  isMultiple: string;
  label: string;
  filePattern: string;
}

type EditAttachItemProps = NativeStackScreenProps<RootStackParamList, 'EditAttachItem'>;

const EditAttachItem: React.FC<EditAttachItemProps> = ({ navigation, route }) => {
  const [isLoadingAPI, setLoading] = useState<boolean>(true);
  const [imgIDs, setImageIds] = useState<string[]>([]);
  const [gridIDs, setGridIDs] = useState<string[]>([]);
  const [grids, setGrids] = useState<GridObject[]>([]);
  const [conditionArray, setConditionArray] = useState<FileObject[]>([]);
  const [fileArray] = useState<FileObject[]>([]);
  const { authData } = useAuthStore();
  const webviewRef = useRef<WebView>(null);
  const rowData = route?.params?.param;

  useEffect(() => {
    if (!authData?.adminRole?.teamMember?.userId) {
      ToastService.show('User authentication data is missing', COLORS.ERROR);
      navigation.goBack();
      return;
    }
    if (!rowData?.container) {
      ToastService.show('Invalid form data', COLORS.ERROR);
      navigation.goBack();
      return;
    }
  }, [authData, rowData]);

  const newData = replaceAllDateFormat(DateFormates, 'yyyy-MM-dd', rowData.container);
  let jsonNew;
  try {
    jsonNew = JSON.parse(newData);
  } catch (error) {
    ToastService.show('Invalid JSON data: ' + error?.message, COLORS.ERROR);
    navigation.goBack();
    return null;
  }

  const customJSON = {
    display: jsonNew.display,
    components: [
      ...jsonNew.components,
      {
        type: 'button',
        label: 'Submit',
        key: 'submit',
        disableOnInvalid: true,
        input: true,
        tableView: false,
        overlay: { style: '', left: '80', top: '', width: '', height: '' },
      },
      {
        autofocus: false,
        input: true,
        label: 'Save draft',
        tableView: false,
        key: 'savedraft',
        size: 'md',
        leftIcon: '',
        rightIcon: '',
        block: false,
        action: 'saveState',
        disableOnInvalid: false,
        theme: 'primary',
        type: 'button',
        tags: [],
        conditional: { show: '', when: null, eq: '' },
        properties: {},
        state: 'draft',
      },
    ],
  };

  let submission;
  if (rowData.updatedSubmission != null && rowData.updatedSubmission !== '') {
    submission = `form.submission = ${rowData.updatedSubmission};`;
  } else {
    if (JSON.parse(rowData.submission).hasOwnProperty('data')) {
      submission = `form.submission = ${rowData.submission};`;
    } else {
      submission = `form.submission = {data: ${rowData.submission}};`;
    }
  }

  const jsCode = `
    console.log('JavaScript injected successfully');
    window.ReactNativeWebView.postMessage('debug*JS injected');
    window.onload = function() {
      if (typeof Formio === 'undefined') {
        window.ReactNativeWebView.postMessage('error*Formio library not loaded');
        return;
      }
      Formio.createForm(document.getElementById('formio'), ${JSON.stringify(
        customJSON,
      )}, { saveDraft: true })
        .then(function(form) {
          let grid = [];
          const protectedKeys = ${rowData.protectedFields || '[]'};
          form.everyComponent((component, components) => {
            if (protectedKeys && protectedKeys.length > 0) {
              if (protectedKeys.includes(component.component.key)) {
                let myComponent = form.getComponent(component.component.key);
                component.disabled = true;
                myComponent.redraw();
              }
            }
            if (component.component.type === 'address' && component.component.provider === 'google') {
              let myComponent = form.getComponent(component.component.key);
              myComponent.component['enableManualMode'] = true;
            }
            if (component.component.dataSrc === 'url') {
              let myComponent = form.getComponent(component.component.key);
              myComponent.component['description'] = 'This field requires an internet connection and must be saved as a draft in offline mode.';
              myComponent.redraw();
            }
            if (component.component.type === 'file') {
              let myComponent = form.getComponent(component.component.key);
              component.disabled = true;
              myComponent.component['description'] = '<p style="color: #dc3545">File uploads are disabled in offline mode. Upload files in the next step.</p>';
              myComponent.redraw();
            }
            if (component.component.type === 'datagrid') {
              let myComponent = form.getComponent(component.component.key);
              if (myComponent.components.length === 0) {
                if (myComponent.component.components[0].type === 'columns') {
                  let col = myComponent.component.components[0].columns;
                  for (let j = 0; j < col.length; j++) {
                    let newComp = col[j].components;
                    if (newComp[0].type === 'file') {
                      grid.push(newComp[0].label);
                      const isreq = typeof newComp[0].validate === 'undefined' ? false : newComp[0].validate.required || false;
                      window.ReactNativeWebView.postMessage('datagrid*'+myComponent.key+'*'+newComp[0].key+'*'+isreq+'*'+newComp[0].multiple+'*'+newComp[0].label+'*'+(newComp[0].filePattern || ''));
                    }
                  }
                }
              } else {
                for (let i = 0; i < myComponent.components.length; i++) {
                  let item = myComponent.components[i];
                  if (item.type === 'file') {
                    grid.push(item.label);
                    let isreq = typeof item.validate === 'undefined' ? false : item.validate.required || false;
                    let ismultiple = typeof item.multiple === 'undefined' ? false : item.multiple;
                    window.ReactNativeWebView.postMessage('datagrid*'+myComponent.key+'*'+item.key+'*'+isreq+'*'+ismultiple+'*'+item.label+'*'+(item.filePattern || ''));
                  }
                  if (item.component.columns) {
                    item.component.columns.forEach((item1, index, arr) => {
                      item1.components.forEach((item2, index, arr) => {
                        if (item2.type === 'file') {
                          let isreq = typeof item2.validate === 'undefined' ? false : item2.validate.required || false;
                          let ismultiple = typeof item2.multiple === 'undefined' ? false : item2.multiple;
                          window.ReactNativeWebView.postMessage('datagrid*'+component.component.key+'*'+item2.key+'*'+isreq+'*'+ismultiple+'*'+item2.label+'*'+(item2.filePattern || ''));
                        }
                      });
                    });
                  }
                }
              }
            }
            if (component.component.type === 'file' && component.component.input === true) {
              let myComponent = form.getComponent(component.component.key);
              let condition = '';
              let customCondition = false;
              if (myComponent.component.conditional?.show != null && 
                  myComponent.component.conditional.when != null && 
                  myComponent.component.conditional.eq !== '') {
                condition = JSON.stringify(myComponent.component.conditional);
              }
              if (myComponent.component.hidden === false) {
                if (!grid.includes(component.component.label)) {
                  window.ReactNativeWebView.postMessage('component*'+component.component.key+'*'+component.component.label+'*'+(component.component.validate?.required || false)+'*'+condition+'*'+customCondition+'*'+component.component.multiple+'*'+(component.component.filePattern || ''));
                }
              }
            }
          });
          form.on('redraw', function() {
            form.everyComponent((component) => {
              if (component.component.type === 'datagrid') {
                component.components.forEach((item, index, arr) => {
                  if (item.component.type === 'file') {
                    // Handle file components
                  }
                  if (item.component.columns) {
                    item.component.columns.forEach((item1, index, arr) => {
                      item1.components.forEach((item2, index, arr) => {
                        if (item2.type === 'file') {
                          // Handle file components
                        }
                      });
                    });
                  }
                });
              }
              if (component.component.type === 'file') {
                let myComponent = form.getComponent(component.component.key);
                if (typeof myComponent.component.conditional === 'undefined' || 
                    myComponent.component.conditional?.when == null) {
                  component.disabled = true;
                  myComponent.component['description'] = '<p style="color: #dc3545">File uploads are disabled in offline mode. Upload files in the next step.</p>';
                  myComponent.redraw();
                }
              }
            });
          });
          ${submission}
          form.on('submit', function(submission) {
            let jsonData = JSON.stringify(submission);
            let jsonGrid = JSON.stringify(submission.data);
            window.ReactNativeWebView.postMessage((submission.state === 'draft' ? 'isDraft' : 'submit') + '*' + jsonData + '*' + jsonGrid);
          });
        })
        .catch(function(error) {
          window.ReactNativeWebView.postMessage('error*Formio initialization failed: ' + error.message);
        });
    };
    function myFunction() {
      const elements = document.getElementsByClassName('formio-component-file');
      console.log('File components:', elements.length);
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
      }
    }
  `;

  const storeAllFile = (files: any[], id: string, formId: string) => {
    return new Promise((resolve) => {
      for (const element of files) {
        const object = {
          formId,
          fileId: id,
          mimeType: element.type,
          url: element.url,
          name: element.name,
        };
        storeFormFilesForSync(object);
      }
      resolve(true);
    });
  };

  const storeDataGridAndCondFiles = (gridName: string, gridsObject: GridObject) => {
    let oldSubJson;
    const fullData = rowData;
    let submissionJson;
    if (fullData.updatedSubmission != null && fullData.updatedSubmission !== '') {
      submissionJson = JSON.parse(fullData.updatedSubmission);
    } else {
      submissionJson = JSON.parse(fullData.submission);
    }
    oldSubJson = submissionJson.hasOwnProperty('data') ? submissionJson.data : submissionJson;
    fetchForIoImgsWithLocalKey(gridName, rowData.id).then((dataExist) => {
      if (dataExist.length === 0) {
        for (let i = 0; i < oldSubJson[gridName].length; i++) {
          const newID = uuid.v4() as string;
          const object: FileObject = {
            id: newID,
            key: gridName,
            label: gridsObject.label,
            gridKey: gridsObject.gridComponents,
            isMultiple: gridsObject.isMultiple === 'true',
            isDataGrid: true,
            count: oldSubJson[gridName].length,
            condition: '',
            isCustomCondition: false,
            validate_required: gridsObject.isReq,
            filePattern: gridsObject.filePattern || '',
          };
          storeFormIOImageDataNew(object, rowData.id);
          storeAllFile(oldSubJson[gridName][i][gridsObject.gridComponents], newID, rowData.id);
        }
      }
    });
  };

  const onMessage = (event: any) => {
    const dataParts = event.nativeEvent.data.split('*');
    if (dataParts[0] === 'debug') {
      console.log(dataParts[1]);
      return;
    }
    if (dataParts[0] === 'error') {
      ToastService.show(dataParts[1], COLORS.ERROR);
      return;
    }

    let oldSubJson;
    let submissionJsonOld;
    if (rowData.updatedSubmission != null && rowData.updatedSubmission !== '') {
      submissionJsonOld = JSON.parse(rowData.updatedSubmission);
    } else {
      submissionJsonOld = JSON.parse(rowData.submission);
    }
    oldSubJson = submissionJsonOld.hasOwnProperty('data')
      ? submissionJsonOld.data
      : submissionJsonOld;

    if (dataParts[0] === 'submit' || dataParts[0] === 'isDraft') {
      const newJSON = JSON.parse(dataParts[1]);
      const allFileArray: FileObject[] = [];
      const otherFileArray = [...fileArray];

      if (grids.length > 0) {
        for (const gridsObject of grids) {
          const gridName = gridsObject.gridKey;
          if (oldSubJson[gridName].length < newJSON.data[gridName].length) {
            const length = newJSON.data[gridName].length - oldSubJson[gridName].length;
            for (let i = 0; i < length; i++) {
              const newID = uuid.v4() as string;
              gridIDs.push(newID);
              setGridIDs([...gridIDs]);
              for (let index = 0; index < otherFileArray.length; index++) {
                if (otherFileArray[index].key === gridsObject.gridComponents) {
                  otherFileArray.splice(index, 1);
                }
              }
              const object: FileObject = {
                id: newID,
                key: gridName,
                label: gridsObject.label,
                gridKey: gridsObject.gridComponents,
                isMultiple: gridsObject.isMultiple === 'true',
                isDataGrid: true,
                count: newJSON.data[gridName].length,
                condition: '',
                isCustomCondition: false,
                validate_required: gridsObject.isReq,
                filePattern: gridsObject.filePattern,
              };
              allFileArray.push(object);
            }
          }
        }
      }

      for (const element of conditionArray) {
        const condition = JSON.parse(element.condition);
        const conditionKey = condition.when;
        const eqCond =
          condition.eq === 'true' ? true : condition.eq === 'false' ? false : condition.eq;
        if (
          newJSON.data.hasOwnProperty(conditionKey) &&
          newJSON.data[conditionKey] === eqCond &&
          condition.show
        ) {
          fetchForIoImgsWithLocalKey(element.key, rowData.id).then((dataExist) => {
            if (dataExist.length === 0) {
              storeFormIOImageDataNew(element, rowData.id);
              storeAllFile(newJSON.data[element.key], element.id, rowData.id);
            }
          });
        } else {
          deleteImageKeyAndFormId(rowData.id, element.key);
        }
      }

      const combinedFileArray = [...allFileArray, ...otherFileArray];
      const saveData = async () => {
        try {
          await storeEditSubmissionToAttachTable(
            dataParts[1],
            rowData.id,
            1, //rowData.isEdited
            imgIDs.join(','),
            rowData.contentItemId,
            rowData.isCase,
            combinedFileArray,
          );
          ToastService.show('Data Saved Successfully', COLORS.SUCCESS_GREEN);
          const imageFullData = await fetchFormioImgswithLocalID(rowData.id);
          if (imageFullData.length > 0) {
            navigate('FormioFileUploadScreen', {
              paramKey: 'params',
              param: rowData.id,
              submission: newJSON,
              type: route?.params?.type,
              caseLicenseObject: route?.params?.caseLicenseObject,
            });
          } else {
            navigation.goBack();
          }
        } catch (error) {
          recordCrashlyticsError('Failed to save data: ', error);
          ToastService.show('Failed to save data: ' + error?.message, COLORS.ERROR);
        }
      };

      if (dataParts[0] === 'submit') {
        saveData(false);
      } else {
        saveData(true);
      }
    } else if (dataParts[0] === 'datagrid') {
      const gridObject: GridObject = {
        gridKey: dataParts[1],
        gridComponents: dataParts[2],
        isReq: dataParts[3],
        isMultiple: dataParts[4],
        label: dataParts[5],
        filePattern: dataParts[6] || '',
      };
      setGrids((prev) => [...prev, gridObject]);
      storeDataGridAndCondFiles(gridObject.gridKey, gridObject);
    } else {
      const newID = uuid.v4() as string;
      setImageIds((prev) => [...prev, newID]);
      const object: FileObject = {
        id: newID,
        key: dataParts[1],
        label: dataParts[2],
        gridKey: '',
        isMultiple: dataParts[6] === 'true',
        isDataGrid: false,
        count: 0,
        condition: dataParts[4],
        isCustomCondition: dataParts[5] === 'true',
        validate_required: dataParts[3],
        filePattern: dataParts[7] || '',
      };
      if (dataParts[4] !== '""' && dataParts[4] !== '') {
        setConditionArray((prev) => [...prev, object]);
      } else {
        fetchForIoImgsWithLocalKey(object.key, rowData.id).then((dataExist) => {
          if (dataExist.length === 0 && oldSubJson[object.key]) {
            storeFormIOImageDataNew(object, rowData.id);
            storeAllFile(oldSubJson[object.key], newID, rowData.id);
          }
        });
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper title="Edit Form">
        <Loader loading={isLoadingAPI} />
        <View style={styles.viewStyles}>
          <WebView
            ref={webviewRef}
            style={{ margin: 5, flex: 1 }}
            onLoad={() => setLoading(false)}
            onError={(error) => ToastService.show(error.nativeEvent.description, COLORS.ERROR)}
            javaScriptCanOpenWindowsAutomatically={false}
            setBuiltInZoomControls
            originWhitelist={['*']}
            source={
              Platform.OS === 'android'
                ? { uri: 'file:///android_asset/myHtml.html' }
                : { uri: 'Web.bundle/formIo.html' }
            }
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            scrollEnabled
            webviewDebuggingEnabled
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            allowFileAccess
            injectedJavaScript={jsCode}
            injectedJavaScriptBeforeContentLoaded={jsCode}
            onMessage={onMessage}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyles: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    marginTop: 0,
    flexDirection: 'column',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  labelStyle: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: fontSize(0.03),
  },
  container: {
    marginTop: -45,
    flex: 0.15,
    flexDirection: 'row',
  },
  topbarBackground: {
    width: WINDOW_WIDTH,
    height: 140,
    justifyContent: 'center',
  },
  titleStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.05),
    textAlign: 'center',
    marginLeft: 15,
  },
  hintStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.025),
    marginBottom: 5,
  },
  formInput: {
    borderBottomWidth: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    height: height(0.05),
    backgroundColor: COLORS.BLUE_COLOR,
  },
  inputStyle: {
    color: COLORS.BLACK,
    paddingHorizontal: 5,
    fontSize: fontSize(0.025),
  },
  iconStyle: {
    width: iconSize(0.03),
    height: iconSize(0.03),
  },
});

export default EditAttachItem;
