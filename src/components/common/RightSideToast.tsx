import type { ReactNode} from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Snackbar, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';

type SnackbarMessage = {
  message: string;
  backgroundColor?: string;
  textColor?: string;
};

let showSnackbarHandler: ((msg: SnackbarMessage) => void) | null = null;

export const RightToastService = {
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

  // Animation values
  const slideAnim = useState(new Animated.Value(500))[0]; // Start off-screen right
  const progressAnim = useState(new Animated.Value(1))[0]; // Progress bar from 1 to 0

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = ({
    message,
    backgroundColor = '#000',
    textColor = '#fff',
  }: SnackbarMessage) => {
    setMessage(message);
    setBackgroundColor(backgroundColor);
    setTextColor(textColor);
    setVisible(true);

    slideAnim.setValue(500);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, 3000);
  };

  const onDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 500, // Slide out to right
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    });
  };

  useEffect(() => {
    RightToastService.register(showMessage);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      <Portal>
        {visible && (
          <Animated.View
            style={[
              styles.snackbarWrapper,
              {
                paddingTop: insets.top + 10,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Snackbar
              visible={visible}
              onDismiss={onDismiss}
              style={[styles.snackbar, { backgroundColor }]}
              theme={{ colors: { onSurface: textColor } }}
            >
              <View>
                <Animated.Text style={[styles.snackbarText, { color: textColor }]}>
                  {message}
                </Animated.Text>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      transform: [{ scaleX: progressAnim }],
                      backgroundColor: textColor,
                    },
                  ]}
                />
              </View>
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
    right: 0, // Align to right side
    width: '80%', // Adjust width as needed
    zIndex: 9999,
    elevation: 10,
  },
  snackbar: {
    marginHorizontal: 6,
    borderRadius: 8,
    elevation: 4,
  },
  snackbarText: {
    fontSize: FONT_SIZE.Font_14,
    fontFamily: FONT_FAMILY.MontserratBold,
  },
  progressBar: {
    height: 3,
    width: '100%',
    marginTop: 12,
    transformOrigin: 'right', // Scale from right to left
  },
});
