import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';

// Get WalletConnect Project ID from environment or use placeholder
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Impact-X',
  projectId,
  chains: [sepolia, mainnet],
  ssr: false,
});

// Contract addresses for different networks
export const CONTRACTS = {
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const,
    X_RESERVE: '0x008888878f94C0d87defdf0B07f46B93C1934442' as const,
  },
  mainnet: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
    X_RESERVE: '0x8888888199b2Df864bf678259607d6D5EBb4e3Ce' as const,
  },
} as const;

// Stacks domain ID for xReserve
export const STACKS_DOMAIN = 10003;

// Stacks contract addresses
export const STACKS_CONTRACTS = {
  testnet: {
    USDCX: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
    USDCX_V1: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx-v1',
  },
  mainnet: {
    USDCX: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx',
    USDCX_V1: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx-v1',
  },
} as const;
