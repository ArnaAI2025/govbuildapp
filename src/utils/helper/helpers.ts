import moment from 'moment';
import uuid from 'react-native-uuid';
import { Alert, Linking, Platform } from 'react-native';
import { COLORS as COLORSCODE } from '../../theme/colors';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';

export const formatDate = (value?: string, format: string = 'YYYY-MM-DD'): string => {
  if (!value) return '';
  return moment(value).format(format);
};
export const parseAndFormatDate = (value?: string, format: string = 'YYYY-MM-DD'): string => {
  if (!value) return '';

  // Try to parse in a safe way
  const date = moment(
    value,
    [
      moment.ISO_8601, // handles "2025-09-24T23:23:32+05:30"
      'ddd MMM DD YYYY HH:mm:ss [GMT]Z', // handles "Wed Sep 24 2025 23:23:32 GMT+0530"
    ],
    true,
  ); // true = strict parsing

  return date.isValid() ? date.format(format) : value;
};

export const formatUTCDate = (value?: string, format: string = 'YYYY-MM-DD'): string => {
  if (!value) return '';
  return moment.utc(value).format(format);
};
export const formatAllTypesDate = (value?: string, format: string = 'YYYY-MM-DD'): string => {
  if (!value) return '';

  const parsedDate = moment(value, [
    moment.ISO_8601, // handles '2026-11-30T00:00:00'
    'MM/DD/YYYY hh:mm:ss A', // handles '7/15/2025 12:00:00 AM'
    'MM/DD/YYYY', // in case time is not there
    'MM/DD/YYYY hh:mm A', // fallback
    'YYYY-MM-DD', // fallback
  ]);

  return parsedDate.isValid() ? parsedDate.format(format) : '';
};

export const formatToYYYYMMDD = (date: string | Date | null | undefined): string | null => {
  if (!date) return null; // Handle undefined or null input

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return null; // Handle invalid date

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
export const formatExpectedDate = (rawDate?: string): string => {
  if (!rawDate) return '';
  return moment(rawDate, 'M/D/YYYY hh:mm:ss A').format('DD-MM-YYYY');
};
export const changeHttpsToHttp = (url: string): string => {
  return url.replace('https://', 'http://');
};

export const maskedEmail = (email: string) =>
  email.replace(/^(.)(.*)(@.*)\.(.*)$/, (match, p1, p2, p3, p4) => {
    return p1 + '*'.repeat(p2.length) + '@' + '*'.repeat(p3.length - 1) + '.' + p4;
  });

export const cleanCoordinateInput = (value: string): string => {
  // Remove all characters except digits, dot, and minus
  let cleaned = value.replace(/[^0-9.-]/g, '');

  // Allow only one `-` at the start
  if (cleaned.includes('-')) {
    cleaned = '-' + cleaned.replace(/-/g, '');
  }

  // Allow only one `.`
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
};

export function createFullAddress(
  street: string,
  city: string,
  state: string,
  zip: string,
): string {
  const parts: string[] = [street.trim(), city.trim(), `${state.trim()} ${zip.trim()}`];
  return parts.filter(Boolean).join(', ');
}

export const encryptWithBase64 = (data: any): string => {
  return btoa(JSON.stringify(data));
};

export const openWifiSettings = () => {
  if (Platform.OS === 'ios') {
    return Linking.openURL('App-Prefs:WIFI');
  } else if (Platform.OS === 'android') {
    return Linking.sendIntent('android.settings.WIFI_SETTINGS');
  }
};

export const replaceNonNumber = (data: string): string => {
  if (!data) return '';
  return data.replace(/[^0-9]/g, '');
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const sortData = <
  T extends {
    id: string;
    displayText: string;
  },
>(
  data: T[],
): T[] => data.sort((a, b) => a.displayText.localeCompare(b.displayText));

export function convertTime(date: string | null): string {
  if (date && date !== '') {
    return moment(date).format('hh:mm A');
  } else {
    return moment().format('hh:mm A');
  }
}

// Convert date into the UTC
export function convertTimeInUTC(date: string | null): string {
  if (date && date !== '') {
    return moment.utc(date).format('hh:mm A');
  } else {
    return moment().format('hh:mm A');
  }
}

export function convertDate(date: moment.MomentInput) {
  if (date != null && date !== '') {
    return moment(date).format('YYYY-MM-DD');
  } else {
    return '';
  }
}
export const formatToTwoDecimal = (value: number | string | null | undefined): string => {
  const numericValue = Number(value);

  if (isNaN(numericValue)) {
    return '0.00';
  }

  return numericValue.toFixed(2);
};

export function convertDateFormat(date: moment.MomentInput) {
  if (date != null && date !== '') {
    return moment(date).format('MM/DD/YYYY hh:mm:ss A');
  } else {
    return '';
  }
}

export const convertDateToISO = (dateObj: moment.MomentInput) => {
  return moment(dateObj).toISOString();
};

export const convertFrom24To12Format = (time24: string): string => {
  if (time24 && time24.trim() !== '') {
    const formattedTime = moment(time24, 'HH:mm').format('h:mm A');
    return formattedTime;
  } else {
    return '';
  }
};

export function formatDateYearMD(dateString: string) {
  if (dateString != null && dateString != '') {
    return moment(dateString, 'YYYY/MM/DD').format('yyyy-MM-dd');
  } else {
    return '';
  }
}

export function convertTime24Hours(date: string): string {
  if (!date || date.trim() === '') {
    return '';
  }

  const formats = ['MM/DD/YYYY HH:mm', 'MM-DD-YYYY HH:mm', 'YYYY-MM-DD HH:mm', moment.ISO_8601];

  const parsedDate = moment(date, formats, true);

  if (!parsedDate.isValid()) {
    return 'Invalid Date';
  }

  return parsedDate.format('HH:mm');
}

export function getTimeDuration(start_time: string, end_time: string): number {
  if (!start_time || !end_time) {
    return 0;
  }

  const format = 'YYYY-MM-DD HH:mm'; // fixed to match input
  const startTime = moment(start_time, format, true);
  const endTime = moment(end_time, format, true);

  if (!startTime.isValid() || !endTime.isValid()) {
    return 0;
  }

  const durationInMinutes = endTime.diff(startTime, 'minutes');

  return isNaN(durationInMinutes) ? 0 : durationInMinutes;
}

// export const convertStringToBool = (
//   value: string | boolean | null | undefined
// ): boolean => {
//   if (value === "true" || value === true) {
//     return true;
//   }
//   if (value === "false" || value === false) {
//     return false;
//   }
//   return false;
// };

export const convertStringToBool = (
  value: string | boolean | number | null | undefined,
): boolean => {
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return false;
};

/**
 * Calculates the difference in hours between two times and compares it to a default threshold.
 * @param start_time - Start time as a string (e.g., "MM/DD/YYYY HH:mm")
 * @param end_time - End time as a string (e.g., "MM/DD/YYYY HH:mm")
 * @param defaultTime - Default time in minutes (e.g., 120)
 * @returns Number of hours if the difference exceeds the default time; otherwise 0
 */
export function getTimeDifference(
  start_time: string,
  end_time: string,
  defaultTime: number,
): number {
  if (!start_time || !end_time || !defaultTime) return 0;

  const format = 'YYYY-MM-DD HH:mm';
  const startTime = moment(start_time, format, true);
  const endTime = moment(end_time, format, true);

  if (!startTime.isValid() || !endTime.isValid()) {
    return 0;
  }

  const timeDiffInHours = endTime.diff(startTime, 'hours', true); // fractional hours
  const defaultTimeInHours = defaultTime / 60;

  if (timeDiffInHours > defaultTimeInHours) {
    return defaultTimeInHours;
  }

  return 0;
}
export const show2Decimals = (value: string | number | null) => {
  if (value != null) {
    let temp = parseFloat(value?.toString()).toFixed(2);

    return temp;
  } else {
    return 0;
  }
};

export const getDigitCount = (value: string) => {
  return value.replace(/\D/g, '').length; // removes all non-digits
};

export const formatToTwoDecimals = (value: string | null | undefined) => {
  if (!value || isNaN(Number(value))) {
    return '';
  }
  return parseFloat(value).toFixed(2);
};

export function generateUniqueID() {
  return uuid.v4();
}
export const generateUID = () => {
  return Math.random().toString().slice(2, 8); // 6-digit numeric ID
};

export function getNewUTCDate() {
  return moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
}
export function getNewUTCDateTime() {
  return moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}
export function getNewUTCDateFormate() {
  // return moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS");
  return String(new Date().toISOString());
}
export const openMaps = async (location: string | undefined, isNetworkAvailable: boolean) => {
  if (!location) return;
  try {
    if (isNetworkAvailable) {
      let url = '';
      if (Platform.OS === 'ios') {
        url = `maps://?q=${encodeURIComponent(location)}`;
      } else {
        url = `geo:0,0?q=${encodeURIComponent(location)}`;
      }
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location,
        )}`;
        await Linking.openURL(browserUrl);
      }
    } else {
      ToastService.show('You are in offline mode', COLORSCODE.WARNING_ORANGE);
      return;
    }
  } catch (error) {
    recordCrashlyticsError('Error opening maps:', error);
    console.error('Error opening maps:', error);
    Alert.alert('Error', 'Unable to open maps. Please try again.');
  }
};

export const doCall = async (phone: string) => {
  // Clean up the number
  const cleanedNumber = phone.replace(/[^0-9+]/g, '');
  const phoneNumber = Platform.OS === 'ios' ? `telprompt:${cleanedNumber}` : `tel:${cleanedNumber}`;
  try {
    const supported = await Linking.canOpenURL(phoneNumber);

    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      // Directly try openURL as fallback (some Android devices return false incorrectly)
      try {
        await Linking.openURL(phoneNumber);
      } catch {
        Alert.alert('Error', 'Phone number is not available on this device');
      }
    }
  } catch (err) {
    console.log('Error while trying to make a call:', err);
    Alert.alert('Error', 'Unable to initiate call');
  }
};

export function formatToCustomDateTimeUTC(dateString: moment.MomentInput) {
  if (!dateString) return '';
  return moment(dateString).format('M/D/YYYY h:mm:ss A');
}

// Utility function to check edit permissions
export const canEditCase = (
  isEditable: boolean,
  viewOnlyAssignUsers: boolean | undefined,
  assignedUsers: string[] | undefined,
  isMyCaseOnly: boolean | undefined,
) => {
  isEditable && (!viewOnlyAssignUsers || assignedUsers?.includes((isMyCaseOnly ?? '').toString()));
};

export const StatusColorCodes = (status: string): string => {
  switch (status) {
    case 'Closed':
      return COLORSCODE.CLOSED;
    case 'Close':
    case 'Denied':
      return COLORSCODE.DENIED;
    case 'Draft':
      return COLORSCODE.DRAFT;
    case 'Expired':
      return COLORSCODE.EXPIRED;
    case 'Expiration':
    case 'Expired without Inspections':
      return COLORSCODE.EXPIRED;
    case 'Issued':
      return COLORSCODE.ISSUED;
    case 'License':
      return COLORSCODE.LICENSE;
    case 'Pending':
    case 'Pending Payment':
      return COLORSCODE.PENDING;
    case 'Approved':
      return COLORSCODE.APPROVED;
    case 'Approved with Conditions':
    case 'Approved - with - Conditions':
    case 'Approved Pending Contractors Information':
    case 'Approved Pending Contractors Information & Payment':
    case 'Completed':
      return COLORSCODE.APPROVED;
    case 'Finaled':
    case 'Cycle Complete':
      return COLORSCODE.APPROVED;
    case 'Submitted':
      return COLORSCODE.SUBMITTED;
    case 'In Progress':
      return COLORSCODE.InProgress;
    case 'On Hold':
      return COLORSCODE.WARNING_ORANGE;
    case 'Meeting Scheduled':
    case 'Meeting Requested':
    case 'Meeting Complete':
    case 'Rescheduling Required':
      return COLORSCODE.STEEL_BLUE;
    case 'Revoked':
      return COLORSCODE.RED;
    case 'Withdrawn':
      return COLORSCODE.GRAY_DARK;
    case 'Application Incomplete':
    case 'Completeness Review':
    case 'Re-Submittal':
      return COLORSCODE.ORANGE;
    case 'Suspended':
    case 'Canceled':
      return COLORSCODE.DARK_RED;
    case 'In Review':
    case 'Under Review':
    case 'Plans Coordinator Review':
    case 'Plans Coordinator Review Complete':
      return COLORSCODE.INDIGO;
    case 'Correction Required':
    case 'Corrections Required':
    case 'Revision Requested':
    case 'Recheck':
    case 'Issues Found':
      return COLORSCODE.LIGHT_BROWN;
    case 'Training case status':
    case 'Demo Case Status':
    case 'Demo 22':
      return COLORSCODE.TEAL;
    case 'Not Started':
      return COLORSCODE.BLACK;
    case 'Read Only':
    case 'Waiting on Notary':
    case 'Received Notarization':
      return COLORSCODE.GRAY_HEADING;
    case 'Done':
    case 'Active':
      return COLORSCODE.BLACK;
    case 'Active Now':
      return COLORSCODE.SUCCESS_GREEN;
    case 'Failed':
    case 'Violation Still Exists (VSE)':
      return COLORSCODE.ERROR;
    case 'Corrected By Owner (CBO)':
      return COLORSCODE.CART;
    case 'Certificate of Occupancy':
      return COLORSCODE.BRIGHT_BLUE;
    case 'Payment Requested':
      return COLORSCODE.STANDARAD_ORANGE;
    case 'Not Now':
      return COLORSCODE.NOT_NOW;
    case 'Pay Later':
      return COLORSCODE.PAY_LATER;
    case 'test':
    case 'Test News':
    case 'test case types 1':
    case 'Advanced':
    case '10/20new license':
    case 'Decline':
    case 'Pass':
    case 'New form status05/25':
      return COLORSCODE.NEW_FORM_STATUS;
    default:
      return COLORSCODE.PENDING; // fallback
  }
};

export function sortArrayByName(arrayToSort: any[]): any[] {
  return arrayToSort.sort((a, b) => {
    const firstNameA = a.firstName.toLowerCase();
    const firstNameB = b.firstName.toLowerCase();
    if (firstNameA < firstNameB) return -1;
    if (firstNameA > firstNameB) return 1;

    // If first names are the same, compare last names (ignoring case)
    const lastNameA = a.lastName.toLowerCase();
    const lastNameB = b.lastName.toLowerCase();
    if (lastNameA < lastNameB) return -1;
    if (lastNameA > lastNameB) return 1;
    return 0;
  });
}

export function sortByKey<T>(array: T[], key: keyof T, secondaryKey?: keyof T): T[] {
  return array.sort((a, b) => {
    const aVal = (a[key] ?? '').toString().toLowerCase();
    const bVal = (b[key] ?? '').toString().toLowerCase();

    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;

    if (secondaryKey) {
      const aSec = (a[secondaryKey] ?? '').toString().toLowerCase();
      const bSec = (b[secondaryKey] ?? '').toString().toLowerCase();

      if (aSec < bSec) return -1;
      if (aSec > bSec) return 1;
    }

    return 0;
  });
}
// helper to normalize booleans
export const normalizeBool = (val: any): boolean => {
  if (val === true || val === '1' || val === 1) return true;
  return false;
};

export function replaceAllDateFormat(DateFormates: any, stringToReplace: any, Source: any) {
  var temp = Source;

  if (temp != undefined || temp != null) {
    for (var i = 0; i < DateFormates.length; i++) {
      var index = temp.indexOf(DateFormates[i]);

      while (index != -1) {
        temp = temp.replace(DateFormates[i], stringToReplace);

        index = temp.indexOf(DateFormates[i]);
      }
    }
  }

  return temp;
}

export const DateFormates = [
  'MM-dd-yyyy',
  'Dd-MM-yyyy',
  'MM-dd-yy',
  'Dd-MM-yy',
  'MM/dd/yyyy',
  'Dd/MM/yyyy',
  'M-D-Y',
  'M/D/YY',
  'M-D-YY',
  'MMDDYY',
  'DDMMYY',
  'MonDDYY',
  'DDMonYY',
  'MM/dd/yy',
  'Dd/MM/yy',
];

// helper: makes every value safe for SQLite
export const toSqlVal = (v: any): string | number | null => {
  if (v === undefined) return null; // SQLite NULL
  if (typeof v === 'boolean') return v ? 1 : 0; // store booleans as 1/0
  return v as string | number; // string, number, Uint8Array OK
};

// Color support for console logs
const RESET = '\x1b[0m';

const COLORS: Record<LogColor, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export type LogColor = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

export function logColor(color: LogColor, ...args: unknown[]): void {
  const colorCode = COLORS[color] || '';
  console.log(colorCode, ...args, RESET);
}

// Named exports for specific colors
export const logRed = (...args: unknown[]) => logColor('red', ...args);
export const logGreen = (...args: unknown[]) => logColor('green', ...args);
export const logYellow = (...args: unknown[]) => logColor('yellow', ...args);
export const logBlue = (...args: unknown[]) => logColor('blue', ...args);
export const logMagenta = (...args: unknown[]) => logColor('magenta', ...args);
export const logCyan = (...args: unknown[]) => logColor('cyan', ...args);
export const logWhite = (...args: unknown[]) => logColor('white', ...args);

//Time ago function
export const getTimeAgo = (dateString: string | Date): string => {
  const now = new Date();
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Time ago function with all the times
export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) {
    return 'just now';
  }
  const intervals: { [key: string]: number } = {
    year: 31536000, // 365 * 24 * 60 * 60
    month: 2592000, // 30 * 24 * 60 * 60
    day: 86400, // 24 * 60 * 60
    hour: 3600, // 60 * 60
    minute: 60,
  };
  for (let key in intervals) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `${value} ${key}${value > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

//Sort folders and files
export function sortFoldersAndFiles(data: any[]) {
  return data.sort((a, b) => {
    const aIsFolder =
      a?.Isfolder === 1 ||
      a?.type?.toLowerCase()?.includes('folder') ||
      a?.type?.toLowerCase()?.includes('comment');
    const bIsFolder =
      b?.Isfolder === 1 ||
      b?.type?.toLowerCase()?.includes('folder') ||
      b?.type?.toLowerCase()?.includes('comment');

    if (aIsFolder && !bIsFolder) return -1; // a first
    if (!aIsFolder && bIsFolder) return 1; // b first
    return 0; // keep order if both are same type
  });
}

export function isNullOrEmpty(value: any) {
  return value === null || value === undefined || value === '';
}
