import { ToastService } from '../components/common/GlobalSnackbar';
import { COLORS } from '../theme/colors';
import { CaseData } from './interfaces/ICase';

export const checkEmailValidation = (text: string): boolean => {
  const reg =
    /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
  return reg.test(text);
};

// Valid email regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export const isEmpty = (val: any) =>
  val === null || val === undefined || (typeof val === 'string' && val.trim() === '');

export const getFirstErrorMessage = (response: any) => {
  const errors = response;
  if (!errors || typeof errors !== 'object') return null;

  const firstFieldKey = Object.keys(errors)[3];
  const firstFieldErrors = errors[firstFieldKey];

  const firstIndexKey = Object.keys(firstFieldErrors || {})[0];
  return firstFieldErrors?.[firstIndexKey]?.[0] || null;
};

export const validateCaseFields = (
  caseData: CaseData | null,
  isAllowMultipleAddress: boolean,
  setFieldErrors: (errors: {
    number: boolean;
    statusId: boolean;
    caseTypeId: boolean;
    location: boolean;
  }) => void,
) => {
  const errors = {
    number: false,
    statusId: false,
    caseTypeId: false,
    location: false,
  };

  const missingFields = [];

  if (!caseData?.number) {
    errors.number = true;
    missingFields.push('Case Number');
  }
  if (!caseData?.statusId) {
    errors.statusId = true;
    missingFields.push('Case Status');
  }
  if (!caseData?.caseTypeId) {
    errors.caseTypeId = true;
    missingFields.push('Case Type');
  }
  if (!isAllowMultipleAddress && (!caseData?.location || caseData?.location.trim() === '')) {
    errors.location = true;
    missingFields.push('Location');
  }

  setFieldErrors(errors);

  if (missingFields.length > 0) {
    const message = `${missingFields.join(', ')} ${
      missingFields.length === 1 ? 'field is' : 'fields are'
    } required.`;
    ToastService.show(message, COLORS.ERROR);
    return false;
  }

  return true;
};
