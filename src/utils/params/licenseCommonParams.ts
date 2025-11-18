import { getNewUTCDate, StatusColorCodes } from '../helper/helpers';
import type { licenseDataPostPayload } from '../interfaces/zustand/ILicense';

export const buildLicensePayload = ({
  contentItemId,
  licenseUniqNumber,
  expirationDate,
  applicantFirstName,
  applicantLastName,
  email,
  phoneNumber,
  cellNumber,
  parcelNumber,
  quickRefNumber,
  additionalInfo,
  location,
  businessName,
  renewalStatusId,
  statusId,
  licenseStatusDisplayText,
  licenseTypeId,
  licenseTypeDisplayText,
  licenseTag,
  licenseSubType,
  assignedUsers,
  paymentReceived,
  licenseDescriptor,
  isForceSync,
  isApiUpdateQuickRefNumberAndParcelNumber,
  SyncModel,
  isNetworkAvailable,
  isAllowAssigned,
}: any) => {
  const basePayload: licenseDataPostPayload = {
    DataType: isNetworkAvailable ? 'Online' : 'Offline',
    licenseNumber: licenseUniqNumber,
    applicantFirstName: applicantFirstName,
    applicantLastName: applicantLastName,
    email: email,
    expirationDate: expirationDate === null ? 'YYYY-MM-DD' : expirationDate,
    businessName: businessName,
    isPaymentReceived: paymentReceived,
    licenseDescriptor: licenseDescriptor,
    statusId: statusId,
    phoneNumber: phoneNumber,
    cellNumber: cellNumber,
    additionalInfo: additionalInfo,
    licenseType: licenseTypeDisplayText,
    licenseTypeId: licenseTypeId,
    assignedUsers: assignedUsers,
    licenseSubType: licenseSubType,
    location: location,
    quickRefNumber: quickRefNumber,
    parcelNumber: parcelNumber,
    isApiUpdateQuickRefNumberAndParcelNumber: isApiUpdateQuickRefNumberAndParcelNumber,
    isForceSync: isForceSync,
    renewalStatus: renewalStatusId,
    viewOnlyAssignUsers: isAllowAssigned,
  };
  if (isNetworkAvailable) {
    Object.assign(basePayload, {
      Id: contentItemId,
      displayText: licenseDescriptor,
      LicenseTag: licenseTag,
      quickRefNumber: quickRefNumber,
      parcelNumber: parcelNumber,
      SyncModel: SyncModel,
    });
  }
  if (!isNetworkAvailable) {
    Object.assign(basePayload, {
      id: contentItemId,
      contentItemId: contentItemId,
      displayText: [
        licenseUniqNumber,
        [applicantFirstName, applicantLastName].filter(Boolean).join(', '),
        location,
      ]
        .filter(Boolean)
        .join(' - '),
      licenseStatus: licenseStatusDisplayText,
      statusColor: StatusColorCodes(licenseStatusDisplayText ?? ''),
      isEditable: true,
      modifiedUtc: getNewUTCDate(),
      licenseTag: licenseTag,
    });
  }

  return basePayload;
};

//For the attached docs
export const addFolderParamOfflineLicense = (
  parentFolderID: string | number,
  isShowonFE: boolean,
  folderName: string,
  isFolder: boolean,
  fileName: string,
  url: string,
  details: any,
  documentType: string | undefined,
  shortDescription: string,
  caseStatus: string,
  caseId: string,
  id: string,
) => {
  var detail = {
    parentFolderID: parentFolderID,
    Isfolder: isFolder,
    name: folderName,
    fileName: fileName,
    URL: url,
    details: details,
    documentType: documentType,
    shortDescription: shortDescription,
    isShowonFE: isShowonFE,
    caseStatus: caseStatus,
    licenseContentItemId: caseId,
    id: id,
  };

  return detail;
};
