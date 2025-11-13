import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { URL } from '../../../constants/url';
import {
  getOwnerDetailsDataById,
  storeOwnerDetailsData,
  updateOwnerDetailsData,
} from '../../../database/sub-screens/subScreenDAO';
import { goBack } from '../../../navigation/Index';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';
import { getBaseUrl } from '../../../session/SessionManager';
import { COLORS } from '../../../theme/colors';
import { OwnerParam } from '../../../utils/params/commonParams';

export const OwnerService = {
  async fetchOwnerData(contentItemId: string, isNetworkAvailable: boolean) {
    //   ): Promise<Contac[]> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await GET_DATA({
          url: `${url}${URL.GET_LICENSE_OWNER_DETAILS}${contentItemId}`,
        });
        return response?.data?.status ? response?.data?.data : [];
      } else {
        const response = await getOwnerDetailsDataById(contentItemId);
        return response;
      }
    } catch (error) {
      recordCrashlyticsError('Error GET_LICENSE_OWNER_DETAILS:--->', error);
      console.error('Error fetching:--->', error);
      return [];
    }
  },

  async saveOwnerDetails(formData: any, contentItemId: string, isNetworkAvailable: boolean) {
    try {
      const payload = OwnerParam(
        formData?.name,
        formData?.email,
        formData?.phone,
        formData?.cellNumber,
        formData?.mailingAddress,
        formData?.address,
        contentItemId,
      );
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        const response = await POST_DATA_WITH_TOKEN({
          url: `${url}${URL.ADD_UPDATE_LICENSE_OWNER_DETAILS}`,
          body: payload,
        });
        if (response?.data?.status) {
          ToastService.show(TEXTS.subScreens.owner.saveSuccess, COLORS.SUCCESS_GREEN);
          goBack();
        } else {
          ToastService.show(response?.data?.message, COLORS.ERROR);
        }
        return response?.data;
      } else {
        console.log('Offline mode - saving owner details locally');
        const existingOwner = await getOwnerDetailsDataById(contentItemId);

        if (existingOwner) {
          // update existing record
          await updateOwnerDetailsData(
            {
              contentItemId: contentItemId,
              ownerName: formData?.name,
              ownerEmail: formData?.email,
              ownerPhoneNumber: formData?.phone,
              ownerCellPhone: formData?.cellNumber,
              ownerMailingAddress: formData?.mailingAddress,
              ownerAddress: formData?.address,
              licenseOwner: formData?.name,
            },
            false, // isCase
            contentItemId,
            0, // isSync = 0
            1, // isEdited = 1
          );
        } else {
          // insert new record
          await storeOwnerDetailsData(
            {
              contentItemId: contentItemId,
              contactEmail: null,
              contactFirstName: null,
              contactLastName: null,
              contactMailingAddress: formData?.mailingAddress,
              contactPhoneNumber: formData?.phone,
              licenseOwner: formData?.name,
              ownerAddress: formData?.address,
              ownerCellPhone: formData?.cellNumber,
              ownerEmail: formData?.email,
              ownerMailingAddress: formData?.mailingAddress,
              ownerName: formData?.name,
              ownerPhoneNumber: formData?.phone,
            },
            false, // isCase
            contentItemId,
            0, // isNew
            1, // isEdited
          );
        }
        goBack();
      }
    } catch (error) {
      recordCrashlyticsError('Error ADD_UPDATE_LICENSE_OWNER_DETAILS:--->', error);
      console.error('Error fetching:--->', error);
    }
  },
};
