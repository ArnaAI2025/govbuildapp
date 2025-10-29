import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';
import WebView, { WebView as RNWebView } from 'react-native-webview';
import { DateFormates, replaceAllDateFormat } from '../../utils/helper/helpers';
import {
  storeAddFormDataNew,
  storeItemToAttachTable,
} from '../../database/sub-screens/attached-items/attachedItemsDAO';
import Loader from '../../components/common/Loader';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS } from '../../theme/colors';
import { fontSize, height, iconSize, WINDOW_WIDTH } from '../../utils/helper/dimensions';
import useAuthStore from '../../store/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { goBack, navigate } from '../../navigation/Index';
import { ToastService } from '../../components/common/GlobalSnackbar';

// // Interfaces (unchanged from your new code)*
interface FormData {
  /* ... */
}
interface FileObject {
  /* ... */
}
interface GridObject {
  /* ... */
}

type NewFormWebViewProps = NativeStackScreenProps<RootStackParamList, 'NewFormWebView'>;

const NewFormWebView: React.FC<NewFormWebViewProps> = ({ navigation, route }) => {
  const [title] = useState<string>('');
  const [isLoadingAPI, setLoading] = useState<boolean>(true);
  const [imgIDs, setImageIds] = useState<string[]>([]);
  const [gridIDs, setGridIDs] = useState<string[]>([]);
  const [grids, setGrids] = useState<GridObject[]>([]);
  const [conditionArray, setConditionArray] = useState<FileObject[]>([]);
  const [fileArray, setFileArray] = useState<FileObject[]>([]);
  const [openFlag] = useState<number>(route?.params?.flag);
  const { authData } = useAuthStore();
  const ownerID = useRef<string>(authData?.adminRole?.teamMember?.userId || '');
  const ownerName = useRef<string>(authData?.adminRole?.teamMember?.name || '');
  const webviewRef = useRef<RNWebView>(null);

  const caseId = route.params.caseId ?? '';
  const licenseId = route.params.licenseId ?? '';
  const type = route.params.type;
  const rowData = route.params.param;

  useEffect(() => {
    if (!authData?.adminRole?.teamMember?.userId) {
      ToastService.show('User authentication data is missing', COLORS.ERROR);
      navigation.goBack();
      return;
    }
    if (!rowData?.AdvancedForm_Container) {
      ToastService.show('Invalid form data', COLORS.ERROR);
      navigation.goBack();
      return;
    }
    // const loadHtml = async () => {
    //   try {
    //     const asset = Asset.fromModule(
    //       require("../../../ios/Web.bundle/4.html")
    //     );
    //     await asset.downloadAsync();
    //     setHtmlUri(asset.localUri || asset.uri);
    //   } catch (error) {
    //     console.error("Error loading HTML asset:", error);
    //     Alert.alert("Error", "Failed to load form HTML");
    //   }
    // };
    // loadHtml();
  }, [authData, rowData]);

  const newData = replaceAllDateFormat(DateFormates, 'yyyy-MM-dd', rowData.AdvancedForm_Container);
  let jsonNew: FormData;
  try {
    jsonNew = JSON.parse(newData);
  } catch (error) {
    ToastService.show('Invalid JSON data: ' + error?.message, COLORS.ERROR);

    navigation.goBack();
    return null;
  }

  const customJSON: FormData = {
    display: jsonNew?.display,
    components: [
      ...jsonNew?.components,
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
          form.everyComponent((component, components) => {
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
                      window.ReactNativeWebView.postMessage('datagrid*'+myComponent.key+'*'+newComp[0].key+'*'+isreq+'*'+newComp[0].multiple+'*'+newComp[0].label+'*'+(component.component.filePattern || ''));
                    }
                  }
                }
              } else {
                for (let i = 0; i < myComponent.components.length; i++) {
                  let item = myComponent.components[i];
                  if (item.type === 'file') {
                    grid.push(item.label);
                    let isreq = typeof item.validate === 'undefined' ? false : item.validate.required || false;
                    let ismultiple = typeof item.multiple === 'undefined' ? false : true;
                    window.ReactNativeWebView.postMessage('datagrid*'+myComponent.key+'*'+item.key+'*'+isreq+'*'+ismultiple+'*'+item.label+'*'+(item.filePattern || ''));
                  }
                  if (item.component.columns) {
                    item.component.columns.forEach((item1, index, arr) => {
                      item1.components.forEach((item2, index, arr) => {
                        if (item2.type === 'file') {
                          let isreq = typeof item2.validate === 'undefined' ? false : item2.validate.required || false;
                          let ismultiple = typeof item2.multiple === 'undefined' ? false : true;
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
          form.on('change', function(changed) {});
          form.on('submit', function(submission) {
            let jsonData = JSON.stringify(submission);
            let jsonGrid = JSON.stringify(submission.data);
            console.log("button data -->", submission.state);
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
    if (dataParts[0] === 'change') {
      // const newJSON = JSON.parse(dataParts[1]);
    } else if (dataParts[0] === 'submit' || dataParts[0] === 'isDraft') {
      const newJSON = JSON.parse(dataParts[1]);
      const allFileArray: FileObject[] = [];
      const otherFileArray = [...fileArray];

      if (grids.length > 0) {
        for (const gridObject of grids) {
          const gridName = gridObject.gridKey;
          for (let i = 0; i < newJSON.data[gridName].length; i++) {
            const newID = uuid.v4() as string;
            gridIDs.push(newID);
            setGridIDs([...gridIDs]);
            for (let index = 0; index < otherFileArray.length; index++) {
              if (otherFileArray[index].key === gridObject.gridComponents) {
                otherFileArray.splice(index, 1);
              }
            }
            const object: FileObject = {
              id: newID,
              key: gridName,
              label: gridObject.label,
              gridKey: gridObject.gridComponents,
              isMultiple: gridObject.isMultiple === 'true',
              isDataGrid: true,
              count: newJSON.data[gridName].length,
              condition: '',
              isCustomCondition: false,
              validate_required: gridObject.isReq,
              filePattern: gridObject.filePattern,
            };
            allFileArray.push(object);
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
          allFileArray.push(element);
        }
      }

      const combinedFileArray = [...allFileArray, ...otherFileArray];
      const formNewId = uuid.v4() as string;

      const saveData = async (isDraft: boolean) => {
        try {
          if (openFlag !== 1) {
            await storeItemToAttachTable(
              rowData,
              formNewId,
              ownerName.current,
              imgIDs.join(','),
              caseId,
              licenseId,
              isDraft,
              rowData.AdvancedForm_Container,
              dataParts[1],
            );
          }
          await storeAddFormDataNew(
            rowData,
            dataParts[1],
            ownerID.current,
            imgIDs.join(','),
            caseId,
            licenseId,
            isDraft,
            gridIDs.join(','),
            title,
            formNewId,
            combinedFileArray,
          );
          ToastService.show('Data Saved Successfully', COLORS.SUCCESS_GREEN);
          if (combinedFileArray.length > 0) {
            navigate('FormioFileUploadScreen', {
              paramKey: 'params',
              param: formNewId,
              submission: newJSON,
              type: type,
              caseLicenseObject: route?.params?.caseLicenseObject,
              parentScreenName: route?.name,
              isFromNewForm: route?.params?.isFromNewForm,
            });
          } else {
            if (route?.params?.isFromNewForm) {
              goBack();
            } else {
              // navigation.replace("AttechedItems", {
              //   type: type,
              //   //  param: null,
              //   param: route?.params?.caseLicenseObject,
              // });
              goBack();
              goBack();
            }
          }
        } catch (error) {
          console.error('Database error:', error);
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
        setFileArray((prev) => [...prev, object]);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper title="New Form">
        <Loader loading={isLoadingAPI} />
        <View style={styles.viewStyles}>
          <WebView
            ref={webviewRef}
            style={{ margin: 5, flex: 1 }}
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
            // javaScriptEnabledAndroid={true}
          />
          {/* <WebView
            style={{ margin: 5 }}
            onLoad={() => setLoading(false)}
            javaScriptCanOpenWindowsAutomatically={false}
            setBuiltInZoomControls={true}
            originWhitelist={['*']}
                source={{ uri: 'Web.bundle/4.html' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit
            scrollEnabled={true}
            onMessage={onMessage}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={jsCode}
          /> */}
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyles: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    //  padding: 15,
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

export default NewFormWebView;
