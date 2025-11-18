import { GET_DATA } from './ApiClient';
import { FILTER_TYPE, LICENSE_SORT, SORT_OPTIONS } from '../constants/data';
import { URL } from '../constants/url';
import { getBaseUrl } from '../session/SessionManager';
import type {
  DefaultAdvancedFiltersResponseInterface,
  FilterItemInterface,
} from '../utils/interfaces/IComponent';
import { sortData } from '../utils/helper/helpers';
import { recordCrashlyticsError } from './CrashlyticsService';

export const fetchFilterOptions = async (
  headerType: string,
): Promise<DefaultAdvancedFiltersResponseInterface> => {
  const url = getBaseUrl();

  const LICENSE = headerType === 'License';

  // Display text for dropdown
  const SUB_TYPE_DISPLAY_TEXT = LICENSE ? 'All License Sub Type' : 'All Case Sub Type';
  const TAGS_DISPLAY_TEXT = LICENSE ? 'All License Tag' : 'All Case Tag';
  const TYPE_DISPLAY_TEXT = LICENSE ? 'All License Types' : 'All Case Types';
  const STATUS_DISPLAY_TEXT = LICENSE ? 'All License Status' : 'All Case Status';

  // APIs
  const SUB_TYPE = LICENSE ? URL.LICENSE_SUB_TYPE : URL.CASE_SUB_TYPE;
  const TAG_LIST = LICENSE ? URL.GET_LICENSE_TAGS : URL.CASE_TAG_LIST;
  const TYPE_LIST = LICENSE ? URL.LICENSE_TYPE_LIST : URL.CASE_TYPE_LIST;
  const STATUS_LIST = LICENSE
    ? `${url}${URL.LICENSE_STATUS}`
    : `${url}${URL.CASE_STATUS_BY_MODULE_ID}?`;
  const TEAM_MEMBER = LICENSE ? URL.GET_TEAM_MEMBER : URL.GET_TEAM_MEMBER;

  const endpoints = {
    subTypes: `${url}${SUB_TYPE}`,
    TagList: `${url}${TAG_LIST}`,
    typeList: `${url}${TYPE_LIST}`,
    status: STATUS_LIST,
    renewalStatus: `${url}${URL.GET_LICENSE_RENEWAL_STATUS}`,
    advanceForms: `${url}${URL.CASE_ADVANCE_FORM_LIST}`,
    teamMembers: `${url}${TEAM_MEMBER}`,
  };
  try {
    const [
      subTypesRes,
      tagsRes,
      typesRes,
      statusRes,
      renewalStatus,
      advanceFormsRes,
      teamMembersRes,
    ] = await Promise.all([
      GET_DATA({ url: endpoints.subTypes }),
      GET_DATA({ url: endpoints.TagList }),
      GET_DATA({ url: endpoints.typeList }),
      GET_DATA({ url: endpoints.status }),
      GET_DATA({ url: endpoints.renewalStatus }),
      GET_DATA({ url: endpoints.advanceForms }),
      GET_DATA({ url: endpoints.teamMembers }),
    ]);

    return {
      subTypes: [
        { displayText: SUB_TYPE_DISPLAY_TEXT, id: '' },
        ...(subTypesRes?.data?.data ?? []),
      ],
      caseTags: [{ displayText: TAGS_DISPLAY_TEXT, id: '' }, ...(tagsRes?.data?.data ?? [])],
      caseTypes: [
        { displayText: TYPE_DISPLAY_TEXT, id: '' },
        ...sortData(typesRes?.data?.data ?? []),
      ],
      caseStatuses: [
        { displayText: STATUS_DISPLAY_TEXT, id: '' },
        ...sortData(statusRes?.data?.data ?? []),
      ],
      renewalStatus: [
        { displayText: 'All License Renewal Status', id: '' },
        ...(renewalStatus?.data?.data ?? []),
      ],
      advanceForms: [
        { displayText: 'All Attached Advance Forms', id: '' },
        ...(advanceFormsRes?.data?.data ?? []),
      ],
      teamMembers: [
        { firstName: 'Choose Team Members', lastName: '', userId: '' },
        ...(teamMembersRes?.data?.data ?? []),
      ],
      sortOption: LICENSE ? LICENSE_SORT : SORT_OPTIONS,
      filterType: FILTER_TYPE,
    };
  } catch (error) {
    recordCrashlyticsError('Error fetching filter options:---->>>', error);
    console.error('Error fetching filter options:---->>>', error);
    throw new Error(`Failed to fetch filter options:----> ${(error as Error).message}`);
  }
};

export const fetchCaseStatusesByCaseType = async (
  caseTypeId: string,
): Promise<FilterItemInterface[]> => {
  const url = getBaseUrl();
  const endpoint = `${url}${URL.CASE_STATUS_BY_MODULE_ID}${caseTypeId}`;

  try {
    const response = await GET_DATA({ url: endpoint });
    return (response?.data?.data ?? []).sort((a: FilterItemInterface, b: FilterItemInterface) =>
      a.displayText.localeCompare(b.displayText),
    );
  } catch (error) {
    recordCrashlyticsError('Error fetching case statuses:', error);
    console.error('Error fetching case statuses:', error);
    throw new Error(`Failed to fetch case statuses: ${(error as Error).message}`);
  }
};
