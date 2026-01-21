import { 
  makeContractDeploy, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { readFileSync } from 'fs';

const MNEMONIC = 'other return young struggle absent agent scare crater blush cave fish usual police sound daring scan chest food october sentence song sense annual fitness';

// Derive private key from mnemonic
import { generateWallet } from '@stacks/wallet-sdk';

async function deploy() {
  console.log('Deploying campaign-registry-v2 to testnet...\n');
  
  // Generate wallet from mnemonic
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: '',
  });
  
  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;
  
  console.log('Deployer address:', account.stxAddress);
  
  // Read contract source
  const contractSource = readFileSync('./contracts/campaign-registry-v2.clar', 'utf8');
  
  console.log('Contract size:', contractSource.length, 'bytes');
  
  // Create deployment transaction
  const txOptions = {
    contractName: 'campaign-registry-v2',
    codeBody: contractSource,
    senderKey: privateKey,
    network: 'testnet' as const,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    fee: 650019n, // Estimated fee
    clarityVersion: 3,
  };
  
  console.log('\nCreating deployment transaction...');
  
  const transaction = await makeContractDeploy(txOptions);
  
  console.log('Transaction created, broadcasting...');
  
  const broadcastResponse = await broadcastTransaction({
    transaction,
    network: 'testnet',
  });
  
  if ('error' in broadcastResponse) {
    console.error('Broadcast failed:', broadcastResponse);
    process.exit(1);
  }
  
  console.log('\n✅ Contract deployed successfully!');
  console.log('Transaction ID:', broadcastResponse.txid);
  console.log('\nView on explorer:');
  console.log(`https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
  console.log('\nContract address:');
  console.log(`${account.stxAddress}.campaign-registry-v2`);
}

deploy().catch(console.error);
