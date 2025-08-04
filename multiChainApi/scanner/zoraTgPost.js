const { Telegraf, Markup } = require('telegraf');
let botToken = ""YOUR TELEGRAM BOT TOKEN""
const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES";
const botMain = new Telegraf(botToken);
const axios = require('axios');
const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function zoraPost(data){
    try{
        if(data?.chain == 3){
            const { followers, following } = await fetchZoraFollowers(data.contractDeployer);
            const { handle } = await fetchZoraHandle(data.contractDeployer)
           // console.log(`Followers: ${followers}, Following: ${following}`);
           let dev = "Zora Dev"
           let devLink = `https://zora.co/${data.contractDeployer}`
           if(handle != undefined){
           dev = "@"+handle
           devLink = `https://zora.co/@${handle}`
           }
            //console.log(handle)
            let newMessage ="🤖"
             newMessage += ` <a href='https://basescan.org/tx/${data.txHash}'>${data?.info?.name}</a> (${data?.info?.symbol})\n`
        + `└Unique Hash: #${data.limits.uniqueHash}\n`
        + `└Ca: <code>${data.contractAddress}</code>\n`
        + `└Supply: <code>${data?.info?.totalSupply}</code>(<code>${data?.info?.decimals}</code>)\n`
        + `└Dev: <code>${data.contractDeployer}</code>\n`
        + `\n📝Statistics:\n`
        + `└Launched: <code>${data?.info?.dexName}</code>\n`
        + `└Mcap: <code>$${parseFloat(data?.info?.info?.mcap).toLocaleString()}</code>\n`
        + `\n<a href ='https://zora.co/coin/${data.contractAddress}'>Zora Token Link</a> | <a href ='${devLink}'>${dev} (Followers: ${parseFloat(followers).toLocaleString()} | Following: ${parseFloat(following).toLocaleString()} )</a>\n`
        + `\n<a href ='https://dexscreener.com/base/${data.contractAddress}'>DexScreener</a> | <a href ='https://x.com/search?q=($${data?.info?.symbol}+OR+${data.contractAddress})&src=typed_query'>Search X.com</a> | <a href ='https://app.cielo.finance/profile/${data.contractDeployer}/pnl/tokens'>Cielo</a> | <a href ='https://app.bubblemaps.io/base/token/${data.contractAddress}'>BubbleMaps</a>\n`
        + `\n⚒️Creation time: ${await formatTime(data.timestamp)}`;

                botMain.telegram
                     .sendMessage(grupDev, newMessage, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        message_thread_id: 343527,
                    })
                    .then((m) => {
                        updateMessageId(data._id, m, chain);
                    })
                    .catch(() => {
                        // Ignore if sending fails
                    }); 

        }
    }catch(e){
        console.log(e)
    }  
}

async function formatTime(timestamp) {
    try {
      const date = new Date(timestamp * 1000);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
    } catch (e) {
      console.log(e);
      return '00:00:00 00.00.0000';
    }
  }


  async function fetchZoraFollowers(profileId) {
    let token = loadToken();
  
    const result = await tryFetch(profileId, token);
    if (result.error) {
      console.warn(`⚠️ Token may be invalid. Attempting to refresh...`);
  
      try {
        execSync('xvfb-run -a node setup_metamask_and_get_token.js', { stdio: 'inherit' });
        token = loadToken(); // Reload token after regeneration
  
        const retryResult = await tryFetch(profileId, token);
        if (retryResult.error) {
          throw new Error('❌ Failed to fetch even after refreshing token.');
        }
        
        return retryResult.data;
      } catch (err) {
        console.error('💥 Final fetch failed:', err.message);
        return { followers: 'N/A', following: 'N/A' };
      }
    }
  
    return result.data;
  }

  async function fetchZoraHandle(profileId) {
    let token = loadToken();
  
    const result = await tryFetchHandle(profileId, token)
    if (result.error) {
      console.warn(`⚠️ Token may be invalid. Attempting to refresh...`);
  
      try {
        execSync('xvfb-run -a node setup_metamask_and_get_token.js', { stdio: 'inherit' });
        token = loadToken(); // Reload token after regeneration
  
        const retryResult = await tryFetchHandle(profileId, token);
        if (retryResult.error) {
          throw new Error('❌ Failed to fetch even after refreshing token.');
        }
        
        return retryResult.data;
      } catch (err) {
        console.error('💥 Final fetch failed:', err.message);
        return { followers: 'N/A', following: 'N/A' };
      }
    }
  
    return result.data;
  }

  function loadToken() {
    try {
      const { token } = JSON.parse(fs.readFileSync('/home/scripts/multiChainApi/scanner/zoraAuth.json', 'utf-8'));
      return token;
    } catch (e) {
      throw new Error('❌ Failed to read token from zoraAuth.json');
    }
  }

  async function tryFetch(profileId, token) {
    try {
      const response = await axios.post(
        'https://api.zora.co/universal/graphql',
        {
          query: `
            query useProfileFollowInformationQuery($profileId: String!) {
              profile(identifier: $profileId) {
                id
                followedEdges { count }
                followingEdges { count }
              }
            }
          `,
          variables: { profileId }
        },
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Origin': 'https://zora.co',
            'Referer': 'https://zora.co/',
          }
        }
      );
  
      const profile = response.data.data?.profile;     
      return {
        data: {
          followers: profile?.followedEdges?.count ?? 0,
          following: profile?.followingEdges?.count ?? 0
        }
      };
  
    } catch (error) {
      if (error.response && [401, 403, 404].includes(error.response.status)) {
        return { error: true };
      }
  
      console.error('Zora API fetch error:', error.message);
      return { data: { followers: 'N/A', following: 'N/A' } };
    }
  }

  async function tryFetchHandle(profileId, token) {
    try {
      const response = await axios.post(
        'https://api.zora.co/universal/graphql',
        {
          query: `
          query getProfileHandle($profileId: String!) {
            profile(identifier: $profileId) {
              handle
            }
          }
        `,
          variables: { profileId }
        },
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Origin': 'https://zora.co',
            'Referer': 'https://zora.co/',
          }
        }
      );

      const profile = response.data.data?.profile;
     // console.log(profile)
      return {
        data: {
          handle: profile?.handle ?? null,
        }
      };
  
    } catch (error) {
      if (error.response && [401, 403, 404].includes(error.response.status)) {
        return { error: true };
      }
  
     // console.error('Zora API fetch error:', error.message);
      return { data: { followers: 'N/A', following: 'N/A' } };
    }
  }



module.exports = { zoraPost };