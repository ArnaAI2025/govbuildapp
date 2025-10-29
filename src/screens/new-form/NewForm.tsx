import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View, FlatList, ActivityIndicator, Platform } from 'react-native';
import Loader from '../../components/common/Loader';
import { styles } from './newFormStyles';
import { COLORS } from '../../theme/colors';
import { useNetworkStatus } from '../../utils/checkNetwork';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { height } from '../../utils/helper/dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useOrientation } from '../../utils/useOrientation';
import DeviceInfo from 'react-native-device-info';
import NoData from '../../components/common/NoData';
import { TEXTS } from '../../constants/strings';
import { fetchNewFormService, fetchTagService, fetchTypeService } from './FormService';
import { useNewFormStore } from '../../store/useNewFormStore';
import IMAGES from '../../theme/images';
import FloatingInput from '../../components/common/FloatingInput';
import { FormStatus } from '../../utils/interfaces/ISubScreens';
import ManageFormListItem from './ManageFormListItem';

type Props = Record<string, never>;

const NewFormScreen: FunctionComponent<Props> = () => {
  const flatListRef = useRef<FlatList<any>>(null);
  const skipLoaderRef = useRef(false);
  const { isNetworkAvailable } = useNetworkStatus();
  // const isFocused = useIsFocused();

  const {
    pageNo,
    loading,
    isFetchingMore,
    hasMoreData,
    searchValue,
    selectedTypeId,
    selectedTagId,
    setPageNo,
    setLoading,
    setIsFetchingMore,
    setHasMoreData,
    setSearchValue,
    setSelectedTypeId,
    setSelectedTagId,
    resetStore,
  } = useNewFormStore();
  const [newFormData, setNewFormData] = useState([]);
  const orientation = useOrientation();
  const hasNotch = DeviceInfo.hasNotch();
  const [isSearching, setIsSearching] = useState(false);
  const [showFilterSearch, setShowFilterSearch] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [typeList, setTypeList] = useState<FormStatus[]>([
    { id: '', displayText: 'All Advanced Form types' },
  ]);
  const [tagList, setTagList] = useState<FormStatus[]>([{ id: '', displayText: 'Choose Tags' }]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // if (isFocused) {
    resetStore();
    skipLoaderRef.current = false;
    setNewFormData([]);
    setPageNo(1);
    fetchTagData();
    fetchTypeData();
    // }
  }, []);

  // useEffect(() => {
  //   if (pageNo === 1) {
  //     NewFormApiCall(true);
  //   }
  // }, [pageNo, searchValue, selectedTypeId, selectedTagId]);

  const fetchTypeData = async () => {
    try {
      const response = await fetchTypeService(isNetworkAvailable);
      const updatedList = [{ id: '', displayText: 'All Advanced Form types' }, ...(response ?? [])];
      setTypeList(updatedList);
    } catch (error) {
      console.error('Error in fetchTypeData --->', error);
    }
  };

  const fetchTagData = async () => {
    try {
      setLoading(true);
      const response = await fetchTagService(isNetworkAvailable);
      const updatedList = [{ id: '', displayText: 'Choose Tags' }, ...(response ?? [])];
      setTagList(updatedList);
      const mobileAppTag = response?.find((tag) => tag.displayText === 'Mobile App');
      setSelectedTagId(mobileAppTag.id);
      if (mobileAppTag) {
        setSelectedTagId(mobileAppTag.id);
        // Call with filter
        NewFormApiCall(true, { tagId: mobileAppTag.id });
      } else {
        // No tag found → fallback call
        NewFormApiCall(true);
      }
    } catch (error) {
      console.error('Error in fetchTagData --->', error);
      NewFormApiCall(true);
    } finally {
    }
  };

  const NewFormApiCall = useCallback(
    async (
      resetPage = false,
      overrideFilters?: {
        typeId?: string;
        tagId?: string;
        search?: string;
      },
    ) => {
      if (!skipLoaderRef.current && resetPage) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const currentPage = resetPage ? 1 : pageNo;
        if (!isNetworkAvailable) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
        const response = await fetchNewFormService(
          currentPage,
          overrideFilters?.search ?? searchValue,
          overrideFilters?.typeId ?? selectedTypeId,
          overrideFilters?.tagId ?? selectedTagId,
          isNetworkAvailable,
        );
        const sortedResponse = [...(response ?? [])].sort((a, b) => {
          const dateA = new Date(a.ModifiedUtc || a.CreatedUtc).getTime();
          const dateB = new Date(b.ModifiedUtc || b.CreatedUtc).getTime();
          return dateB - dateA;
        });

        if (currentPage === 1) {
          setNewFormData(sortedResponse);
        } else {
          setNewFormData([...newFormData, ...sortedResponse]);
        }

        if (response?.length > 0) {
          setPageNo(currentPage + 1);
          setHasMoreData(true);
        } else {
          setHasMoreData(false);
        }
      } catch (error) {
        console.error('Error loading form list --->', error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
        setIsSearching(false);
        skipLoaderRef.current = false;
      }
    },
    [pageNo, searchValue, selectedTagId, selectedTypeId, isNetworkAvailable],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchValue(text);
      setIsSearchActive(!!text);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (text.length >= 3 || text.length === 0) {
          skipLoaderRef.current = true;
          setHasMoreData(true);
          setIsSearching(true);
          setPageNo(1);
          NewFormApiCall(true, { search: text });
        }
      }, 250);
    },
    [setPageNo, setSearchValue, setHasMoreData],
  );

  const renderEmptyComponent = () =>
    !loading ? (
      <NoData
        message={TEXTS.newForm.noNewFormMsg}
        containerStyle={{ marginTop: orientation === 'PORTRAIT' ? '45%' : '' }}
      />
    ) : null;

  const renderFooterLoader = () =>
    isFetchingMore ? (
      <View style={{ paddingVertical: '15%' }}>
        <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
      </View>
    ) : null;

  const isFilterApplied =
    (selectedTypeId !== '' && selectedTypeId != undefined) ||
    (selectedTagId !== '' && selectedTagId != undefined) ||
    searchValue?.length > 0;

  return (
    <ScreenWrapper title={TEXTS.newForm.newFormText}>
      <Loader loading={loading} />
      <View
        style={{
          marginTop:
            orientation === 'PORTRAIT'
              ? hasNotch
                ? height(-0.056)
                : Platform.OS == 'ios'
                  ? height(-0.049)
                  : height(-0.062)
              : height(-0.054),
          alignItems: 'flex-end',
          alignSelf: 'flex-end',
          zIndex: -1,
          marginBottom: height(0.02),
          width: '50%',
        }}
      >
        <View style={styles.switchContainer}>
          <TouchableOpacity
            onPress={() => {
              setShowFilterSearch(!showFilterSearch);
            }}
          >
            <View style={styles.filterIconContainer}>
              <Icon
                name={showFilterSearch ? 'filter-off' : 'filter'}
                size={30}
                color={COLORS.APP_COLOR}
              />
              {isFilterApplied && <View style={styles.filterBadge} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* Search & filters */}
        {showFilterSearch && (
          <>
            <FloatingInput
              label="Filter by Title"
              value={searchValue ?? ''}
              numberOfLines={1}
              onChangeText={handleSearch}
              placeholder="Filter by Title"
              keyboardType="default"
              customRightIcon={isSearchActive ? IMAGES.CLOSE_ICON : IMAGES.SEARCH_ICON}
              onIconPress={() => {
                if (isSearchActive) {
                  setIsSearchActive(false);
                  setSearchValue('');
                  setNewFormData([]);
                  setPageNo(1);
                  NewFormApiCall(true, { search: '' });
                }
              }}
              style={{
                marginBottom: 3,
                marginTop: -6,
              }}
            />
            <CustomDropdown
              data={typeList}
              labelField="displayText"
              valueField="id"
              zIndexPriority={3}
              label="All Advanced Form types"
              value={selectedTypeId}
              containerStyle={styles.inputFieldStyle}
              onChange={(item) => {
                const selectedId = item?.value?.id ?? '';
                setSelectedTypeId(selectedId);
                setNewFormData([]);
                setPageNo(1);
                NewFormApiCall(true, { typeId: selectedId });
              }}
              onClear={() => {
                setSelectedTypeId('');
                setNewFormData([]);
                setPageNo(1);
                NewFormApiCall(true, { typeId: '' });
              }}
              placeholder={TEXTS.newForm.placeholderText}
            />
            <CustomDropdown
              data={tagList}
              labelField="displayText"
              valueField="id"
              zIndexPriority={3}
              label="Choose Tags"
              value={selectedTagId}
              containerStyle={styles.inputFieldStyle}
              onChange={(item) => {
                const selectedId = item?.value?.id ?? '';
                setSelectedTagId(selectedId);
                setNewFormData([]);
                setPageNo(1);
                NewFormApiCall(true, { tagId: selectedId });
              }}
              onClear={() => {
                setSelectedTagId('');
                setNewFormData([]);
                setPageNo(1);
                NewFormApiCall(true, { tagId: '' });
              }}
              placeholder={TEXTS.newForm.placeholderText}
            />
          </>
        )}

        {isSearching ? (
          <View style={{ paddingVertical: '10%' }}>
            <Loader loading={isSearching} overlayMode={false} />
          </View>
        ) : newFormData.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={newFormData}
              keyExtractor={(item, index) => `${item?.id}-${index}`}
              renderItem={({ item }) => (
                <ManageFormListItem
                  rowData={item}
                  orientation={orientation}
                  isNetworkAvailable={isNetworkAvailable}
                />
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={renderFooterLoader}
              onEndReached={() => {
                if (!isFetchingMore && !loading && hasMoreData) {
                  NewFormApiCall(false);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </View>
        ) : (
          <NoData />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewFormScreen;
