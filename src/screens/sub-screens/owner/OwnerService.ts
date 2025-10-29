import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { URL } from '../../../constants/url';
import { goBack } from '../../../navigation/Index';
import { GET_DATA, POST_DATA_WITH_TOKEN } from '../../../services/ApiClient';
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
      }
    } catch (error) {
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
      }
    } catch (error) {
      console.error('Error fetching:--->', error);
    }
  },
};
