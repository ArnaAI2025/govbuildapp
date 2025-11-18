import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, FlatList, Text, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from '../../../theme/colors';
import { fontSize, height, iconSize, marginLeftAndRight } from '../../../utils/helper/dimensions';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { InspectionScheduleDropDown } from '../../../components/inspection/InspectionSchaduleDropdown';
import { TEXTS } from '../../../constants/strings';
import { FONT_FAMILY } from '../../../theme/fonts';
import { DailyInspectionService } from '../DailyInspectionService';
import { useDailyInspectionStore } from '../../../store/useDailyInspectionStore';
import useNetworkStore from '../../../store/networkStore';
import SwitchToggle from 'react-native-switch-toggle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

interface AdvanceFilterDialogProps {
  openAdvanceFilter: boolean;
  setOpenAdvanceFilter: (open: boolean) => void;
  fetchInspections: () => void;
  resetFilters: () => void;
}

export const AdvanceFilterDialog: React.FC<AdvanceFilterDialogProps> = ({
  openAdvanceFilter,
  setOpenAdvanceFilter,
  fetchInspections,
  resetFilters,
}) => {
  const {
    teamMembers,
    selectedTeam,
    inspectionTypes,
    inspectionStatus,
    caseType,
    caseTypeCategory,
    licenseType,
    licenseTypeCategory,
    selectedInspectionType,
    selectedStatus,
    selectedCaseType,
    selectedCaseTypeCategory,
    selectedLicenseType,
    selectedLicenseTypeCategory,
    isIncomplete,
    noInspectorAssigned,
    setSelectedTeam,
    setSelectedInspectionType,
    setSelectedStatus,
    setSelectedCaseType,
    setSelectedCaseTypeCategory,
    setSelectedLicenseType,
    setSelectedLicenseTypeCategory,
    setIsIncomplete,
    setNoInspectorAssigned,
    setFilterCount,
    setAdvanceFilter,
    setInspectionTypes,
    setInspectionStatus,
    setCaseType,
    setCaseTypeCategory,
    setLicenseType,
    setLicenseTypeCategory,
    setSelectedTeamMember,
  } = useDailyInspectionStore();
  const { isNetworkAvailable } = useNetworkStore();
  const [openTeamMember, setOpenTeamMember] = useState(false);
  const [openTypes, setOpenTypes] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openCaseType, setOpenCaseType] = useState(false);
  const [openCaseTypeCategory, setOpenCaseTypeCategory] = useState(false);
  const [openLicenseType, setOpenLicenseType] = useState(false);
  const [openLicenseTypeCategory, setOpenLicenseTypeCategory] = useState(false);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const dropdownData = await DailyInspectionService.fetchDropdownFilters(isNetworkAvailable);
        setInspectionTypes(dropdownData.inspectionTypes);
        setInspectionStatus(dropdownData.inspectionStatus);
        setCaseType(dropdownData.caseType);
        setCaseTypeCategory(dropdownData.caseTypeCategory);
        setLicenseType(dropdownData.licenseType);
        setLicenseTypeCategory(dropdownData.licenseTypeCategory);
      } catch (error) {
        recordCrashlyticsError('Error in initialize:', error);
        console.error('Error in initialize:', error);
      }
    };
    initialize();
  }, []);

  // Sync case types when case type category changes
  useEffect(() => {
    if (selectedCaseTypeCategory.length > 0) {
      const matchingCaseTypes = caseType
        .filter((item) => selectedCaseTypeCategory.some((cat) => cat?.id === item?.category))
        .map((item) => ({
          displayText: item.displayText,
          id: item.id,
          category: item.category,
        }));
      setSelectedCaseType(matchingCaseTypes);
    }
  }, [selectedCaseTypeCategory, caseType, setSelectedCaseType]);

  // Sync license types when license type category changes
  useEffect(() => {
    if (selectedLicenseTypeCategory.length > 0) {
      const matchingLicenseTypes = licenseType
        .filter((item) => selectedLicenseTypeCategory.some((cat) => cat?.id === item?.category))
        .map((item) => ({
          displayText: item.displayText,
          id: item.id,
          category: item.category,
        }));
      setSelectedLicenseType(matchingLicenseTypes);
    }
  }, [selectedLicenseTypeCategory, licenseType, setSelectedLicenseType]);

  // Add useEffect hooks to react to filter changes
  useEffect(() => {
    const teamMemberIds = commaSeparatedIds(selectedTeam);
    const typesIds = commaSeparatedIds(selectedInspectionType);
    const statusIds = commaSeparatedIds(selectedStatus, true);
    const caseTypeIds = commaSeparatedIds(selectedCaseType);
    const licenseTypeIds = commaSeparatedIds(selectedLicenseType);
    const caseTypeCategoryIds = commaSeparatedIds(selectedCaseTypeCategory);
    const licenseTypeCategoryIds = commaSeparatedIds(selectedLicenseTypeCategory);

    let filterCount = 0;
    if (teamMemberIds) filterCount++;
    if (typesIds) filterCount++;
    if (statusIds) filterCount++;
    if (caseTypeIds) filterCount++;
    if (licenseTypeIds) filterCount++;
    if (caseTypeCategoryIds) filterCount++;
    if (licenseTypeCategoryIds) filterCount++;
    if (isIncomplete) filterCount++;
    if (noInspectorAssigned) filterCount++;

    setFilterCount(filterCount);
    setAdvanceFilter({
      inspectorBy: teamMemberIds,
      type: typesIds,
      status: statusIds,
      caseType: caseTypeIds,
      licenseType: licenseTypeIds,
      caseTypeCategory: caseTypeCategoryIds,
      licenseTypeCategory: licenseTypeCategoryIds,
    });

    // Update selectedTeamMember based on selectedTeam
    if (selectedTeam.length === 1) {
      setSelectedTeamMember(selectedTeam[0]);
    } else {
      setSelectedTeamMember({ id: '', displayText: '' });
    }

    // Fetch inspections immediately
    //fetchInspections();
  }, [
    selectedTeam,
    selectedInspectionType,
    selectedStatus,
    selectedCaseType,
    selectedCaseTypeCategory,
    selectedLicenseType,
    selectedLicenseTypeCategory,
    isIncomplete,
    noInspectorAssigned,
  ]);
  // Utility function to delete items from filter arrays
  const deleteFilterItem = (index: number, type: number) => {
    switch (type) {
      case 1:
        const tempTeam = [...selectedTeam];
        tempTeam.splice(index, 1);
        setSelectedTeam(tempTeam);
        break;
      case 2:
        const tempInspectionType = [...selectedInspectionType];
        tempInspectionType.splice(index, 1);
        setSelectedInspectionType(tempInspectionType);
        break;
      case 3:
        const tempStatus = [...selectedStatus];
        tempStatus.splice(index, 1);
        setSelectedStatus(tempStatus);
        break;
      case 4:
        const tempCaseTypeCategory = [...selectedCaseTypeCategory];
        tempCaseTypeCategory.splice(index, 1);
        setSelectedCaseTypeCategory(tempCaseTypeCategory);
        const remainingCaseTypes = caseType.filter((item) =>
          tempCaseTypeCategory.some((cat) => cat?.id === item?.category),
        );
        setSelectedCaseType(remainingCaseTypes);
        break;
      case 5:
        const tempCaseType = [...selectedCaseType];
        tempCaseType.splice(index, 1);
        setSelectedCaseType(tempCaseType);
        break;
      case 6:
        const tempLicenseTypeCategory = [...selectedLicenseTypeCategory];
        tempLicenseTypeCategory.splice(index, 1);
        setSelectedLicenseTypeCategory(tempLicenseTypeCategory);
        const remainingLicenseTypes = licenseType.filter((item) =>
          tempLicenseTypeCategory.some((cat) => cat?.id === item?.category),
        );
        setSelectedLicenseType(remainingLicenseTypes);
        break;
      case 7:
        const tempLicenseType = [...selectedLicenseType];
        tempLicenseType.splice(index, 1);
        setSelectedLicenseType(tempLicenseType);
        break;
    }
  };

  // Utility function to generate comma-separated IDs
  const commaSeparatedIds = (data: any[], isJoinName?: boolean): string => {
    const arrayOfIds = data.map((item) => (isJoinName ? item.displayText : item.id));
    return arrayOfIds.join(',');
  };

  // Render dropdown component
  const renderDropdown = (
    placeholder: string,
    data: any[],
    open: boolean,
    setOpen: (open: boolean) => void,
    selectedItems: any[],
    setSelectedItems: (items: any[]) => void,
    hint?: string,
    disable?: boolean,
  ) => (
    <CustomDropdown
      data={data.map((item) => ({
        id: item?.id || item?.value,
        displayText: item?.displayText || item?.label,
      }))}
      labelField="displayText"
      valueField="id"
      value={''}
      onChange={(selectedValue) => {
        if (!selectedItems.some((item) => item.id === selectedValue.value.id)) {
          setSelectedItems([...selectedItems, selectedValue.value]);
        }
        setOpen(false);
      }}
      label={placeholder}
      zIndexPriority={2}
      hintText={hint ?? ''}
      disabled={disable}
    />
  );

  return (
    <Modal
      visible={openAdvanceFilter}
      transparent
      animationType="slide"
      supportedOrientations={['landscape', 'portrait']}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{TEXTS.advanceFilter.advancedFilters}</Text>
            <TouchableOpacity onPress={() => resetFilters()} style={{ alignItems: 'center' }}>
              <Icon name="restart" size={24} color={COLORS.BLUE_COLOR} />
              <Text style={styles.forceSyncText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            nestedScrollEnabled
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {selectedTeam.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedTeam}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 1)}
                      type="1"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'Filter by Inspector',
                teamMembers,
                openTeamMember,
                setOpenTeamMember,
                selectedTeam,
                setSelectedTeam,
                '',
                noInspectorAssigned,
              )}

              {selectedInspectionType.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedInspectionType}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 2)}
                      type="2"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'Filter By Inspection Type',
                inspectionTypes,
                openTypes,
                setOpenTypes,
                selectedInspectionType,
                setSelectedInspectionType,
              )}

              {selectedStatus.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedStatus}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 3)}
                      type="3"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'Filter by Status',
                inspectionStatus,
                openStatus,
                setOpenStatus,
                selectedStatus,
                setSelectedStatus,
              )}

              {selectedCaseTypeCategory.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedCaseTypeCategory}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 4)}
                      type="4"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'Case Type Categories',
                caseTypeCategory,
                openCaseTypeCategory,
                setOpenCaseTypeCategory,
                selectedCaseTypeCategory,
                setSelectedCaseTypeCategory,
                'Changing categories will reset the Case Types.',
              )}

              {selectedCaseType.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedCaseType}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 5)}
                      type="5"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'Case Type',
                caseType,
                openCaseType,
                setOpenCaseType,
                selectedCaseType,
                setSelectedCaseType,
              )}

              {selectedLicenseTypeCategory.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedLicenseTypeCategory}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 6)}
                      type="6"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'License Type Categories',
                licenseTypeCategory,
                openLicenseTypeCategory,
                setOpenLicenseTypeCategory,
                selectedLicenseTypeCategory,
                setSelectedLicenseTypeCategory,
                'Changing categories will reset the License Types.',
              )}

              {selectedLicenseType.length > 0 && (
                <FlatList
                  style={styles.flatList}
                  data={selectedLicenseType}
                  renderItem={({ item, index }) => (
                    <InspectionScheduleDropDown
                      rowData={item}
                      index={index.toString()}
                      deleteInspectionType={() => deleteFilterItem(index, 7)}
                      type="7"
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                />
              )}
              {renderDropdown(
                'License Type',
                licenseType,
                openLicenseType,
                setOpenLicenseType,
                selectedLicenseType,
                setSelectedLicenseType,
              )}

              <View style={styles.switchContainer}>
                {/* <Switch
                  style={styles.switch}
                  value={isIncomplete}
                  onValueChange={setIsIncomplete}
                  trackColor={{
                    false: COLORS.GRAY_DARK,
                    true: COLORS.APP_COLOR,
                  }}
                /> */}
                <SwitchToggle
                  switchOn={isIncomplete}
                  onPress={() => {
                    const newValue = !isIncomplete;
                    setIsIncomplete(newValue);
                  }}
                  circleColorOff={COLORS.VERY_GRAY_LIGHT}
                  circleColorOn={COLORS.WHITE}
                  backgroundColorOn={COLORS.APP_COLOR}
                  backgroundColorOff={COLORS.GRAY_MEDIUM}
                  containerStyle={styles.toggleContainer}
                  circleStyle={styles.toggleCircle}
                />
                <Text style={styles.switchLabel}>Incomplete</Text>
              </View>

              <View style={styles.switchContainer}>
                <SwitchToggle
                  switchOn={noInspectorAssigned}
                  onPress={() => {
                    const newValue = !noInspectorAssigned;
                    setNoInspectorAssigned(newValue);
                    if (newValue) {
                      setSelectedTeam([]);
                      setSelectedTeamMember({ id: '', displayText: '' });
                      setAdvanceFilter({
                        inspectorBy: '', // inspector filter ko empty kar diya
                        type: commaSeparatedIds(selectedInspectionType),
                        status: commaSeparatedIds(selectedStatus, true),
                        caseType: commaSeparatedIds(selectedCaseType),
                        licenseType: commaSeparatedIds(selectedLicenseType),
                        caseTypeCategory: commaSeparatedIds(selectedCaseTypeCategory),
                        licenseTypeCategory: commaSeparatedIds(selectedLicenseTypeCategory),
                      });
                    }
                  }}
                  circleColorOff={COLORS.VERY_GRAY_LIGHT}
                  circleColorOn={COLORS.WHITE}
                  backgroundColorOn={COLORS.APP_COLOR}
                  backgroundColorOff={COLORS.GRAY_MEDIUM}
                  containerStyle={styles.toggleContainer}
                  circleStyle={styles.toggleCircle}
                />
                {/* <Switch
                  style={styles.switch}
                  value={noInspectorAssigned}
                  onValueChange={(checked) => {
                    setNoInspectorAssigned(checked);
                    if (checked) {
                      setSelectedTeam([]);
                      setSelectedTeamMember({ id: "", displayText: "" });
                      setAdvanceFilter({
                        inspectorBy: "", // inspector filter ko empty kar diya
                        type: commaSeparatedIds(selectedInspectionType),
                        status: commaSeparatedIds(selectedStatus, true),
                        caseType: commaSeparatedIds(selectedCaseType),
                        licenseType: commaSeparatedIds(selectedLicenseType),
                        caseTypeCategory: commaSeparatedIds(
                          selectedCaseTypeCategory
                        ),
                        licenseTypeCategory: commaSeparatedIds(
                          selectedLicenseTypeCategory
                        ),
                      });
                    }
                  }}
                  trackColor={{
                    false: COLORS.GRAY_DARK,
                    true: COLORS.APP_COLOR,
                  }}
                /> */}
                <Text style={styles.switchLabel}>No Inspector Assigned</Text>
              </View>
            </View>
          </KeyboardAwareScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpenAdvanceFilter(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={async () => {
                let filterCount = 0;
                const teamMemberIds = commaSeparatedIds(selectedTeam);
                const typesIds = commaSeparatedIds(selectedInspectionType);
                const statusIds = commaSeparatedIds(selectedStatus, true);
                const caseTypeIds = commaSeparatedIds(selectedCaseType);
                const licenseTypeIds = commaSeparatedIds(selectedLicenseType);
                const caseTypeCategoryIds = commaSeparatedIds(selectedCaseTypeCategory);
                const licenseTypeCategoryIds = commaSeparatedIds(selectedLicenseTypeCategory);

                if (selectedTeam.length === 1) {
                  setSelectedTeamMember(selectedTeam[0]);
                } else {
                  setSelectedTeamMember({ id: '', displayText: '' });
                }
                setAdvanceFilter({
                  inspectorBy: teamMemberIds,
                  type: typesIds,
                  status: statusIds,
                  caseType: caseTypeIds,
                  licenseType: licenseTypeIds,
                  caseTypeCategory: caseTypeCategoryIds,
                  licenseTypeCategory: licenseTypeCategoryIds,
                });

                if (teamMemberIds) filterCount++;
                if (typesIds) filterCount++;
                if (statusIds) filterCount++;
                if (caseTypeIds) filterCount++;
                if (licenseTypeIds) filterCount++;
                if (caseTypeCategoryIds) filterCount++;
                if (licenseTypeCategoryIds) filterCount++;
                if (isIncomplete) filterCount++;
                if (noInspectorAssigned) filterCount++;
                setFilterCount(filterCount);
                setOpenAdvanceFilter(false);
                setTimeout(async () => {
                  await fetchInspections();
                }, 500);
              }}
            >
              <Text style={styles.buttonText}>{TEXTS.advanceFilter.filter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    marginTop: height(0.07),
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.BLACK,
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize(0.032),
  },
  closeIcon: {
    height: 15,
    width: 15,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginTop: 30,
  },
  flatList: {
    marginTop: 15,
  },
  rowContainer: {
    paddingBottom: height(0.025),
    flexDirection: 'row',
    marginLeft: 5,
  },
  headingStyleSmall: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.03),
    marginRight: 5,
    flex: 1,
  },
  iconStyle: {
    width: iconSize(0.02),
    height: iconSize(0.02),
  },
  pickerViewStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY_HEADING,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: COLORS.WHITE,
    maxHeight: height(0.05),
    minHeight: height(0.05),
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.026),
  },
  heading: {
    color: COLORS.BLACK,
    fontWeight: '500',
    fontSize: fontSize(0.032),
    marginTop: height(0.04),
    marginBottom: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginHorizontal: -5,
  },
  switchLabel: {
    color: COLORS.TEXT_COLOR,
    marginLeft: marginLeftAndRight(0.02),
    fontFamily: FONT_FAMILY.MontserratRegular,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
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
  searchButton: {
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
  buttonText: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
  title: {
    color: COLORS.APP_COLOR,
    fontWeight: 'bold',
    fontSize: fontSize(0.04),
    flex: 1,
  },
  toggleContainer: {
    width: 45,
    height: 25,
    borderRadius: 25,
    padding: 3,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  forceSyncText: {
    color: COLORS.APP_COLOR,
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: fontSize(0.02),
  },
});

export const commaSeparatedIds = (data: any[]): string => {
  const arrayOfIds = data.map((item) => item.id);
  return arrayOfIds.join(',');
};
