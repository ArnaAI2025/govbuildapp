import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RichEditor } from 'react-native-pell-rich-editor';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/Types';
import { TEXTS } from '../../../constants/strings';
import { ToastService } from '../../../components/common/GlobalSnackbar';
import { COLORS } from '../../../theme/colors';
import Loader from '../../../components/common/Loader';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import IMAGES from '../../../theme/images';
import { saveCommentWithDoc } from '../../../services/sub-screens-service/SubScreensCommonService';
import { styles } from './adminNotesStyle';
import { useNetworkStatus } from '../../../utils/checkNetwork';

type CommentWithFileAttachedProps = NativeStackScreenProps<
  RootStackParamList,
  'CommentWithFileAttached'
>;

interface FileItem {
  localUrl: string;
  name: string;
  mimeType: string;
}

const CommentWithFileAttached: React.FC<CommentWithFileAttachedProps> = ({ route, navigation }) => {
  const [comment, setComment] = useState<string>(route.params.comment || '');
  const [caseData] = useState(route.params.caseData);
  const [fileArray, setFileArray] = useState<FileItem[]>(route.params.fileArray || []);
  const [isLoadingAPI, setLoading] = useState<boolean>(false);
  const [saveDisable, setSaveDisable] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { isNetworkAvailable } = useNetworkStatus();
  const isAdminNotes = route.params.isAdminNotes;
  const permissions = route.params.permissions;
  const richTextRef = useRef<RichEditor>(null);

  const hasUnsavedChanges = (): boolean => {
    return comment.trim() !== '' || fileArray.length > 0;
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        TEXTS.subScreens.commentWithFileAttached.unsavedChangesTitle,
        TEXTS.subScreens.commentWithFileAttached.unsavedChangesMessage,
        [
          { text: TEXTS.alertMessages.cancel, style: 'cancel' },
          {
            text: 'Ok',
            style: 'destructive',
            onPress: () => {
              setComment('');
              richTextRef.current?.setContentHTML('');
              navigation.goBack();
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      navigation.goBack();
    }
  };

  const saveComment = async () => {
    if (comment.trim() === '') {
      ToastService.show(TEXTS.subScreens.commentWithFileAttached.commentValidation, COLORS.ERROR);
      return;
    }

    setLoading(true);
    try {
      const newCommentId = await saveCommentWithDoc(
        {
          comment,
          fileArray,
          contentItemId: caseData.contentItemId,
          isAdminNotes,
          isCase: route.params.isCase,
        },
        caseData,
        navigation,
        isNetworkAvailable,
      );
      setComment('');
      setFileArray([]);
      setLoading(false);
      setSaveDisable(false);
      richTextRef.current?.setContentHTML('');
      ToastService.show(TEXTS.subScreens.commentWithFileAttached.saveSuccess, COLORS.SUCCESS_GREEN);

      navigation.replace(isAdminNotes ? 'AdminNotes' : 'PublicComments', {
        param: caseData,
        permissions: permissions,
        caseSettingData: null,
        isOnline: isNetworkAvailable,
        type: route.params.isCase ? 'Case' : 'License',
        newCommentAdded: true,
        newCommentId: newCommentId,
      });
    } catch (error: any) {
      console.error('Error saving comment:', error);
      setLoading(false);
      ToastService.show(TEXTS.subScreens.commentWithFileAttached.savingError, COLORS.ERROR);
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      title={TEXTS.subScreens.commentWithFileAttached.title}
      onBackPress={handleBackPress}
    >
      <Loader loading={isLoadingAPI} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // No height for Android
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {fileArray.length > 0 && (
          <View style={styles.fileSection}>
            <View style={styles.fileHeader}>
              <Text style={styles.fileHeaderText}>
                {TEXTS.subScreens.commentWithFileAttached.selectedFiles}
              </Text>
              <Text style={styles.fileCountText}>
                {`${currentIndex + 1} of ${fileArray.length}`}
              </Text>
            </View>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {fileArray.length > 0 && (
            <FlatList
              data={fileArray}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / (WINDOW_WIDTH - 30),
                );
                setCurrentIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <View style={styles.fileItem}>
                  <Image
                    source={{ uri: item.localUrl }}
                    style={styles.fileImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
              getItemLayout={(data, index) => ({
                length: WINDOW_WIDTH - 30,
                offset: (WINDOW_WIDTH - 30) * index,
                index,
              })}
            />
          )}

          <View style={styles.addCommentContainer}>
            <View style={styles.inputContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <RichEditor
                  useContainer={true}
                  ref={richTextRef}
                  androidLayerType="software"
                  initialContentHTML={comment}
                  style={styles.richEditor}
                  editorStyle={{
                    backgroundColor: 'transparent',
                  }}
                  onChange={(value) => setComment(value)}
                  onBlur={() => Keyboard.dismiss()}
                />
              </ScrollView>
              <TouchableOpacity
                style={styles.sendButton}
                disabled={saveDisable}
                onPress={() => {
                  setSaveDisable(true);
                  saveComment();
                }}
              >
                <Image source={IMAGES.SEND_ICON} style={styles.sendIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CommentWithFileAttached;
