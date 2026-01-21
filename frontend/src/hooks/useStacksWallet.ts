import { useState, useEffect, useCallback } from 'react';
import { 
  connect, 
  disconnect, 
  isConnected, 
  getLocalStorage,
  request 
} from '@stacks/connect';

interface StacksWalletState {
  connected: boolean;
  stxAddress: string | null;
  btcAddress: string | null;
  loading: boolean;
}

export function useStacksWallet() {
  const [state, setState] = useState<StacksWalletState>({
    connected: false,
    stxAddress: null,
    btcAddress: null,
    loading: true,
  });

  // Extract checkConnection as a stable function
  const checkConnection = useCallback(() => {
    const connected = isConnected();
    const userData = getLocalStorage();
    
    // Handle different address formats from @stacks/connect
    let stxAddr: string | null = null;
    let btcAddr: string | null = null;
    
    if (userData?.addresses) {
      // addresses can be an object with stx/btc keys or an array
      const addrs = userData.addresses as any;
      if (Array.isArray(addrs)) {
        // Array format
        const stxEntry = addrs.find((a: any) => a.symbol === 'STX');
        const btcEntry = addrs.find((a: any) => a.symbol === 'BTC');
        stxAddr = stxEntry?.address || null;
        btcAddr = btcEntry?.address || null;
      } else {
        // Object format
        stxAddr = addrs.stx?.[0]?.address || null;
        btcAddr = addrs.btc?.[0]?.address || null;
      }
    }
    
    setState({
      connected,
      stxAddress: stxAddr,
      btcAddress: btcAddr,
      loading: false,
    });
  }, []);

  // Check connection status on mount and when window gains focus
  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Listen for storage changes (wallet connect/disconnect in other tabs)
    const handleStorageChange = () => {
      checkConnection();
    };
    
    // Listen for window focus (user switches between tabs/apps)
    const handleFocus = () => {
      checkConnection();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // Set up a periodic check as a fallback (every 1 second)
    const intervalId = setInterval(checkConnection, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  const connectWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await connect();
      
      // Handle different response formats
      const addrs = response.addresses as any;
      let stxAddr: string | null = null;
      let btcAddr: string | null = null;
      
      if (Array.isArray(addrs)) {
        const stxEntry = addrs.find((a: any) => a.symbol === 'STX');
        const btcEntry = addrs.find((a: any) => a.symbol === 'BTC');
        stxAddr = stxEntry?.address || null;
        btcAddr = btcEntry?.address || null;
      } else {
        stxAddr = addrs?.stx?.[0]?.address || null;
        btcAddr = addrs?.btc?.[0]?.address || null;
      }
      
      setState({
        connected: true,
        stxAddress: stxAddr,
        btcAddress: btcAddr,
        loading: false,
      });
      
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setState({
      connected: false,
      stxAddress: null,
      btcAddress: null,
      loading: false,
    });
  }, []);

  const getAccounts = useCallback(async () => {
    if (!state.connected) return null;
    
    try {
      const accounts = await request('stx_getAccounts');
      return accounts;
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return null;
    }
  }, [state.connected]);

  // Manual refresh function - call this when you need to force a re-check
  const refresh = checkConnection;

  return {
    ...state,
    connect: connectWallet,
    disconnect: disconnectWallet,
    getAccounts,
    refresh,
  };
}
