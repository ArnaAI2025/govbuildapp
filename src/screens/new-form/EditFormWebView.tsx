import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';
import WebView, { WebView as RNWebView } from 'react-native-webview';
import { DateFormates, replaceAllDateFormat } from '../../utils/helper/helpers';
import {
  deleteImageKeyAndFormId,
  fetchForIoImgsWithLocalKey,
  fetchFormioImgswithLocalID,
  storeFormIOImageDataNew,
} from '../../database/sub-screens/attached-items/attachedItemsDAO';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { navigate } from '../../navigation/Index';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { editFormSubmission, storeFormFilesUrls } from '../../database/new-form/newFormDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

interface FileObject {}
interface GridObject {}

type EditFormWebViewProps = NativeStackScreenProps<RootStackParamList, 'EditFormWebView'>;

const EditFormWebView: React.FC<EditFormWebViewProps> = ({ route, navigation }) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [, setImageIds] = useState<string[]>([]);
  const [, setGridIDs] = useState<string[]>([]);
  const [grids, setGrids] = useState<GridObject[]>([]);
  const [conditionArray, setConditionArray] = useState<FileObject[]>([]);
  const [fileArray] = useState<FileObject[]>([]);
  const webviewRef = useRef<RNWebView>(null);
  const type = route.params.type;
  const rowData = route.params.param;
  let submission;
  if (JSON.parse(rowData.submission).hasOwnProperty('data')) {
    submission = ' form.submission =' + rowData.submission + ';';
  } else {
    submission = ' form.submission ={data:' + rowData.submission + '};';
  }

  function sotreAllFile(files, id, fromId) {
    return new Promise(async (resolve) => {
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        const object = {
          formId: fromId,
          fileId: id,
          mimeType: element.type,
          url: element.url,

          name: element.name,
        };

        storeFormFilesUrls(object);
      }
      resolve(true);
      return true;
    });
  }

  function storeDataGridAndCondFiles(gridName, gridsObject) {
    var oldSubJson;
    var fullData = route.params.param;
    var submissionJson;
    submissionJson = JSON.parse(fullData.submission);
    if (submissionJson.hasOwnProperty('data')) {
      oldSubJson = submissionJson.data;
    } else {
      oldSubJson = submissionJson;
    }
    fetchForIoImgsWithLocalKey(gridName, rowData.id).then((dataExist) => {
      if (dataExist.length == 0) {
        for (var i = 0; i < oldSubJson[gridName].length; i++) {
          var newID = uuid.v4();
          var object = {
            id: newID,
            key: gridName,
            label: gridsObject.label,
            gridKey: gridsObject.gridComponents,
            isMultiple:
              typeof gridsObject.isMultiple == 'undefined'
                ? false
                : gridsObject.isMultiple == 'true'
                  ? true
                  : false,
            isDataGrid: true,
            count: oldSubJson[gridName].length,
            condition: '',
            isCustomCondition: false,
            validate_required: gridsObject.isReq,
          };
          storeFormIOImageDataNew(object, rowData.id);
          sotreAllFile(oldSubJson[gridName][i][gridsObject.gridComponents], newID, rowData.id);
        }
      }
    });
  }

  let newData = replaceAllDateFormat(DateFormates, 'yyyy-MM-dd', rowData?.container);
  var jsonNew = JSON.parse(newData);
  var customJSON;
  if (jsonNew.display == 'form') {
    var array = jsonNew.components;
    array.push({
      type: 'button',
      label: 'Submit',
      key: 'submit',
      disableOnInvalid: true,
      input: true,
      tableView: false,
      overlay: {
        style: '',
        left: '80',
        top: '',
        width: '',
        height: '',
      },
    });
    array.push({
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
      conditional: {
        show: '',
        when: null,
        eq: '',
      },
      properties: {},
      state: 'draft',
    });

    customJSON = { display: 'form', components: array };
  } else {
    var array = jsonNew.components;
    array.push({
      type: 'button',
      label: 'Submit',
      key: 'submit',
      disableOnInvalid: true,
      input: true,
      tableView: false,
      overlay: {
        style: '',
        left: '80',
        top: '',
        width: '',
        height: '',
      },
    });
    array.push({
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
      conditional: {
        show: '',
        when: null,
        eq: '',
      },
      properties: {},
      state: 'draft',
    });

    customJSON = { display: 'wizard', components: array };
  }

  const jsCode = `
  window.onload = function() {
    Formio.createForm(document.getElementById('formio'), ${JSON.stringify(
      customJSON,
    )}, { saveDraft: true })
      .then(function(form) {

        let grid = [];

        form.everyComponent((component) => {

          // Google Address
          if (component.component.type === 'address' && component.component.provider === 'google') {
            let myComponent = form.getComponent(component.component.key);
            myComponent.component["enableManualMode"] = true;
          }

          //URL Data Source
          if (component.component.dataSrc === 'url') {
            let myComponent = form.getComponent(component.component.key);
            myComponent.component["description"] = "That it will only work online and the form will need to be saved as a draft";
            myComponent.redraw();
          }

          // File Components (Offline)
          if (component.component.type === 'file') {
            let myComponent = form.getComponent(component.component.key);
            component.disabled = true;
            myComponent.component["description"] = "<p style='color: #ff0000'>While in offline mode you will upload files in the next step.</p>";
            myComponent.redraw();
          }

          // DataGrid with File Components
          if (component.component.type === 'datagrid') {
            let myComponent = form.getComponent(component.component.key);

            if (myComponent.components.length === 0) {
              if (myComponent.component.components[0].type === 'columns') {
                let col = myComponent.component.components[0].columns;
                for (var j = 0; j < col.length; j++) {
                  let newComp = col[j].components;
                  if (newComp[0].type === 'file') {
                    grid.push(newComp[0].label);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      action: "datagrid",
                      gridKey: myComponent.key,
                      fileKey: newComp[0].key,
                      required: newComp[0].validate?.required || false,
                      multiple: newComp[0].multiple || false,
                      filePattern: newComp[0].filePattern || ""
                    }));
                  }
                }
              }
            } else {
              for (var i = 0; i < myComponent.components.length; i++) {
                var item = myComponent.components[i];

                if (item.type === 'file') {
                  grid.push(item.label);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    action: "datagrid",
                    gridKey: myComponent.key,
                    fileKey: item.key,
                    required: item.validate?.required || false,
                    multiple: item.multiple || false,
                    filePattern: item.filePattern || ""
                  }));
                }

                if (item.component.columns) {
                  item.component.columns.forEach(function (colItem) {
                    colItem.components.forEach(function (nested) {
                      if (nested.type === 'file') {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          action: "datagrid",
                          gridKey: component.component.key,
                          fileKey: nested.key,
                          required: nested.validate?.required || false,
                          multiple: nested.multiple || false,
                          filePattern: nested.filePattern || ""
                        }));
                      }
                    });
                  });
                }
              }
            }
          }

          //Top-Level File Component
          if (component.component.type === 'file' && component.component.input === true) {
            let myComponent = form.getComponent(component.component.key);
            let condition = "";
            let customCondition = false;

            if (myComponent.component.conditional.show != null &&
                myComponent.component.conditional.when != null &&
                myComponent.component.conditional.eq != "") {
              condition = myComponent.component.conditional;
            }

            if (!grid.includes(component.component.label)) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action: "component",
                key: component.component.key,
                label: component.component.label,
                required: component.component.validate?.required || false,
                condition: condition,
                customCondition: customCondition,
                multiple: component.component.multiple || false,
                filePattern: component.component.filePattern || ""
              }));
            }
          }
        });

        // Handle Redraw
        form.on('redraw', function() {
          form.everyComponent((component) => {
            if (component.component.type === 'file') {
              let myComponent = form.getComponent(component.component.key);

              if (typeof myComponent.component.conditional === 'undefined' ||
                  myComponent.component.conditional.when == null) {
                component.disabled = true;
                myComponent.component["description"] = "<p style='color: #ff0000'>While in offline mode you will upload files in the next step.</p>";
                myComponent.redraw();
              }
            }
          });
        });

        // Handle Change
        form.on('change', function(changed) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: "change",
            data: changed.data
          }));
        });

        ${submission}

        // Handle Submit
        form.on('submit', function(submission) {
          if (submission.state === 'draft') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: "isDraft",
              submission: submission
            }));
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: "submit",
              submission: submission
            }));
          }
        });

      });
  };

  function myFunction() {
    var element = document.getElementsByClassName("formio-component-file");
    for (let i = 0; i < element.length; i++) {
      element[i].style.display = "none";
    }
  }
`;

  const onMessage = async (event) => {
    try {
      const raw = event.nativeEvent?.data;
      if (!raw) return;

      let message;
      try {
        message = JSON.parse(raw);
      } catch (e) {
        recordCrashlyticsError('Could not parse message from webview:',e)
        console.error('Could not parse message from webview:', e, raw);
        return;
      }

      const action = message.action;
      if (!action) return;

      // Parse old submission JSON (fallback if no `data` key exists)
      let submissionJsonOld = {};
      try {
        submissionJsonOld = JSON.parse(rowData.submission || '{}');
      } catch {
        submissionJsonOld = {};
      }
      const oldSubJson = submissionJsonOld.data ?? submissionJsonOld;

      // === Submit / Draft ===
      if (action === 'submit' || action === 'isDraft') {
        const newJSON = message.submission; // already an object
        let allFileArray: any[] = [];
        let otherFileArray = [...fileArray];

        // --- Handle Data Grids ---
        if (grids.length > 0) {
          for (let j = 0; j < grids.length; j++) {
            const gridsObject = grids[j];
            const gridName = gridsObject?.gridKey;
            if (!gridName) continue;

            const oldLen = oldSubJson[gridName]?.length || 0;
            const newLen = newJSON?.data?.[gridName]?.length || 0;

            if (oldLen < newLen) {
              const lengthDiff = newLen - oldLen;
              for (let i = 0; i < lengthDiff; i++) {
                const newID = uuid.v4();
                setGridIDs((prev) => [...prev, newID]);

                otherFileArray = otherFileArray.filter(
                  (el) => el.key !== gridsObject?.gridComponents,
                );

                const object = {
                  id: newID,
                  key: gridName,
                  label: gridsObject?.label,
                  gridKey: gridsObject?.gridComponents,
                  isMultiple:
                    gridsObject?.isMultiple === true || gridsObject?.isMultiple === 'true',
                  isDataGrid: true,
                  count: newJSON?.data?.[gridName]?.length ?? 0,
                  condition: '',
                  isCustomCondition: false,
                  validate_required: gridsObject?.isReq,
                  filePattern: gridsObject?.filePattern,
                };
                allFileArray.push(object);
              }
            }
          }
        }

        // --- Handle Conditional Files ---
        for (const element of [...conditionArray]) {
          const condObj = element?.condition ? JSON.parse(element.condition) : null;
          if (!condObj) continue;

          const fieldKey = condObj.when;
          const eqCond = condObj.eq === 'true' ? true : condObj.eq === 'false' ? false : condObj.eq;

          if (newJSON.data && Object.prototype.hasOwnProperty.call(newJSON.data, fieldKey)) {
            if (newJSON.data[fieldKey] === eqCond && condObj.show) {
              const dataExist = await fetchForIoImgsWithLocalKey(element.key, rowData.id);
              if (dataExist.length === 0) {
                await storeFormIOImageDataNew(element, rowData.id);
                await sotreAllFile(newJSON.data[element.key] || [], element.id, rowData.id);
              }
            } else {
              await deleteImageKeyAndFormId(rowData.id, element.key);
            }
          }
        }

        allFileArray = [...allFileArray, ...otherFileArray];

        // --- Save Submission ---
        await handleSaveSubmission(JSON.stringify(newJSON), rowData, allFileArray, newJSON);
      }

      // === Datagrid ===
      else if (action === 'datagrid') {
        const jsonObj = {
          gridKey: message.gridKey,
          gridComponents: message.fileKey,
          isReq: message.required ?? message.isReq,
          isMultiple: message.multiple ?? message.isMultiple,
          label: message.label,
          filePattern: message.filePattern || '',
        };

        setGrids((prev) => [...prev, jsonObj]);
        storeDataGridAndCondFiles(jsonObj.gridKey, jsonObj);
      }

      // === Component ===
      else if (action === 'component') {
        const newID = uuid.v4();
        setImageIds((prev) => [...prev, newID]);

        const object = {
          id: newID,
          key: message.key,
          label: message.label,
          gridKey: '',
          isMultiple: message.multiple === true || message.multiple === 'true',
          isDataGrid: false,
          count: 0,
          condition: message.condition || '',
          isCustomCondition: message.customCondition === true || message.customCondition === 'true',
          validate_required: message.required,
          filePattern: message.filePattern || '',
        };

        if (object.condition && object.condition !== '""') {
          setConditionArray((prev) => [...prev, object]);
        } else {
          const dataExist = await fetchForIoImgsWithLocalKey(object.key, rowData.id);
          if (dataExist.length === 0 && typeof oldSubJson[object.key] !== 'undefined') {
            await storeFormIOImageDataNew(object, rowData.id);
            await sotreAllFile(oldSubJson[object.key], newID, rowData.id);
          }
        }
      }

      // === Change Event ===
      else if (action === 'change') {
        // optional: handle change data updates here
        console.log('Form change:---->>>', message.data);
      }
    } catch (err) {
      recordCrashlyticsError('Error in onMessage:', err)
      console.error('Error in onMessage:', err);
    }
  };

  const handleSaveSubmission = async (payload, rowData, allFileArray, newJSON) => {
    console.log('edit form payload----->>>', payload);
    try {
      await editFormSubmission(payload, rowData.id, allFileArray);
      ToastService.show('Data Saved Successfully', COLORS.SUCCESS_GREEN);
      const imageFullData = await fetchFormioImgswithLocalID(rowData?.id);
      if (imageFullData.length > 0) {
        navigate('FormioFileUploadScreen', {
          paramKey: 'params',
          param: rowData.id,
          submission: newJSON,
          type: type,
          caseLicenseObject: route?.params?.caseLicenseObject,
          parentScreenName: route?.name,
          isFromNewForm: true,
        });
      } else {
        navigation.goBack(null);
      }
    } catch (error) {
      recordCrashlyticsError('Error saving submission:',error)
      console.error('Error saving submission:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper title="Edit Form">
        <Loader loading={isLoading} />
        <View style={styles.viewStyles}>
          <WebView
            ref={webviewRef}
            style={{ flex: 1 }}
            onLoad={() => setLoading(false)}
            onError={(error: any) => ToastService.show(error.nativeEvent.description, COLORS.ERROR)}
            javaScriptCanOpenWindowsAutomatically={false}
            setBuiltInZoomControls={true}
            originWhitelist={['*']}
            source={
              Platform.OS === 'android'
                ? { uri: 'file:///android_asset/myHtml.html' }
                : { uri: 'Web.bundle/formIo.html' }
            }
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit
            scrollEnabled={true}
            webviewDebuggingEnabled={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
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

export default EditFormWebView;
