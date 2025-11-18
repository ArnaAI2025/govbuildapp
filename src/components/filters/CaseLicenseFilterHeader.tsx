import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Platform } from 'react-native';
import SwitchToggle from 'react-native-switch-toggle';
import { COLORS } from '../../theme/colors';
import { TEXTS } from '../../constants/strings';
import IMAGES from '../../theme/images';
import DeviceInfo from 'react-native-device-info';
import { fontSize, height } from '../../utils/helper/dimensions';
import type { ListCaseLicenseHeaderProps } from '../../utils/interfaces/IComponent';
import CaseLicenseFilterDialog from '../dialogs/CaseLicenseFilterDialog';
import { FONT_FAMILY } from '../../theme/fonts';
import { useUnifiedCaseStore } from '../../store/caseStore';
import { MyPopover } from '../common/InfoPopup';
import { useLicenseStore } from '../../store/useLicenseStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ListHeader: React.FC<ListCaseLicenseHeaderProps> = ({
  filters,
  isNetworkAvailable,
  openFilter,
  setOpenFilter,
  onToggleShowAll,
  onApplyFilters,
  onSearch,
  orientation,
  headerType = 'Case',
  isForDailyInspection = false,
}) => {
  // const { filterCount } = useUnifiedCaseStore();
  const [searchText, setSearchText] = useState(filters.search);
  const hasNotch = DeviceInfo.hasNotch();
  const LICENSE = headerType === 'License';
  const isMyOnly = LICENSE ? filters.isMyLicenseOnly : filters.isMyCaseOnly;
  const { filterCount } = LICENSE ? useLicenseStore() : useUnifiedCaseStore();
  const [toggleState, setToggleState] = useState<boolean>(false);

  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  useEffect(() => {
    setToggleState(isMyOnly ?? false);
  }, [isMyOnly]);

  const clearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  const handleToggle = () => {
    const newState = !toggleState;
    setToggleState(newState);
    onToggleShowAll(newState);
  };

  return (
    <View>
      {isNetworkAvailable && (
        <CaseLicenseFilterDialog
          visible={openFilter}
          onClose={() => setOpenFilter(false)}
          onApply={onApplyFilters}
          headerType={headerType}
        />
      )}

      {isNetworkAvailable && (
        <View
          style={[
            styles.headerContainer,
            {
              marginTop:
                orientation === 'PORTRAIT'
                  ? hasNotch
                    ? height(-0.056)
                    : Platform.OS == 'ios'
                      ? height(-0.049)
                      : height(-0.062)
                  : height(-0.054),
            },
          ]}
        >
          {!isForDailyInspection && (
            <>
              <Text style={styles.headerText}>{TEXTS.caseScreen.allCases}</Text>
              <MyPopover infoMsg="Add a search term to search all items." />

              <SwitchToggle
                switchOn={toggleState}
                onPress={handleToggle}
                circleColorOff={COLORS.VERY_GRAY_LIGHT}
                circleColorOn={COLORS.WHITE}
                backgroundColorOn={COLORS.APP_COLOR}
                backgroundColorOff={COLORS.GRAY_MEDIUM}
                containerStyle={styles.toggleContainer}
                circleStyle={styles.toggleCircle}
              />
            </>
          )}
          <TouchableOpacity
            onPress={() => setOpenFilter(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <View style={styles.filterIconContainer}>
              <Image source={IMAGES.FILTER_ICON} style={styles.icon} />
              {filterCount > 0 && <View style={styles.filterBadge} />}
            </View>
          </TouchableOpacity>
        </View>
      )}
      {!isForDailyInspection && (
        <View style={styles.searchContainer}>
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              onSearch(text.trim());
            }}
            placeholder={LICENSE ? 'Filter by Title' : filters?.filterType?.displayText}
            style={styles.searchInput}
            autoCapitalize="none"
            autoFocus={false}
          />
          <View style={styles.searchIconContainer}>
            <TouchableOpacity onPress={searchText ? clearSearch : undefined} activeOpacity={0.7}>
              <Icon name={searchText ? 'close' : 'magnify'} size={26} color={COLORS.APP_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: height(0.025),
    paddingHorizontal: 10,
    width: '50%',
  },
  headerText: {
    color: COLORS.APP_COLOR,
    fontFamily: FONT_FAMILY.MontserratBold,
    fontSize: fontSize(0.025),
    marginRight: 3,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    height: 30,
  },
  searchIconContainer: {
    alignItems: 'flex-end',
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: COLORS.APP_COLOR,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    borderRadius: 5,
    padding: 6,
    marginRight: height(0.01),
    marginLeft: height(0.01),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  filterButton: {
    height: height(0.035),
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.RED,
  },
  toggleContainer: {
    width: 45,
    height: 25,
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 10,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});
