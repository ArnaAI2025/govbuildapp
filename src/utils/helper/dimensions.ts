import { Dimensions, PixelRatio, Platform, ViewStyle } from 'react-native';

export const { height: deviceHeight, width: deviceWidth } = Dimensions.get('window');

export const WINDOW_WIDTH = deviceHeight >= deviceWidth ? deviceWidth : deviceHeight;
export const WINDOW_HEIGHT = deviceHeight >= deviceWidth ? deviceHeight : deviceWidth;

export const isTablet = Platform.OS === 'ios' && deviceWidth >= 768;

export const scaleFont = (size: number): number => size * PixelRatio.getFontScale();

function dimensions(
  top: number,
  right: number = top,
  bottom: number = top,
  left: number = right,
  property: 'margin' | 'padding',
): Partial<ViewStyle> {
  return {
    [`${property}Top`]: top,
    [`${property}Right`]: right,
    [`${property}Bottom`]: bottom,
    [`${property}Left`]: left,
  } as Partial<ViewStyle>;
}

export function fontSize(size: number): number {
  return (WINDOW_HEIGHT / 2) * size;
}

export function imageSize(size: number): number {
  return (WINDOW_HEIGHT / 2) * size;
}

export function marginTop(size: number): number {
  return (WINDOW_HEIGHT / 2) * size;
}

export function marginTopAndBottom(size: number): number {
  return deviceHeight >= deviceWidth ? WINDOW_HEIGHT * size - 15 : WINDOW_HEIGHT * size;
}

export function height(size: number): number {
  return WINDOW_HEIGHT * size;
}

export function width(size: number): number {
  return WINDOW_WIDTH * size;
}

export function marginLeftAndRight(size: number): number {
  return WINDOW_WIDTH * size;
}

export function iconSize(size: number): number {
  return WINDOW_HEIGHT * size;
}

export function margin(
  top: number,
  right?: number,
  bottom?: number,
  left?: number,
): Partial<ViewStyle> {
  return dimensions(top, right, bottom, left, 'margin');
}

export function padding(
  top: number,
  right?: number,
  bottom?: number,
  left?: number,
): Partial<ViewStyle> {
  return dimensions(top, right, bottom, left, 'padding');
}

export function cardBorder(): number {
  return Platform.OS === 'android' ? 0.5 : 0;
}

export function boxShadow(
  color: string,
  offset: { height: number; width: number } = { height: 2, width: 2 },
  radius: number = 8,
  opacity: number = 0.2,
): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: radius,
  };
}

export const modalProps = Platform.select({
  ios: {
    animationType: 'none',
    supportedOrientations: ['portrait', 'landscape'],
  },
});

export const isIPad = Platform.OS === 'ios' && Dimensions.get('window').width >= 768;
