import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { RootStackParamList } from '../../../navigation/Types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useOrientation } from '../../../utils/useOrientation';
import { fetchTaskList } from '../../../services/sub-screens-service/SubScreensCommonService';
import { Task } from '../../../utils/interfaces/ISubScreens';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { COLORS } from '../../../theme/colors';
import Loader from '../../../components/common/Loader';
import { fontSize, height, marginTopAndBottom } from '../../../utils/helper/dimensions';
import { TaskRowItem } from './TaskRowItem';
import NoData from '../../../components/common/NoData';
import IMAGES from '../../../theme/images';

type TaskScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskScreen'>;

const TaskScreen: React.FC<TaskScreenProps> = ({ route }) => {
  const orientation = useOrientation();
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Task[]>([]);
  const [allData, setAllData] = useState<Task[]>([]);
  const [, setIsSearch] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (route.params.param?.contentItemId) {
        const tasks = await fetchTaskList(
          route.params.param.contentItemId,
          route.params?.isOnline,
          setLoading,
        );
        setData(tasks);
        setAllData(tasks);
      }
    };
    fetchData();
  }, [route.params.param?.contentItemId]);

  const filteredSuggestions = (filterData: string) => {
    if (filterData.length > 1) {
      setData(
        allData.filter((suggestion) => {
          const teamMemberMatch = suggestion.teamMemberName
            .toLowerCase()
            .includes(filterData.toLowerCase());
          const statusMatch = suggestion.status.toLowerCase().includes(filterData.toLowerCase());
          const typeMatch = suggestion.type.toLowerCase().includes(filterData.toLowerCase());
          return teamMemberMatch || statusMatch || typeMatch;
        }),
      );
    }
  };
  const onChangeText = (value: string) => {
    setSearchValue(value);

    if (value.length === 0) {
      setIsSearch(false);
      setData(allData);
    } else {
      setIsSearch(true);
      setIsSearching(true);

      // Add small delay to simulate search processing
      setTimeout(() => {
        filteredSuggestions(value);
        setIsSearching(false);
      }, 300);
    }
  };

  return (
    <ScreenWrapper title="Tasks">
      <Loader loading={isLoadingAPI} />
      <View style={styles.innerContainer}>
        {allData.length > 0 && (
          <View style={styles.searchContainer}>
            <TextInput
              value={searchValue}
              onChangeText={onChangeText}
              placeholder="Search..."
              style={styles.searchInput}
              autoCapitalize="none"
              autoFocus={false}
            />
            <View style={styles.searchIconContainer}>
              {searchValue ? (
                <TouchableOpacity
                  onPress={() => {
                    if (searchValue !== '') {
                      setIsSearch(false);
                      setSearchValue('');
                      setData(allData);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Image source={IMAGES.CROSS_ICON} style={styles.icon} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onChangeText(searchValue ?? '')}
                  activeOpacity={0.7}
                >
                  <Image source={IMAGES.SEARCH_ICON} style={styles.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {isSearching ? (
          <View style={{ paddingVertical: '10%' }}>
            <Loader loading={isSearching} overlayMode={false} />
          </View>
        ) : (
          <FlatList
            style={styles.flatList}
            data={data}
            renderItem={({ item }) => <TaskRowItem rowData={item} orientation={orientation} />}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={
              <NoData
                containerStyle={{
                  marginTop: orientation === 'PORTRAIT' ? '36%' : '13%',
                }}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
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
  textInput: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    height: height(0.015),
    width: height(0.015),
    margin: 5,
  },
  iconStyle: {
    height: height(0.03),
    width: height(0.03),
  },
  flatList: {
    marginTop: marginTopAndBottom(0.04),
  },
  labelStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.025),
    textAlign: 'center',
  },
  syncButton: {
    color: COLORS.APP_COLOR,
    textAlign: 'center',
    fontSize: fontSize(0.025),
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
});

export default TaskScreen;
