import { fetchInspectionData } from '../../../database/sub-screens/subScreenDAO';
import type {
  InspectionModel,
  InspectionType,
  InspectionTeamMember,
  CaseOrLicenseData,
  IImageData,
} from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA, POST_DATA_WITH_TOKEN, UPLOAD_API } from '../../../services/ApiClient';
import {
  formatDate,
  getNewUTCDate,
  getTimeDifference,
  sortByKey,
} from '../../../utils/helper/helpers';
import type { InspectionInputData } from '../../../utils/params/commonParams';
import { scheduleInspectionParams, SyncModelParam } from '../../../utils/params/commonParams';
import { URL } from '../../../constants/url';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class InspectionService {
  static async fetchInspections(
    contentItemId: string,
    type: string,
    isNetworkAvailable: boolean,
    setLoading: (loading: boolean) => void,
  ): Promise<InspectionModel[]> {
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const url = getBaseUrl();
        const endpoint = type === 'Case' ? URL.INPECTION_API : URL.SYNC_LICENSE_INSPECTION_API;
        const response = await GET_DATA({
          url: `${url}${endpoint}${contentItemId}`,
        });
        if (!response?.status) {
          return [];
        }
        const data = response?.data?.data;
        return Array.isArray(data) ? (data as InspectionModel[]) : [];
      } else {
        const offlineData = await fetchInspectionData(contentItemId, type);
        return (offlineData as InspectionModel[]) ?? [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching inspections:', error);
      console.error('Error fetching inspections:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  static async uploadFile(data: any, isNetworkAvailable: boolean): Promise<IImageData[]> {
    if (!isNetworkAvailable) return [];
    const { fileArray, contentItemId, isCase } = data;
    const path = isCase ? '/CaseAttachments/' : '/LicenseAttachments/';
    const results: IImageData[] = [];
    try {
      const baseUrl = getBaseUrl();
      if (!baseUrl) throw new ServiceError('Base URL is missing.');

      for (const file of fileArray) {
        const formData = new FormData();

        const fileName = encodeURIComponent(file.name || `upload_${Date.now()}.jpg`);
        const mimeType = file.originalType || file.mimeType || 'application/octet-stream';
        formData.append('file', {
          uri: file.localUrl,
          name: fileName,
          type: mimeType,
        });
        formData.append('dir', `${path}${contentItemId}/Inspections`);
        const uploadResponse = await UPLOAD_API({
          url: `${baseUrl}${URL.FILE_UPLOAD_API}`,
          body: formData,
        });
        if (uploadResponse?.url) {
          results.push(uploadResponse as IImageData);
        } else {
          throw new ServiceError(uploadResponse?.message || 'File upload failed.');
        }
      }

      return results;
    } catch (error) {
      recordCrashlyticsError('Error in inspections uploadFile:', error);
      console.log('Upload Error: ', error);
      throw error;
    }
  }

  static async fetchInspectionTypes(
    caseOrLicenseData: CaseOrLicenseData,
    type: 'Case' | 'License',
    isNetworkAvailable: boolean,
  ): Promise<InspectionType[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        let fullUrl = '';
        if (type === 'Case') {
          fullUrl = `${url}${URL.CASE_INSPECTION_TYPE_FLAG}?caseTypeId=${caseOrLicenseData.caseTypeId}&caseId=${caseOrLicenseData.contentItemId}&caseSubTypeIds=${caseOrLicenseData.subTypes}`;
        } else {
          fullUrl = `${url}${URL.LICENSE_INSPECTION_TYPE_FLAG}?licenseTypeId=${caseOrLicenseData.licenseTypeId}&licenseId=${caseOrLicenseData.contentItemId}&licenseSubTypeIds=${caseOrLicenseData.subTypes}`;
        }
        const response = await GET_DATA({
          url: fullUrl,
        });
        if (!response?.status) {
          return [];
        }
        const data = response?.data?.data;
        return Array.isArray(data) ? (data as InspectionType[]) : [];
      } else {
        return [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching inspection types:', error);
      console.error('Error fetching inspection types:', error);
      return [];
    }
  }

  static async fetchInspectionTypeList(
    caseOrLicenseData: CaseOrLicenseData,
    type: string,
    selectedTypeIds: string,
    isShowAllType: boolean,
    isNetworkAvailable: boolean,
  ): Promise<InspectionType[]> {
    if (isNetworkAvailable) {
      try {
        const url = getBaseUrl();
        const basePath = type === 'Case' ? URL.CASE_INSPECTION_TYPE : URL.LICENSE_INSPECTION_TYPE;

        const params = new URLSearchParams({
          selectedInspectionTypeIds: selectedTypeIds,
          isShowAllType: String(isShowAllType),
        });

        if (type === 'Case') {
          params.append('caseTypeId', String(caseOrLicenseData?.caseTypeId || ''));
          params.append('caseId', String(caseOrLicenseData?.contentItemId || ''));
          params.append('caseSubTypeIds', String(caseOrLicenseData?.subTypes || ''));
        } else {
          params.append('licenseTypeId', String(caseOrLicenseData?.licenseTypeId || ''));
          params.append('licenseId', String(caseOrLicenseData?.contentItemId || ''));
          params.append('licenseSubTypeIds', String(caseOrLicenseData?.subTypes || ''));
        }

        const fullUrl = `${url}${basePath}${params.toString()}`;
        console.log('fetchInspectionTypeList URL:--->', fullUrl);

        const response = await GET_DATA({ url: fullUrl });
        const apiData = response?.status ? response?.data?.data : null;
        return Array.isArray(apiData) ? apiData : [];
      } catch (error) {
        recordCrashlyticsError(' Error in fetchInspectionTypeList:---->', error);
        console.error(' Error in fetchInspectionTypeList:---->', error);
        return [];
      }
    } else {
      return [];
    }
  }

  static async fetchTeamMembers(
    caseOrLicenseData: CaseOrLicenseData,
    typeIds: string,
    isNetworkAvailable: boolean,
  ): Promise<InspectionTeamMember[]> {
    try {
      if (!isNetworkAvailable) return [];
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.DEPARTMENT_MEMBER_LIST}${caseOrLicenseData.schedulingDepartments}&inspectionTypeIds=${typeIds}`,
      });
      const members = response?.status ? (response?.data?.data ?? []) : [];
      return sortByKey(members, 'displayText');
    } catch (error) {
      recordCrashlyticsError('Error fetching team members:', error);
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async fetchAllTeamMembers(isNetworkAvailable: boolean): Promise<any[]> {
    try {
      if (!isNetworkAvailable) return [];
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.DEPARTMENT_MEMBER_LIST}`,
      });
      const members = response?.status ? (response?.data?.data ?? []) : [];
      return sortByKey(members, 'displayText');
    } catch (error) {
      recordCrashlyticsError('Error fetching team members:', error);
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async fetchAllStatus(isNetworkAvailable: boolean): Promise<any[]> {
    try {
      if (!isNetworkAvailable) return [];
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.APPOINTMENT_STATUS_WITH_LABEL}`,
      });
      const statuses = response?.status ? (response?.data?.data ?? []) : [];
      return sortByKey(statuses, 'displayText');
    } catch (error) {
      recordCrashlyticsError('Error fetching team members:', error);
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async fetchInspectionById(
    inspectionId: string,
    isNetworkAvailable: boolean,
  ): Promise<InspectionModel | null> {
    try {
      if (!isNetworkAvailable) return null;
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.INSPECTION_BY_ID}${inspectionId}`,
      });
      if (!response?.status) {
        return null;
      }
      return (response?.data?.data as InspectionModel | null) ?? null;
    } catch (error) {
      recordCrashlyticsError('Error fetching inspection by ID:', error);
      console.error('Error fetching inspection by ID:', error);
      return null;
    }
  }

  static async fetchInspectionDefaultTime(
    typeIds: string,
    startTime: string,
    endTime: string,
    isNetworkAvailable: boolean,
  ): Promise<{ defaultTime: number; timeDifference: number }> {
    try {
      if (!isNetworkAvailable) return { defaultTime: 0, timeDifference: 0 };
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.INSPECTION_DEFAULT_TIME_BY_TYPE}${typeIds}`,
      });
      if (!response?.status) {
        return { defaultTime: 0, timeDifference: 0 };
      }
      const defaultTime = Number(response?.data?.data ?? 0);
      const timeDifference = getTimeDifference(startTime, endTime, defaultTime);
      return { defaultTime, timeDifference };
    } catch (error) {
      recordCrashlyticsError('Error fetching inspection default time:', error);
      console.error('Error fetching inspection default time:', error);
      return { defaultTime: 0, timeDifference: 0 };
    }
  }

  static async fetchTeamMemberSignature(isNetworkAvailable: boolean): Promise<string | null> {
    try {
      if (!isNetworkAvailable) return null;
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.TEAM_MEMBER_SIGNATURE}`,
      });
      if (!response?.status) {
        return null;
      }
      return (response?.data?.data as string | null) ?? null;
    } catch (error) {
      recordCrashlyticsError('Error fetching team member signature:', error);
      console.error('Error fetching team member signature:', error);
      return null;
    }
  }

  static async verifyTeamMemberSchedule(
    teamMemberIds: string,
    date: string,
    startTime: string,
    endTime: string,
    isNetworkAvailable: boolean,
  ): Promise<{ bookedTeamMembers: any[] }> {
    try {
      if (!isNetworkAvailable) return { bookedTeamMembers: [] };
      const url = getBaseUrl();
      const fullUrl = `${url}${URL.VERIFY_TEAM_MEMBER_SCHADULE}${teamMemberIds}&date=${formatDate(
        date,
      )}&startTime=${startTime}&endTime=${endTime}`;
      const response = await GET_DATA({ url: fullUrl });
      if (!response?.status) {
        return { bookedTeamMembers: [] };
      }
      return response?.data?.data ?? { bookedTeamMembers: [] };
    } catch (error) {
      recordCrashlyticsError('Error verifying team member schedule:', error);
      console.error('Error verifying team member schedule:', error);
      return { bookedTeamMembers: [] };
    }
  }

  static async fetchInspectionTitle(typeIds: string, isNetworkAvailable: boolean): Promise<string> {
    try {
      if (!isNetworkAvailable) throw new Error('No internet connection');
      const url = getBaseUrl();
      const fullUrl = `${url}${URL.INSPECTION_TITLE_BY_TYPE}${typeIds}`;
      const response = await GET_DATA({ url: fullUrl });
      if (!response?.status) {
        return '';
      }
      return (response?.data?.data as string | null) ?? '';
    } catch (error) {
      recordCrashlyticsError('Error fetching inspection title:', error);
      console.error('Error fetching inspection title:', error);
      return '';
    }
  }
  static async saveInspection(
    inspectionData: InspectionInputData,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean,
  ): Promise<boolean> {
    try {
      if (!isNetworkAvailable) {
        //  await this.saveInspectionOffline(inspectionData);
        return true;
      }
      setLoading(true);
      const url = getBaseUrl();
      const fullUrl = inspectionData.isNew
        ? URL.ADD_NEW_INPECTION
        : URL.UPDATE_INSPECTION_BY_CONTENT_ITEM_ID;

      const params = scheduleInspectionParams(
        inspectionData,
        false,
        SyncModelParam(
          false,
          false,
          getNewUTCDate(),
          inspectionData.inspectionId,
          inspectionData.isNew ? null : inspectionData.inspectionId,
          null,
        ),
      );
      const response = await POST_DATA_WITH_TOKEN({
        url: `${url}${fullUrl}`,
        body: params,
      });
      if (response?.status) {
        if (response.data && ['error', 'failed'].includes(response.data.status)) {
          return false; // Handle failure case in component
        }
        ToastService.show(
          `Inspection ${inspectionData?.isNew ? 'saved' : 'updated'} successfully`,
          COLORS.SUCCESS_GREEN,
        );
        // global.IsInspectionUpdate = true;
        return true;
      }
      return false;
    } catch (error) {
      recordCrashlyticsError('Error saving inspection:', error);
      console.error('Error saving inspection:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ['NETWORK_DISCONNECTED', 'REQUEST_TIMEOUT'].includes((error as any).message)
      ) {
        //   await this.saveInspectionOffline(inspectionData);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  //   async uploadFile(
  //     file: any,
  //     setLoading: (loading: boolean) => void,
  //     navigation: NavigationProp<RootStackParamList>
  //   ): Promise<IImageData | null> {
  //     try {
  //       const state = await NetInfo.fetch();
  //       if (!state.isConnected) return null;
  //       setLoading(true);
  //       const url = await getBaseUrl();
  //       const token = await getAccessToken();
  //       const response = await UPLOADAPI(file, `${url}${UploadAPI}`, token);
  //       setLoading(false);
  //       if (response.url) {
  //         return { filename: file.name, url: response.url };
  //       }
  //       Alert.alert(response.message || "File upload failed");
  //       return null;
  //     } catch (error) {
  //       setLoading(false);
  //       console.error("File upload error:", error);
  //       return null;
  //     }
  //   }

  //   async saveInspectionOffline(inspectionData: {
  //     msCalendarId: string;
  //     inspectionId: string;
  //     outlookFailed: boolean;
  //     responsiblePartyEmail: string | null;
  //     duration: number;
  //     licenseNumber: string | null;
  //     licenseContentItemId: string | null;
  //     statusLabel: string;
  //     preferredTime: string;
  //     location: string;
  //     body: string;
  //     inspectionDate: string;
  //     startTime: string | null;
  //     endTime: string | null;
  //     statusId: string;
  //     caseNumber: string | null;
  //     subject: string;
  //     teamMemberIds: string;
  //     teamMemberNames: string;
  //     typeIds: string;
  //     caseContentItemId: string | null;
  //     adminNotes: string | null;
  //     adminImages: IImageData[];
  //     generalImages: IImageData[];
  //     isNew: boolean;
  //     isCase: boolean;
  //   }) {
  //     const params = scheduleInspectionParams(
  //       inspectionData.msCalendarId,
  //       inspectionData.inspectionId,
  //       inspectionData.outlookFailed,
  //       inspectionData.responsiblePartyEmail,
  //       inspectionData.duration,
  //       inspectionData.licenseNumber,
  //       inspectionData.licenseContentItemId,
  //       inspectionData.statusLabel,
  //       inspectionData.preferredTime,
  //       inspectionData.location,
  //       inspectionData.body,
  //       inspectionData.inspectionDate,
  //       inspectionData.startTime,
  //       inspectionData.endTime,
  //       inspectionData.statusId,
  //       inspectionData.caseNumber,
  //       inspectionData.subject,
  //       inspectionData.teamMemberIds,
  //       inspectionData.teamMemberNames,
  //       inspectionData.typeIds,
  //       inspectionData.caseContentItemId,
  //       inspectionData.adminNotes,
  //       inspectionData.adminImages,
  //       inspectionData.generalImages,
  //       true,
  //       inspectionData.isNew
  //     );
  //     const contentItemId = inspectionData.isCase
  //       ? inspectionData.caseContentItemId
  //       : inspectionData.licenseContentItemId;
  //     const entity = inspectionData.isCase
  //       ? await caseToForceSyncByID(contentItemId!)
  //       : await licenseToForceSyncByID(contentItemId!);
  //     const notInOffline = entity.length === 0;
  //     if (inspectionData.isNew || notInOffline) {
  //       await storeOfflineInspectionData(
  //         params,
  //         false,
  //         notInOffline,
  //         inspectionData.inspectionId,
  //         getNewUTCDate(),
  //         { contentItemId: contentItemId! },
  //         inspectionData.isCase
  //       );
  //     } else {
  //       await updateOfflineInspectionData(
  //         params,
  //         true,
  //         inspectionData.inspectionId,
  //         getNewUTCDate(),
  //         contentItemId!,
  //         inspectionData.isCase
  //       );
  //     }
  //   }
}
