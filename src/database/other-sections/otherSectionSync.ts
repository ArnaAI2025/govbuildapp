import { URL } from './../../constants/url';
import NetInfo from '@react-native-community/netinfo';
import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { syncSubmissionData } from '../form-submission/formSubmissionSync';
import { deleteFormListData, updateFormListIfExist } from '../form-submission/formSubmissionDAO';
import { syncFileExtensionData } from '../sub-screens/attached-docs/attachedDocsSync';
import { updateDailyInspectionListIfExist } from './otherSectionDAO';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
// # Sync logic (optional, for syncing with server)
export const getOtherScreenData = async () => {
  console.log('Fetch selection list starts');
  try {
    syncFileExtensionData();
    syncDailyInspectionData();
    getSubmissionDataAPI();
    syncFormListForOffline();
    console.log('fetch selection methods completed');
  } catch (error) {
    recordCrashlyticsError('fetch selection list db error:', error);
    console.log('fetch selection list db error:', error);
  }
};

const getSubmissionDataAPI = async () => {
  try {
    // Check internet connection
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      console.log('No internet connection. Unable to fetch submission data.');
      return;
    }
    const baseUrl = getBaseUrl();
    // Fetch base URL and access token in parallel for efficiency
    // Construct the API URL
    const newURL = `${baseUrl}${URL.GET_SUBMISSION_OFFLINE}`;

    // Fetch submission data
    const data1 = await GET_DATA({
      url: newURL,
    });

    // Check if API returned valid data
    if (data1 && data1?.status) {
      const fullData = data1?.data?.data;
      console.log(`Fetched ${fullData?.length} submissions. Processing...`);

      // Process each submission entry
      fullData?.forEach((model: any) => {
        syncSubmissionData(model);
      });

      console.log('Submission data processing complete.');
    } else {
      console.warn('API call successful but no valid data returned.');
    }
  } catch (error) {
    recordCrashlyticsError('Error in getSubmissionDataAPI:', error);
    // Catch and log any errors encountered
    console.error('Error in getSubmissionDataAPI:', error);
  }
};

const syncFormListForOffline = async () => {
  try {
    // Check internet connection
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      console.log('No internet connection. Cannot fetch form list.');
      return;
    }

    let allData: any = []; // To accumulate all data
    const url = getBaseUrl();
    console.log('Fetching data FormList');

    for (let page = 1; ; page++) {
      try {
        const apiUrl = `${url + URL.GET_ADVANCED_FORM_LIST_API}=${page}&isOffline=true`;
        const data = await GET_DATA({
          url: apiUrl,
        });
        if (
          data &&
          data?.status &&
          data?.data &&
          Array.isArray(data?.data?.data?.contentItemSummaries) &&
          data?.data?.data?.contentItemSummaries?.length > 0
        ) {
          allData = [...allData, ...data?.data?.data?.contentItemSummaries];
        } else {
          console.log('No more data to fetch. Exiting loop.');
          break;
        }
      } catch (paginationError) {
        recordCrashlyticsError(`Error fetching page ${page}:`, paginationError);
        console.error(`Error fetching page ${page}:`, paginationError);
        break;
      }
    }

    console.log('Total offline forms fetched:--->>>', allData?.length);

    if (allData?.length > 0) {
      console.log(`Fetched----> ${allData?.length} form items. Processing...`);
      deleteFormListData();
      allData?.forEach((formItem: any) => {
        updateFormListIfExist(formItem);
      });
      console.log('Form list processing complete.');
    } else {
      console.warn('No data fetched from the API.');
    }
  } catch (error) {
    recordCrashlyticsError('Error in addFormListAPICall:', error);
    console.error('Error in addFormListAPICall:', error);
  }
};

const syncDailyInspectionData = async () => {
  try {
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      console.log('No internet connection. Cannot fetch Daily Inspection Data.');
      return;
    }
    const url = getBaseUrl();

    // Fetch daily inspection data
    const data1 = await GET_DATA({
      url: `${url + URL.DAILY_INSPECTION_REPORT}&isOffline=true`,
    });

    // Check if the API response is successful
    if (data1?.status && data1?.data?.data.length > 0) {
      const fullData = data1?.data?.data;
      const showStatus = data1?.data?.isShowAppointmentStatusOnReport;
      const caseOrLicenseNumber = data1?.data?.isShowCaseOrLicenseNumberOnReport;
      const caseOrLicenseType = data1?.data?.isShowCaseOrLicenseTypeOnReport;

      console.log(`Fetched ${fullData.length} daily inspections. Processing data...`);

      // Process each daily inspection record
      fullData.forEach(async (model: any) => {
        await updateDailyInspectionListIfExist(
          model,
          showStatus,
          caseOrLicenseNumber,
          caseOrLicenseType,
        );
      });

      console.log('Daily inspection data processing complete.');
    } else {
      console.warn('API call successful, but no valid data returned.');
    }
  } catch (error) {
    recordCrashlyticsError('Error in DailyInspectionDataAPI:', error);
    // Log any errors encountered during the process
    console.error('Error in DailyInspectionDataAPI:', error);
  }
};
