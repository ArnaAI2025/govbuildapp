import { TABLES } from '../database/DatabaseConstants';
import { getDatabase } from '../database/DatabaseService';
import { COLORS } from '../theme/colors';
import { ToastService } from '../components/common/GlobalSnackbar';
import { processBatch } from '../database/sync-offline-to-server/syncOfflineToServerSync';
import { syncing } from '../constants/data';
import { recordCrashlyticsError } from '../services/CrashlyticsService';

// Interface for sync queue task
export interface SyncQueueTask {
  id: number;
  type: string;
  data: any;
  status: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

// Enum for supported sync types
export enum SyncType {
  CASE = 'case',
  SETTINGS = 'settings',
  ADMIN_NOTES = 'admin_notes',
  LICENSE = 'license',
  INSPECTION = 'inspection',
  CONTACTS = 'Contacts',

  FORM = 'form',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
}

export class SyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncError';
  }
}

// Retry logic with exponential backoff
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = syncing.MAX_RETRIES,
  baseDelay: number = syncing.BASE_DELAY_MS,
): Promise<T> => {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// Main sync queue processor
export const processSyncQueue = async (offlineItemsCount: () => void) => {
  const syncTypes = Object.values(SyncType);
  const allTasks: SyncQueueTask[] = [];

  // Fetch all pending tasks in FIFO order
  for (const type of syncTypes) {
    const tasks = await fetchPendingSyncTasks(type);
    allTasks.push(...tasks);
  }

  if (allTasks.length === 0) {
    ToastService.show('No tasks to sync.', COLORS.SUCCESS_GREEN);
    return;
  }

  // Sort tasks by created_at to ensure FIFO
  allTasks.sort((a, b) => a.created_at.localeCompare(b.created_at));

  await processBatch(allTasks, offlineItemsCount);
};

// Add task to sync queue
export const addToSyncQueue = async (type: string, data: any): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(`INSERT INTO ${TABLES.SYNC_QUEUE} (type, data, status) VALUES (?, ?, ?)`, [
      type,
      JSON.stringify(data),
      'pending',
    ]);
  } catch (error) {
    throw new SyncError(
      `Error adding to sync queue: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Fetch pending sync tasks
export const fetchPendingSyncTasks = async (
  type: string,
  status: string = 'pending',
): Promise<SyncQueueTask[]> => {
  const db = getDatabase();
  try {
    const rows = (await db.getAllAsync(
      `SELECT * FROM ${TABLES.SYNC_QUEUE} WHERE type = ? AND status = ? ORDER BY created_at ASC`,
      [type, status],
    )) as SyncQueueTask[];
    return rows.map((row) =>
      row && typeof row === 'object' ? { ...row, data: JSON.parse((row as any).data) } : row,
    );
  } catch (error) {
    throw new SyncError(
      `Error fetching sync tasks: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getPendingSyncTasksCount = async (): Promise<number> => {
  const db = getDatabase();
  try {
    const [{ count }] = (await db.getAllAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${TABLES.SYNC_QUEUE} WHERE status = ?`,
      ['pending'],
    )) as { count: number }[];

    return count;
  } catch (error) {
    throw new SyncError(
      `Error counting pending sync tasks: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const updateSyncTaskStatus = async (
  id: number,
  status: string,
  retryCount?: number,
): Promise<void> => {
  const db = getDatabase();
  try {
    console.log(`Updating task ID: ${id} to status: ${status}, retryCount: ${retryCount ?? 0}`);
    await db.runAsync(
      `UPDATE ${TABLES.SYNC_QUEUE} SET status = ?, retry_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, retryCount ?? 0, id],
    );
    console.log('updated successfully.');
  } catch (error) {
    recordCrashlyticsError('updateSyncTaskStatus failed:', error);
    console.error('updateSyncTaskStatus failed:', error);
    throw new SyncError(
      `Error updating sync task: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Handle sync task failure
export const handleSyncFailure = async (taskId: number, retryCount: number, type: string) => {
  await updateSyncTaskStatus(taskId, 'failed', retryCount + 1);
  if (retryCount >= 3) {
    ToastService.show(`Failed to sync ${type} after retries.`, COLORS.ERROR);
  }
};

export const addsetAlertToSyncQueue = async (type: string, data: any): Promise<void> => {
  const db = getDatabase();
  try {
    // Check for existing pending task with the same contentItemId
    const existingTask = (await db.getFirstAsync(
      `SELECT * FROM ${TABLES.SYNC_QUEUE} WHERE type = ? AND status = ? AND JSON_EXTRACT(data, '$.contentItemId') = ?`,
      [type, 'pending', data.contentItemId],
    )) as SyncQueueTask;

    if (existingTask) {
      // Parse existing task data
      const existingData = JSON.parse(existingTask.data);
      // Merge new data, preserving isEdit: false for new records
      const updatedData = {
        ...existingData,
        ...data,
        comment: data.comment ?? existingData.comment,
        commentIsAlert: data.commentIsAlert ?? existingData?.commentIsAlert ?? false,
        isLocallyEdited: (existingData?.isLocallyEdited || data?.isEdit) ?? false, // Track local edits
        isEdit: existingData.isEdit ?? false, // Preserve isEdit: false for new records
      };

      // Update the existing sync queue entry
      await db.runAsync(`UPDATE ${TABLES.SYNC_QUEUE} SET data = ? WHERE id = ?`, [
        JSON.stringify(updatedData),
        existingTask.id,
      ]);
      console.log(`Updated sync queue task ${existingTask.id} with new data:`, updatedData);
    } else {
      // Insert new sync queue entry
      const newData = {
        ...data,
        isLocallyEdited: data.isEdit ?? false, // Track if the record was edited locally
        isEdit: data?.isEdit, // Already added records always have isEdit: true
      };
      await db.runAsync(`INSERT INTO ${TABLES.SYNC_QUEUE} (type, data, status) VALUES (?, ?, ?)`, [
        type,
        JSON.stringify(newData),
        'pending',
      ]);
      console.log(`Added new sync queue task for ${type}:`, newData);
    }
  } catch (error) {
    throw new SyncError(
      `Error adding to sync queue: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const logDbError = (functionName: string, error: unknown) => {
  console.error(`DB Error in ${functionName}:`, error instanceof Error ? error.message : error);
};
