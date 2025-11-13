import { URL } from '../../constants/url';
import {
  fetchLocalLicenseById,
  fetchMyLicenseDataFromDB,
} from '../../database/license/licenseSync';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../services/ApiClient';
import { getBaseUrl, getLicenseUserRole } from '../../session/SessionManager';
import { generateUniqueID, getNewUTCDate, sortByKey } from '../../utils/helper/helpers';
import { DefaultAdvancedFiltersInterface } from '../../utils/interfaces/IComponent';
import {
  EditLicenseDropdownResponse,
  EditLicenseResponse,
  LicenseData,
  LicenseResponse,
} from '../../utils/interfaces/zustand/ILicense';
import { buildLicensePayload } from '../../utils/params/licenseCommonParams';
import { updateLicenseIfIdExist } from '../../database/license/licenseSync';
import {
  fetchBillingStatus,
  fetchCaseType,
  fetchRenewalStatus,
  fetchStatus,
  fetchSubCaseType,
  fetchTags,
  fetchTeamMembers,
} from '../../database/drop-down-list/dropDownlistDAO';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { TEXTS } from '../../constants/strings';
import { COLORS } from '../../theme/colors';
import { fetchAlertAdminNotes } from '../../database/sub-screens/subScreensSync';
import { SyncModelParam } from '../../utils/params/commonParams';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

const buildQueryString = (
  filters: DefaultAdvancedFiltersInterface,
  pageNo: number,
  isSearch: boolean,
): string => {
  const queryParams = [
    `pagenum=${pageNo}`,
    `TeamMember=${
      filters?.teamMember?.userId === '' && !filters?.isMyLicenseOnly
        ? getLicenseUserRole()
        : filters?.teamMember?.userId
    }`,
    `FilterType=title`,
    `DisplayText=${isSearch ? encodeURIComponent(filters.search ?? '') : ''}`,
    `LicenseTag=${
      filters?.caseLicenseTag?.id ? filters?.caseLicenseTag?.displayText.replace(/\s/g, '_') : ''
    }`,
    `LicenseSubType=${
      filters?.caseLicenseSubType?.id
        ? filters?.caseLicenseSubType?.displayText.replace(/\s/g, '_')
        : ''
    }`,
    `LicenseType=${
      filters?.caseLicenseType?.id ? filters?.caseLicenseType?.displayText.replace(/\s/g, '+') : ''
    }`,
    `LicenseStatus=${
      filters?.caseLicenseStatus?.id
        ? filters?.caseLicenseStatus?.displayText.replace(/\s/g, '+')
        : ''
    }`,
    `LicenseRenewalStatus=${
      filters?.licenseRenewalStatus?.id
        ? filters?.licenseRenewalStatus?.displayText.replace(/\s/g, '+')
        : ''
    }`,
    `SortBy=${filters?.sortBy?.value?.trim() || ''}`,
    ,
  ];
  const queryString = queryParams.join('&');
  return queryString;
};

export const fetchLicenseService = async (
  filters: DefaultAdvancedFiltersInterface,
  pageNo: number,
  isSearch: boolean,
  isNetworkAvailable: boolean,
  userID: string,
): Promise<LicenseResponse> => {
  if (isNetworkAvailable) {
    try {
      const baseUrl = getBaseUrl();
      const queryString = buildQueryString(filters, pageNo, isSearch);
      const LicenseUrl = `${baseUrl}${URL.GET_LICENSE_LIST}?${queryString}`;
      const payload = { url: LicenseUrl };
      const response = await GET_DATA(payload);
      if (!response?.status || !response?.data?.data) {
        throw new Error('Invalid license data response from API');
      }
      const licenseData = response?.data?.data;

      return {
        licenseData: licenseData?.contentItemSummaries ?? [],
        isMyLicenseOnly: licenseData?.isMyLicenseOnly ?? false,
        isAllowEditLicense: response?.data?.permissions?.isAllowEditLicense ?? false,
        selectedTeamMember: licenseData?.selectedTeamMember ?? '',
      };
    } catch (error) {
      recordCrashlyticsError('fetchLicenseService error:--->', error);
      console.error('fetchLicenseService error:--->', error?.message || error);
      // Return a safe fallback
      return {
        licenseData: [],
        isMyLicenseOnly: true,
        isAllowEditLicense: false,
        selectedTeamMember: '',
      };
    }
  } else {
    const searchText = filters?.search || '';
    const offlineData = await fetchMyLicenseDataFromDB(userID, pageNo, 10, searchText);
    // console.log('offlineData----->>>>>>',offlineData);

    // const sortedLicenseDetails = offlineData.sort((a, b) => {
    //   console.log("a data ----->>>",a?.displayText);
    //   console.log("a?.modifiedUtc--->>>>",a?.modifiedUtc);
    //   logBlue("-------------------------------------------------------------");

    //   const dateA = new Date(a?.modifiedUtc || 0).getTime();
    //   const dateB = new Date(b?.modifiedUtc || 0).getTime();
    //   return dateB - dateA; // DESCENDING ORDER: newest first
    // });

    return {
      licenseData: (offlineData as LicenseData[]) ?? [],
      isMyLicenseOnly: true,
      isAllowEditLicense: true,
      selectedTeamMember: '',
    };
  }
};
export const fetchLicenseTypeFieldSetting = async (
  licenseTypeId: string,
  isNetworkAvailable: boolean
): Promise<any> => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const url =  `${baseUrl}${URL.GET_LICENSE_TYPE_FIELDS_SETTING}${licenseTypeId}`
    
    try {
      // For the case type fields
      const licenseTypeFieldSetting = await GET_DATA({
        url:url,
      });
      
      if (!licenseTypeFieldSetting?.status) {
        throw new Error(
          "Failed to fetch cases type field setting: Invalid response status"
        );
      }
      const serverData = licenseTypeFieldSetting?.data?.data;
      return serverData;
    } catch (error) {
      console.error("Error in fetchCases:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch cases: ${error.message}`);
      } else {
        throw new Error("Failed to fetch cases: An unknown error occurred");
      }
    }
  } else {
    // const responseCaseData = await getOfflineCaseTypeSettingsById(licenseTypeId);
    // return responseCaseData ?? {};
     return {}
  }
};
export const fetchLicenseByID = async (
  contentItemId?: string,
  licenseDataProps?: LicenseData,
  isNetworkAvailable?: boolean,
): Promise<EditLicenseResponse> => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const payload = {
      url: `${baseUrl}${URL.LICENSE_BY_CONTENT_ID}${contentItemId}`,
    };
    try {
      const Response = await GET_DATA(payload);
      if (!Response?.status) {
        throw new Error('Failed to fetch cases by id: Invalid response status');
      }

      const payloadForChaveron = {
        url: `${baseUrl}${URL.GET_LICENSE_CHEVRON_BY_LICENSEID}${contentItemId}`,
      };
      const chevronStatusResponse = await GET_DATA(payloadForChaveron);
      if (!chevronStatusResponse?.status) {
        throw new Error('Failed to fetch cases chaveron by id: Invalid response status');
      }
      return {
        licenseDetail: Response?.data ?? [],
        chevronList: chevronStatusResponse?.data ?? [],
      };
    } catch (error) {
      recordCrashlyticsError('Error in fetchCases:-->', error);
      console.error('Error in fetchCases:-->', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch cases:---> ${error.message}`);
      } else {
        throw new Error('Failed to fetch cases: An unknown error occurred');
      }
    }
  } else {
    const licenseDetailsById = await fetchLocalLicenseById(licenseDataProps?.contentItemId ?? '');
    const alertList = await fetchAlertAdminNotes(contentItemId);
    // console.log("Alert List Data", alertList);
    return {
      licenseDetail: {
        data: licenseDetailsById ? licenseDetailsById[0] : [],
        lstComments: alertList,
        permissions: {
          isAllowEditCase: licenseDataProps?.isAllowEditLicense,
          isAllowViewInspection: licenseDataProps?.isAllowViewInspection,
          isAllowAddAdminNotes: licenseDataProps?.isAllowAddAdminNotes,
        },
      },
      chevronList: [],
    };
  }
};

export const fetchLicenseSubtype = async (isNetworkAvailable?: boolean, licenseTypeId?: string) => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const payload = {
      url: `${baseUrl}${URL.LICENSE_SUB_TYPE_BY_LICENSE_TYPE_ID}${licenseTypeId}`,
    };
    try {
      const licenseSubTypesResById = await GET_DATA(payload);
      const licenseSubType = licenseSubTypesResById?.data?.data;
      if (licenseSubTypesResById?.data?.status) {
        return licenseSubType ?? [];
      }
    } catch (error) {
      recordCrashlyticsError('get sub type data api error--->', error);
      console.log('get sub type data api error--->', error);
    }
  }
};

export const fetchLicenseDropdown = async (
  isNetworkAvailable: boolean,
): Promise<EditLicenseDropdownResponse> => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    try {
      // For dropdown apis
      const endpoints = {
        licenseSubTypes: `${baseUrl}${URL.LICENSE_SUB_TYPE}`,
        licenseTags: `${baseUrl}${URL.GET_LICENSE_TAGS}`,
        licenseTypes: `${baseUrl}${URL.LICENSE_TYPE}`,
        licenseStatus: `${baseUrl}${URL.LICENSE_STATUS}`,
        licenseRenewalStatus: `${baseUrl}${URL.GET_LICENSE_RENEWAL_STATUS}`,
        licenseAttachedItems: `${baseUrl}${URL.GET_LICENSE_ATTACHED_ITEMS}`,
        // teamMembers: `${baseUrl}${URL.GET_TEAM_MEMBER}`,
        billingStatus: `${baseUrl}${URL.BILLING_STATUS}`,
      };

      const [
        licenseSubTypesRes,
        licenseTagsRes,
        licenseTypesRes,
        licenseStatusRes,
        licenseRenewalStatusRes,
        licenseAttachedItemsRes,
        // teamMembersRes,
        billingStatusRes,
      ] = await Promise.all([
        GET_DATA({ url: endpoints.licenseSubTypes }),
        GET_DATA({ url: endpoints.licenseTags }),
        GET_DATA({ url: endpoints.licenseTypes }),
        GET_DATA({ url: endpoints.licenseStatus }),
        GET_DATA({ url: endpoints.licenseRenewalStatus }),
        GET_DATA({ url: endpoints.licenseAttachedItems }),
        // GET_DATA({ url: endpoints.teamMembers }),
        GET_DATA({ url: endpoints.billingStatus }),
      ]);
      return {
        dropdownsList: {
          licenseSubTypes: licenseSubTypesRes?.data?.data ?? [],
          licenseTags: licenseTagsRes?.data?.data ?? [],
          licenseTypes: licenseTypesRes?.data?.data?.listLicenseTypes ?? [],
          licenseStatus: licenseStatusRes?.data?.data ?? [],
          licenseRenewalStatus: licenseRenewalStatusRes?.data?.data ?? [],
          licenseAttachedItems: licenseAttachedItemsRes?.data?.data ?? [],
          // teamMembers: teamMembersRes?.data?.data ?? [],
          billingStatus: billingStatusRes?.data?.data?.data ?? [],
        },
      };
    } catch (error) {
      recordCrashlyticsError('get Dropdown data api error--->', error);
      console.log('get Dropdown data api error--->', error);
    }
  } else {
    const licenseStatusRes = await fetchStatus(false);
    const licenseTagsRes = await fetchTags(false);
    const licenseSubTypesRes = await fetchSubCaseType(false);
    const licenseTypesRes = await fetchCaseType(false);
    const licenseRenewalStatusRes = await fetchRenewalStatus();
    // const teamMembersRes = await fetchTeamMembers();
    const billingStatusRes = await fetchBillingStatus(false);
    return {
      dropdownsList: {
        licenseSubTypes: licenseSubTypesRes ?? [],
        licenseTags: licenseTagsRes ?? [],
        licenseTypes: licenseTypesRes ?? [],
        licenseStatus: licenseStatusRes ?? [],
        licenseRenewalStatus: licenseRenewalStatusRes ?? [],
        // teamMembers: teamMembersRes ?? [],
        billingStatus: billingStatusRes ?? [],
      },
    };
  }
};

export const fetchTeamMember = async (isNetworkAvailable: boolean) => {
  try {
    if (isNetworkAvailable) {
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.GET_TEAM_MEMBER}`,
      });
      return sortByKey(response?.data?.data || [], 'firstName', 'lastName');
    } else {
      const result = await fetchTeamMembers();
      return sortByKey(result || [], 'firstName', 'lastName');
    }
  } catch (error) {
    recordCrashlyticsError('Error fetching team members:', error);
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const postLicenseDetails = async (
  licenseEditData: LicenseData | null,
  isNetworkAvailable: boolean,
  teamMemberArray: string,
  contentItemId: string,
  address: string,
) => {
  const newId = generateUniqueID();
  let SyncModel = SyncModelParam(
    false, // IsForceSync
    false, // IsOfflineSync
    getNewUTCDate(), // UTC date in YYYY-MM-DD
    newId, // Unique sync ID
    contentItemId ?? null, // ContentItem ID
    null, // Optional fallback value
  );
  const licenseDataPayload = buildLicensePayload({
    //   ...licenseEditData,
    contentItemId: licenseEditData?.contentItemId ?? '',
    licenseUniqNumber: licenseEditData?.licenseUniqNumber ?? '',
    expirationDate: licenseEditData?.expirationDate ?? null,
    applicantFirstName: licenseEditData?.applicantFirstName ?? '',
    applicantLastName: licenseEditData?.applicantLastName ?? '',
    email: licenseEditData?.email ?? '',
    phoneNumber: licenseEditData?.phoneNumber ?? '',
    cellNumber: licenseEditData?.cellNumber ?? '',
    parcelNumber: licenseEditData?.parcelNumber ?? '',
    quickRefNumber: licenseEditData?.quickRefNumber ?? '',
    additionalInfo: licenseEditData?.additionalInfo ?? '',
    // location: licenseEditData?.location ?? "",
    location: address ?? '',
    businessName: licenseEditData?.businessName ?? '',
    renewalStatusId: licenseEditData?.renewalStatusId ?? '',
    statusId: licenseEditData?.statusId ?? '',
    licenseStatusDisplayText: licenseEditData?.licenseStatusDisplayText ?? '',
    licenseTypeId: licenseEditData?.licenseTypeId ?? '',
    licenseTypeDisplayText: licenseEditData?.licenseTypeDisplayText ?? '',
    licenseTag: licenseEditData?.licenseTag ?? '',
    licenseSubType: licenseEditData?.licenseSubType ?? '',
    assignedUsers: teamMemberArray,
    paymentReceived: licenseEditData?.paymentReceived ?? false,
    licenseDescriptor: licenseEditData?.licenseDescriptor ?? '',
    isForceSync: isNetworkAvailable ? true : false,
    isApiUpdateQuickRefNumberAndParcelNumber: true,
    SyncModel: SyncModel,
    isNetworkAvailable,
    // longitude: licenseEditData?.longitudeField ?? "",
    // latitude: licenseEditData?.latitudeField ?? "",
    isAllowAssigned: licenseEditData?.isAllowAssigned ?? false,
    // isAllowAssigned: licenseEditData?.viewOnlyAssignUsers ?? false,
  });

  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const payload = {
      url: `${baseUrl}${URL.EDIT_LICENSES}`,
      body: licenseDataPayload,
    };
    try {
      const Response = await POST_DATA_WITH_TOKEN(payload);
      if (Response?.data?.status === false) {
        const errorMessage = Response.data?.message || 'Something went wrong';
        ToastService.show(errorMessage, COLORS.ERROR);
      }
      if (Response?.status === 200) {
        return Response.data;
      }
    } catch (error) {
      if (error instanceof Error) {
        recordCrashlyticsError('Failed to fetch license number:--->', error);
        throw new Error(`Failed to fetch license number:---> ${error.message}`);
      } else {
        throw new Error('Failed to fetch license number: An unknown error occurred');
      }
    }
  } else {
    const responseLicenseData = await fetchLocalLicenseById(contentItemId);
    const licenseData = responseLicenseData?.[0] as any;
    const isAllowEditLicense = licenseData?.isAllowEditLicense == 1 || false;
    const isAllowAddAdminNotes = licenseData?.isAllowAddAdminNotes == 1 || false;
    const isAllowViewInspection = licenseData?.isAllowViewInspection == 1 || false;

    if (Array.isArray(responseLicenseData) && responseLicenseData.length > 0) {
      //  Update license if the ID exists
      const Response = await updateLicenseIfIdExist(
        licenseDataPayload,
        responseLicenseData,
        false,
        false,
        false, // isForceSync
        false, // shouldUpdateOnlyCaseData
        true, // isEdited
        isAllowEditLicense, // isAllowEditLicense
        isAllowViewInspection, // isAllowViewInspection
        true, // isPermission
        isAllowAddAdminNotes, // isAllowAddAdminNotes
        newId,
        getNewUTCDate(),
      );

      if (Response) {
        return {
          statusCode: 200,
          message: 'License information updated successfully in offline mode.',
        };
      } else {
        return {
          statusCode: 500,
          message: 'Something went wrong. Please try updating again.',
        };
      }
    } else {
      ToastService.show(TEXTS.alertMessages.offlineSaveDataError, COLORS.RED);
    }
  }
};

export const fetchLicenseNumber = async (
  licenseTypeId: string | null,
  licenseDescriptor: string,
  isNetworkAvailable: boolean,
) => {
  if (isNetworkAvailable) {
    try {
      const url = getBaseUrl();
      const payload = `${url}${URL.GET_LICENSE_NUMBER}${licenseTypeId}&licenseDescriptor=${licenseDescriptor}`;
      const response = await GET_DATA({
        url: payload,
      });
      if (response?.data?.status) {
        return response?.data ?? [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching license number:', error);
      console.error('Error fetching license number:', error);
    }
  }
  {
    return;
  }
};
