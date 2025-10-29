import { AttachedItem } from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA } from '../../../services/ApiClient';
import { URL } from '../../../constants/url';
import {
  fetchAttachedItemsBYId,
  fetchAttachedItemsFromDB,
} from '../../../database/sub-screens/subScreensSync';
import { storeSubmissionToAttachTable } from '../../../database/sub-screens/subScreenDAO';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';

export const fetchAttachedItems = async (
  contentItemId: string,
  isCase: boolean,
  isNetworkAvailable: boolean,
): Promise<AttachedItem[]> => {
  try {
    if (isNetworkAvailable) {
      const url = getBaseUrl();
      const apiUrl = isCase
        ? `${url}${URL.ATTACHED_ITEMS}${contentItemId}`
        : `${url}${URL.LICENSE_ATTACHED_ITEMS}${contentItemId}`;
      const response = await GET_DATA({ url: apiUrl });

      if (response?.status && response?.data?.data) {
        await storeSubmissionToAttachTable(response?.data?.data?.lstAttachedItems);
        return response?.data?.data?.lstAttachedItems;
      } else {
        return [];
      }
    } else {
      return ((await fetchAttachedItemsFromDB(contentItemId)) as AttachedItem[]) ?? [];
    }
  } catch (error) {
    console.error('Error fetching attached items:', error);
    return [];
  }
};

export const downloadForm = async (
  ItemId: string,
  isNetworkAvailable: boolean,
): Promise<boolean> => {
  try {
    if (isNetworkAvailable) {
      const url = getBaseUrl();
      const apiUrl = `${url}${URL.ADVANCE_FORM_BY_ID}${ItemId}`;
      const response = await GET_DATA({ url: apiUrl });
      if (response?.status && response.data) {
        await storeSubmissionToAttachTable(response.data);
        ToastService.show('Item saved for the Offline use', COLORS.SUCCESS_GREEN);
        return true;
      }
      ToastService.show('Item not saved for the Offline use', COLORS.ERROR);
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error downloading form:', error);
    return false;
  }
};

export const getOfflineDataById = async (contentItemId: string): Promise<any[]> => {
  try {
    return (await fetchAttachedItemsBYId(contentItemId)) ?? [];
  } catch (error) {
    console.error('Error fetching offline data:', error);
    return [];
  }
};
