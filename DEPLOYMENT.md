# Impact-X Deployment Guide

This guide covers deploying the Impact-X smart contract to Stacks testnet and configuring the frontend.

## Prerequisites

1. **Clarinet** - Stacks smart contract development tool
   ```bash
   # Install Clarinet
   curl -L https://www.hiro.so/clarinet/install | bash
   
   # Verify installation
   clarinet --version
   ```

2. **Stacks Wallet with Testnet STX**
   - Install [Leather Wallet](https://leather.io) or [Xverse](https://xverse.app)
   - Switch to testnet
   - Get testnet STX from [Stacks Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)

3. **Testnet USDC (for testing donations)**
   - Get from [Circle Faucet](https://faucet.circle.com/) (Sepolia network)

---

## Step 1: Deploy the Smart Contract

### Option A: Using Clarinet CLI

```bash
cd /home/praise/Desktop/impact-x/contracts

# Check the contract compiles
clarinet check

# Run tests (optional)
clarinet test

# Deploy to testnet
# First, create a deployment plan
clarinet deployments generate --testnet

# Then apply the deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Option B: Using Hiro Platform (Web UI)

1. Go to [platform.hiro.so](https://platform.hiro.so)
2. Connect your Stacks wallet
3. Click "Deploy Contract"
4. Paste the contract code from `contracts/contracts/campaign-registry.clar`
5. Name it `campaign-registry`
6. Deploy to testnet

### Option C: Using Stacks Explorer Sandbox

1. Go to [Stacks Explorer Sandbox](https://explorer.stacks.co/sandbox/deploy?chain=testnet)
2. Connect your wallet
3. Paste the contract code
4. Deploy

---

## Step 2: Update Frontend Configuration

After deployment, you'll get a contract address like `ST1ABC123...`

1. Open `frontend/src/lib/stacks.ts`
2. Update line 8:
   ```typescript
   const CONTRACT_ADDRESS = ACTIVE_NETWORK === 'testnet' 
     ? 'ST_YOUR_DEPLOYED_ADDRESS_HERE'  // <-- Replace this
     : 'SP...';
   ```

---

## Step 3: Verify Deployment

```bash
# Check the contract is deployed
curl "https://api.testnet.hiro.so/v2/contracts/interface/YOUR_ADDRESS/campaign-registry"
```

Or view on explorer:
`https://explorer.stacks.co/txid/YOUR_TX_ID?chain=testnet`

---

## Step 4: Run the Frontend

```bash
cd /home/praise/Desktop/impact-x/frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

## Testing the Full Flow

### 1. Create a Campaign
1. Connect your Stacks wallet (Leather/Xverse)
2. Click "Create Campaign"
3. Fill in the form
4. Submit (will prompt for wallet signature)

### 2. Make a Donation
1. Connect your Ethereum wallet (MetaMask)
2. Ensure you have Sepolia USDC
3. Navigate to a campaign
4. Click "Back this project"
5. Enter amount and confirm

### 3. Register the Bridged Donation
After ~15 minutes when the bridge completes:
1. The campaign owner connects their Stacks wallet
2. Calls `register-deposit` with the bridged amount
3. Campaign funding updates

---

## Troubleshooting

### "Contract not found" error
- Verify the contract address in `stacks.ts` matches your deployed address
- Ensure you deployed to testnet, not mainnet

### Wallet connection issues
- Clear browser cache
- Try a different wallet (Leather vs Xverse)
- Check you're on the correct network

### Bridge not completing
- Sepolia → Stacks bridge takes ~15 minutes
- Check transaction on [Etherscan](https://sepolia.etherscan.io)
- Verify xReserve contract addresses in `constants.ts`

---

## Contract Addresses

| Contract | Network | Address |
|----------|---------|---------|
| USDC | Sepolia | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| xReserve | Sepolia | `0x008888878f94C0d87defdf0B07f46B93C1934442` |
| USDCx | Stacks Testnet | `ST1F55GGV1M3YWM4CVNA95Q29TZ2D5SXQPSPYEVK4.usdcx-token` |
| Campaign Registry | Stacks Testnet | `YOUR_DEPLOYED_ADDRESS` |

---

## Production Deployment

For mainnet:

1. Deploy contract to Stacks mainnet
2. Update `VITE_NETWORK=mainnet` in `.env`
3. Update contract addresses in `stacks.ts` and `constants.ts`
4. Get real IPFS storage (web3.storage API key)
5. Deploy frontend to Vercel/Netlify
