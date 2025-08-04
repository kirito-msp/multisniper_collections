const axios = require('axios');

async function getInfoAboutTwitter(contractAddress) {
  const url = 'https://api.arenapro.io/tokens_view?token_contract_address=eq.' + contractAddress.toLowerCase();
  console.log('📡 Request URL:', url);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Referer': 'https://www.arenapro.io/',
    'Origin': 'https://www.arenapro.io',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Priority': 'u=4',
    'TE': 'trailers'
  };

  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    const response = await axios.get(url, { headers });

    const item = response.data?.[0]; // Use optional chaining to avoid crashes
    if (!item) {
      console.warn('⚠️ No data returned from Arena API for address:', contractAddress);
      return null;
    }

    const data = {
      xHandle: item.creator_twitter_handle || null,
      xFollowers: item.creator_twitter_followers || 0,
      prevDeploys: item.tokens_by_creator || 0
    };

    console.log('✅ Parsed Response:', data);
    return data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Error Response:', error.response.status, error.response.data);
    } else {
      console.error('❌ Request Failed:', error.message);
    }
    return null;
  }
}

module.exports = { getInfoAboutTwitter };
