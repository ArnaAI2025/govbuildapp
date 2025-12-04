import { getBaseUrl } from '../../../session/SessionManager';
import {
  contactFormData,
  contactFormDataOffline,
  SyncModelParam,
} from '../../../utils/params/commonParams';
import { generateUniqueID, getNewUTCDate } from '../../../utils/helper/helpers';
import { URL } from '../../../constants/url';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
import type {
  Contact,
  Contractor,
  License,
  LicenseForContract,
  ResponsiblePartyFormData,
} from '../../../utils/interfaces/ISubScreens';
import { addContractorParams } from '../../../utils/interfaces/ISubScreens';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { COLORS } from '../../../theme/colors';
import {
  AddNewContactInDb,
  fetchContactsDataByIdFromDB,
  fetchContactsFromDB,
  fetchContractorFromDb,
  UpdateContactInDb,
} from '../../../database/sub-screens/subScreenDAO';
import { fetchCaseDataByCaseIdFromDb } from '../../../database/my-case/myCaseDAO';
import { goBack } from '../../../navigation/Index';
import { fetchLocalLicenseById } from '../../../database/license/licenseSync';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const contactService = {
  async fetchContacts(
    contentItemId: string,
    type: 'Case' | 'License',
    isNetworkAvailable: boolean,
  ): Promise<Contact[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const endpoint = type === 'Case' ? URL.CASE_CONTACT_LIST : URL.GET_ALL_LICENSE_CONTACTS;
        const response = await GET_DATA({
          url: `${url}${endpoint}${contentItemId}`,
        });
        const contacts = response?.status ? (response?.data?.data ?? []) : [];
        return Array.isArray(contacts) ? contacts : [];
      }

      const response = await fetchContactsFromDB(contentItemId);
      // console.log('response------>>>>>',response);
      // @ts-ignore
      //  return Array.isArray(response) ? [...response].reverse() : response;
      return response;
    } catch (error) {
      recordCrashlyticsError('Error fetching contacts:--->', error);
      console.error('Error fetching contacts:--->', error);
      return [];
    }
  },

  async fetchContractors(
    contentItemId: string,
    type: 'Case' | 'License',
    isNetworkAvailable?: boolean,
  ): Promise<Contractor[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const caseAndLicenseId = type === 'Case' ? 'caseId=' : 'licenseId=';
        const response = await GET_DATA({
          url: `${url}${URL.CONTRACT_BY_CASE_LICENSE}${caseAndLicenseId}${contentItemId}`,
        });
        const contractors = response?.status ? (response?.data?.data ?? []) : [];
        return Array.isArray(contractors) ? contractors : [];
      }

      const Response = await fetchContractorFromDb(contentItemId);
      // @ts-ignore
      return Response;
    } catch (error) {
      recordCrashlyticsError('Error fetching contractors:', error);
      console.error('Error fetching contractors:', error);
      return [];
    }
  },

  async fetchLicenseTypes(isNetworkAvailable?: boolean): Promise<any[]> {
    try {
      if (!isNetworkAvailable) {
        // handle when network is not available
        return [];
      }

      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.LICENSE_TYPE_LIST}`,
      });
      const types = response?.status ? (response?.data?.data ?? []) : [];
      return Array.isArray(types) ? types : [];
    } catch (error) {
      recordCrashlyticsError('Error fetching license types:', error);
      console.error('Error fetching license types:', error);
      return [];
    }
  },

  async fetchLicenseByContentId(
    licenseId?: string,
    isNetworkAvailable?: boolean,
  ): Promise<LicenseForContract | null> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.LICENSE_BY_CONTENT_ID}${licenseId}`,
        });
        return response.status ? response.data : null;
      }
      return null;
    } catch (error) {
      recordCrashlyticsError('Error fetching license by content ID:', error);
      console.error('Error fetching license by content ID:', error);
      return null;
    }
  },

  async fetchLicensesByType(typeIds: string, isNetworkAvailable?: boolean): Promise<License[]> {
    try {
      if (!isNetworkAvailable) {
        return [];
      }
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.LICENSE_BY_TYPE}${typeIds}`,
      });
      const licenses = response?.status ? (response?.data?.data ?? []) : [];
      if (!Array.isArray(licenses)) {
        return [];
      }
      return licenses.filter(
        (item: License) => item.number || item.businessName || item.licenseDescriptor,
      );
    } catch (error) {
      recordCrashlyticsError('Error fetching licenses:', error);
      console.error('Error fetching licenses:', error);
      return [];
    }
  },

  async saveContractor(
    contractorData: Contractor,
    caseLicenseId: string,
    type: 'Case' | 'License',
    isNetworkAvailable?: boolean,
  ): Promise<boolean> {
    try {
      const newID = generateUniqueID();
      if (isNetworkAvailable) {
        if (!contractorData.licenseTypeIds || !contractorData.contractorId) {
          ToastService.show(
            TEXTS.subScreens.contactAndContract.licenseValidate,
            COLORS.WARNING_ORANGE,
          );
          return false;
        }

        const url = getBaseUrl();
        const params = addContractorParams(
          contractorData.id || '0',
          caseLicenseId,
          contractorData.isAllowAccess || false,
          contractorData.contractorId,
          contractorData.notes || '',
          contractorData.endDate || null,
          type,
          SyncModelParam(false, false, getNewUTCDate(), newID, null, contractorData?.id ?? null),
        );

        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.UPSERT_CONTRACT}`,
          body: params,
        });
        if (response?.data?.status) {
          ToastService.show('Contractor saved successfully.', COLORS.SUCCESS_GREEN);
          goBack();
        } else {
          ToastService.show(response?.data?.message, COLORS.ERROR);
        }
        return response?.data?.status;
      } else {
        // Handle offline saving logic here

        // const isCase = type === "Case";

        // const syncCheck = isCase ? caseToForceSyncByID : licenseToForceSyncByID;
        // const storeFunction = contractorData.id
        //   ? updateContractorData
        //   : storeContractorData;
        // const notInOffline = (await syncCheck(caseLicenseId)).length === 0;

        // await storeFunction(
        //   addContractorParamsOffline(
        //     contractorData.applicantName || "",
        //     contractorData.id || "0",
        //     contractorData.businessName || "",
        //     contractorData.contractorId || "",
        //     contractorData.documentId || "0",
        //     contractorData.email || "",
        //     contractorData.isAllowAccess || false,
        //     contractorData.notes || "",
        //     contractorData.number || "",
        //     contractorData.phoneNumber || ""
        //   ),
        //   isCase ? 1 : 0,
        //   caseLicenseId,
        //   1,
        //   contractorData.id ? 1 : 0,
        //   notInOffline,
        //   newID,
        //   getNewUTCDate(),
        //   caseData
        // );
        return true; // Currenlty we have not use this area becouse it is for the offline.
      }
    } catch (error) {
      recordCrashlyticsError('Error saving contractor:', error);
      console.error('Error saving contractor:', error);
      return false;
    }
  },
  async saveContact(
    formData: ResponsiblePartyFormData,
    type: 'Case' | 'License' | string,
    caseLicenseId: string,
    addNew: boolean,
    caseData: any,
    navigation: any,
    setLoading: (loading: boolean) => void,
    isNetworkAvailable: boolean = true,
  ): Promise<void> {
    const newId = generateUniqueID();
    try {
      if (isNetworkAvailable) {
        setLoading(true);
        const payload = contactFormData(
          formData.FirstName,
          formData?.LastName,
          formData?.Email,
          formData?.PhoneNumber,
          typeof formData?.MailingAddress === 'undefined' ? null : formData?.MailingAddress,
          formData == null ? 0 : formData?.id,
          caseLicenseId,
          formData?.contactType,
          formData?.businessName,
          formData?.isAllowAccess,
          formData?.isPrimary,
          formData?.notes,
          formData?.endDate,
          type,
          addNew,
          SyncModelParam(false, false, getNewUTCDate(), newId, null, addNew ? null : formData?.id),
        );
        const url = getBaseUrl();
        const endpoint =
          type === 'Case' ? `${url}${URL.ADD_CONTACT}` : `${url}${URL.ADD_LICENSE_CONTACT}`;

        const response = await POST_DATA_WITH_TOKEN({
          url: endpoint,
          body: payload,
        });

        if (response?.status) {
          ToastService.show(TEXTS.subScreens.contactAndContract.saveSuccess, COLORS.SUCCESS_GREEN);
          navigation.goBack(null);
        } else {
          console.log('Response error---->>>', response?.message);
        }
      } else {
        const payloadOffline = contactFormDataOffline(
          formData.FirstName,
          formData?.LastName,
          formData?.Email,
          formData?.PhoneNumber,
          typeof formData?.MailingAddress == 'undefined' ? '' : formData?.MailingAddress,
          formData == null ? newId : formData.id,
          caseLicenseId,
          formData?.contactType,
          formData?.businessName,
          formData?.isAllowAccess,
          formData?.isPrimary,
          formData?.notes,
          formData?.endDate ?? null,
          type,
          addNew,
        );
        const response =
          type === 'Case'
            ? await fetchCaseDataByCaseIdFromDb(caseLicenseId)
            : await fetchLocalLicenseById(caseLicenseId);

        if (Array.isArray(response) && response.length > 0) {
          if (addNew) {
            try {
              const response = await AddNewContactInDb(
                payloadOffline,
                type === 'Case' ? 1 : 0,
                caseLicenseId,
                1,
                false,
                newId,
                getNewUTCDate(),
                caseData,
              );
              if (response) {
                ToastService.show('Contact added successfully.', COLORS.SUCCESS_GREEN);
                navigation.goBack(null);
              }
            } catch (error) {
              recordCrashlyticsError('Error adding new contact:', error);
              console.error('Error adding new contact:', error);
            }
          } else {
            try {
              const contactsData = await fetchContactsDataByIdFromDB(formData?.id);
              if (Array.isArray(contactsData) && contactsData.length > 0) {
                const responseData = await UpdateContactInDb(
                  payloadOffline,
                  true, // isEdited
                  false, // isSync
                  //  false, // isNew
                  formData?.id,
                  type === 'Case' ? 1 : 0,
                  caseLicenseId,
                  newId,
                  getNewUTCDate(),
                );
                if (responseData) {
                  ToastService.show(
                    'Contact update successfully for offline use.',
                    COLORS.SUCCESS_GREEN,
                  );
                  navigation.goBack(null);
                }
              } else {
                console.log('contactsData is not available.');
              }
            } catch (error) {
              recordCrashlyticsError('Error fetching or updating contact data:', error);
              console.error('Error fetching or updating contact data:', error);
            }
          }
        } else {
          ToastService.show(`There is not ${type}`, COLORS.WARNING_ORANGE);
        }
      }
    } catch (error) {
      console.error('Error---->>>', error);
    } finally {
      setLoading(false);
    }
  },
};
