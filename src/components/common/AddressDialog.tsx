import { View, TouchableOpacity, Modal, SafeAreaView, Text, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from '../../theme/colors';
import { fontSize, height } from '../../utils/helper/dimensions';
import FloatingInput from './FloatingInput';
import { useState } from 'react';
import IMAGES from '../../theme/images';
import { cleanCoordinateInput } from '../../utils/helper/helpers';
import { FONT_FAMILY } from '../../theme/fonts';

// Define the shape of the address fields
interface AddressFields {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: string;
  longitude?: string;
}

// Define the props for the AddressDialog component
interface AddressDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  type: string;
  fields: AddressFields;
  setFields: (fields: AddressFields) => void;
  onUpdate: () => void;
  onCancel: () => void;
  showCoordinates?: boolean;
  isManualLocation?: boolean;
  setManualLocation?: (value: boolean) => void;
}

const AddressDialog: React.FC<AddressDialogProps> = ({
  visible,
  setVisible,
  title,
  type,
  fields,
  setFields,
  onUpdate,
  onCancel,
  showCoordinates = false,
  isManualLocation = false,
  setManualLocation,
}) => {
  const [showErrors, setShowErrors] = useState(false);
  return (
    <View>
      <Modal
        visible={visible}
        animationType="none"
        supportedOrientations={['landscape', 'portrait']}
        transparent={true}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              margin: 10,
              backgroundColor: COLORS.WHITE,
              padding: 20,
            }}
          >
            <Text style={[styles.headingStyle, { alignSelf: 'center', marginBottom: 20 }]}>
              {title}
            </Text>
            <KeyboardAwareScrollView
              nestedScrollEnabled={true}
              extraScrollHeight={-150}
              contentContainerStyle={{ flexGrow: 1 }}
              enableOnAndroid={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ paddingHorizontal: 10 }}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.inputViewStyle}>
                  <FloatingInput
                    label="Street Address"
                    value={fields.street}
                    numberOfLines={1}
                    multiline={true}
                    onChangeText={(value: string) => setFields({ ...fields, street: value })}
                    placeholder="Street Address"
                    keyboardType="default"
                    onIconPress={() => {
                      setFields({ ...fields, street: '' });
                    }}
                    customRightIcon={fields.street != '' ? IMAGES.CLOSE_ICON : undefined}
                  />
                </View>
                <FloatingInput
                  label="City"
                  value={fields.city}
                  numberOfLines={1}
                  required={type === 'Location' ? true : false}
                  onChangeText={(value: string) => setFields({ ...fields, city: value })}
                  placeholder="City"
                  keyboardType="default"
                  error={type === 'Location' && showErrors && !fields.city}
                  hintText={
                    type === 'Location' && showErrors && !fields.city
                      ? 'City is required'
                      : undefined
                  }
                  hintTextStyle={
                    type === 'Location' && showErrors && !fields.city
                      ? { color: COLORS.ERROR }
                      : undefined
                  }
                />
                <FloatingInput
                  label="State"
                  value={fields.state}
                  numberOfLines={1}
                  required={type === 'Location' ? true : false}
                  onChangeText={(value: string) => setFields({ ...fields, state: value })}
                  placeholder="State"
                  keyboardType="default"
                  error={type === 'Location' && showErrors && !fields.state}
                  hintText={
                    type === 'Location' && showErrors && !fields.state
                      ? 'State is required'
                      : undefined
                  }
                  hintTextStyle={
                    type === 'Location' && showErrors && !fields.state
                      ? { color: COLORS.ERROR }
                      : undefined
                  }
                />
                <FloatingInput
                  label="Zip"
                  value={fields.zip}
                  numberOfLines={1}
                  required={type === 'Location' ? true : false}
                  onChangeText={(value: string) => setFields({ ...fields, zip: value })}
                  placeholder="Zip"
                  keyboardType="numeric"
                  error={type === 'Location' && showErrors && !fields.zip}
                  hintText={
                    type === 'Location' && showErrors && !fields.zip ? 'Zip is required' : undefined
                  }
                  hintTextStyle={
                    type === 'Location' && showErrors && !fields.zip
                      ? { color: COLORS.ERROR }
                      : undefined
                  }
                />
                <View style={styles.inputViewStyle}>
                  <FloatingInput
                    label="Country"
                    value={fields.country}
                    numberOfLines={1}
                    editable={false}
                    onChangeText={(value: string) => setFields({ ...fields, country: value })}
                    placeholder="Country"
                    keyboardType="default"
                    style={{
                      backgroundColor: COLORS.GRAY_LIGHT,
                    }}
                  />
                </View>
                {showCoordinates && (
                  <>
                    <View style={styles.inputViewStyle}>
                      <FloatingInput
                        label="Latitude"
                        value={fields.latitude ?? ''}
                        numberOfLines={1}
                        onChangeText={(value: string) =>
                          setFields({
                            ...fields,
                            latitude: cleanCoordinateInput(value),
                          })
                        }
                        placeholder="Please enter latitude"
                        maxLength={15}
                        keyboardType={'default'}
                        style={{
                          backgroundColor: isManualLocation ? COLORS.WHITE : COLORS.GRAY_LIGHT,
                        }}
                        editable={isManualLocation}
                      />
                    </View>
                    <View style={styles.inputViewStyle}>
                      <FloatingInput
                        label="Longitude"
                        value={fields.longitude ?? ''}
                        numberOfLines={1}
                        onChangeText={(value: string) =>
                          setFields({
                            ...fields,
                            longitude: cleanCoordinateInput(value),
                          })
                        }
                        maxLength={15}
                        placeholder="Please enter longitude"
                        keyboardType={'default'}
                        style={{
                          backgroundColor: isManualLocation ? COLORS.WHITE : COLORS.GRAY_LIGHT,
                        }}
                        editable={isManualLocation}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 10,
                      }}
                    >
                      <Checkbox
                        value={isManualLocation}
                        onValueChange={setManualLocation}
                        color={isManualLocation ? COLORS.APP_COLOR : undefined}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setManualLocation && setManualLocation(!isManualLocation);
                        }}
                      >
                        <Text style={[styles.titleStyle, { marginLeft: 10 }]}>
                          Set Manual Location
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      onCancel();
                      setVisible(false);
                    }}
                  >
                    <Text style={styles.textStyle}>{'Close'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                      if (type === 'Location') {
                        if (fields.city && fields.state && fields.zip) {
                          onUpdate();
                          setVisible(false);
                        } else {
                          setShowErrors(true); // Only show errors for location type
                        }
                      } else {
                        onUpdate(); // No validation for mailing
                        setVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.textStyle}>{'Update'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headingStyle: {
    color: COLORS.BLACK,
    fontSize: fontSize(0.038),
    fontFamily: FONT_FAMILY.MontserratSemiBold,
  },
  titleStyle: {
    color: COLORS.TEXT_COLOR,
    fontSize: fontSize(0.028),
  },
  formInput: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    height: height(0.05),
    backgroundColor: COLORS.TEXT_COLOR,
  },
  inputStyle: {
    color: COLORS.BLACK,
    paddingHorizontal: 5,
    fontSize: fontSize(0.022),
  },
  inputViewStyle: {
    flexDirection: 'column',
    marginBottom: height(0.01),
    zIndex: 1,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  closeButton: {
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    // backgroundColor: COLORS.GRAY_MEDIUM,
    backgroundColor: COLORS.GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButton: {
    width: '45%',
    height: height(0.05),
    borderRadius: 12,
    backgroundColor: COLORS.APP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textStyle: {
    color: COLORS.WHITE,
    fontSize: fontSize(0.035),
    fontFamily: FONT_FAMILY.MontserratBold,
    textAlign: 'center',
  },
});

export default AddressDialog;
