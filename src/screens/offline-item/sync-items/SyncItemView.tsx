import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import globalStyles from '../../../theme/globalStyles';
import { cardBorder, fontSize, height } from '../../../utils/helper/dimensions';
import TextHeadingAndValue from '../../../components/common/TextHeadingAndTitleView';
import { COLORS } from '../../../theme/colors';

type RootStackParamList = {
  // Define your navigation stack here
};

interface SyncItemData {
  displayText: string;
  caseType: string;
  location: string;
  isEdited: boolean;
  isSync: boolean;
}

interface SyncItemViewProps {
  data: SyncItemData;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  navigation: NativeStackNavigationProp<RootStackParamList>;
  isNetConnected: boolean;
}

const SyncItemView: React.FC<SyncItemViewProps> = ({ data }) => {
  return (
    <View style={globalStyles.cardContainer}>
      <TouchableOpacity onPress={() => {}}>
        <View style={[styles.cardContent, { height: height(0.18) }]}>
          <TextHeadingAndValue heading="Case #: " value={data.displayText} />
          <TextHeadingAndValue heading="Case Type: " value={data.caseType} />
          <TouchableOpacity onPress={() => Linking.openURL(`maps://app?saddr=${data.location}`)}>
            <TextHeadingAndValue heading="Address: " value={data.location} />
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            <Text style={data.isEdited && data.isSync ? styles.syncedText : styles.notSyncedText}>
              {data.isEdited && data.isSync ? 'Synced' : 'Not Synced'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    borderRadius: 5,
    borderWidth: cardBorder(),
    elevation: 5,
    marginVertical: height(0.01),
    marginHorizontal: 0,
  },
  cardContent: {
    flexDirection: 'column',
    padding: height(0.015),
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncedText: {
    color: COLORS.APP_COLOR,
    fontSize: fontSize(0.03),
    textAlign: 'right',
  },
  notSyncedText: {
    color: COLORS.RED,
    fontSize: fontSize(0.03),
    textAlign: 'right',
  },
});

export default SyncItemView;
