import { Alert } from 'react-native';

export function verifyTeamMemberDialog(callSaveApi: any) {
  Alert.alert(
    'Selected Team Member Already Scheduled',
    'A selected team member is already booked during the selected time and date. Are you sure you want to save the task?',
    [
      {
        text: 'Cancel',
        onPress: () => {
          return null;
        },
      },
      {
        text: 'Ok',
        onPress: () => {
          callSaveApi(false);
        },
      },
    ],
    { cancelable: false },
  );
}
export function InspectionScheduleFailAlert(callSaveApi: any) {
  Alert.alert(
    'Outlook Schedule Failed',
    'Do you want to continue scheduling without outlook?',
    [
      {
        text: 'No',
        onPress: () => {
          return null;
        },
      },
      {
        text: 'Yes',
        onPress: () => {
          callSaveApi(true);
        },
      },
    ],
    { cancelable: false },
  );
}
