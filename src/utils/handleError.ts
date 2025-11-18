import { ToastService } from '../components/common/GlobalSnackbar';
import { TEXTS } from '../constants/strings';
import { COLORS } from '../theme/colors';
import type { AxiosError } from 'axios';
import { getFirstErrorMessage } from './validations';
export const handleError = (error: AxiosError | any) => {
  if (error?.message == 'Network Error') {
    ToastService.show('Internet not available', COLORS.WARNING_ORANGE);
  }
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data) {
          const message = getFirstErrorMessage(data);
          if (message) {
            ToastService.show(message, COLORS.ERROR);
          } else {
            ToastService.show(data?.message || TEXTS.apiServiceFile.badRequest, COLORS.ERROR);
          }
        }
        break;
      case 403:
        ToastService.show(TEXTS.apiServiceFile.notHavePermission, COLORS.ERROR);
        break;
      case 500:
        ToastService.show(TEXTS.apiServiceFile.internalServerError, COLORS.ERROR);
        break;
      case 404:
        ToastService.show(TEXTS.apiServiceFile.notFound, COLORS.ERROR);
        break;
      default:
        ToastService.show(data?.title || 'Server error occurred.', COLORS.ERROR);
    }
  } else if (error.request) {
    console.log('error.request--->', error.request);
    // ToastService.show(TEXTS.apiServiceFile.networkIssue, COLORS.WARNING_ORANGE);
  } else {
    ToastService.show(TEXTS.apiServiceFile.unexpectedErrorOccurred, COLORS.ERROR);
  }
};
