import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { StyleSheet, Animated, PanResponder, Text } from 'react-native';
import { Snackbar, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';

type SnackbarMessage = {
  message: string;
  backgroundColor?: string;
  textColor?: string;
};

let showSnackbarHandler: ((msg: SnackbarMessage) => void) | null = null;

export const ToastService = {
  register: (handler: (msg: SnackbarMessage) => void) => {
    showSnackbarHandler = handler;
  },
  show: (message: string, backgroundColor: string = '#000', textColor: string = '#fff') => {
    if (showSnackbarHandler) {
      showSnackbarHandler({ message, backgroundColor, textColor });
    } else {
      console.log('Snackbar handler not registered yet.');
    }
  },
};

export const GlobalSnackbarProvider = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000');
  const [textColor, setTextColor] = useState('#fff');

  const position = useRef(new Animated.Value(-100)).current;

  const showMessage = ({
    message,
    backgroundColor = '#000',
    textColor = '#fff',
  }: SnackbarMessage) => {
    setMessage(message);
    setBackgroundColor(backgroundColor);
    setTextColor(textColor);
    setVisible(true);
    Animated.timing(position, {
      toValue: 10,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onDismiss = () => {
    Animated.timing(position, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  // Add PanResponder for drag functionality
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5, // Detect vertical drag
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) {
          // Only allow dragging up
          position.setValue(10 + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50) {
          // If dragged up enough → dismiss
          onDismiss();
        } else {
          // Reset back to position
          Animated.spring(position, {
            toValue: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    ToastService.register(showMessage);
  }, []);

  return (
    <>
      {children}
      <Portal>
        {visible && (
          <Animated.View
            {...panResponder.panHandlers} // Attach PanResponder
            style={[
              styles.snackbarWrapper,
              {
                paddingTop: insets.top + 10,
                transform: [{ translateY: position }],
              },
            ]}
          >
            <Snackbar
              visible={visible}
              onDismiss={onDismiss}
              duration={3000}
              style={[styles.snackbar, { backgroundColor }]}
              theme={{ colors: { onSurface: textColor } }}
            >
              <Text style={[styles.snackbarText, { color: textColor }]}>{message}</Text>
            </Snackbar>
          </Animated.View>
        )}
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  snackbarWrapper: {
    position: 'absolute',
    top: '9%',
    width: '100%',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  snackbar: {
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
  },
  snackbarText: {
    fontSize: FONT_SIZE.Font_12,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
});
