import { normalizeBool } from '../../utils/helper/helpers';
import type { TabData } from '../../utils/interfaces/ISubScreens';

export const LicenseSubScreensItemView = (
  tabData: TabData,
  licenseDetails: any,
  isAllowViewInspection: boolean,
): { type: string; title: string; screenName: string } | null => {
  const { isShowInspectionTab, subLicenseName } = licenseDetails || {};

  const inspectionTab = normalizeBool(isShowInspectionTab);

  switch (tabData.screenName) {
    case 'InspectionsScreen':
      if (!inspectionTab || !isAllowViewInspection) return null;
      return {
        type: tabData.type,
        title: tabData.title,
        screenName: tabData.screenName,
      };

    case 'SubLicenseScreen':
      return {
        type: tabData.type,
        title: subLicenseName?.trim() || 'Contractors',
        screenName: tabData.screenName,
      };

    // every tab returns {type, title, screenName}
    case 'AttechedItems':
    case 'AdminNotes':
    case 'AttachedDocs':
    case 'ContactMain':
    case 'ShowLicenseScreen':
    case 'LicenseDetailsScreen':
    case 'OwnerScreen':
    case 'PaymentMain':
    case 'PublicComments':
    case 'SendMailScreen':
    case 'StatusChangeLog':
      return {
        type: tabData.type,
        title: tabData.title,
        screenName: tabData.screenName,
      };

    default:
      return null;
  }
};
