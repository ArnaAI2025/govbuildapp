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
import { recordCrashlyticsError } from './CrashlyticsService';

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
        recordCrashlyticsError('Task failed:', err);
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
      recordCrashlyticsError('Unexpected error during sync:', error);
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
  setProgress: (progress: number | null) => void,
  setTotal: (total: number) => void,
): Promise<{ success: boolean; errors: string[] }> => {
  // 1. Short-circuit if offline
  if (!isNetworkAvailable) {
    ToastService.show('No network connection. Cannot sync offline items.', COLORS.ORANGE);
    return { success: false, errors: ['No network connection'] };
  }

  // 2. Define tasks with names for better error reporting
  const tasks: { name: string; run: () => Promise<void> }[] = [
    { name: 'Cases', run: () => syncEditCase(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Settings', run: () => syncSettings(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Licenses', run: () => syncEditLicense(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Contacts', run: () => syncContacts(OfflineItemsCount, isNetworkAvailable) },
    {
      name: 'Admin note files',
      run: () => syncAdminNotesFiles(OfflineItemsCount, isNetworkAvailable),
    },
    { name: 'Admin notes', run: () => syncAdminNotes(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Attachments', run: () => syncAttachments(OfflineItemsCount, isNetworkAvailable) },
    {
      name: 'Attached documents',
      run: () => syncAttachedDocs(OfflineItemsCount, isNetworkAvailable),
    },
    { name: 'Form files', run: () => syncFormFiles(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Forms', run: () => syncForms(OfflineItemsCount, isNetworkAvailable) },
    { name: 'Edited forms', run: () => syncEditedForms(OfflineItemsCount, isNetworkAvailable) },
  ];

  setTotal(tasks.length);
  setProgress(0);

  let completed = 0;
  const errors: string[] = [];

  // 3. Run tasks sequentially, but don’t stop the entire sync on one failure
  for (const task of tasks) {
    try {
      await task.run();
    } catch (error: any) {
      const msg = `Failed to sync ${task.name}`;
      errors.push(task.name);
      recordCrashlyticsError(msg, error);
      console.error(msg, error);
    } finally {
      completed += 1;
      const percent = Math.round((completed / tasks.length) * 100);
      setProgress(percent);
    }
  }

  // 4. Reset progress after a short delay
  setTimeout(() => {
    setProgress(null);
  }, 1000);

  // 5. Overall result + user feedback
  if (errors.length > 0) {
    ToastService.show(
      `Sync finished with errors in: ${errors.join(', ')}. Please review and try again.`,
      COLORS.ERROR,
    );
    return { success: false, errors };
  }

  ToastService.show('Offline items synced successfully.', COLORS.SUCCESS_GREEN);
  return { success: true, errors: [] };
};
