import React, { memo } from 'react';
import { TouchableOpacity, View, Text, Image, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';
import { CaseItemProps } from '../../utils/interfaces/ICase';
import TextHeadingAndTitleView from '../../components/common/TextHeadingAndTitleView';
import IMAGES from '../../theme/images';
import globalStyles from '../../theme/globalStyles';
import { navigate } from '../../navigation/Index';
import { styles } from './myCaseStyles';
import { TEXTS } from '../../constants/strings';
import { getUserRole } from '../../session/SessionManager';
import { openMaps } from '../../utils/helper/helpers';

const CaseItem: React.FC<CaseItemProps> = ({ item, isAllowEditCase, orientation }) => {
  const handleEdit = () => {
    if (isAllowEditCase) {
      const userId = getUserRole();
      if (item.isEditable && item.viewOnlyAssignUsers == false) {
        navigate('EditCaseScreen', {
          caseId: item.contentItemId ?? '',
          myCaseData: item,
        });
      } else if (
        item.isEditable &&
        item.viewOnlyAssignUsers &&
        item.assignedUsers != null &&
        item.assignedUsers.includes(userId) // Check if the user is part of assigned users
      ) {
        navigate('EditCaseScreen', {
          caseId: item.contentItemId ?? '',
          myCaseData: item,
        });
      } else {
        Alert.alert(
          'Access Restricted',
          'The Case has been marked as Private and you do not have access to it. Please ask a user that has access any questions.',
        );
      }
    } else {
      Alert.alert(TEXTS.alertMessages.accessRestricted, TEXTS.alertMessages.editCasePermission);
    }
  };

  return (
    <View
      style={[styles.container, orientation === 'PORTRAIT' ? styles.portrait : styles.landscape]}
    >
      <TouchableOpacity style={styles.content} onPress={handleEdit} activeOpacity={0.7}>
        <TextHeadingAndTitleView heading={item.displayText ?? ''} value="" />
        <TextHeadingAndTitleView
          variant="small"
          heading={`${TEXTS.caseScreen.caseType} -`}
          value={item.caseType ?? 'N/A'}
        />
        {item.location && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openMaps(item.location)}
            disabled={!item.location}
          >
            <TextHeadingAndTitleView
              heading={`${TEXTS.caseScreen.address} -`}
              value={item.location ?? 'N/A'}
              variant="address"
            />
          </TouchableOpacity>
        )}
        <View style={styles.badgeContainer}>
          <View
            style={[styles.statusBadge, { backgroundColor: item.caseStatusColor ?? COLORS.BLACK }]}
          >
            <Text style={styles.statusText}>{`Status - ${item.caseStatus ?? 'Unknown'}`}</Text>
          </View>
          <View style={styles.publishBadge}>
            <Text style={styles.publishText}>
              {item.published ? TEXTS.caseScreen.published : TEXTS.caseScreen.draft}
            </Text>
          </View>
          {item.viewOnlyAssignUsers ? (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.RED }]}>
              <Text style={styles.statusText}>Private</Text>
            </View>
          ) : (
            <View />
          )}
          {item.isEditable && (
            <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
              <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(CaseItem, (prevProps, nextProps) => {
  return (
    prevProps.item.contentItemId === nextProps.item.contentItemId &&
    prevProps.orientation === nextProps.orientation
  );
});
