import { COLORS } from '../theme/colors';
import { ToastService } from '../components/common/GlobalSnackbar';
import { myCaseAPICall } from '../database/my-case/myCaseSync';
import { TEXTS } from '../constants/strings';
import { syncDropdownListData } from '../database/drop-down-list/dropDownListSync';
import {
  syncAdminNotes,
  syncAdminNotesFiles,
  syncAttachedDocs,
  syncAttachments,
  syncContacts,
  syncEditCase,
  syncEditedForms,
  syncEditLicense,
  syncFormFiles,
  syncForms,
  syncSettings,
} from '../database/sync-offline-to-server/syncOfflineToServerSync';
import { licenseAPICall } from '../database/license/licenseSync';
import { getOtherScreenData } from '../database/other-sections/otherSectionSync';

let cancelSync = false;
export const stopSyncing = () => {
  cancelSync = true;
};

// ONLINE TO OFFLINE
export const syncServerToOfflineDatabase = async (
  onProgressUpdate?: (percentage: number) => void,
): Promise<string> => {
  cancelSync = false; // reset at start

  const tasks: Array<() => Promise<void>> = [
    () => syncDropdownListData(),
    () => getOtherScreenData(),
    () => myCaseAPICall(),
    () => licenseAPICall(),
  ];

  const totalTasks = tasks.length;
  let completedTasks = 0;

  try {
    for (const task of tasks) {
      // BREAK the loop if logout happened
      if (cancelSync) {
        console.log(' Sync stopped due to logout.');
        return 'Sync cancelled'; // exit function completely
      }

      try {
        await task();
      } catch (err) {
        console.warn('Task failed:', err);
      }
      completedTasks++;
      const percentage = Math.round((completedTasks / totalTasks) * 100);

      if (!cancelSync) {
        onProgressUpdate?.(percentage);
      }
    }

    if (cancelSync) {
      console.log(' Sync cancelled after partial run.');
      return 'Sync cancelled';
    }

    if (completedTasks < totalTasks) {
      ToastService.show('Some data failed to sync. Please try again.', COLORS.RED);
      return 'Partial sync failure.';
    }
    const successMessage = TEXTS.offlineSync.SuccessMsg;
    ToastService.show(successMessage, COLORS.SUCCESS_GREEN);
    return successMessage;
  } catch (error: unknown) {
    if (!cancelSync) {
      console.error('Unexpected error during sync:', error);
      ToastService.show('Sync failed. Please try again.', COLORS.RED);
    }
    return 'Offline sync failed.';
  }
};

// OFFLINE TO ONLINE
export const syncOfflineToServerDatabase = async (
  OfflineItemsCount: () => void,
  isNetworkAvailable: boolean,
  setProgress: (progress: number) => void,
  setTotal: (total: number) => void,
) => {
  const tasks = [
    () => syncEditCase(OfflineItemsCount, isNetworkAvailable),
    () => syncSettings(OfflineItemsCount, isNetworkAvailable),
    () => syncEditLicense(OfflineItemsCount, isNetworkAvailable),
    () => syncContacts(OfflineItemsCount, isNetworkAvailable),
    () => syncAdminNotesFiles(OfflineItemsCount, isNetworkAvailable),
    () => syncAdminNotes(OfflineItemsCount, isNetworkAvailable),
    () => syncAttachments(OfflineItemsCount, isNetworkAvailable),
    () => syncAttachedDocs(OfflineItemsCount, isNetworkAvailable),
    () => syncFormFiles(OfflineItemsCount, isNetworkAvailable),
    () => syncForms(OfflineItemsCount, isNetworkAvailable),
    () => syncEditedForms(OfflineItemsCount, isNetworkAvailable),
  ];

  setTotal(tasks.length);
  let completed = 0;

  for (const task of tasks) {
    await task();
    completed++;
    setProgress(Math.round((completed / tasks.length) * 100));
  }

  setTimeout(() => {
    setProgress(null);
  }, 1000);
  return true;
};
