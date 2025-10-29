import React, { FunctionComponent, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRefWithCurrent,
  StackActions,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/Splash';
import LoginScreen from '../screens/auth/login/Login';
import HomeScreen from '../screens/dashboard/home/Home';
import MyCaseScreen from '../screens/my-case/MyCase';
import ForgotPasswordScreen from '../screens/auth/forgot-password/ForgotPassword';
import EditCaseScreen from '../screens/my-case/edit-case/EditCase';
import DashboardDrawerScreen from '../screens/dashboard/dashboard-drawer/DashboardDrawer';
import { RootStackParamList } from './Types';
import { useNetworkStatus } from '../utils/checkNetwork';
import { isTokenTimeOut, TokenRefreshGlobal } from '../session/TokenRefresh';
import LicenseScreen from '../screens/license/License';
import NewFormScreen from '../screens/new-form/NewForm';
import ReportScreen from '../screens/report/Report';
import NewFormDetailsScreen from '../screens/new-form/NewFormDetailsScreen';
import { createCaseTable, createSubTabsTables } from '../database/my-case/myCaseSchema';

import OpenInWebView from '../components/webView/OpenInWebView';
import AddForm from '../screens/form/AddForm';
import EditLicenseScreen from '../screens/license/edit-license/EditLicense';
import PaymentMain from '../screens/sub-screens/payment/PaymentMain';
import RelatedScreen from '../screens/sub-screens/related/RelatedScreen';
import TaskScreen from '../screens/sub-screens/task/TaskScreen';
import StatusChangeLog from '../screens/sub-screens/log/StatusChangeLog';
import Locations from '../screens/sub-screens/location/LocationsScreen';
import AddLocationScreen from '../screens/sub-screens/location/AddLocationScreen';
import PublicComments from '../screens/sub-screens/public-comment/PublicComment';

import SettingsScreen from '../screens/sub-screens/setting/SettingsScreen';
import { createLicenseTable } from '../database/license/licenseSchema';
import { ToastService } from '../components/common/GlobalSnackbar';
import { COLORS } from '../theme/colors';
import { createDropdownListTables } from '../database/drop-down-list/dropDownlistScheme';
import InspectionsScreen from '../screens/sub-screens/inspection/InspectionsScreen';
import InspectionSchedule from '../screens/sub-screens/inspection/InspectionSchedule';
import WebViewForForm from '../components/webView/WebViewforform';
import { createHistoryTable } from '../database/sync-history/syncHistorySchema';
import AttachedItems from '../screens/sub-screens/attached-item/AttachedItems';
import AdminNotes from '../screens/sub-screens/admin-notes/AdminNotes';
import AddContacts from '../screens/sub-screens/contact-contract/contactTab/AddCaseAndLicenseContact';
import AddCaseAndLicenseContractor from '../screens/sub-screens/contact-contract/contractorTab/AddCaseAndLicenseContractor';
import SendMailScreen from '../screens/sub-screens/send-email/SendMailScreen';
import ContactMain from '../screens/sub-screens/contact-contract/ContactMain';
import CommentWithFileAttached from '../screens/sub-screens/admin-notes/CommentWithFileAttached';
import { closeDatabase, openDatabase } from '../database/DatabaseService';
import AttachedDocs from '../screens/sub-screens/attached-docs/AttachedDocs';
import AttachedDocsSubScreen from '../screens/sub-screens/attached-docs/AttachedDocsSubScreen';
import AttachDocPreview from '../screens/sub-screens/attached-docs/AttachDocPreview';
import AttachedDocsUpdateAndAdd from '../screens/sub-screens/attached-docs/AttachedDocsUpdateAndAdd';
import AdvanceFormSubmission from '../screens/form-submission/AdvanceFormSubmission';
import { createFormSubmissionTables } from '../database/form-submission/formSubmissionSchema';
import NewFormWebView from '../screens/form/NewFormWebView';
import FormioFileUploadScreen from '../screens/form/FormioFileUploadView';
import LicenseDetailsScreen from '../screens/sub-screens/license-details/LicenseDetailsScreen';
import OwnerScreen from '../screens/sub-screens/owner/OwnerScreen';
import SubLicenseScreen from '../screens/sub-screens/sub-license/SubLicenseScreen';
import ShowLicenseScreen from '../screens/sub-screens/show-license/ShowLicenseScreen';
import EditAttachItem from '../screens/form/EditAttachItem';
import OfflineSyncScreen from '../screens/offline-item/OfflineSyncScreen';
import DailyInspection from '../screens/daily-inspection/DailyInspection';
import RouteScreen from '../screens/daily-inspection/RouteScreen';
import EditInspection from '../screens/daily-inspection/EditInspection';
import { createDailyInspectionTables } from '../database/daily-inspection/DailyInspectionSchema';
import { createFormSelectionListTab } from '../database/new-form/newFormSchema';
import EditFormWebView from '../screens/new-form/EditFormWebView';
import ParcelScreen from '../screens/parcel/ParcelScreen';
import ParcelDetailScreen from '../screens/parcel/parcel-tabs/ParcelDetailScreen';
import MyScheduleScreen from '../screens/schedule/MyScheduleScreen';

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();
type Props = Record<string, never>;

const navigationRef = React.createRef<NavigationContainerRefWithCurrent<RootStackParamList>>();

export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  navigationRef.current?.navigate(name as any, params);
}

export function navigateReplace<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}

export function goBack() {
  navigationRef.current?.goBack();
}
export function goBackWithProps(data?: any) {
  const route = navigationRef.current?.getCurrentRoute();
  const onGoBack = route?.params?.onGoBack;
  if (onGoBack && data) {
    onGoBack(data); // send data back to previous screen
  }
  navigationRef.current?.goBack();
}

export const StackScreen = (
  name: keyof RootStackParamList,
  component: React.ComponentType<any>,
) => (
  <Stack.Screen
    options={{
      headerShown: false,
      animation: 'none',
      gestureEnabled: false,
      headerBackVisible: false,
    }}
    name={name}
    component={component}
  />
);

// Refresh token when network becomes available
export const handleTokenRefresh = async () => {
  const isExpired = await isTokenTimeOut();
  if (isExpired) {
    await TokenRefreshGlobal();
  }
};

const Navigation: FunctionComponent<Props> = ({}: Props) => {
  const { isNetworkAvailable } = useNetworkStatus();

  const isInitializedRef = useRef(false);
  const initializeDatabase = async () => {
    if (isInitializedRef.current) return;
    try {
      openDatabase();
      // await migrateSchema();
      Promise.all([
        createDropdownListTables(),
        createFormSubmissionTables(),
        createHistoryTable(),
        createCaseTable(),
        createSubTabsTables(),
        createLicenseTable(),
        createDailyInspectionTables(),
        createFormSelectionListTab(),
      ]);
      // logDatabaseStats();
      isInitializedRef.current = true; // set to true after successful init
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  useEffect(() => {
    // Show toast when network changes
    ToastService.show(
      isNetworkAvailable ? 'You are online' : 'You are offline',
      isNetworkAvailable ? COLORS.SUCCESS_GREEN : COLORS.ERROR,
    );
  }, [isNetworkAvailable]);

  useEffect(() => {
    // Initialize database & token handling
    initializeDatabase();
    if (isNetworkAvailable) {
      handleTokenRefresh();
    }
    let isClosed = false;
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        openDatabase();
        if (isNetworkAvailable) {
          handleTokenRefresh();
        } else {
          console.log('App active but offline, skipping token refresh.');
        }
      }
      if ((nextAppState === 'background' || nextAppState === 'inactive') && !isClosed) {
        await closeDatabase();
        isClosed = true;
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (!isClosed) closeDatabase();
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'none' }}
        initialRouteName="SplashScreen"
      >
        {StackScreen('SplashScreen', SplashScreen)}
        {StackScreen('LoginScreen', LoginScreen)}
        {StackScreen('DashboardDrawerScreen', DashboardDrawerScreen)}
        {StackScreen('HomeScreen', HomeScreen)}
        {StackScreen('ForgotPasswordScreen', ForgotPasswordScreen)}
        {StackScreen('MyCaseScreen', MyCaseScreen)}
        {StackScreen('LicenseScreen', LicenseScreen)}
        {StackScreen('EditLicenseScreen', EditLicenseScreen)}
        {StackScreen('NewFormScreen', NewFormScreen)}
        {StackScreen('NewFormDetailsScreen', NewFormDetailsScreen)}
        {StackScreen('ReportScreen', ReportScreen)}
        {StackScreen('EditCaseScreen', EditCaseScreen)}
        {StackScreen('AttechedItems', AttachedItems)}
        {StackScreen('AdminNotes', AdminNotes)}
        {StackScreen('OpenInWebView', OpenInWebView)}
        {StackScreen('WebViewForForm', WebViewForForm)}
        {StackScreen('AddForm', AddForm)}
        {StackScreen('AddContact', AddContacts)}
        {StackScreen('AddContract', AddCaseAndLicenseContractor)}
        {StackScreen('PublicComments', PublicComments)}
        {StackScreen('AttachedDocs', AttachedDocs)}
        {StackScreen('InspectionsScreen', InspectionsScreen)}
        {StackScreen('InspectionSchedule', InspectionSchedule)}
        {StackScreen('Locations', Locations)}
        {StackScreen('SettingsScreen', SettingsScreen)}
        {StackScreen('RelatedScreen', RelatedScreen)}
        {StackScreen('SendMailScreen', SendMailScreen)}
        {StackScreen('ContactMain', ContactMain)}
        {StackScreen('PaymentMain', PaymentMain)}
        {StackScreen('TaskScreen', TaskScreen)}
        {StackScreen('StatusChangeLog', StatusChangeLog)}
        {StackScreen('AddMultiLocation', AddLocationScreen)}
        {StackScreen('CommentWithFileAttached', CommentWithFileAttached)}
        {StackScreen('AttachedDocsSubScreen', AttachedDocsSubScreen)}
        {StackScreen('AttachedDocsUpdateAndAdd', AttachedDocsUpdateAndAdd)}
        {StackScreen('AttachDocPreview', AttachDocPreview)}
        {StackScreen('AdvanceFormSubmission', AdvanceFormSubmission)}
        {StackScreen('NewFormWebView', NewFormWebView)}
        {StackScreen('EditAttachItem', EditAttachItem)}
        {StackScreen('FormioFileUploadScreen', FormioFileUploadScreen)}
        {StackScreen('LicenseDetailsScreen', LicenseDetailsScreen)}
        {StackScreen('OwnerScreen', OwnerScreen)}
        {StackScreen('SubLicenseScreen', SubLicenseScreen)}
        {StackScreen('ShowLicenseScreen', ShowLicenseScreen)}
        {StackScreen('OfflineSyncScreen', OfflineSyncScreen)}
        {StackScreen('DailyInspection', DailyInspection)}
        {StackScreen('RouteScreen', RouteScreen)}
        {StackScreen('EditInspection', EditInspection)}
        {StackScreen('EditFormWebView', EditFormWebView)}
        {StackScreen('ParcelScreen', ParcelScreen)}
        {StackScreen('ParcelDetailScreen', ParcelDetailScreen)}
        {StackScreen('MyScheduleScreen', MyScheduleScreen)}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
