# Impact-X Quick Start Guide

## 🚀 Start the Platform

```bash
cd /home/praise/Desktop/impact-x/frontend
npm run dev
```

**Open**: http://localhost:5173

---

## 🧪 Testing the Full Flow

### Step 1: Create a Campaign (Campaign Creator)

1. **Connect Stacks Wallet**
   - Click "Connect Wallet" in navbar
   - Connect Leather or Xverse wallet
   - Make sure you're on Stacks Testnet

2. **Create Campaign**
   - Click "Create Campaign"
   - Fill in campaign details:
     - Title: "Test Campaign"
     - Description: "Testing escrow system"
     - Goal: $100 USDC
     - Duration: 30 days
   - Click through steps and submit
   - Wait for transaction confirmation

3. **View Your Campaign**
   - Go to "My Campaigns"
   - Click on your campaign
   - Note the Campaign ID

### Step 2: Get USDCx (Donor Preparation)

**Option A: Bridge from Ethereum (Real Test)**
1. Go to https://faucet.circle.com/ (get testnet USDC on Sepolia)
2. Get some Sepolia ETH from https://cloud.google.com/application/web3/faucet/ethereum/sepolia
3. Follow the guide: https://docs.stacks.co/more-guides/bridging-usdcx
4. Wait ~15 minutes for USDCx to arrive in your Stacks wallet

**Option B: Ask in Stacks Discord**
- Join: https://discord.gg/stacks
- Ask for testnet USDCx tokens in #dev-support

### Step 3: Donate to Campaign (Donor)

1. **Connect Stacks Wallet**
   - Make sure you have USDCx balance
   - Check balance in wallet

2. **Donate**
   - Navigate to the campaign
   - Click "Back this project"
   - Connect Stacks wallet
   - Enter amount (e.g., $10)
   - Click "Donate to Escrow"
   - Confirm transaction

3. **Verify Donation**
   - Wait for transaction to confirm
   - Refresh campaign page
   - See raised amount increase
   - See backer count increase

### Step 4: Claim Funds (Campaign Creator)

1. **Wait for Goal**
   - Donate enough to meet the goal
   - OR wait for other backers

2. **Claim**
   - Go to your campaign page
   - Click "Claim Funds" button
   - Confirm transaction
   - Receive 95% of funds (5% platform fee)

### Step 5: Test Refunds (If Goal Not Met)

1. **Create Underfunded Campaign**
   - Create campaign with high goal
   - Make small donation
   - Wait for deadline to pass

2. **Request Refund**
   - Add refund UI (optional) OR
   - Call `request-refund` via contract interface
   - Verify 100% refund received

---

## 🔍 Verify Contract on Explorer

**V2 Contract:**
https://explorer.hiro.so/txid/65c74549326adb8b46a97989d5204132ef1f3aa43586be3c78cb1e5bba5d523d?chain=testnet

**Contract Address:**
`STZ5Q1C2GVSMCWS9NWVDEKHNW04THC75SEGDHS74.campaign-registry-v2`

**Check Functions:**
```bash
# View contract interface
curl -s "https://api.testnet.hiro.so/v2/contracts/interface/STZ5Q1C2GVSMCWS9NWVDEKHNW04THC75SEGDHS74/campaign-registry-v2" | jq .

# Get campaign count
curl -s -X POST "https://api.testnet.hiro.so/v2/contracts/call-read/STZ5Q1C2GVSMCWS9NWVDEKHNW04THC75SEGDHS74/campaign-registry-v2/get-campaign-count" \
  -H "Content-Type: application/json" \
  -d '{"sender":"STZ5Q1C2GVSMCWS9NWVDEKHNW04THC75SEGDHS74","arguments":[]}' | jq .
```

---

## 🐛 Troubleshooting

### "Insufficient USDCx balance"
- Bridge USDC from Ethereum to Stacks
- Or get testnet USDCx from Stacks Discord

### "Campaign not found"
- Wait for create-campaign transaction to confirm
- Check transaction status on explorer
- Refresh the page

### "Goal not met" when claiming
- Donate more to reach the goal
- Or adjust campaign goal (if before deadline)

### Wallet connection issues
- Make sure wallet is on Stacks Testnet
- Clear browser cache
- Try different wallet (Leather vs Xverse)

---

## 📊 Contract Features Available

### As Campaign Creator:
- ✅ `create-campaign` - Create new campaign
- ✅ `claim-funds` - Claim when goal met (95% payout)
- ✅ `update-campaign-metadata` - Update IPFS hash

### As Donor:
- ✅ `donate` - Deposit USDCx to escrow
- ✅ `request-refund` - Get refund if goal not met

### Read-Only:
- ✅ `get-campaign` - View campaign details
- ✅ `get-campaign-count` - Total campaigns
- ✅ `get-donation` - Your donation + refund status
- ✅ `can-refund` - Check if refund available

---

## 🎥 For Hackathon Submission

### Video Demo Script:
1. Show homepage with campaigns
2. Create new campaign (screen record)
3. Show campaign details page
4. Donate to campaign (show escrow protection message)
5. Show updated raised amount
6. Claim funds when goal met
7. Show 5% fee deduction
8. Explain security benefits vs traditional crowdfunding

### Key Points to Highlight:
- ✅ Trustless escrow (no fraud possible)
- ✅ Automatic refunds if goal not met
- ✅ Deep USDCx integration on Stacks
- ✅ Cross-chain bridge support (Ethereum → Stacks)
- ✅ Production-ready code with tests
- ✅ Beautiful glassmorphism UI

---

## 📝 Important Reminders

1. **USDCx Required**: Donors MUST have USDCx in Stacks wallet before donating
2. **Escrow Safety**: All funds locked in smart contract until campaign ends
3. **5% Fee**: Only charged on successful campaigns
4. **Testnet Only**: Current deployment is on Stacks Testnet

---

## ✅ Pre-Flight Checklist

Before demo:
- [ ] Frontend running: `npm run dev`
- [ ] Stacks wallet connected to testnet
- [ ] Have testnet STX for transaction fees
- [ ] Have testnet USDCx for donations
- [ ] Browser console open (check for errors)

---

**You're ready to showcase Impact-X!** 🚀

For questions: Check `/home/praise/Desktop/impact-x/V2-DEPLOYMENT-SUMMARY.md`
