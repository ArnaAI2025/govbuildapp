import { recordCrashlyticsError } from '../../services/CrashlyticsService';
import type { SelectionListData, TeamMemberData } from '../../utils/interfaces/offline/IOffllineCase';
import { TABLES } from '../DatabaseConstants';
import { getDatabase } from '../DatabaseService';

export const insertBillingStatus = async (
  data: SelectionListData,
  isCase: boolean,
): Promise<void> => {
  await updateIfId(data.displayText, data.id, isCase, TABLES.BILLING_STATUS_TABLE_NAME);
};

export const insertDepartmentMemberList = async (data: {
  displayText: string;
  id: string;
}): Promise<void> => {
  const db = getDatabase();
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM ${TABLES.DEPARTMENT_MEMBER_LIST} WHERE id = ?`,
      [data.id],
    );
    if (data.displayText) {
      if (rows.length === 0) {
        await db.runAsync(
          `INSERT OR REPLACE INTO ${TABLES.DEPARTMENT_MEMBER_LIST} (displayText, id) VALUES (?, ?)`,
          [data.displayText, data.id],
        );
      } else {
        await db.runAsync(
          `UPDATE ${TABLES.DEPARTMENT_MEMBER_LIST} SET displayText = ? WHERE id = ?`,
          [data.displayText, data.id],
        );
      }
    }
  } catch (error) {
    recordCrashlyticsError('Error inserting department member:', error);
    console.error('Error inserting department member:', error);
    throw error;
  }
};

export const insertType = async (data: SelectionListData, isCase: boolean): Promise<void> => {
  const isMultipleLocation = data?.content?.CaseType?.IsAllowMutlipleAddress?.Value ?? false;

  await updateTypeIfId(
    data.displayText,
    data.id,
    isCase,
    TABLES.TYPE_TABLE_NAME,
    isMultipleLocation,
  );
};

export const insertRenewalStatus = async (
  data: SelectionListData,
  isCase: boolean,
): Promise<void> => {
  await updateIfId(data.displayText, data.id, isCase, TABLES.RENEWAL_STATUS);
};

export const insertStatus = async (data: SelectionListData, isCase: boolean): Promise<void> => {
  await updateStatusIfId(data, isCase);
};

export const insertSubCaseType = async (
  data: SelectionListData,
  isCase: boolean,
): Promise<void> => {
  await updateIfId(data.displayText, data.id, isCase, TABLES.SUBTYPE_TABLE_NAME);
};

export const insertDocumentTypes = async (
  data: SelectionListData,
  isCase: boolean,
): Promise<void> => {
  await updateIfId(data.displayText, data.id, isCase, TABLES.DOC_TYPE_TABLE_NAME);
};

export const insertUsers = async (data: {
  userName: string;
  userId: string;
  isCase: boolean;
}): Promise<void> => {
  await updateIfId(data.userName, data.userId, data.isCase, TABLES.USERS_TABLE_NAME);
};

export const insertTeamMembers = async (data: TeamMemberData, isCase: boolean): Promise<void> => {
  await updateIfIdTeam(data, isCase, TABLES.TEAM_MEMBER_TABLE_NAME);
};

export const insertTags = async (data: SelectionListData, isCase: boolean): Promise<void> => {
  await updateIfId(data.displayText, data.id, isCase, TABLES.TAGS);
};

export const fetchBillingStatus = async (isCase: boolean): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      `SELECT * FROM ${TABLES.BILLING_STATUS_TABLE_NAME} WHERE isCase = ?`,
      [isCase],
    );
  } catch (error) {
    recordCrashlyticsError('Error fetching billing status:', error);
    console.error('Error fetching billing status:', error);
    throw error;
  }
};

export const fetchDepartmentMemberList = async (): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.DEPARTMENT_MEMBER_LIST}`);
  } catch (error) {
    recordCrashlyticsError('Error fetching department member list:', error);
    console.error('Error fetching department member list:', error);
    throw error;
  }
};

export const fetchCaseType = async (isCase: boolean): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.TYPE_TABLE_NAME} WHERE isCase = ?`, [
      isCase,
    ]);
  } catch (error) {
    recordCrashlyticsError('Error fetching case type:', error);
    console.error('Error fetching case type:', error);
    throw error;
  }
};

export const fetchRenewalStatus = async (): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.RENEWAL_STATUS} WHERE isCase = ?`, [false]);
  } catch (error) {
    recordCrashlyticsError('Error fetching renewal status:', error);
    console.error('Error fetching renewal status:', error);
    throw error;
  }
};

export const fetchStatus = async (isCase: boolean): Promise<any[]> => {
  try {
    const db = getDatabase();
    const row = await db.getAllAsync(`SELECT * FROM ${TABLES.STATUS_TABLE_NAME} WHERE isCase = ?`, [
      isCase,
    ]);
    return row;
  } catch (error) {
    recordCrashlyticsError('Error fetching status:', error);
    console.error('Error fetching status:', error);
    throw error;
  }
};

export const fetchSubCaseType = async (isCase: boolean): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.SUBTYPE_TABLE_NAME} WHERE isCase = ?`, [
      isCase,
    ]);
  } catch (error) {
    recordCrashlyticsError('Error fetching sub case type:', error);
    console.error('Error fetching sub case type:', error);
    throw error;
  }
};

export const fetchSubCaseTypeAndSet = async (
  setData: (data: any[]) => void,
  isCase: boolean,
): Promise<void> => {
  try {
    const rows = await fetchSubCaseType(isCase);
    setData(rows);
  } catch (error) {
    recordCrashlyticsError('Error fetching subtype data:', error);
    console.error('Error fetching subtype data:', error);
    throw error;
  }
};

export const fetchDocumentTypesFromDb = async (isCase: boolean): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.DOC_TYPE_TABLE_NAME} WHERE isCase = ?`, [
      isCase,
    ]);
  } catch (error) {
    recordCrashlyticsError('Error fetching document types:', error);
    console.error('Error fetching document types:', error);
    throw error;
  }
};

export const fetchUsers = async (setData?: (data: any[]) => void): Promise<any[]> => {
  const db = getDatabase();
  try {
    const rows = await db.getAllAsync(`SELECT * FROM ${TABLES.USERS_TABLE_NAME}`);
    if (setData) setData(rows);
    return rows;
  } catch (error) {
    recordCrashlyticsError('Error fetching users:', error);
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchTeamMembers = async (): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.TEAM_MEMBER_TABLE_NAME}`);
  } catch (error) {
    recordCrashlyticsError('Error fetching team members:', error);
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const fetchTags = async (isCase: boolean): Promise<any[]> => {
  const db = getDatabase();
  try {
    return await db.getAllAsync(`SELECT * FROM ${TABLES.TAGS} WHERE isCase = ?`, [isCase]);
  } catch (error) {
    recordCrashlyticsError('Error fetching tags:', error);
    console.error('Error fetching tags:', error);
    throw error;
  }
};

const updateIfId = async (
  displayText: string,
  id: string,
  isCase: boolean,
  tableName: string,
): Promise<void> => {
  if (!displayText) return;
  const db = getDatabase();
  try {
    const rows = await db.getAllAsync(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    if (rows.length === 0) {
      await storeData(displayText, id, isCase, tableName);
    } else {
      await updateData(displayText, id, tableName);
    }
  } catch (error) {
    recordCrashlyticsError(`Error updating or storing data in ${tableName}:`, error);
    console.error(`Error updating or storing data in ${tableName}:`, error);
    throw error;
  }
};

const updateIfIdTeam = async (
  data: TeamMemberData,
  isCase: boolean,
  tableName: string,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${tableName} (
      firstName TEXT,
      lastName TEXT,
      userId TEXT PRIMARY KEY,
      isCase INTEGER,
      contentItemId TEXT
    )`);

    if (!data?.userId) {
      console.warn('Skipping team member with missing userId:', data);
      return;
    }

    const rows = await db.getAllAsync(`SELECT * FROM ${tableName} WHERE userId = ?`, [data.userId]);

    if (rows.length === 0) {
      await db.runAsync(
        `INSERT OR REPLACE INTO ${tableName} (firstName, lastName, userId, isCase, contentItemId) VALUES (?, ?, ?, ?, ?)`,
        [data.firstName, data.lastName, data.userId, isCase ? 1 : 0, data.contentItemId],
      );
    } else {
      await db.runAsync(
        `UPDATE ${tableName} SET firstName = ?, lastName = ?, contentItemId = ? WHERE userId = ?`,
        [data.firstName, data.lastName, data.contentItemId, data.userId],
      );
    }
  } catch (error) {
    recordCrashlyticsError('Error in updateIfIdTeam:', error);
    console.error('Error in updateIfIdTeam:', error);
    throw error;
  }
};

const updateTypeIfId = async (
  displayText: string,
  id: string,
  isCase: boolean,
  tableName: string,
  isMultipleLocation: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    const rows = await db.getAllAsync(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    if (displayText) {
      if (rows.length === 0) {
        await storeTypeData(displayText, id, isCase, tableName, isMultipleLocation);
      } else {
        await updateTypeData(displayText, id, tableName, isMultipleLocation);
      }
    }
  } catch (error) {
    recordCrashlyticsError(`Error updating or storing data in ${tableName}:`, error);
    console.error(`Error updating or storing data in ${tableName}:`, error);
    throw error;
  }
};

const updateStatusIfId = async (data: SelectionListData, isCase: boolean): Promise<void> => {
  const db = getDatabase();
  try {
    const rows = await db.getAllAsync(`SELECT * FROM ${TABLES.STATUS_TABLE_NAME} WHERE id = ?`, [
      data.id,
    ]);
    if (data.displayText) {
      if (rows.length === 0) {
        await storeStatusData(data, isCase);
      } else {
        await updateStatusData(data);
      }
    }
  } catch (error) {
    recordCrashlyticsError(`Error updating status with ID ${data.id}:`, error);
    console.error(`Error updating status with ID ${data.id}:`, error);
    throw error;
  }
};

const storeData = async (
  displayText: string,
  id: string,
  isCase: boolean,
  tableName: string,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(`INSERT INTO ${tableName} (displayText, id, isCase) VALUES (?, ?, ?)`, [
      displayText,
      id,
      isCase,
    ]);
  } catch (error) {
    recordCrashlyticsError(`Error storing data in ${tableName}:`, error);
    console.error(`Error storing data in ${tableName}:`, error);
    throw error;
  }
};

const storeTypeData = async (
  displayText: string,
  id: string,
  isCase: boolean,
  tableName: string,
  isMultipleLocation: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `INSERT INTO ${tableName} (displayText, id, isCase, isMultipleLocation) VALUES (?, ?, ?, ?)`,
      [displayText, id, isCase, isMultipleLocation],
    );
  } catch (error) {
    recordCrashlyticsError(`Error storing type data in ${tableName}:`, error);
    console.error(`Error storing type data in ${tableName}:`, error);
    throw error;
  }
};

const storeStatusData = async (data: SelectionListData, isCase: boolean): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `INSERT INTO ${TABLES.STATUS_TABLE_NAME} (displayText, id, isCase, isRemoveAllAssignedTeamMembers) VALUES (?, ?, ?, ?)`,
      [data.displayText, data.id, isCase, data.isRemoveAllAssignedTeamMembers ?? false],
    );
  } catch (error) {
    recordCrashlyticsError(`Error storing status data in ${TABLES.STATUS_TABLE_NAME}:`, error);
    console.error(`Error storing status data in ${TABLES.STATUS_TABLE_NAME}:`, error);
    throw error;
  }
};

const updateData = async (displayText: string, id: string, tableName: string): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(`UPDATE ${tableName} SET displayText = ? WHERE id = ?`, [displayText, id]);
  } catch (error) {
    recordCrashlyticsError(`Error updating data in ${tableName}:`, error);
    console.error(`Error updating data in ${tableName}:`, error);
    throw error;
  }
};

const updateTypeData = async (
  displayText: string,
  id: string,
  tableName: string,
  isMultipleLocation: boolean,
): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${tableName} SET displayText = ?, isMultipleLocation = ? WHERE id = ?`,
      [displayText, isMultipleLocation, id],
    );
  } catch (error) {
    recordCrashlyticsError(`Error updating data in ${tableName}:`, error);
    console.error(`Error updating data in ${tableName}:`, error);
    throw error;
  }
};

const updateStatusData = async (data: SelectionListData): Promise<void> => {
  const db = getDatabase();
  try {
    await db.runAsync(
      `UPDATE ${TABLES.STATUS_TABLE_NAME} SET displayText = ?, isRemoveAllAssignedTeamMembers = ? WHERE id = ?`,
      [data.displayText, data.isRemoveAllAssignedTeamMembers ?? false, data.id],
    );
  } catch (error) {
    recordCrashlyticsError(`Error updating data in ${TABLES.STATUS_TABLE_NAME}:`, error);
    console.error(`Error updating data in ${TABLES.STATUS_TABLE_NAME}:`, error);
    throw error;
  }
};

// Advanced form get type dropdown data
export const updateFormFilterDataIfExists = async (displayText, id, tableName) => {
  try {
    const db = await getDatabase();
    const resultSet = await db.getAllAsync(`SELECT * FROM ${tableName} WHERE id = ?`, id);

    if (displayText != null) {
      if (resultSet.length === 0) {
        await storeListData(displayText, id, tableName);
      } else {
        await updateListData(displayText, id, tableName);
      }
    }
  } catch (error) {
    recordCrashlyticsError(`Error updating or storing data in ${tableName}:`, error);
    console.error(`Error updating or storing data in ${tableName}:`, error);
    throw error;
  }
};

const storeListData = async (displayText, id, tableName) => {
  try {
    const db = await getDatabase();
    const query = `
        INSERT INTO ${tableName} 
        (displayText, id) 
        VALUES (?, ?)
      `;
    const statement = await db.prepareAsync(query);

    await statement.executeAsync(displayText, id);
  } catch (error) {
    recordCrashlyticsError(`Error storing list data in ${tableName}:`, error);
    console.error(`Error storing list data in ${tableName}:`, error);
  }
};

const updateListData = async (displayText, id, tableName) => {
  try {
    const db = await getDatabase();
    const query = `UPDATE ${tableName} SET displayText = ? WHERE id = ?`;

    await db.runAsync(query, [displayText, id]);
  } catch (error) {
    recordCrashlyticsError(`Error updating list data in ${tableName}:`, error);
    console.error(`Error updating list data in ${tableName}:`, error);
  }
};
