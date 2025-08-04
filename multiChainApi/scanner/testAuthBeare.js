const { ethers } = require('ethers');
const axios = require('axios');

const WALLET_PRIVATE_KEY = '339fac609b0fb4c1755b9ef4312fb41242e6c8d6bed0b2d7b0c5fc45729e96cd';
const address = '0x1a7Ea4e5dF48d2d45c47cd9a6f05bA8Ca84e4aed';
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org'); // for Base chain
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

async function getNonce() {
  const res = await axios.post('https://privy.zora.co/api/v1/siwe/init', {
    address
  }, {
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'privy-app-id': 'clpgf04wn04hnkw0fv1m11mnb',
        'privy-client-id': 'client-WY2f8mnC65aGnM2LmXpwBU5GqK3kxYqJoV7pSNRJLWrp6',
        'privy-ca-id': '77151880-b967-4c79-ac35-2720602e6086',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://zora.co/',
        'Origin': 'https://zora.co' // 🔥 this is what was missing!
      }
      
  });

  return res.data;
}

async function signAndAuthenticate() {
  const { nonce, expires_at } = await getNonce();
  const issuedAt = new Date().toISOString();

  const message = `zora.co wants you to sign in with your Ethereum account:\n${address}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.\n\nURI: https://zora.co\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}\nResources:\n- https://privy.io`;

  const signature = await wallet.signMessage(message);

  const authRes = await axios.post('https://privy.zora.co/api/v1/siwe/authenticate', {
    message,
    signature,
    chainId: 'eip155:8453',
    walletClientType: 'metamask',
    connectorType: 'injected',
    mode: 'login-or-sign-up'
  }, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'privy-app-id': 'clpgf04wn04hnkw0fv1m11mnb',
      'privy-client-id': 'client-WY2f8mnC65aGnM2LmXpwBU5GqK3kxYqJoV7pSNRJLWrp6',
      'privy-ca-id': '77151880-b967-4c79-ac35-2720602e6086',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://zora.co/',
    }
  });

  console.log('✅ Auth token:', authRes.data.token);
  return authRes.data.token;
}

signAndAuthenticate().catch(console.error);
