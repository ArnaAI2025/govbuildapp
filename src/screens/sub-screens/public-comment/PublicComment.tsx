import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { RichEditor } from 'react-native-pell-rich-editor';
import type { RootStackParamList } from '../../../navigation/Types';
import { useNetworkStatus } from '../../../utils/checkNetwork';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Loader from '../../../components/common/Loader';
import IMAGES from '../../../theme/images';
import { getUserRole } from '../../../session/SessionManager';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import type { CommentsState } from '../../../utils/interfaces/ISubScreens';
import {
  fetchAdminAndPublicComment,
  saveComment,
} from '../../../services/sub-screens-service/SubScreensCommonService';
import { TEXTS } from '../../../constants/strings';
import { styles } from '../admin-notes/adminNotesStyle';
import CommentItem from '../admin-notes/CommentItem';
import StandardCommentDialog from '../../../components/comments-list/CommentListDialog';
import OpenDocPickerDialog from '../../../components/common/OpenDocPickerDialog';
import { navigate } from '../../../navigation/Index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { height } from '../../../utils/helper/dimensions';
import NoData from '../../../components/common/NoData';
import { normalizeBool } from '../../../utils/helper/helpers';
import { useOrientation } from '../../../utils/useOrientation';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

type PublicCommentsScreenProps = NativeStackScreenProps<RootStackParamList, 'PublicComments'>;

const PublicComments: React.FC<PublicCommentsScreenProps> = ({ route, navigation }) => {
  const {
    param: caseData,
    permissions,
    // isOnline: initialOnlineStatus,
  } = route.params;
  const orientation = useOrientation();
  const isForceSync = normalizeBool(route?.params?.isForceSync);
  const { isNetworkAvailable: realNetworkAvailable } = useNetworkStatus();
  // Override network based on isForceSync
  const isNetworkAvailable = isForceSync === true ? false : realNetworkAvailable;

  const isFocused = useIsFocused();
  const richText = useRef<RichEditor>(null);
  const isCase = route?.params.type == 'Case' ? true : false;
  const flatListRef = useRef<FlatList>(null);

  const [state, setState] = useState<CommentsState>({
    comments: [],
    newComment: '',
    isLoading: true,
    isPublic: false,
    isEditComment: false,
    editCommentId: '',
    deleteComment: false,
    alertVisible: false,
    openComment: false,
    checkedStComment: [],
    userId: '',
    fromAttachedItems: false,
  });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Memoized functions
  const fetchComments = useCallback(async () => {
    try {
      richText.current?.setContentHTML('');
      setState((prev) => ({ ...prev, isLoading: true, newComment: '' }));
      const data = await fetchAdminAndPublicComment(
        caseData.contentItemId,
        isCase,
        true,
        isNetworkAvailable,
      );
      if (data) {
        setState((prev) => ({
          ...prev,
          comments: data?.map((comment: any) => ({
            id: comment.commentSubmissionPart?.ContentItemID || comment.contentItemId,
            text: comment.commentSubmissionPart?.Comment || comment.comment,
            author: comment.author,
            createdUtc: comment.createdUtc,
            isPublic: comment.isPublic,
            isAlert: comment.commentSubmissionPart?.IsAlert || comment.comment_isAlert,
            attachment: comment.commentSubmissionPart?.Attachment || comment.Attachment,
            fileName: comment.commentSubmissionPart?.FileName || comment.FileName,
          })),
        }));
      } else {
        setState((prev) => ({ ...prev, comments: [] }));
      }
    } catch (error) {
      recordCrashlyticsError('Error fetching admin comments:', error);
      console.error('Error fetching admin comments:', error);
      setState((prev) => ({ ...prev, comments: [] }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [caseData.contentItemId, isNetworkAvailable]);

  const handleAddComment = useCallback(async () => {
    if (!state.newComment.trim()) {
      ToastService.show(TEXTS.subScreens.adminNotes.fillComment, COLORS.ERROR);
      return;
    }

    try {
      richText.current?.blurContentEditor?.();
      Keyboard.dismiss();
      setState((prev) => ({ ...prev, isLoading: true }));
      const savePublicComment = await saveComment(
        caseData?.contentItemId,
        state.newComment,
        true,
        state.isEditComment,
        state.editCommentId,
        state.fileName ?? '',
        state.attachment ?? '',
        isNetworkAvailable,
        true,
        isCase,
      );

      if (savePublicComment?.success && savePublicComment?.newComment) {
        !state.deleteComment
          ? ToastService.show(
              `Comment ${state.isEditComment ? 'updated' : 'added'} successfully`,
              COLORS.SUCCESS_GREEN,
            )
          : ToastService.show('Comment deleted successfully', COLORS.SUCCESS_GREEN);

        // setState((prev) => ({
        //   ...prev,
        //   comments: state.isEditComment
        //     ? prev.comments.map((comment) =>
        //         comment.id === state.editCommentId
        //           ? {
        //               ...comment,
        //               text: state.newComment,
        //               isPublic: state.isPublic,
        //             }
        //           : comment
        //       )
        //     : [
        //         savePublicComment?.newComment as AdminAndPublicComment,
        //         ...prev.comments,
        //       ],
        // }));

        fetchComments().then(() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          setTimeout(
            () => setHighlightedId(savePublicComment.commentId ?? state.editCommentId),
            300,
          );
          setTimeout(() => setHighlightedId(null), 3000);
        });
      } else {
        ToastService.show(TEXTS.subScreens.adminNotes.commentError, COLORS.ERROR);
      }
    } catch (error) {
      recordCrashlyticsError('Error saving comment:', error);
      console.error('Error saving comment:', error);
      ToastService.show(TEXTS.subScreens.adminNotes.commentError, COLORS.ERROR);
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        newComment: '',
        isPublic: false,
        isEditComment: false,
        editCommentId: '',
        deleteComment: false,
      }));
      richText.current?.setContentHTML('');
    }
  }, [caseData?.contentItemId, isNetworkAvailable, state]);

  const handleEditComment = useCallback(
    (commentId: string, text: string, attachment?: string, fileName?: string) => {
      setState((prev) => ({
        ...prev,
        newComment: text,
        isEditComment: true,
        editCommentId: commentId,
        attachment: attachment,
        fileName: fileName,
      }));
      richText.current?.setContentHTML(text);
    },
    [],
  );

  const handleDeleteComment = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      newComment: TEXTS.subScreens.adminNotes.moderatorComment,
      isEditComment: true,
      editCommentId: commentId,
      deleteComment: true,
    }));
  }, []);

  // Effects
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      userId: getUserRole()?.toLowerCase() || '',
    }));
  }, []);

  useEffect(() => {
    if (isFocused && route.params?.newCommentAdded && route.params?.newCommentId) {
      fetchComments().then(() => {
        setTimeout(() => {
          const newCommentIndex = state.comments.findIndex(
            (comment) => comment.id === route.params.newCommentId,
          );
          if (newCommentIndex !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: newCommentIndex,
              animated: true,
              viewPosition: 0,
            });
          } else {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
          setTimeout(() => {
            setState((prev) => ({ ...prev, fromAttachedItems: true }));
            setHighlightedId(null);
            navigation.setParams({
              newCommentAdded: undefined,
              newCommentId: undefined,
            });
          }, 400);
        }, 300);
      });
    } else {
      if (isFocused) {
        fetchComments();
      }
    }
  }, [isFocused, route.params?.newCommentAdded, route.params?.newCommentId]);

  useEffect(() => {
    if (state.deleteComment) {
      handleAddComment();
    }
  }, [state.deleteComment]);

  function FileUploadApi(fileArray: any, comment: string) {
    navigate('CommentWithFileAttached', {
      caseData: route.params.param,
      isAdminNotes: false,
      isOnline: isNetworkAvailable,
      fileArray: fileArray,
      comment: comment,
      isCase: isCase,
      permissions: permissions,
    });
  }

  async function commentInsert(selectedComment: string) {
    const fullBody = `${state.newComment}${selectedComment}`;
    setState((prev) => ({ ...prev, newComment: fullBody }));
    richText.current?.setContentHTML(fullBody);
  }

  return (
    <ScreenWrapper
      title={TEXTS.subScreens.publicComment.heading}
      onBackPress={() => {
        if (state.fromAttachedItems) {
          const state = navigation.getState();
          const publicCommentsCount = state.routes.filter(
            (r) => r.name === 'PublicComments',
          ).length;
          if (publicCommentsCount > 0) {
            // PublicComments already exists in stack, just pop back to it
            const index = state.routes.findIndex((r) => r.name === 'PublicComments');
            navigation.pop(state.routes.length - 1 - index);
            navigation.goBack();
          }
        } else {
          navigation.pop();
        }
      }}
    >
      <Loader loading={state.isLoading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // No height for Android
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ flex: 1 }}>
          <OpenDocPickerDialog
            visible={state.alertVisible}
            onClose={() => setState((prev) => ({ ...prev, alertVisible: false }))}
            config={{
              flag: 2,
              comment: state.newComment,
              FileUploadApi: FileUploadApi,
              isEdit: false,
              index: '',
              id: '',
            }}
          />
          <StandardCommentDialog
            setOpenComment={(openComment: boolean) =>
              setState((prev) => ({ ...prev, openComment }))
            }
            openComment={state.openComment}
            checked={state.checkedStComment}
            setChecked={(checkedStComment: any[]) =>
              setState((prev) => ({ ...prev, checkedStComment }))
            }
            commentInsert={commentInsert}
          />

          <FlatList
            data={state.comments}
            ref={flatListRef}
            renderItem={({ item }) => (
              <CommentItem
                item={item}
                userId={getUserRole()?.toLowerCase() || ''}
                isFromPublicComment
                isNetworkAvailable={isNetworkAvailable}
                permissions={permissions}
                isStatusReadOnly={caseData.isStatusReadOnly}
                onEditComment={() =>
                  handleEditComment(item.id, item.text, item?.attachment, item.fileName)
                }
                onDeleteComment={handleDeleteComment}
                isHighlighted={highlightedId === item.id}
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <NoData containerStyle={{ marginTop: orientation === 'PORTRAIT' ? '36%' : '13%' }} />
            }
            contentContainerStyle={styles.commentsList}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={state.comments.length} // Render all comments initially
            onScrollToIndexFailed={(info) => {
              // Handle case where scrollToIndex fails (e.g., item not yet rendered)
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0,
                });
              }, 500);
            }}
          />
          <View style={styles.addCommentContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    opacity: caseData?.isStatusReadOnly || isForceSync ? 0.4 : 1,
                  },
                ]}
                onPress={() =>
                  setState((prev) => ({
                    ...prev,
                    alertVisible: !state.alertVisible,
                  }))
                }
                disabled={normalizeBool(caseData?.isStatusReadOnly) || isForceSync}
              >
                <Icon name="paperclip" size={height(0.025)} color={COLORS.WHITE} />
              </TouchableOpacity>
              {isNetworkAvailable && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      opacity: caseData?.isStatusReadOnly || isForceSync ? 0.4 : 1,
                    },
                  ]}
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      openComment: true,
                      checkedStComment: [],
                    }))
                  }
                  disabled={normalizeBool(caseData?.isStatusReadOnly) || isForceSync}
                >
                  <Icon name="message-text-outline" size={height(0.025)} color={COLORS.WHITE} />
                </TouchableOpacity>
              )}
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  opacity: caseData?.isStatusReadOnly || isForceSync ? 0.4 : 1,
                },
              ]}
              pointerEvents={caseData?.isStatusReadOnly || isForceSync ? 'none' : 'auto'}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <RichEditor
                  useContainer
                  ref={richText}
                  //  androidLayerType="software"
                  initialContentHTML={state.newComment}
                  style={styles.richEditor}
                  editorStyle={{
                    backgroundColor: 'transparent',
                  }}
                  onChange={(text) => setState((prev) => ({ ...prev, newComment: text }))}
                  onBlur={() => Keyboard.dismiss()}
                />
              </ScrollView>
              <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
                <Image source={IMAGES.SEND_ICON} style={styles.sendIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default memo(PublicComments);
