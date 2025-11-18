import type { DailyInspectionModel } from '../../utils/interfaces/ISubScreens';
import { getBaseUrl, getUserRole } from '../../session/SessionManager';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { fetchInspectionData } from '../../database/daily-inspection/DailyInspectionDAO';
import {
  formatDate,
  generateUniqueID,
  getNewUTCDate,
  normalizeBool,
  sortByKey,
} from '../../utils/helper/helpers';
import { SyncModelParam } from '../../utils/params/commonParams';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { caseToForceSyncByID } from '../../database/my-case/myCaseDAO';
import { licenseToForceSyncByID } from '../../database/license/licenseDAO';
import { TEXTS } from '../../constants/strings';
import { downloadDailyInspectionReportFile } from '../../utils/helper/fileHandlers';
import { fetchDepartmentMemberList } from '../../database/drop-down-list/dropDownlistDAO';
import { navigate } from '../../navigation/Index';
import { Alert, Linking, Platform } from 'react-native';
import { COLORS } from '../../theme/colors';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

interface AdvanceFilter {
  inspectorBy: string;
  type: string;
  status: string;
  caseType: string;
  licenseType: string;
  caseTypeCategory: string;
  licenseTypeCategory: string;
}

interface TeamMember {
  id: string;
  displayText: string;
}

export const DailyInspectionService = {
  async fetchInspections(
    filterDate: string,
    endDate: string,
    advanceFilter: AdvanceFilter,
    noInspectorAssigned: boolean,
    isNetworkAvailable: boolean,
    inspectorId: string,
  ): Promise<{
    data: DailyInspectionModel[];
    isAllowInspectorDragDrop: boolean;
    isAllowOwnInspector: boolean;
    isShowStatus: boolean;
    isShowCaseOrLicenseNumber: boolean;
    isShowCaseOrLicenseType: boolean;
  }> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const newUrl = `${url}${URL.DAILY_INSPECTION_REPORT}${filterDate}&endDate=${endDate}&inspectorBy=${inspectorId}&type=${advanceFilter.type}&status=${advanceFilter.status}&isNoInspectorAssigned=${noInspectorAssigned}&caseTypeIds=${advanceFilter.caseType}&licenseTypeIds=${advanceFilter.licenseType}&caseTypeCategoryIds=${advanceFilter.caseTypeCategory}&licenseTypeCategoryIds=${advanceFilter.licenseTypeCategory}`;
        const response = await GET_DATA({ url: newUrl });
        if (response?.status && response?.data?.data) {
          return {
            data: response.data?.data || [],
            isAllowInspectorDragDrop: response?.data?.isAllowInspectorDragDropDailyInspection,
            isAllowOwnInspector: response?.data?.isAllowOwnInspectorDragDropDailyInspection,
            isShowStatus: response?.data?.isShowAppointmentStatusOnReport,
            isShowCaseOrLicenseNumber: response?.data?.isShowCaseOrLicenseNumberOnReport,
            isShowCaseOrLicenseType: response?.data?.isShowCaseOrLicenseTypeOnReport,
          };
        }
        return {
          data: [],
          isAllowInspectorDragDrop: false,
          isAllowOwnInspector: false,
          isShowStatus: true,
          isShowCaseOrLicenseNumber: true,
          isShowCaseOrLicenseType: true,
        };
      } else {
        const localData = await fetchInspectionData(inspectorId);
        const firstItem = localData[0] || {};
        return {
          data: localData || [],
          isAllowInspectorDragDrop: false,
          isAllowOwnInspector: false,
          isShowStatus: firstItem.isShowAppointmentStatusOnReport || true,
          isShowCaseOrLicenseNumber: firstItem.isShowCaseOrLicenseNumberOnReport || true,
          isShowCaseOrLicenseType: firstItem.isShowCaseOrLicenseTypeOnReport || true,
        };
      }
    } catch (error) {
      recordCrashlyticsError('Error in fetchInspections:', error);
      console.error('Error in fetchInspections:', error);
      return {
        data: [],
        isAllowInspectorDragDrop: false,
        isAllowOwnInspector: false,
        isShowStatus: true,
        isShowCaseOrLicenseNumber: true,
        isShowCaseOrLicenseType: true,
      };
    }
  },

  async fetchTeamMembers(
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<TeamMember[]> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.DEPARTMENT_TEAM_MEMBERS}`,
        });
        setLoading(false);
        if (response?.status && response?.data?.data) {
          return sortByKey(response?.data?.data || [], 'displayText');
        }
        return [];
      } else {
        setLoading(false);
        const localData = await fetchDepartmentMemberList();
        return sortByKey(localData || [], 'displayText');
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error in fetchTeamMembers:', error);
      console.error('Error in fetchTeamMembers:', error);
      return [];
    }
  },

  async fetchDropdownFilters(isNetworkAvailable: boolean): Promise<{
    inspectionTypes: Array<{ id: string; displayText: string }>;
    inspectionStatus: Array<{ id: string; displayText: string }>;
    caseType: Array<{ id: string; displayText: string }>;
    caseTypeCategory: Array<{ id: string; displayText: string }>;
    licenseType: Array<{ id: string; displayText: string }>;
    licenseTypeCategory: Array<{ id: string; displayText: string }>;
  }> {
    try {
      if (!isNetworkAvailable) {
        return {
          inspectionTypes: [],
          inspectionStatus: [],
          caseType: [],
          caseTypeCategory: [],
          licenseType: [],
          licenseTypeCategory: [],
        };
      }
      const url = getBaseUrl();
      const [
        inspectionTypeResponse,
        appointmentStatusResponse,
        caseTypeResponse,
        licenseTypeResponse,
        caseTypeCategoryResponse,
        licenseTypeCategoryResponse,
      ] = await Promise.all([
        GET_DATA({ url: `${url}${URL.SELECT_INSPECTION_LIST}` }),
        GET_DATA({ url: `${url}${URL.APPOINTMENT_STATUS_WITH_LABEL}` }),
        GET_DATA({ url: `${url}${URL.CASE_TYPE_LIST}` }),
        GET_DATA({ url: `${url}${URL.LICENSE_TYPE_LIST}` }),
        GET_DATA({ url: `${url}${URL.CASE_TYPE_CATEGORY_LIST}` }),
        GET_DATA({ url: `${url}${URL.LICENSE_TYPE_CATEGORY_LIST}` }),
      ]);
      return {
        inspectionTypes: sortByKey(inspectionTypeResponse?.data?.data || [], 'displayText'),
        inspectionStatus: sortByKey(appointmentStatusResponse?.data?.data || [], 'displayText'),
        caseType: sortByKey(caseTypeResponse?.data?.data || [], 'displayText'),
        caseTypeCategory: sortByKey(caseTypeCategoryResponse?.data?.data || [], 'displayText'),
        licenseType: sortByKey(licenseTypeResponse?.data?.data || [], 'displayText'),
        licenseTypeCategory: sortByKey(
          licenseTypeCategoryResponse?.data?.data || [],
          'displayText',
        ),
      };
    } catch (error) {
      recordCrashlyticsError('Error in fetchDropdownFilters:', error);
      console.error('Error in fetchDropdownFilters:', error);
      return {
        inspectionTypes: [],
        inspectionStatus: [],
        caseType: [],
        caseTypeCategory: [],
        licenseType: [],
        licenseTypeCategory: [],
      };
    }
  },

  async updateOrder(
    contentItemIds: string[],
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const newId = generateUniqueID();
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPDATE_DAILY_INSPECTION_REPORT_ORDER}`,
          body: {
            ContentItemIds: contentItemIds.join(','),
            SyncModel: SyncModelParam(false, false, getNewUTCDate(), newId, null),
          },
        });
        setLoading(false);
        return Boolean(response?.status);
      }
      ToastService.show(TEXTS.alertMessages.noNetwork);
      return false;
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error in updateOrder:', error);
      console.error('Error in updateOrder:', error);
      return false;
    }
  },

  async getCaseByCID(
    caseId: string,
    type: string,
    flag: number,
    setLoading: (loading: boolean) => void,
    navigation: any,
    inspectionId?: string,
    isNetworkAvailable?: boolean,
  ): Promise<void> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const userId = getUserRole();
        const url = getBaseUrl();
        const urlEndPoint = type === 'Case' ? URL.GET_CASE_BY_ID : URL.GET_LICENSE_BY_CONTENT;
        const response = await GET_DATA({
          url: `${url}${urlEndPoint}${caseId}`,
        });
        setLoading(false);
        if (response?.status && response?.data?.data) {
          const { isAllowEditCase, isAllowEditLicense, isAllowViewInspection } =
            response?.data?.permissions || {};

          if (isAllowEditCase || isAllowEditLicense) {
            if (flag === 1) {
              if (type === 'Case') {
                const caseItem = response?.data?.data;
                if (caseItem.isEditable && caseItem.viewOnlyAssignUsers == false) {
                  navigate('EditCaseScreen', {
                    caseId: caseItem.contentItemId ?? '',
                    myCaseData: caseItem,
                  });
                } else if (
                  caseItem.isEditable &&
                  caseItem.viewOnlyAssignUsers &&
                  caseItem.assignedUsers != null &&
                  caseItem.assignedUsers.includes(userId) // Check if the user is part of assigned users
                ) {
                  navigate('EditCaseScreen', {
                    caseId: caseItem.contentItemId ?? '',
                    myCaseData: caseItem,
                  });
                } else {
                  Alert.alert(
                    'Access Restricted',
                    response?.data?.message || TEXTS.alertMessages.privateCaseMsg,
                  );
                }
              } else {
                const licenseItem = response?.data?.data;
                const isEditable = normalizeBool(licenseItem?.isEditable);
                const isAssigned = licenseItem.assignedUsers?.includes(userId);
                if (isEditable && !licenseItem.viewOnlyAssignUsers) {
                  navigate('EditLicenseScreen', {
                    contentItemId: licenseItem?.contentItemId,
                    licenseData: licenseItem,
                  });
                } else if (isEditable && licenseItem.viewOnlyAssignUsers && isAssigned) {
                  navigate('EditLicenseScreen', {
                    contentItemId: licenseItem?.contentItemId,
                    licenseData: licenseItem,
                  });
                } else {
                  Alert.alert(
                    'Access Restricted',
                    response?.data?.message || TEXTS.alertMessages.privateLicenseMsg,
                  );
                }
              }
            } else if (isAllowViewInspection) {
              navigation.navigate('InspectionSchedule', {
                type,
                param: response?.data?.data,
                caseData: response?.data?.data,
                inspectionId,
                isAllowViewInspection,
                isNew: false,
              });
            } else {
              ToastService.show(TEXTS.alertMessages.dontHaveAction);
            }
          } else {
            ToastService.show(TEXTS.alertMessages.dontHaveAction);
          }
        } else {
          Alert.alert('Access Restricted', response?.data?.message);
        }
      } else {
        setLoading(false);
        if (flag === 1) {
          if (type === 'Case') {
            const caseData = await caseToForceSyncByID(caseId);
            if (caseData?.length > 0) {
              navigate('EditCaseScreen', {
                caseId: caseData?.[0]?.contentItemId ?? '',
                myCaseData: caseData?.[0] || null,
              });
            } else {
              ToastService.show(TEXTS.alertMessages.notAvailableInOffline, COLORS.WARNING_ORANGE);
            }
          } else {
            const licenseData = await licenseToForceSyncByID(caseId);
            if (licenseData?.length > 0) {
              navigate('EditLicenseScreen', {
                contentItemId: licenseData?.[0]?.contentItemId,
                licenseData: licenseData?.[0],
              });
            } else {
              ToastService.show(TEXTS.alertMessages.notAvailableInOffline, COLORS.WARNING_ORANGE);
            }
          }
        }
      }
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error in getCaseByCID:', error);
      console.error('Error in getCaseByCID:', error);
    }
  },

  async downloadCSV(
    filterDate: string,
    endDate: string,
    teamMemberId: string,
    isNetworkAvailable: boolean,
  ): Promise<void> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        await downloadDailyInspectionReportFile(
          `${url}${URL.DAILY_INSPECTION_REPORT_DOWNLOAD}?date=${filterDate}&endDate=${endDate}&inspectorBy=${teamMemberId}`,
        );
      } else {
        ToastService.show(TEXTS.alertMessages.noNetwork);
      }
    } catch (error) {
      recordCrashlyticsError('Error in downloadCSV:', error);
      console.error('Error in downloadCSV:', error);
    }
  },

  filterIncompleteStatus(data: DailyInspectionModel[]): DailyInspectionModel[] {
    return data.filter(
      (item) =>
        item.status.trim() !== 'Cancelled By User' &&
        item.status.trim() !== 'Cancelled By Admin' &&
        item.status.trim() !== 'Not Required' &&
        item.status.trim() !== 'Failed' &&
        item.status.trim() !== 'Completed' &&
        item.status.trim() !== 'Approved',
    );
  },

  checkLocationForRouteCreate(data: DailyInspectionModel[]): boolean {
    return data.some((object) => {
      if (object.location && object.location !== '') {
        try {
          const location = JSON.parse(object.location);
          return (
            location?.Latitude != null &&
            location?.Latitude !== '' &&
            location?.Longitude != null &&
            location?.Longitude !== ''
          );
        } catch {
          return false;
        }
      }
      return false;
    });
  },

  isLocationExist(data: DailyInspectionModel[], lat: string, long: string): Promise<boolean> {
    return Promise.resolve(
      data.some((obj) => {
        if (obj?.location && obj?.location != 'null') {
          var loc = JSON.parse(obj?.location);
          if (
            loc?.Latitude != null &&
            loc?.Latitude != '' &&
            loc?.Longitude != null &&
            loc?.Longitude != ''
          ) {
            return loc?.Latitude === lat && loc?.Longitude === long;
          } else {
            return true;
          }
        } else {
          return true;
        }
      }),
    );
  },

  // async deleteInspection(contentItemId: string, isNetworkAvailable: boolean): Promise<boolean> {
  //   try {
  //     if (isNetworkAvailable) {
  //       const url = getBaseUrl();
  //       await DELETE_API({
  //         url: `${url}${URL.DELETE_DAILY_INSPECTION}${contentItemId}`,
  //         body: {
  //           contentItemId,
  //         },
  //       });
  //       return true;
  //     }
  //     console.warn('No internet connection');
  //     return false;
  //   } catch (error) {
  //     recordCrashlyticsError('Error in deleteInspection:', error);
  //     console.error('Error in deleteInspection:', error);
  //     return false;
  //   }
  // },

  async saveOrUpdateInspection(
    isEdit: boolean,
    inspectionData: DailyInspectionModel,
    contentId: string,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const newURL = isEdit
          ? `${url}${URL.UPDATE_DAILY_INSPECTION}`
          : `${url}${URL.ADD_DAILY_INSPECTION}`;
        const formData = {
          contentItemId: isEdit ? inspectionData.contentItemId : '',
          inspector: inspectionData.inspector,
          caseContentItemId: inspectionData.caseContentItemId,
          caseNumber: inspectionData.caseNumber,
          inspectionDate: inspectionData.inspectionDate
            ? formatDate(inspectionData.inspectionDate)
            : null,
          inspectionType: inspectionData.inspectionType,
          subject: inspectionData.subject,
          time: inspectionData.time,
          location: inspectionData.location,
          advancedFormLinksJson: inspectionData.advancedFormLinksJson,
          body: inspectionData.body,
          status: inspectionData.status,
          statusColor: inspectionData.statusColor,
          preferredTime: inspectionData.preferredTime,
          scheduleWith: inspectionData.scheduleWith,
          licenseContentItemId: inspectionData.licenseContentItemId,
          licenseNumber: inspectionData.licenseNumber,
          caseType: inspectionData.caseType,
          createdDate: inspectionData.createdDate,
          licenseType: inspectionData.licenseType,
          syncModel: SyncModelParam(
            false,
            false,
            getNewUTCDate(),
            isEdit ? inspectionData.contentItemId : '',
            null,
            null,
          ),
        };
        const response = await POST_DATA_WITH_TOKEN({
          url: newURL,
          body: formData,
        });
        setLoading(false);
        if (response?.status && response?.data?.status) {
          return true;
        } else {
          ToastService.show(response?.data?.message);
          return false;
        }
      }
      console.warn('No internet connection');
      return false;
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error in saveOrUpdateInspection:', error);
      console.error('Error in saveOrUpdateInspection:', error);
      return false;
    }
  },
};
export const handleLocationPress = (location?: any, isNetworkAvailable?: boolean) => {
  if (!isNetworkAvailable) {
    ToastService.show('You are in offline mode', COLORS.WARNING_ORANGE);
    return;
  }

  try {
    let destination: string | null = null;

    // Prefer address first
    if (location?.Address && location.Address.trim() !== '') {
      destination = encodeURIComponent(location.Address.trim());
    }
    // Fallback → lat/long if valid
    else if (
      location?.Latitude &&
      location?.Longitude &&
      location?.Latitude !== '' &&
      location?.Longitude !== ''
    ) {
      const lat = parseFloat(location.Latitude);
      const long = parseFloat(location.Longitude);
      if (!isNaN(lat) && !isNaN(long) && lat !== 0 && long !== 0) {
        destination = `${lat},${long}`;
      }
    }

    if (!destination) {
      Alert.alert('Error', 'No valid address or coordinates available.');
      return;
    }

    // Build platform-specific map URL
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/maps?saddr=Current+Location&daddr=${destination}&directionsmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${destination}&travelmode=driving`;

    Linking.openURL(url);
  } catch (error) {
    console.warn('Error handling location press:', error);
    Alert.alert('Error', 'Unable to open map for this location.');
  }
};
