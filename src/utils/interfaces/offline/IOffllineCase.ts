export interface SelectionListData {
  displayText: string;
  id: string;
  isCase?: boolean;
  isRemoveAllAssignedTeamMembers?: boolean;
  isMultipleLocation?: boolean;
  unlockExpirationDate?: boolean;
}

export interface TeamMemberData {
  firstName: string;
  lastName: string;
  userId: string;
  isCase: boolean;
  contentItemId: string;
}
export interface SyncHistoryRecord {
  type: string;
  itemId: string;
  itemSubId: string;
  itemName: string;
  updateDate: string;
  subTypeTitle: string;
  itemType: string;
  title: string;
}
export interface TableRecord {
  displayText: string;
  caseType?: string;
  licenseType?: string;
}
