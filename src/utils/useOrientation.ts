import { useEffect, useState, useRef } from 'react';
import type { OrientationType } from 'react-native-orientation-locker';
import Orientation from 'react-native-orientation-locker';
import { Dimensions, Platform } from 'react-native';

export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const normalize = (o: OrientationType): 'PORTRAIT' | 'LANDSCAPE' => {
    if (o === 'LANDSCAPE-LEFT' || o === 'LANDSCAPE-RIGHT') return 'LANDSCAPE';
    if (o === 'PORTRAIT' || o === 'PORTRAIT-UPSIDEDOWN') return 'PORTRAIT';

    // fallback to dimensions
    const { width, height } = Dimensions.get('window');
    return width > height ? 'LANDSCAPE' : 'PORTRAIT';
  };

  useEffect(() => {
    const updateOrientation = (newOrientation: OrientationType) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setOrientation(normalize(newOrientation));
      }, 150);
    };

    if (Platform.OS === 'android') {
      // Use UI orientation (respects lock)
      Orientation.getOrientation((o) => {
        setOrientation(normalize(o));
      });
      Orientation.addOrientationListener(updateOrientation);
    } else {
      // iOS/iPad can use device orientation
      Orientation.getDeviceOrientation((o) => {
        setOrientation(normalize(o));
      });
      Orientation.addDeviceOrientationListener(updateOrientation);
    }

    return () => {
      if (Platform.OS === 'android') {
        Orientation.removeOrientationListener(updateOrientation);
      } else {
        Orientation.removeDeviceOrientationListener(updateOrientation);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Fallback: Dimensions (covers edge cases)
  useEffect(() => {
    const onChange = ({ window }: { window: { width: number; height: number } }) => {
      setOrientation(window.width > window.height ? 'LANDSCAPE' : 'PORTRAIT');
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return orientation;
}
