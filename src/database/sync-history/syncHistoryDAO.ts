import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import { TAB, TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

// INSERT AND UPDATE SYNC HISTORY FOR CASE
export const insertSyncHistoryData = async (
  type: string,
  itemId: string,
  itemSubId: string,
  itemName: string,
  updateDate: string,
  subTypeTitle: string,
  itemType: string,
  title: string,
): Promise<void> => {
  try {
    const db = await getDatabase();
    const query = `INSERT INTO ${TABLES.SYNC_HISTORY} 
        (type, itemId, itemSubId, itemName, updateDate, subTypeTitle, itemType, title) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const statement = await db.prepareAsync(query);
    await statement.executeAsync(
      type,
      itemId,
      itemSubId,
      itemName,
      updateDate,
      subTypeTitle,
      itemType,
      title,
    );
    console.log('Insert new history data successfully');
  } catch (error) {
    recordCrashlyticsError('Error inserting sync history data:', error);
    console.error('Error inserting sync history data:', error);
  }
};

export const updateSyncHistory = async (
  type: string,
  itemId: string,
  itemSubId: string,
  itemName: string,
  updateDate: string,
  subTypeTitle: string,
  itemType: string,
): Promise<void> => {
  try {
    const db = await getDatabase();

    if (type === TAB) {
      await db.runAsync(
        `UPDATE ${TABLES.SYNC_HISTORY} 
           SET itemName = ?, updateDate = ?, itemType = ? 
           WHERE itemSubId = ? AND itemId = ?`,
        [itemName, updateDate, itemType, itemSubId, itemId],
      );
      console.log('Update SYNC_HISTORY data successfully');
    } else {
      await db.runAsync(
        `UPDATE ${TABLES.SYNC_HISTORY} 
           SET itemName = ?, updateDate = ?, itemType = ? 
           WHERE itemId = ?`,
        [itemName, updateDate, itemType, itemId],
      );
      console.log('Update history data successfully');
    }
  } catch (error) {
    recordCrashlyticsError('Error updating sync history:', error);
    console.error('Error updating sync history:', error);
  }
};

export const getSyncHistory = async () => {
  try {
    const db = await getDatabase();
    const row = db.getAllAsync('SELECT * FROM ' + TABLES.SYNC_HISTORY);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error in getSyncHistory', error);
    console.log('Error in getSyncHistory', error);
  }
};
