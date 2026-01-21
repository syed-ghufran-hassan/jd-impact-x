import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useStacksWallet } from '../hooks/useStacksWallet';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { connected, stxAddress, connect, disconnect, loading } = useStacksWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Stacks Wallet */}
      {connected ? (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-500/20 border border-primary-500/30">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary-300">
            {truncateAddress(stxAddress!)}
          </span>
          <button
            onClick={disconnect}
            className="p-1 hover:bg-primary-500/20 rounded-lg transition-colors"
            title="Disconnect Stacks"
          >
            <LogOut className="w-4 h-4 text-primary-400" />
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={loading}
          className="hidden sm:flex btn-primary items-center gap-2 py-2 px-4"
        >
          <Wallet className="w-4 h-4" />
          {loading ? 'Connecting...' : 'Stacks'}
        </button>
      )}

      {/* Ethereum Wallet via RainbowKit */}
      <div className="[&_button]:!rounded-xl [&_button]:!font-heading [&_button]:!text-sm">
        <ConnectButton 
          chainStatus="icon"
          showBalance={false}
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'address',
          }}
        />
      </div>
    </div>
  );
}
