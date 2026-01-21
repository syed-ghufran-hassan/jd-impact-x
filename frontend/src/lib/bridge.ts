import { parseUnits, type Hex } from 'viem';
import { encodeStacksAddress } from './helpers';
import { CONTRACTS, STACKS_DOMAIN } from './wagmi-config';

// xReserve ABI - depositToRemote function
export const X_RESERVE_ABI = [
  {
    name: 'depositToRemote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'remoteDomain', type: 'uint32' },
      { name: 'remoteRecipient', type: 'bytes32' },
      { name: 'localToken', type: 'address' },
      { name: 'maxFee', type: 'uint256' },
      { name: 'hookData', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

// ERC20 ABI for USDC
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
  },
] as const;

export interface BridgeParams {
  amount: string;
  recipientStacksAddress: string;
  walletClient: any;
  publicClient: any;
  network?: 'sepolia' | 'mainnet';
}

export interface BridgeResult {
  approveTxHash: Hex;
  depositTxHash: Hex;
}

/**
 * Bridge USDC from Ethereum to Stacks via Circle xReserve
 * This calls depositToRemote which initiates the cross-chain transfer
 */
export async function bridgeUSDCToStacks({
  amount,
  recipientStacksAddress,
  walletClient,
  publicClient,
  network = 'sepolia',
}: BridgeParams): Promise<BridgeResult> {
  const contracts = CONTRACTS[network];
  
  // USDC has 6 decimals
  const value = parseUnits(amount, 6);
  const maxFee = parseUnits('0', 6); // No max fee limit
  
  // Encode Stacks address to bytes32 format
  const remoteRecipient = encodeStacksAddress(recipientStacksAddress);
  const hookData = '0x' as Hex;

  console.log('Bridge params:', {
    amount,
    value: value.toString(),
    recipientStacksAddress,
    remoteRecipient,
    network,
  });

  // Step 1: Approve xReserve to spend USDC
  console.log('Approving USDC spend...');
  const approveTxHash = await walletClient.writeContract({
    address: contracts.USDC,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [contracts.X_RESERVE, value],
  });

  console.log('Approval tx hash:', approveTxHash);
  
  // Wait for approval confirmation
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
  console.log('Approval confirmed');

  // Step 2: Call depositToRemote
  console.log('Initiating bridge deposit...');
  const depositTxHash = await walletClient.writeContract({
    address: contracts.X_RESERVE,
    abi: X_RESERVE_ABI,
    functionName: 'depositToRemote',
    args: [
      value,
      STACKS_DOMAIN,
      remoteRecipient,
      contracts.USDC,
      maxFee,
      hookData,
    ],
  });

  console.log('Deposit tx hash:', depositTxHash);

  return {
    approveTxHash,
    depositTxHash,
  };
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(
  address: string,
  publicClient: any,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<bigint> {
  const contracts = CONTRACTS[network];
  
  const balance = await publicClient.readContract({
    address: contracts.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as Hex],
  });
  
  return balance as bigint;
}

/**
 * Get USDC allowance for xReserve
 */
export async function getUSDCAllowance(
  ownerAddress: string,
  publicClient: any,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<bigint> {
  const contracts = CONTRACTS[network];
  
  const allowance = await publicClient.readContract({
    address: contracts.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress as Hex, contracts.X_RESERVE],
  });
  
  return allowance as bigint;
}

/**
 * Check if bridge amount is valid
 */
export function validateBridgeAmount(
  amount: string,
  balance: bigint,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): { valid: boolean; error?: string } {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  
  const minAmount = network === 'sepolia' ? 1 : 10;
  if (numAmount < minAmount) {
    return { valid: false, error: `Minimum amount is ${minAmount} USDC` };
  }
  
  const amountInMicro = parseUnits(amount, 6);
  if (amountInMicro > balance) {
    return { valid: false, error: 'Insufficient USDC balance' };
  }
  
  return { valid: true };
}
