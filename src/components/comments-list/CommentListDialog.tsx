import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  Keyboard,
} from 'react-native';

import { FilterItem } from '../../utils/interfaces/ICase';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY } from '../../theme/fonts';
import { height } from '../../utils/helper/dimensions';
import { StandardCommentDialogListItem } from './CommentListDialogListItem';
import NoData from '../common/NoData';
import CustomDropdown from '../common/CustomDropdown';
import IMAGES from '../../theme/images';
import { fetchStandardComments } from '../../services/sub-screens-service/SubScreensCommonService';
import FloatingInput from '../common/FloatingInput';
import { CommentType, StandardComment } from '../../utils/interfaces/ISubScreens';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PublishButton from '../common/PublishButton';
import Loader from '../common/Loader';

interface StandardCommentDialogProps {
  openComment: boolean;
  setOpenComment: (open: boolean) => void;
  checked: string[];
  setChecked: (checked: string[]) => void;
  commentInsert: (comment: string) => void;
}

const getCommentType = (commentTypes: FilterItem[] = [], value: StandardComment): string => {
  let commentTypeString = '';
  const contentItemIds = value.StandardComment.CommentType?.ContentItemIds ?? [];

  commentTypes.forEach((type) => {
    if (contentItemIds.includes(type.id)) {
      commentTypeString += `${type.displayText}, `;
    }
  });

  return commentTypeString.length > 0 ? commentTypeString.slice(0, -2) : commentTypeString;
};

const StandardCommentDialog: React.FC<StandardCommentDialogProps> = ({
  openComment,
  setOpenComment,
  checked,
  setChecked,
  commentInsert,
}) => {
  const [typeValue, setTypeValue] = useState();
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [filterCommentList, setFilterCommentList] = useState<StandardComment[]>([]);
  const [standardCommentData, setStandardCommentData] = useState<StandardComment[]>([]);
  const [commentType, setCommentType] = useState<FilterItem[]>([]);
  const [showFilterSearch, setShowFilterSearch] = useState<boolean>(false);

  // Check if any filter is applied (for red dot on icon)
  const isFilterApplied =
    (typeValue?.id !== '' && typeValue?.id != undefined) || search?.length > 0;

  const filterCommentData = (filterId: string, searchText: string) => {
    setIsSearching(true);

    setTimeout(() => {
      let filtered = standardCommentData;

      // Apply type filter
      if (filterId) {
        filtered = filtered.filter(
          (item) => item.StandardComment?.CommentType?.ContentItemIds?.includes(filterId) ?? false,
        );
      }

      // Apply search filter
      if (searchText.length > 1) {
        const lowerSearch = searchText.toLowerCase();
        filtered = filtered.filter((item) => {
          const displayTextMatch = item.DisplayText?.toLowerCase().includes(lowerSearch);
          const shortDescMatch =
            item?.StandardComment?.ShortDescription?.Text?.toLowerCase().includes(lowerSearch);
          const commentTypeMatch = getCommentType(commentType, item)
            .toLowerCase()
            .includes(lowerSearch);
          return displayTextMatch || shortDescMatch || commentTypeMatch;
        });
      }

      setFilterCommentList(filtered);
      setIsSearching(false);
    }, 300); // show loader at least for 300ms
  };

  const onChangeText = (value: string) => {
    setSearch(value);
    setIsSearch(value.length > 0);
    filterCommentData(typeValue?.id, value);
  };

  const fetchCommentsList = async () => {
    const result = await fetchStandardComments(true);
    const [commentResponse, typeResponse] = Array.isArray(result) ? result : [null, null];

    if (commentResponse) {
      setStandardCommentData(commentResponse);
      setFilterCommentList(commentResponse);
    }
    if (typeResponse) {
      const tempArray: FilterItem[] = [];
      typeResponse.forEach((item: CommentType) => {
        if (item.DisplayText) {
          tempArray.push({
            displayText: item.DisplayText,
            id: item.ContentItemId,
          });
        }
      });
      setCommentType(tempArray);
    }
  };

  // Reset filters and fetch comments when modal opens
  useEffect(() => {
    if (openComment) {
      setTypeValue();
      setSearch('');
      setIsSearch(false);
      setShowFilterSearch(false);
      setFilterCommentList(standardCommentData);
      fetchCommentsList();
    }
  }, [openComment]);

  const handleInsert = () => {
    if (checked.length === 0) {
      alert('Please select standard comment');
      return;
    }

    const fullBody = checked.reduce((body, checkedId) => {
      const comment = standardCommentData.find((item) => item.ContentItemId === checkedId);
      return body + (comment?.StandardComment.Comment.Html ?? '');
    }, '');

    commentInsert(fullBody);
    setOpenComment(false);
  };

  return (
    <Modal
      visible={openComment}
      animationType="slide"
      supportedOrientations={['landscape', 'portrait']}
      transparent
    >
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => setOpenComment(false)}>
              <Icon name="close" size={30} color={COLORS.APP_COLOR} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Select Standard Comment</Text>
            <TouchableOpacity onPress={() => setShowFilterSearch(!showFilterSearch)}>
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
          {showFilterSearch && (
            <View style={styles.filterSearchContainer}>
              <View style={styles.dropdownContainer}>
                <CustomDropdown
                  data={commentType ?? []}
                  labelField="displayText"
                  valueField="id"
                  value={typeValue?.id}
                  onChange={(item) => {
                    setTypeValue(item?.value);
                    filterCommentData(item?.value?.id, search);
                  }}
                  label="Type"
                  placeholder="Filter By Type"
                  zIndexPriority={0}
                />
              </View>
              <View>
                <FloatingInput
                  label="Search"
                  value={search ?? ''}
                  numberOfLines={1}
                  onChangeText={onChangeText}
                  placeholder="Please search..."
                  keyboardType="default"
                  customRightIcon={isSearch ? IMAGES.CLOSE_ICON : IMAGES.SEARCH_ICON}
                  onIconPress={() => {
                    if (isSearch) {
                      setIsSearch(false);
                      setSearch('');
                      filterCommentData(typeValue?.id, '');
                    }
                  }}
                />
              </View>
            </View>
          )}
          <View style={styles.contentContainer}>
            {isSearching ? (
              <View style={styles.loaderContainer}>
                <Loader loading={isSearching} overlayMode={false} />
              </View>
            ) : filterCommentList.length > 0 ? (
              <View style={styles.listContainer}>
                <FlatList
                  style={styles.flatList}
                  showsVerticalScrollIndicator={false}
                  data={filterCommentList}
                  renderItem={({ item }) => (
                    <StandardCommentDialogListItem
                      rowData={item}
                      checked={checked}
                      setChecked={setChecked}
                      inspectionCommentType={commentType}
                    />
                  )}
                  keyExtractor={(_, index) => index.toString()}
                  onScrollBeginDrag={() => Keyboard.dismiss()}
                />

                {/* <TouchableOpacity
                  style={styles.insertButton}
                  onPress={handleInsert}
                >
                  <Text style={styles.insertButtonText}>Insert</Text>
                </TouchableOpacity> */}
                <PublishButton
                  textName="Insert"
                  buttonStyle={{ marginTop: 15 }}
                  onPress={handleInsert}
                />
              </View>
            ) : (
              <NoData />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Styles defined at the bottom
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 0.9,
    backgroundColor: COLORS.WHITE,
    padding: height(0.02),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height(0.02),
  },
  headerText: {
    color: COLORS.BLACK,
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: height(0.02),
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
    backgroundColor: COLORS.RED, // Assuming COLORS.RED exists, else use "#FF0000"
  },
  filterSearchContainer: {
    flexDirection: 'column',
    marginBottom: height(0.012),
    zIndex: 2,
  },
  dropdownContainer: {
    marginBottom: height(0.015),
  },
  searchContainer: {
    flex: 1,
    marginBottom: height(0.018),
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
  },
  flatList: {
    marginTop: height(0.01),
  },
  insertButton: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.05),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height(0.02),
  },
  insertButtonText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.MontserratMedium,
    fontSize: height(0.018),
  },
  loaderContainer: {
    paddingVertical: '10%',
  },
});

export default StandardCommentDialog;
