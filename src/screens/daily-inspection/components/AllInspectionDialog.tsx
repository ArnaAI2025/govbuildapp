import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Text,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import InspectionDialogListItem from './InspectionDialogListItem';
import type { FC} from 'react';
import { memo } from 'react';
import { height } from '../../../utils/helper/dimensions';
import { COLORS } from '../../../theme/colors';
import type { DailyInspectionModel } from '../../../utils/interfaces/ISubScreens';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_FAMILY } from '../../../theme/fonts';
import PublishButton from '../../../components/common/PublishButton';
import { recordCrashlyticsError } from '../../../services/CrashlyticsService';

// Define interfaces for type safety
interface InspectionItem {
  contentItemId: string;
  location: string | null;
}

interface AllInspectionDialogProps {
  showInspectionDialog: boolean;
  setShowInspectionDialog: (visible: boolean) => void;
  inspectionList: InspectionItem[];
  checked: DailyInspectionModel[];
  setChecked: (checked: DailyInspectionModel[]) => void;
}

// Styles as constants for better maintainability

// Utility function for map redirection
const redirectToDefaultMap = (
  inspectionList: InspectionItem[],
  checked: DailyInspectionModel[],
): void => {
  let baseUrl =
    Platform.OS === 'ios'
      ? 'http://maps.apple.com/maps?saddr=Current+Location&daddr='
      : 'https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=';

  inspectionList?.forEach((item) => {
    if (checked?.includes(item?.contentItemId) && item?.location) {
      try {
        const location = JSON.parse(item.location);
        let destination: string | null = null;

        // Prefer address
        if (location?.Address && location.Address.trim() !== '') {
          destination = encodeURIComponent(location.Address.trim());
        }
        // Fallback → lat/long
        else if (
          location?.Latitude &&
          location?.Longitude &&
          location?.Latitude !== '' &&
          location?.Longitude !== ''
        ) {
          const lat = parseFloat(location.Latitude);
          const long = parseFloat(location.Longitude);

          if (
            !isNaN(lat) &&
            !isNaN(long) &&
            lat !== 0 &&
            long !== 0 &&
            !(lat === 12 && long === 12)
          ) {
            destination = `${lat},${long}`;
          }
        }

        if (destination) {
          if (Platform.OS === 'ios') {
            baseUrl += `${destination}+to:`;
          } else {
            baseUrl += `${destination}+to:`;
          }
        }
      } catch (error) {
        recordCrashlyticsError('Error parsing location:', error);
        console.error('Error parsing location:', error);
      }
    }
  });

  // Clean trailing +to:
  if (baseUrl.endsWith('+to:')) {
    baseUrl = baseUrl.slice(0, -4);
  }

  // Open maps
  if (Platform.OS === 'ios') {
    Linking.openURL(`${baseUrl}&zoom=10&directionsmode=driving`);
  } else {
    Linking.openURL(`${baseUrl}&travelmode=driving&zoom=10`);
  }
};

const AllInspectionDialog: FC<AllInspectionDialogProps> = ({
  showInspectionDialog,
  setShowInspectionDialog,
  inspectionList,
  checked,
  setChecked,
}) => {
  const handleCreateRoute = (): void => {
    if (Platform.OS === 'ios' ? checked.length > 15 : checked.length > 10) {
      Alert.alert(`Please select no more than ${Platform.OS === 'ios' ? 15 : 10} inspections`);
      return;
    }
    if (checked.length === 0) {
      Alert.alert('Please select at least one inspection');
      return;
    }
    redirectToDefaultMap(inspectionList, checked);
    setShowInspectionDialog(false);
  };

  return (
    <View>
      <Modal
        visible={showInspectionDialog}
        animationType="slide"
        supportedOrientations={['landscape', 'portrait']}
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.dialogContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Select Daily Inspection</Text>
                <TouchableOpacity onPress={() => setShowInspectionDialog(false)}>
                  <Icon name="close" size={30} color={COLORS.APP_COLOR} />
                </TouchableOpacity>
              </View>

              <FlatList
                style={styles.flatList}
                showsVerticalScrollIndicator={false}
                data={inspectionList}
                renderItem={({ item }) => (
                  <InspectionDialogListItem item={item} checked={checked} setChecked={setChecked} />
                )}
                keyExtractor={(_, index) => index.toString()}
              />
              <PublishButton
                textName="Create Route"
                buttonStyle={{ marginTop: 15 }}
                onPress={handleCreateRoute}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  modalContent: {
    marginTop: height(0.08),
    flex: 1,
  },
  dialogContainer: {
    marginTop: 10,
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
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
  flatList: {
    marginTop: height(0.03),
  },
  button: {
    backgroundColor: COLORS.APP_COLOR,
    height: height(0.035),
    borderRadius: 5,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: COLORS.WHITE,
  },
  closeIcon: {
    height: 15,
    width: 15,
  },
};
// Memoize the component to prevent unnecessary re-renders
export default memo(AllInspectionDialog);
