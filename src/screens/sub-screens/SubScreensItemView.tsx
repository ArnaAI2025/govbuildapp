import type { TabData } from '../../utils/interfaces/ISubScreens';

// Interface for tab data (matches the DATA array structure)

// SubScreensItemView function
export const SubScreensItemView = (
  item: TabData,
  isOnline: boolean,
  caseSettingData: any,
  isShowTaskStatusLogTab: boolean,
  permissions: any,
  isAllowMultipleAddress: boolean,
  isAllowViewInspection: boolean,
  caseDetails: any,
): { type: string } | null => {
  // Destructure caseSettingData for readability
  const {
    isHideAdminNotesTab,
    isHideAttachedDocTab,
    isHidePaymentTab,
    isHidePublicCommentTab,
    isHideRelatedTab,
    isHideContactTab,
    isHideSettingTab,
    isHideTaskTab,
    isHideSentMailTab,
    //for the tabs
    isHideTeamMemberAssignmentLogTab,
    isHideBillingStatusChangeLogTab,
    isHideChangeLogTab,
    isHideInspectionHistoryLogTab,
    isHideTaskStatusChangeLogTab,
    isHidePaymentHistoryLogTab,
  } = caseSettingData || {};

  const { isShowInspectionTab } = caseDetails || {};

  // Evaluate tab visibility based on screenName
  switch (item.screenName) {
    case 'AttechedItems':
      return { type: item.type };

    case 'AdminNotes':
      if (!isHideAdminNotesTab) {
        return { type: item.type };
      }

    case 'AttachedDocs':
      if (!isHideAttachedDocTab) {
        return { type: item.type };
      }
    case 'ContactMain':
      if (!isHideContactTab) {
        return { type: item.type };
      }
      return null;

    case 'InspectionsScreen':
      if (isShowInspectionTab && isAllowViewInspection) {
        return { type: item.type };
      }
    case 'Locations':
      if (isAllowMultipleAddress) {
        return { type: item.type };
      }
      return null;
    case 'PaymentMain':
      if (!isHidePaymentTab) {
        return { type: item.type };
      }
      return null;

    case 'PublicComments':
      if (!isHidePublicCommentTab) {
        return { type: item.type };
      }
      return null;

    case 'RelatedScreen':
      if (!isHideRelatedTab) {
        return { type: item.type };
      }
      return null;

    case 'SendMailScreen':
      if (!isHideSentMailTab && isOnline) {
        return { type: item.type };
      }
      return null;

    case 'SettingsScreen':
      if (!isHideSettingTab) {
        return { type: item.type };
      }
      return null;

    case 'StatusChangeLog':
      const tabFlags = {
        isHideTeamMemberAssignmentLogTab,
        isHideBillingStatusChangeLogTab,
        isHideChangeLogTab,
        isHideInspectionHistoryLogTab,
        isHideTaskStatusChangeLogTab,
        isHidePaymentHistoryLogTab,
      };

      const shouldHideTabSection = Object.values(tabFlags).every((value) => value === true);

      if (!shouldHideTabSection) {
        return { type: item.type };
      }
      return null;

    case 'TaskScreen':
      if (!isHideTaskTab && isOnline) {
        return { type: item.type };
      }
      return null;

    case 'TaskStatusChangeLog':
      if (isShowTaskStatusLogTab && !isHideTaskStatusChangeLogTab) {
        return { type: item.type };
      }
      return null;

    default:
      return null; // Unknown screen, hide by default
  }
};
