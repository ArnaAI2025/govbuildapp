import { getBaseUrl } from '../../session/SessionManager';
import { GET_DATA } from '../../services/ApiClient';
import { URL } from '../../constants/url';
import { FormItem } from '../../utils/interfaces/IComponent';
import { fetchAddFormListFromDB } from '../../database/sub-screens/attached-items/attachedItemsDAO';
import {
  fetchFormFilterTags,
  fetchFormFilterTypes,
  fetchNewAdvancedFormListFromDB,
} from '../../database/new-form/newFormDAO';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { COLORS } from '../../theme/colors';
import { navigateReplace } from '../../navigation/Index';

export const fetchFormList = async (
  pageNo: number,
  isNetworkAvailable: boolean,
  isInitialFetch: boolean,
): Promise<FormItem[]> => {
  try {
    console.log('Functon alled');
    if (isNetworkAvailable) {
      const url = getBaseUrl();
      const apiUrl = `${url}${URL.ADVANCE_FORM_LIST}${pageNo}`;

      const response = await GET_DATA({ url: apiUrl });

      return response?.data?.data?.contentItemSummaries;
    } else {
      const offlineData = await fetchAddFormListFromDB();
      if (isInitialFetch) {
        return offlineData as FormItem[];
      }
      return [];
    }
  } catch (error) {
    console.error('Error fetching form list:', error);
    return [];
  }
};

export const filterFormList = (allForms: FormItem[], query: string): FormItem[] => {
  if (!Array.isArray(allForms)) return [];
  return allForms?.filter((item) =>
    item?.DisplayText?.toLowerCase().includes(query?.toLowerCase()),
  );
};

export const fetchNewFormService = async (
  pageNo?: number,
  searchValue?: string | null,
  selectedTypeId?: string | number | null,
  selectedTagId?: string | number | null,
  isNetworkAvailable?: boolean,
): Promise<any> => {
  if (isNetworkAvailable) {
    try {
      const baseUrl = getBaseUrl();
      const formUrl = `${baseUrl}${
        URL.GET_ADVANCED_FORM_LIST_API
      }=${pageNo}&displayText=${searchValue}&typeId=${
        selectedTypeId || ''
      }&tagId=${selectedTagId || ''}`;
      // console.log("formUrl---->>>>>>", formUrl);
      const payload = { url: formUrl };
      const response = await GET_DATA(payload);
      if (!response?.status || !response?.data?.data) {
        throw new Error('Invalid data response from API');
      }
      return response?.data?.data?.contentItemSummaries || [];
    } catch (error) {
      console.error('fetchFormService error:--->', error?.message || error);
      return [];
    }
  } else {
    //  fetchAddFormListFromDB();
    let pageSize = 10;
    const offlineData = await fetchNewAdvancedFormListFromDB(
      pageNo,
      pageSize,
      searchValue,
      selectedTypeId,
      selectedTagId,
    );
    return offlineData ?? [];
  }
};

export const fetchTypeService = async (isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    try {
      const baseUrl = getBaseUrl();
      const formUrl = `${baseUrl}${URL.GET_ADVANCEFORM_TYPE_API}`;
      const payload = { url: formUrl };
      const response = await GET_DATA(payload);
      if (response?.data?.status) {
        return response?.data?.data;
      }
    } catch (error) {
      console.error('fetchTypeService error:--->', error?.message || error);
      return [];
    }
  } else {
    const result = await fetchFormFilterTypes();
    return result ?? [];
  }
};

export const fetchTagService = async (isNetworkAvailable: boolean) => {
  if (isNetworkAvailable) {
    try {
      const baseUrl = getBaseUrl();
      const formUrl = `${baseUrl}${URL.GET_ADVANCEFORM_TAG_API}`;
      const payload = { url: formUrl };
      const response = await GET_DATA(payload);
      if (response?.data?.status) {
        return response?.data?.data;
      }
    } catch (error) {
      console.error('fetchTagService error:--->', error?.message || error);
      return [];
    }
  } else {
    const result = await fetchFormFilterTags();
    return result ?? [];
  }
};

// For Advanced Form Details Service
// export const fetchCaseOrLicenseByIds = async (
//   caseId: string,
//   type: string,
//   isNetworkAvailable: boolean
// ) => {
//   if (isNetworkAvailable) {
//     try {
//       //   const formUrl = `${baseUrl}${URL.GET_ADVANCEFORM_TAG_API}`;
//       //   const payload = { url: formUrl };
//       //   const response = await GET_DATA(payload);
//       //   if (response?.data?.status) {
//       //     return response?.data?.data;
//       //   }

//       const baseUrl = await getBaseUrl();
//       if (!baseUrl) throw new Error("Missing base URL");

//       const urlEndPoint =
//         type === "Case" ? URL.GET_CASE_BY_ID : URL.GET_LICENSE_BY_CONTENT;
//       const newURL = `${baseUrl}${urlEndPoint}${caseId}`;

//       const response = await GET_DATA({ url: newURL });

//       if (data1?.status) {
//         const screen = type === "Case" ? "EditCaseScreen" : "EditLicenseScreen";
//         navigate(screen, { paramKey: "params", param: data1?.data });
//       } else {
//         throw new Error("Failed to fetch data from API");
//       }
//     } catch (error) {
//       console.error("fetchTagService error:--->", error?.message || error);
//       return [];
//     }
//   } else {
//     return [];
//   }
// };

export const fetchCaseOrLicenseByIdService = async (
  contentId: string,
  type: 'Case' | 'License',
  // navigation: any
): Promise<void> => {
  try {
    const baseUrl = await getBaseUrl();
    if (!baseUrl) throw new Error('Missing base URL');

    const urlEndPoint = type === 'Case' ? URL.GET_CASE_BY_ID : URL.GET_LICENSE_BY_CONTENT;
    const newURL = `${baseUrl}${urlEndPoint}${contentId}`;
    const response = await GET_DATA({ url: newURL });

    if (response?.status && response.data) {
      ToastService.show('Your Advanced Form Submissions has been published.', COLORS.SUCCESS_GREEN);
      if (type === 'Case') {
        navigateReplace('EditCaseScreen', {
          caseId: response?.data?.data?.contentItemId ?? '',
          myCaseData: response?.data?.data,
        });
        // navigation.replace("EditCaseScreen", {
        //   caseId: response?.data?.data?.contentItemId ?? "",
        //   myCaseData: response?.data?.data,
        // });
      } else {
        navigateReplace('EditLicenseScreen', {
          contentItemId: response?.data?.data?.contentItemId ?? '',
          licenseData: response?.data?.data,
        });
      }
    } else {
      throw new Error('Failed to fetch data from API');
    }
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
  }
};
