import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { SentEmail } from '../../../utils/interfaces/ISubScreens';
import { Card } from 'react-native-paper';
import { height } from '../../../utils/helper/dimensions';
import ExpandableView from '../../../components/common/ExpandableView';

interface Props {
  rowData: SentEmail;
}

export const SendMailListItem: React.FC<Props> = ({ rowData }) => {
  return (
    <Card style={styles.headingStyle}>
      <View style={styles.expandView}>
        <ExpandableView
          to={rowData.to}
          subject={rowData.subject}
          createdUtc={rowData.createdUtc}
          succeeded={rowData.succeeded}
          data={rowData.body}
        />
      </View>
    </Card>
  );
};
const styles = StyleSheet.create({
  headingStyle: {
    padding: 0,
    shadowOpacity: 0,
    borderRadius: 10,
    marginBottom: height(0.01),
    marginTop: height(0.01),
    marginLeft: 2,
    marginRight: 2,
  },
  expandView: {
    flex: 1,
    flexDirection: 'column',
  },
});
