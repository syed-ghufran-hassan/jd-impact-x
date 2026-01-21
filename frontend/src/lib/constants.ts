// Network configuration constants

export const NETWORKS = {
  stacks: {
    testnet: {
      name: 'Stacks Testnet',
      chainId: 2147483648, // Stacks testnet identifier
      apiUrl: 'https://api.testnet.hiro.so',
      explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    },
    mainnet: {
      name: 'Stacks Mainnet',
      chainId: 1,
      apiUrl: 'https://api.hiro.so',
      explorerUrl: 'https://explorer.hiro.so',
    },
  },
  ethereum: {
    sepolia: {
      name: 'Sepolia Testnet',
      chainId: 11155111,
      explorerUrl: 'https://sepolia.etherscan.io',
    },
    mainnet: {
      name: 'Ethereum Mainnet',
      chainId: 1,
      explorerUrl: 'https://etherscan.io',
    },
  },
} as const;

// Current active network (change this to switch networks)
export const ACTIVE_NETWORK = 'testnet' as const;

// Helper to get current network config
export function getStacksNetwork() {
  return NETWORKS.stacks[ACTIVE_NETWORK];
}

export function getEthereumNetwork() {
  return ACTIVE_NETWORK === 'testnet' 
    ? NETWORKS.ethereum.sepolia 
    : NETWORKS.ethereum.mainnet;
}

// Bridge timing estimates (in minutes)
export const BRIDGE_TIMING = {
  testnet: {
    deposit: 15,  // ETH -> Stacks
    withdraw: 25, // Stacks -> ETH
  },
  mainnet: {
    deposit: 15,
    withdraw: 60,
  },
} as const;

// Minimum amounts for bridge operations
export const BRIDGE_MINIMUMS = {
  testnet: {
    deposit: 1,      // 1 USDC
    withdraw: 4.80,  // 4.80 USDCx (includes fee)
  },
  mainnet: {
    deposit: 10,     // 10 USDC
    withdraw: 4.80,  // 4.80 USDCx
  },
} as const;
