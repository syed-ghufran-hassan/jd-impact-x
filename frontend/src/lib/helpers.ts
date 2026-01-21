import * as P from 'micro-packed';
import { 
  createAddress, 
  addressToString, 
  AddressVersion, 
  StacksWireType 
} from '@stacks/transactions';
import { hex } from '@scure/base';
import { type Hex, pad, toHex } from 'viem';

/**
 * Encoder/decoder for Stacks addresses to bytes32 format
 * Required for xReserve depositToRemote function
 */
export const remoteRecipientCoder = P.wrap<string>({
  encodeStream(w, value: string) {
    // Parse the Stacks address
    const address = createAddress(value);
    // Left pad with 11 zero bytes
    P.bytes(11).encodeStream(w, new Uint8Array(11).fill(0));
    // Add 1 version byte
    P.U8.encodeStream(w, address.version);
    // Add 20 hash bytes
    P.bytes(20).encodeStream(w, hex.decode(address.hash160));
  },
  decodeStream(r) {
    // Skip left padding (11 bytes)
    P.bytes(11).decodeStream(r);
    // Read 1 version byte
    const version = P.U8.decodeStream(r);
    // Read 20 hash bytes
    const hash = P.bytes(20).decodeStream(r);
    return addressToString({
      hash160: hex.encode(hash),
      version: version as AddressVersion,
      type: StacksWireType.Address,
    });
  },
});

/**
 * Convert a byte array to bytes32 hex string
 */
export function bytes32FromBytes(bytes: Uint8Array): Hex {
  return toHex(pad(bytes, { size: 32 }));
}

/**
 * Encode a Stacks address to bytes32 format for xReserve
 */
export function encodeStacksAddress(stacksAddress: string): Hex {
  const encoded = remoteRecipientCoder.encode(stacksAddress);
  return bytes32FromBytes(encoded);
}

/**
 * Decode a bytes32 back to a Stacks address
 */
export function decodeStacksAddress(bytes32: Hex): string {
  const bytes = hexToBytes(bytes32);
  return remoteRecipientCoder.decode(bytes);
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hexString: Hex): Uint8Array {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Validate a Stacks address format
 */
export function isValidStacksAddress(address: string): boolean {
  try {
    createAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format USDC amount from human readable to micro units (6 decimals)
 */
export function formatUSDCAmount(amount: string | number): bigint {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(numAmount * 1_000_000));
}

/**
 * Format micro USDC units to human readable
 */
export function parseUSDCAmount(microAmount: bigint | number): string {
  const num = typeof microAmount === 'bigint' ? Number(microAmount) : microAmount;
  return (num / 1_000_000).toFixed(2);
}

/**
 * Truncate an address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
