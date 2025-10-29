import React, { memo, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { fetchFormList, filterFormList } from '../new-form/FormService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Loader from '../../components/common/Loader';
import { COLORS } from '../../theme/colors';
import { height } from '../../utils/helper/dimensions';
import AddFormItemView from './AddFormItemView';
import { FormItem } from '../../utils/interfaces/IComponent';
import NoData from '../../components/common/NoData';
import { TEXTS } from '../../constants/strings';
import { useNetworkStatus } from '../../utils/checkNetwork';
import { sortByKey } from '../../utils/helper/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type AddFormScreenProps = NativeStackScreenProps<RootStackParamList, 'AddForm'>;

const AddForm: React.FC<AddFormScreenProps> = ({ route, navigation }) => {
  const { caseData, type } = route.params;
  const isCase = type === 'Case' ? true : false;
  const { isNetworkAvailable } = useNetworkStatus();
  const isFocused = useIsFocused();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [allForms, setAllForms] = useState<FormItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMore, setLoadMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      hasFetchedOnce.current = false; // Allow re-fetching when coming back
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchInitialForms = async () => {
      setIsLoading(true);
      try {
        const newForms = await fetchFormList(1, isNetworkAvailable, true);

        setForms(sortByKey(newForms || [], 'DisplayText'));
        setAllForms(sortByKey(newForms || [], 'DisplayText'));
        if (newForms.length > 0) {
          setPageNo(2);
        }
      } catch (error) {
        console.warn('Error fetching forms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused && !hasFetchedOnce.current) {
      fetchInitialForms();
      hasFetchedOnce.current = true;
    }
  }, [isFocused, isNetworkAvailable]);

  const handleLoadMore = async () => {
    // Prevent loading more if searching and list is empty or small
    if (isLoading || !isNetworkAvailable || (isSearching && forms.length === 0)) return;
    setLoadMore(true);
    try {
      const newForms = await fetchFormList(pageNo, isNetworkAvailable, false);
      if (newForms.length > 0) {
        setForms((prev) => [...prev, ...newForms]);
        setAllForms((prev) => [...prev, ...newForms]);
        setPageNo((prev) => prev + 1);
      }
    } catch (error) {
      console.warn('Error loading more forms:', error);
    } finally {
      setLoadMore(false);
    }
  };

  // const handleSearch = (text: string) => {
  //   try {
  //     setSearchQuery(text);
  //     setIsSearching(text.length > 0);
  //     setShowSuggestions(text.length > 0);
  //     const filtered = filterFormList(allForms, text);
  //     setForms(filtered);
  //     setPageNo(1); // Reset pagination when searching
  //   } catch (error) {
  //     console.warn("Error during search:", error);
  //     setForms([]);
  //   }
  // };
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
    setShowSuggestions(text.length > 0);

    if (text.length === 0) {
      setForms(allForms);
      return;
    }

    setIsSearchLoading(true);

    // Artificial async behavior so loader can appear
    setTimeout(() => {
      try {
        const filtered = filterFormList(allForms, text);
        setForms(filtered);
        setPageNo(1); // Reset pagination when searching
      } catch (error) {
        console.warn('Error during search:', error);
        setForms([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500); // delay so ActivityIndicator actually shows
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setShowSuggestions(false);
    setForms(allForms);
    setPageNo(1);
  };
  const renderFooterLoader = () =>
    isLoadMore ? (
      <View style={{ paddingVertical: '15%' }}>
        <ActivityIndicator size="small" color={COLORS.APP_COLOR} />
      </View>
    ) : null;

  const renderEmptyComponent = () =>
    !isLoading ? (
      <NoData
        message={TEXTS.subScreens.attachedItem.noFormsAvailable}
        containerStyle={{ marginTop: height(0.07) }}
      />
    ) : null;

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <ScreenWrapper title="Add Form">
        <View style={styles.searchContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search..."
            autoCorrect={true}
            placeholderTextColor={COLORS.BLACK}
            style={styles.searchInput}
            autoCapitalize="none"
            autoFocus={false}
            onFocus={() => setShowSuggestions(true)}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={isSearching ? clearSearch : undefined}
          >
            <Icon name={isSearching ? 'close' : 'magnify'} size={26} color={COLORS.APP_COLOR} />
          </TouchableOpacity>
        </View>
        {isSearchLoading ? (
          <View style={{ paddingVertical: '10%' }}>
            <Loader loading={isSearching} overlayMode={false} />
          </View>
        ) : (
          <FlatList
            data={forms}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item?.contentItemId?.toString() || index?.toString()}
            renderItem={({ item }) => (
              <AddFormItemView
                item={item}
                navigation={navigation}
                isNetConnected={isNetworkAvailable}
                caseLicenseData={caseData}
                isMyCase={isCase}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.8} // Increased threshold to reduce premature triggers
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={renderFooterLoader}
          />
        )}
      </ScreenWrapper>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.APP_COLOR,
    height: 30,
  },
  searchButton: {
    alignItems: 'flex-end',
  },
  searchIcon: {
    width: height(0.025),
    height: height(0.025),
  },
});

export default memo(AddForm);
