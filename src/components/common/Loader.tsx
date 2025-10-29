import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme/colors';

interface LoaderProps {
  loading: boolean;
  overlayMode?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading, overlayMode = true }) => {
  const animations = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.stagger(
          150,
          animations.map((anim) =>
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
      ).start();
    }
  }, [loading]);

  if (!loading) return null;

  // If overlayMode = true → Modal
  if (overlayMode) {
    return (
      <Modal transparent animationType="none" visible={loading}>
        <View style={styles.modalBackground}>
          <View style={styles.dotsContainer}>
            {animations.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: anim,
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.4],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>
    );
  }

  // If overlayMode = false → Inline overlay (doesn’t hide keyboard)
  return (
    <View style={styles.modalBackground} pointerEvents="none">
      <View style={styles.dotsContainer}>
        {animations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //  backgroundColor: COLORS.BACKGROUD_COLOR,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.APP_COLOR,
    marginHorizontal: 5,
  },
});
