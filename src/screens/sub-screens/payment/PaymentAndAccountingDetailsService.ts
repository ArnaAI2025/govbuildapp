import {
  AccountingDetail,
  AccountingDetailTitle,
  Payment,
} from '../../../utils/interfaces/ISubScreens';
import { getBaseUrl } from '../../../session/SessionManager';
import { GET_DATA } from '../../../services/ApiClient';
import { URL } from '../../../constants/url';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { TEXTS } from '../../../constants/strings';
import { fetchPaymentsFromDb } from '../../../database/sub-screens/subScreenDAO';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

export const PaymentAndAccountingDetailsService = {
  async fetchPayments(
    contentItemId: string,
    type: 'Case' | 'License',
    isNetworkAvailable: boolean,
  ): Promise<Payment[]> {
    try {
      if (isNetworkAvailable) {
        const url = await getBaseUrl();
        const endpoint = `${url}${URL.PAYMENT_LIST}${
          type === 'Case' ? 'caseId=' : 'licenseId='
        }${contentItemId}`;

        const response = await GET_DATA({ url: endpoint });
        if (response.status) {
          return response?.data?.data?.orders || [];
        } else {
          return [];
        }
      } else {
        const payments = await fetchPaymentsFromDb(contentItemId);
        return payments || [];
      }
    } catch (error) {
      recordCrashlyticsError('Error in fetchPayments:', error);
      console.error('Error in fetchPayments:', error);
      return [];
    }
  },

  async fetchAccountingDetails(
    contentItemId: string,
    type: 'Case' | 'License',
    isNetworkAvailable: boolean,
  ): Promise<{ details: AccountingDetail[]; titles: AccountingDetailTitle[] }> {
    try {
      if (isNetworkAvailable) {
        const url = getBaseUrl();
        // Fetch accounting detail titles
        const titleEndpoint =
          type === 'Case'
            ? `${url}${URL.ACCOUNTING_DETAILS_FOR_CASE}?name=AccountingDetails`
            : `${url}${URL.ACCOUNTING_DETAILS_FOR_LICENSE}`;
        const titleResponse = await GET_DATA({ url: titleEndpoint });
        const titles = titleResponse.status ? titleResponse?.data?.data || [] : [];

        // Fetch accounting details
        const detailsEndpoint =
          type === 'Case'
            ? `${url}${URL.ACCOUNTING_DETAILS_BY_CASEID}${contentItemId}`
            : `${url}${URL.ACCOUNTING_DETAILS_BY_LICENSEID}${contentItemId}`;
        const detailsResponse = await GET_DATA({ url: detailsEndpoint });
        const details = detailsResponse.status ? detailsResponse?.data?.data || [] : [];

        return { details, titles };
      } else {
        ToastService.show(TEXTS.errors.noInternet);
        return { details: [], titles: [] };
      }
    } catch (error) {
      if (error instanceof Error) {
        recordCrashlyticsError('Error in fetchAccountingDetails:', error);
        console.error('Error in fetchAccountingDetails:', error.message);
      } else {
        recordCrashlyticsError('Error in fetchAccountingDetails:', error);
        console.error('Error in fetchAccountingDetails:', error);
      }
      return { details: [], titles: [] };
    }
  },
};
