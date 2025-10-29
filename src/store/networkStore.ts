import { create } from 'zustand';

interface NetworkState {
  isNetworkAvailable: boolean;
  setNetworkAvailable: (status: boolean) => void;
}

const useNetworkStore = create<NetworkState>((set) => ({
  isNetworkAvailable: true,
  setNetworkAvailable: (status) => set({ isNetworkAvailable: status }),
}));

export default useNetworkStore;
