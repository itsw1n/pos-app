import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/** Subscribe to network connectivity changes; true when online. */
export function useConnectivity(): boolean {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let active = true;
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        if (active) setIsConnected(state.isConnected === true);
      })
      .catch(() => {
        // Network state unavailable; keep the current value.
      });
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (active) setIsConnected(state.isConnected === true);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return isConnected;
}
