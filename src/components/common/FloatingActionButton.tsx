import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { iconSize } from '../../utils/helper/dimensions';
import type { FABProps } from '../../utils/interfaces/IComponent';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  customIcon,
  isLoading,
  disabled,
  contanerstyle,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isLoading) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }

    return () => {
      animation?.stop();
    };
  }, [isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <TouchableOpacity
      style={[styles.fab, contanerstyle, { opacity: disabled ? 0.4 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      {customIcon === 'sync' ? (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name={'sync'} size={40} color={COLORS.WHITE} />
        </Animated.View>
      ) : (
        <Icon name={customIcon ?? 'plus'} size={40} color={COLORS.WHITE} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 35,
    backgroundColor: COLORS.APP_COLOR,
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIcon: {
    width: iconSize(0.03),
    height: iconSize(0.03),
    marginTop: 2,
    tintColor: COLORS.WHITE,
  },
});

export default FloatingActionButton;
