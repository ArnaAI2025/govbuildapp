import React, { memo, useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { fontSize, height, isTablet } from '../../utils/helper/dimensions';
import { useUnifiedCaseStore } from '../../store/caseStore';
import { fetchCaseStatusesByCaseType, fetchFilterOptions } from '../../services/FilterService';
import IMAGES from '../../theme/images';
import globalStyles from '../../theme/globalStyles';
import { TEXTS } from '../../constants/strings';
import { useLicenseStore } from '../../store/useLicenseStore';
import {
  DefaultAdvancedFiltersInterface,
  FilterItemInterface,
  filterOptionInterface,
  TeamMemberInterface,
} from '../../utils/interfaces/IComponent';
import { COLORS } from '../../theme/colors';
import { getUserRole } from '../../session/SessionManager';
import { useOrientation } from '../../utils/useOrientation';
import { FONT_FAMILY } from '../../theme/fonts';

interface CaseLicenseFilterDialogProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: DefaultAdvancedFiltersInterface) => void;
  headerType: string;
}

const CaseLicenseFilterDialog: React.FC<CaseLicenseFilterDialogProps> = ({
  visible,
  onClose,
  onApply,
  headerType,
}) => {
  const LICENSE = headerType != 'License';
  const { filters: currentFilters, resetFilters } = LICENSE
    ? useUnifiedCaseStore()
    : useLicenseStore();
  const orientation = useOrientation();
  const [localFilters, setLocalFilters] = useState<DefaultAdvancedFiltersInterface>(currentFilters);

  const [dropdownData, setDropdownData] = useState<{
    caseLicenseSubTypes: FilterItemInterface[];
    caseLicenseTags: FilterItemInterface[];
    caseLicenseTypes: FilterItemInterface[];
    caseLicenseStatus: FilterItemInterface[];
    licenseRenewalStatus: FilterItemInterface[];
    advanceForms: FilterItemInterface[];
    teamMembers: TeamMemberInterface[];
    sortOption: filterOptionInterface[];
    filterType: filterOptionInterface[];
  }>({
    caseLicenseSubTypes: [],
    caseLicenseTags: [],
    caseLicenseTypes: [],
    caseLicenseStatus: [],
    licenseRenewalStatus: [],
    advanceForms: [],
    teamMembers: [],
    sortOption: [],
    filterType: [],
  });

  // Above code is completed
  const fetchDropdownData = useCallback(async () => {
    try {
      const filterObject = await fetchFilterOptions(headerType);

      const updatedTeamMembers = (filterObject?.teamMembers ?? []).map((member) => ({
        ...member,
        fullName: `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim(),
      }));

      setDropdownData({
        caseLicenseSubTypes: filterObject?.subTypes ?? [],
        caseLicenseTags: filterObject?.caseTags ?? [],
        caseLicenseTypes: filterObject?.caseTypes ?? [],
        caseLicenseStatus: filterObject?.caseStatuses ?? [],
        licenseRenewalStatus: filterObject?.renewalStatus ?? [],
        advanceForms: filterObject?.advanceForms ?? [],
        teamMembers: updatedTeamMembers ?? [],
        sortOption: filterObject?.sortOption ?? [],
        filterType: filterObject?.filterType ?? [],
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchDropdownData();
      setLocalFilters(currentFilters); // Use currentFilters directly, as teamMember is already set in store
    }
  }, [visible, currentFilters, fetchDropdownData]);
  const fetchStatuses = useCallback(async (caseTypeId: string) => {
    try {
      const caseStatuses = await fetchCaseStatusesByCaseType(caseTypeId);
      setDropdownData((prev) => ({
        ...prev,
        status: [{ displayText: 'All Case Status', id: '' }, ...caseStatuses],
      }));
      setLocalFilters((prev) => ({
        ...prev,
        caseStatus: { displayText: 'All Case Status', id: '' },
      }));
    } catch (error) {
      console.error('Error fetching case statuses:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchDropdownData();
      setLocalFilters(currentFilters);
    }
  }, [visible, currentFilters, fetchDropdownData]);

  useEffect(() => {
    fetchStatuses(localFilters?.caseLicenseType?.id);
  }, [localFilters?.caseLicenseType?.id, fetchStatuses]);

  const handleFilterChange = useCallback(
    (key: keyof DefaultAdvancedFiltersInterface, value: any) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );
  const normalizeDropdownData = (data: any, labelField: string) => {
    return data.map((item: any) => ({
      ...item,
      [labelField]: item[labelField] || 'N/A',
    }));
  };
  useEffect(() => {
    if (
      localFilters?.teamMember?.userId === '' &&
      !localFilters?.isMyCaseOnly &&
      !localFilters?.isMyLicenseOnly
    ) {
      const userRole = getUserRole();
      handleFilterChange('teamMember', { userId: userRole });
    }
  }, [localFilters?.teamMember?.userId, localFilters?.isMyCaseOnly, localFilters?.isMyLicenseOnly]);

  const handleReset = useCallback(() => {
    resetFilters();
    setLocalFilters(currentFilters);
  }, [resetFilters, currentFilters]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{TEXTS.advanceFilter.advancedFilters}</Text>
            <TouchableOpacity onPress={handleReset}>
              <Image source={IMAGES.DELETE} style={globalStyles.iconSize} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1 }}>
              {headerType != 'License' && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.label}>{TEXTS.advanceFilter.filterTypeLabel}</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={normalizeDropdownData(dropdownData?.filterType, 'displayText')}
                    labelField="displayText"
                    valueField="value"
                    dropdownPosition="auto"
                    value={localFilters?.filterType?.value}
                    onChange={(item) => handleFilterChange('filterType', item)}
                  />
                </View>
              )}

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>
                  {LICENSE ? TEXTS.advanceFilter.caseTypeLabel : TEXTS.advanceFilter.licenseType}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData?.caseLicenseTypes, 'displayText')}
                  labelField="displayText"
                  valueField="id"
                  dropdownPosition="auto"
                  search
                  searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                  value={localFilters?.caseLicenseType?.id}
                  onChange={(item) => handleFilterChange('caseLicenseType', item)}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>
                  {LICENSE
                    ? TEXTS.advanceFilter.caseStatusLabel
                    : TEXTS.advanceFilter.licenseStatusLabel}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData?.caseLicenseStatus, 'displayText')}
                  labelField="displayText"
                  valueField="id"
                  dropdownPosition="auto"
                  search
                  searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                  value={localFilters?.caseLicenseStatus?.id}
                  onChange={(item) => handleFilterChange('caseLicenseStatus', item)}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>
                  {LICENSE
                    ? TEXTS.advanceFilter.caseSubTypeLabel
                    : TEXTS.advanceFilter.licenseSubTypeLabel}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData.caseLicenseSubTypes, 'displayText')}
                  labelField="displayText"
                  valueField="id"
                  dropdownPosition="auto"
                  search
                  searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                  value={localFilters?.caseLicenseSubType?.id}
                  onChange={(item) => handleFilterChange('caseLicenseSubType', item)}
                />
              </View>

              {headerType === 'License' && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.label}>{TEXTS.advanceFilter.licenseRenewalStatusLabel}</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={normalizeDropdownData(dropdownData.licenseRenewalStatus, 'displayText')}
                    labelField="displayText"
                    valueField="id"
                    dropdownPosition="auto"
                    search
                    searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                    value={localFilters?.licenseRenewalStatus?.id}
                    onChange={(item) => handleFilterChange('licenseRenewalStatus', item)}
                  />
                </View>
              )}

              {headerType != 'License' && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.label}>{TEXTS.advanceFilter.attachedAdvanceFormLabel}</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={normalizeDropdownData(dropdownData.advanceForms, 'displayText')}
                    labelField="displayText"
                    valueField="id"
                    dropdownPosition={
                      orientation === 'LANDSCAPE' ? 'top' : isTablet ? 'bottom' : 'top'
                    }
                    search
                    searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                    value={localFilters?.advanceForm?.id}
                    onChange={(item) => handleFilterChange('advanceForm', item)}
                  />
                </View>
              )}

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>{TEXTS.advanceFilter.teamMemberLabel}</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData.teamMembers, 'fullName')}
                  labelField="fullName"
                  valueField="userId"
                  value={
                    localFilters?.teamMember?.userId === '' &&
                    !localFilters?.isMyCaseOnly &&
                    !localFilters?.isMyLicenseOnly
                      ? getUserRole()
                      : localFilters?.teamMember?.userId
                  }
                  dropdownPosition={
                    orientation === 'LANDSCAPE' ? 'top' : isTablet ? 'bottom' : 'top'
                  }
                  onChange={(item) => handleFilterChange('teamMember', item)}
                  search
                  searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                  renderItem={(item) => <Text style={styles.dropdownItem}>{item.fullName}</Text>}
                />
              </View>

              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>
                  {LICENSE ? TEXTS.advanceFilter.caseTag : TEXTS.advanceFilter.licenseTag}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData.caseLicenseTags, 'displayText')}
                  labelField="displayText"
                  valueField="id"
                  dropdownPosition={
                    orientation === 'LANDSCAPE' ? 'top' : isTablet ? 'bottom' : 'top'
                  }
                  value={localFilters?.caseLicenseTag?.id}
                  search
                  searchPlaceholder={TEXTS.advanceFilter?.searchHere}
                  onChange={(item) => handleFilterChange('caseLicenseTag', item)}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.label}>{TEXTS.advanceFilter.sortBy}</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={normalizeDropdownData(dropdownData.sortOption, 'displayText')}
                  labelField="displayText"
                  valueField="value"
                  value={localFilters?.sortBy?.value}
                  dropdownPosition={
                    orientation === 'LANDSCAPE' ? 'top' : isTablet ? 'bottom' : 'top'
                  }
                  onChange={(item) => handleFilterChange('sortBy', item)}
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.textStyle}>{TEXTS.advanceFilter.close}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => onApply(localFilters)}>
              <Text style={styles.textStyle}>{TEXTS.advanceFilter.filter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    marginTop: height(0.07),
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.APP_COLOR,
    //textAlign: "center",
    fontWeight: 'bold',
    fontSize: fontSize(0.04),
    flex: 1,
  },
  clearButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.GRAY_MEDIUM,
    borderRadius: 5,
  },
  clearButtonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.022),
    fontWeight: '600',
  },
  dropdownContainer: {
    marginBottom: Platform.OS === 'android' ? 6 : 15,
  },
  label: {
    fontSize: fontSize(0.028),
    marginBottom: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_MEDIUM,
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    //marginTop: 20,
    //marginBottom: 20,
    justifyContent: 'space-between',
  },
  closeButton: {
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButton: {
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
});

export default memo(CaseLicenseFilterDialog);
