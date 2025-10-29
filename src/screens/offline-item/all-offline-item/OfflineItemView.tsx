import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import globalStyles from '../../../theme/globalStyles';
import { TEXTS } from '../../../constants/strings';
import { styles } from '../../my-case/myCaseStyles';
import TextHeadingAndTitleView from '../../../components/common/TextHeadingAndTitleView';
import { StatusColorCodes } from '../../../utils/helper/helpers';
import IMAGES from '../../../theme/images';

interface ItemData {
  id: string;
  ListType: 'Case' | 'License';
  DisplayText: string;
  Status: string;
  Type: string;
  isForceSync: number;
}

interface OfflineItemViewProps {
  data: ItemData[];
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  getCaseByCID: (caseId: string, type: 'Case' | 'License') => void;
  isSyncAllData: number;
  isOnline: boolean;
  btnLoad: boolean;
}

const OfflineItemView: React.FC<OfflineItemViewProps> = ({
  data,
  // orientation,
  getCaseByCID,
  // isSyncAllData,
  // isOnline,
  // btnLoad,
}) => {
  const rowData = data[0];
  return (
    <View style={globalStyles.cardContainer}>
      <TouchableOpacity onPress={() => ''} activeOpacity={0.7}>
        <TextHeadingAndTitleView
          heading={`${rowData.ListType} - ${rowData.DisplayText ?? ''}`}
          value=""
        />
        <TextHeadingAndTitleView
          variant="small"
          heading={`${TEXTS.caseScreen.caseType} -`}
          value={rowData.Type ?? 'N/A'}
        />
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: StatusColorCodes(rowData.Status) }]}>
            <Text style={styles.statusText}>{`Status - ${rowData.Status ?? ''}`}</Text>
          </View>

          {/* {btnLoad ? (
            <ActivityIndicator size={"small"} />
          ) : ( */}
          <TouchableOpacity
            hitSlop={{ left: 20, right: 20, bottom: 20, top: 20 }}
            style={styles.editIcon}
            onPress={() => {
              getCaseByCID(rowData.id, rowData.ListType);
            }}
          >
            {/* <Icon
                name="square-edit-outline"
                size={24}
                color={COLORS.BLUE_COLOR}
              /> */}
            <Image source={IMAGES.EDIT_ICON} style={globalStyles.iconSize} />
          </TouchableOpacity>
          {/* )} */}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default OfflineItemView;
