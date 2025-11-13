import { CaseData, CaseResponse, EditCaseResponse } from '../../utils/interfaces/ICase';
import { getAccessToken, getBaseUrl, getUserRole } from '../../session/SessionManager';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import {
  fetchCasesFromDB,
  fetchLocalCasebyId,
  updateCaseIfIdExist,
} from '../../database/my-case/myCaseSync';
import { DefaultAdvancedFiltersInterface } from '../../utils/interfaces/IComponent';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { AdressModel } from '../../utils/interfaces/ISubScreens';
import { editAddress } from '../../utils/params/commonParams';
import {
  fetchBillingStatus,
  fetchCaseType,
  fetchStatus,
  fetchSubCaseType,
  fetchTags,
  fetchTeamMembers,
} from '../../database/drop-down-list/dropDownlistDAO';
import { generateUniqueID, getNewUTCDate } from '../../utils/helper/helpers';
import { getOfflineCaseTypeSettingsById } from '../../database/my-case/myCaseDAO';
import { fetchAlertAdminNotes } from '../../database/sub-screens/subScreensSync';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

const buildQueryString = (
  filters: DefaultAdvancedFiltersInterface,
  pageNo: number,
  isSearch: boolean,
  apiFor: string,
): string => {
  const queryParams = [
    `pagenum=${pageNo}`,
    `TeamMember=${
      filters?.teamMember?.userId === '' && !filters?.isMyCaseOnly
        ? getUserRole()
        : filters?.teamMember?.userId
    }`,
    `FilterType=${filters?.filterType?.value?.trim() || 'title'}`,
    `DisplayText=${isSearch ? encodeURIComponent(filters.search ?? '') : ''}`,
    `SortBy=${filters?.sortBy?.value?.trim() || ''}`,
  ];
  if (apiFor == 'myCase') {
    queryParams.push(
      `caseTag=${
        filters?.caseLicenseTag?.id ? filters?.caseLicenseTag?.displayText.replace(/\s/g, '_') : ''
      }`,
      `caseSubType=${
        filters?.caseLicenseSubType?.id
          ? filters?.caseLicenseSubType?.displayText.replace(/\s/g, '_')
          : ''
      }`,
      `CaseType=${
        filters?.caseLicenseType?.id
          ? filters?.caseLicenseType?.displayText.replace(/\s/g, '+')
          : ''
      }`,
      `AdvancedForm=${
        filters?.advanceForm?.id ? filters?.advanceForm?.displayText.replace(/\s/g, '_') : ''
      }`,
      `CaseStatus=${
        filters?.caseLicenseStatus?.id
          ? filters?.caseLicenseStatus?.displayText.replace(/\s/g, '+')
          : ''
      }`,
    );
  } else {
    queryParams.push(`IsAssignment=true`);
  }

  const queryString = queryParams.join('&');
  return queryString;
};

export const fetchCases = async (
  filters: DefaultAdvancedFiltersInterface,
  pageNo: number,
  isSearch: boolean,
  apiFor: string,
  isNetworkAvailable: boolean,
): Promise<CaseResponse> => {
  if (isNetworkAvailable) {
    const accessToken = getAccessToken();
    const baseUrl = getBaseUrl();
    const queryString = buildQueryString(filters, pageNo, isSearch, apiFor);
    const payload = {
      url: `${baseUrl}${URL.MY_CASELIST}?${queryString}`,
      token: accessToken,
    };

    try {
      const response = await GET_DATA(payload);
      if (!response?.status) {
        throw new Error('Failed to fetch cases: Invalid response status');
      }

      return {
        cases: response?.data?.data?.contentItemSummaries ?? [],
        isMyCaseOnly: response?.data?.data?.isMyCaseOnly ?? false,
        isAllowEditCase: response?.data?.permissions?.isAllowEditCase ?? false,
      };
    } catch (error) {
      recordCrashlyticsError('Error in fetchCases:', error);
      console.error('Error in fetchCases:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch cases: ${error.message}`);
      } else {
        throw new Error('Failed to fetch cases: An unknown error occurred');
      }
    }
  } else {
    const offlineCases = await fetchCasesFromDB(filters, isSearch);

    const pageSize = 10;
    const start = (pageNo - 1) * pageSize;
    const end = start + pageSize;
    const paginatedOfflineCases = offlineCases
      .sort((a, b) => new Date(b.modifiedUtc).getTime() - new Date(a.modifiedUtc).getTime())
      .slice(start, end)
      .map((caseItem) => ({
        ...caseItem,
        totalCost:
          typeof caseItem.totalCost === 'string' ? Number(caseItem.totalCost) : caseItem.totalCost,
        isManualAddress: caseItem.isManualAddress,
      }));

    return {
      cases: paginatedOfflineCases,
      isMyCaseOnly: false,
      isAllowEditCase: offlineCases[0]?.isAllowEditCase,
    };
  }
};

export const fetchCaseDataById = async (
  contentItemId: string,
  isNetworkAvailable: boolean,
  caseDataProps?: CaseData,
): Promise<EditCaseResponse> => {
  if (isNetworkAvailable) {
    const accessToken = getAccessToken();
    const baseUrl = getBaseUrl();

    try {
      // For the case details
      const payloadForCaseDetails = {
        url: `${baseUrl}${URL.GET_CASE_BY_ID}${contentItemId}`,
        token: accessToken,
      };
      const caseDetailsResponse = await GET_DATA(payloadForCaseDetails);
      if (!caseDetailsResponse?.status) {
        throw new Error('Failed to fetch cases by id: Invalid response status');
      }
      // For the case type fields

      // For the chevron status
      const payloadForChaveron = {
        url: `${baseUrl}${URL.GET_CASE_CHEVRON_BY_CASEID}${contentItemId}`,
        token: accessToken,
      };

      const chevronStatusResponse = await GET_DATA(payloadForChaveron);
      if (!caseDetailsResponse?.status) {
        throw new Error('Failed to fetch cases chaveron by id: Invalid response status');
      }

      // const endpoints = {
      //   caseSubTypes: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseSubType`,
      //   caseTags: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseTag`,
      //   caseTypes: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseType`,
      //   caseStatuses: `${baseUrl}/api/Case/GetCaseStatusByCaseType?caseTypeId=`,
      //   advanceForms: `${baseUrl}/api/Case/GetCaseDropDownList?name=AdvancedForm`,
      //   teamMembers: `${baseUrl}/api/TeamMember/GetTeamMembers?`,
      //   billingStatus: `${baseUrl}/api/Case/GetCaseDropDownList?name=BillingStatus`,
      // };

      // const [
      //   caseSubTypesRes,
      //   caseTagsRes,
      //   caseTypesRes,
      //   caseStatusesRes,
      //   advanceFormsRes,
      //   teamMembersRes,
      //   billingStatusRes,
      // ] = await Promise.all([
      //   await GET_DATA({ url: endpoints.caseSubTypes }),
      //   await GET_DATA({ url: endpoints.caseTags }),
      //   await GET_DATA({ url: endpoints.caseTypes }),
      //   await GET_DATA({ url: endpoints.caseStatuses }),
      //   await GET_DATA({ url: endpoints.advanceForms }),
      //   await GET_DATA({ url: endpoints.teamMembers }),
      //   await GET_DATA({ url: endpoints.billingStatus }),
      // ]);

      return {
        casesDetails: caseDetailsResponse?.data ?? [],
        chevronList: chevronStatusResponse?.data?.data ?? [],
        // subDropdownsList: {
        //   subTypes: caseSubTypesRes?.data?.data ?? [],
        //   caseTags: caseTagsRes?.data?.data ?? [],
        //   caseTypes: caseTypesRes?.data?.data ?? [],
        //   caseStatuses: caseStatusesRes?.data?.data ?? [],
        //   advanceForms: advanceFormsRes?.data?.data ?? [],
        //   teamMembers: teamMembersRes?.data?.data ?? [],
        //   billingStatus: billingStatusRes?.data?.data ?? [],
        // },
      };
    } catch (error) {
      recordCrashlyticsError('Error in fetchCases dropdown:', error);
      console.error('Error in fetchCases:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch cases: ${error.message}`);
      } else {
        throw new Error('Failed to fetch cases: An unknown error occurred');
      }
    }
  } else {
    const caseDetailsById = await fetchLocalCasebyId(caseDataProps?.contentItemId ?? '');
    // const caseSubTypesRes = await fetchSubCaseType(true);
    // const caseTagsRes = await fetchTags(true);
    // const caseTypesRes = await fetchCaseType(true);
    // const caseStatusesRes = await fetchStatus(true);
    // const teamMembersRes = await fetchTeamMembers();
    // const billingStatusRes = await fetchBillingStatus(true);
    const alertList = await fetchAlertAdminNotes(contentItemId);

    return {
      casesDetails: {
        data: caseDetailsById ? caseDetailsById[0] : [],
        lstComments: alertList,
        permissions: {
          isAllowEditCase: caseDataProps?.isAllowEditCase,
          isAllowViewInspection: caseDataProps?.isAllowViewInspection,
          isAllowAddAdminNotes: caseDataProps?.isAllowAddAdminNotes,
        },
      },
      chevronList: [],
      // subDropdownsList: {
      //   subTypes: caseSubTypesRes ?? [],
      //   caseTags: caseTagsRes ?? [],
      //   caseTypes: caseTypesRes ?? [],
      //   caseStatuses: caseStatusesRes ?? [],
      //   advanceForms: [],
      //   teamMembers: teamMembersRes ?? [],
      //   billingStatus: billingStatusRes ?? [],
      // },
    };
  }
};

export const fetchCaseDropdownData = async (
  isNetworkAvailable: boolean,
): Promise<EditCaseResponse> => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const endpoints = {
      caseSubTypes: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseSubType`,
      caseTags: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseTag`,
      caseTypes: `${baseUrl}/api/Case/GetCaseDropDownList?name=CaseType`,
      caseStatuses: `${baseUrl}/api/Case/GetCaseStatusByCaseType?caseTypeId=`,
      advanceForms: `${baseUrl}/api/Case/GetCaseDropDownList?name=AdvancedForm`,
      teamMembers: `${baseUrl}/api/TeamMember/GetTeamMembers?`,
      billingStatus: `${baseUrl}/api/Case/GetCaseDropDownList?name=BillingStatus`,
    };

    try {
      const [
        caseSubTypesRes,
        caseTagsRes,
        caseTypesRes,
        caseStatusesRes,
        advanceFormsRes,
        teamMembersRes,
        billingStatusRes,
      ] = await Promise.all([
        GET_DATA({ url: endpoints.caseSubTypes }),
        GET_DATA({ url: endpoints.caseTags }),
        GET_DATA({ url: endpoints.caseTypes }),
        GET_DATA({ url: endpoints.caseStatuses }),
        GET_DATA({ url: endpoints.advanceForms }),
        GET_DATA({ url: endpoints.teamMembers }),
        GET_DATA({ url: endpoints.billingStatus }),
      ]);

      return {
        subDropdownsList: {
          subTypes: caseSubTypesRes?.data?.data ?? [],
          caseTags: caseTagsRes?.data?.data ?? [],
          caseTypes: caseTypesRes?.data?.data ?? [],
          caseStatuses: caseStatusesRes?.data?.data ?? [],
          advanceForms: advanceFormsRes?.data?.data ?? [],
          teamMembers: teamMembersRes?.data?.data ?? [],
          billingStatus: billingStatusRes?.data?.data ?? [],
        },
      };
    } catch (error) {
      recordCrashlyticsError('Error in fetchCaseDropdownData:', error);
      console.error('Error in fetchCaseDropdownData:', error);
      throw new Error(`Failed to fetch dropdowns: ${error.message}`);
    }
  } else {
    const caseSubTypesRes = await fetchSubCaseType(true);
    const caseTagsRes = await fetchTags(true);
    const caseTypesRes = await fetchCaseType(true);
    const caseStatusesRes = await fetchStatus(true);
    const teamMembersRes = await fetchTeamMembers();
    const billingStatusRes = await fetchBillingStatus(true);

    return {
      subDropdownsList: {
        subTypes: caseSubTypesRes ?? [],
        caseTags: caseTagsRes ?? [],
        caseTypes: caseTypesRes ?? [],
        caseStatuses: caseStatusesRes ?? [],
        advanceForms: [],
        teamMembers: teamMembersRes ?? [],
        billingStatus: billingStatusRes ?? [],
      },
    };
  }
};

export const fetchCaseTypeFieldSetting = async (
  caseTypeId: string,
  isNetworkAvailable: boolean,
): Promise<any> => {
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();

    try {
      // For the case type fields
      const caseTypeFieldSetting = await GET_DATA({
        url: `${baseUrl}${URL.GET_CASE_TYPE_FIELDS_SETTING}${caseTypeId}`,
      });
      if (!caseTypeFieldSetting?.status) {
        throw new Error('Failed to fetch cases type field setting: Invalid response status');
      }
      const serverData = caseTypeFieldSetting?.data?.data;
      return serverData;
    } catch (error) {
      recordCrashlyticsError('Error in fetch case type field setting:', error);
      console.error('Error in fetchCases:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch cases: ${error.message}`);
      } else {
        throw new Error('Failed to fetch cases: An unknown error occurred');
      }
    }
  } else {
    const responseCaseData = await getOfflineCaseTypeSettingsById(caseTypeId);
    return responseCaseData ?? {};
  }
};
export const updateCaseDetails = async (
  caseDataPayload: any,
  contentItemId: any,
  isNetworkAvailable: boolean,
) => {
  const newId = generateUniqueID();
  if (isNetworkAvailable) {
    const baseUrl = getBaseUrl();
    const payload = {
      url: `${baseUrl}${URL.UPDATE_CASE_API}`,
      body: caseDataPayload,
    };
    try {
      const response = await POST_DATA_WITH_TOKEN(payload);
      if (response?.status === 200) {
        return response.data;
      }
    } catch (error) {
      recordCrashlyticsError('Failed to save case:--->', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save case:---> ${error.message}`);
      } else {
        throw new Error('Failed to save case: An unknown error occurred');
      }
    }
  } else {
    // Fetch case data to force sync by ID
    const responseCaseData = await fetchLocalCasebyId(contentItemId ?? '');
    // const responseCaseData = await fetchCaseDataByCaseIdFromDb(contentItemId);
    const firstCase = responseCaseData?.[0] as any;
    const isAllowEditCase = firstCase?.isAllowEditCase == 1 || false;
    const isEnableMultiline = firstCase?.isEnableMultiline == 1 || false;
    const isAllowAddAdminNotes = firstCase?.isAllowAddAdminNotes == 1 || false;
    const isAllowViewInspection = firstCase?.isAllowViewInspection == 1 || false;

    if (Array.isArray(responseCaseData) && responseCaseData.length > 0) {
      // Update case if the case ID exists
      const Response = await updateCaseIfIdExist(
        caseDataPayload,
        responseCaseData,
        false,
        false,
        false, // isForceSync
        false, // shouldUpdateOnlyCaseData
        true, // isEdited
        isEnableMultiline, // isEnableMultiline
        isAllowEditCase, // isAllowEditCase
        isAllowViewInspection, // isAllowViewInspection
        true, // isPermission
        isAllowAddAdminNotes, // isAllowAddAdminNotes
        newId,
        getNewUTCDate(),
      );
      if (Response) {
        return {
          statusCode: 200,
          message: 'Case information updated successfully',
        };
      } else {
        return {
          statusCode: 500,
          message: 'Something went wrong. Please try updating again.',
        };
      }
    } else {
      // ToastService.show(
      //   TEXTS.alertMessages.internetConnectionMsg,
      //   COLORS.ORANGE
      // );
    }
  }
};

export const getCaseUniqueNumber = async (
  caseTypeId: string | null,
  contentItemId: string,
  isNetworkAvailable: boolean,
) => {
  if (isNetworkAvailable) {
    try {
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.GET_CASE_NUMBER}${caseTypeId}&caseContentItemId=${contentItemId}`,
      });
      if (response.status) {
        return response?.data ?? [];
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching case number:', error);
      console.error('Error fetching case number:', error);
    }
  }
  {
    return;
  }
};

export const updateLocation = async (locationInput: AdressModel) => {
  const baseUrl = getBaseUrl();
  const payload = {
    url: `${baseUrl}${URL.UPDATE_CASE_LOCATION_API}`,
    body: editAddress(
      locationInput?.contentItemId || '',
      locationInput?.streetAddress || '',
      locationInput?.latitude || '',
      locationInput?.longitude || '',
      locationInput?.city || '',
      locationInput?.state || '',
      locationInput?.zip || '',
      locationInput?.isManualLocation || false,
      false,
      locationInput?.SyncModel ?? null,
    ),
  };
  try {
    const response = await POST_DATA_WITH_TOKEN(payload);

    if (response?.status) {
      return response?.data;
    } else {
      // ToastService.show(response?.statusText, COLORS.ERROR);
    }
  } catch (error) {
    recordCrashlyticsError('Error updating case location:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save case:---> ${error.message}`);
    } else {
      throw new Error('Failed to save case: An unknown error occurred');
    }
  }
};
export const updateMailingAdress = async (mailingAdressInput: AdressModel) => {
  const baseUrl = getBaseUrl();
  const payload = {
    url: `${baseUrl}${URL.UPDATE_CASE_MAILING_ADDRESS_API}`,
    body: editAddress(
      mailingAdressInput?.contentItemId || '',
      mailingAdressInput?.streetAddress || '',
      mailingAdressInput?.latitude || '',
      mailingAdressInput?.longitude || '',
      mailingAdressInput?.city || '',
      mailingAdressInput?.state || '',
      mailingAdressInput?.zip || '',
      true,
      true,
      mailingAdressInput?.SyncModel ?? null,
    ),
  };
  try {
    const response = await POST_DATA_WITH_TOKEN(payload);
    if (response?.status) {
      return response?.data;
    } else {
      ToastService.show(response?.statusText, COLORS.ERROR);
    }
  } catch (error) {
    recordCrashlyticsError('Error updating maailing address:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save case:---> ${error.message}`);
    } else {
      throw new Error('Failed to save case: An unknown error occurred');
    }
  }
};
