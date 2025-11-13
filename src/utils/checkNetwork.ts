import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import useNetworkStore from '../store/networkStore';
import { recordCrashlyticsError } from '../services/CrashlyticsService';

interface NetworkStore {
  isNetworkAvailable: boolean;
  setNetworkAvailable: (connected: boolean) => void;
}

const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout | null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useNetworkStatus = () => {
  const mockOfflineMode = false;
  const { isNetworkAvailable, setNetworkAvailable } = useNetworkStore() as NetworkStore;
  const isMounted = useRef<boolean>(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const updateNetworkState = debounce((state: NetInfoState) => {
    if (!isMounted.current) return;
    let connected = !!state.isConnected && !!state.isInternetReachable;
    if (__DEV__ && mockOfflineMode) {
      connected = false;
    }
    setNetworkAvailable(connected);
  }, 500);

  const checkNetwork = async () => {
    try {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
    } catch (error) {
      recordCrashlyticsError('Failed to fetch network status on app resume:', error);
      console.error('Failed to fetch network status on app resume:', error);
      if (isMounted.current) setNetworkAvailable(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;

    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      updateNetworkState(state);
    });

    const getInitialStatus = async () => {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
    };
    getInitialStatus();

    // AppState listener to detect when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkNetwork(); // Refresh network status
      }
      appState.current = nextAppState;
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted.current = false;
      unsubscribeNetInfo();
      appStateListener.remove();
    };
  }, [setNetworkAvailable]);

  return { isNetworkAvailable };
};
