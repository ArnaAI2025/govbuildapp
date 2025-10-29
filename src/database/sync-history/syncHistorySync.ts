import { CASE, TAB, TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';
import { insertSyncHistoryData, updateSyncHistory } from './syncHistoryDAO';

export const updateOfflineHistoryIfIdExist = async (
  type: string,
  itemId: string,
  itemSubId: string = '',
  itemName: string,
  updateDate: string,
  subTypeTitle: string,
  itemType: string,
) => {
  try {
    const db = await getDatabase();

    if (type === TAB) {
      const tableName = itemName === CASE ? TABLES.CASES : TABLES.LICENSE;

      const response = await db.getAllAsync(`SELECT * FROM ${tableName} WHERE contentItemId=?`, [
        itemId,
      ]);
      if (response.length === 0)
        throw new Error(`No record found in ${tableName} for contentItemId: ${itemId}`);

      const resultSet = await db.getAllAsync(
        `SELECT * FROM ${TABLES.SYNC_HISTORY} WHERE itemId = ? AND itemSubId=?`,
        [itemId, itemSubId],
      );

      if (resultSet.length === 0) {
        await insertSyncHistoryData(
          type,
          itemId,
          itemSubId,
          response[0]?.displayText,
          updateDate,
          subTypeTitle,
          itemName === CASE ? response[0]?.caseType : response[0]?.licenseType,
          itemName,
        );
      } else {
        await updateSyncHistory(
          type,
          itemId,
          itemSubId,
          response[0]?.displayText,
          updateDate,
          subTypeTitle,
          itemName === CASE ? response[0]?.caseType : response[0]?.licenseType,
        );
      }
    } else {
      const resultSet = await db.getAllAsync(
        `SELECT * FROM ${TABLES.SYNC_HISTORY} WHERE itemId = ? AND itemSubId =?`,
        [itemId, ''],
      );
      if (resultSet.length === 0) {
        await insertSyncHistoryData(
          type,
          itemId,
          itemSubId,
          itemName,
          updateDate,
          subTypeTitle,
          itemType,
          type,
        );
      } else {
        await updateSyncHistory(
          type,
          itemId,
          itemSubId,
          itemName,
          updateDate,
          subTypeTitle,
          itemType,
        );
      }
    }
  } catch (error) {
    console.error('Error updating history if ID exists:', error);
  }
};
