const axios = require('axios');

async function getSocialsToken(pairAddress, chain){ 
  let data = null;
  try{

      let response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/'+chain+'/'+pairAddress)
          if(response.data.pair == null){
            return false
          }
          data = {
              'launchedAt': formatTimestamp(response.data.pair.pairCreatedAt/1000),
              'nrTxLast24h': parseInt(response.data.pair.txns.h24.buys +response.data.pair.txns.h24.sells),
              'nrbuys24h': parseInt(response.data.pair.txns.h24.buys),
              'nrsells24h': parseInt(response.data.pair.txns.h24.sells),
              'last5minPrice': response.data.pair.priceChange.m5,
              'last24hVolume': parseFloat(parseFloat(response.data.pair.volume.h24).toFixed(0)).toLocaleString(),
              'websiteLink': null,                
              'telegramLink': null,
              'twitterLink': null,
              'twitterInfo': {}
          }
        
          try{
              if(response.data.pair.info != undefined){                             
                  if(response.data.pair.info.websites != undefined && response.data.pair.info.websites[0] != undefined){
                      if(response.data.pair.info.websites[0].url != undefined){
                         let websiteTemp = response.data.pair.info.websites[0].url
                         if(websiteTemp.includes('https')){
                          data.websiteLink = websiteTemp
                         }
                      }
                  }
                
                  if(response.data.pair.info.socials != undefined && response.data.pair.info.socials[0] != undefined){
                      if(response.data.pair.info.socials[0].url != undefined){
                          if(response.data.pair.info.socials[0].type == 'twitter'){
                              let twitterTemp = response.data.pair.info.socials[0].url
                              if(twitterTemp.includes('https')){
                                  data.twitterLink = twitterTemp
                              }
                          }
                          if(response.data.pair.info.socials[0].type == 'telegram'){
                              let telegramTemp = response.data.pair.info.socials[0].url
                              if(telegramTemp.includes('https')){
                                  data.telegramLink = telegramTemp
                              }
                          }                                            
                      }
                      if(response.data.pair.info.socials[1].url != undefined){
                          if(response.data.pair.info.socials[1].type == 'twitter'){
                              let twitterTemp = response.data.pair.info.socials[1].url
                              if(twitterTemp.includes('https')){
                                  data.twitterLink = twitterTemp
                              }
                          }
                          if(response.data.pair.info.socials[1].type == 'telegram'){
                              let telegramTemp = response.data.pair.info.socials[1].url
                              if(telegramTemp.includes('https')){
                                  data.telegramLink = telegramTemp
                              }
                          }             
                       }
                  }
              }
              if(data.twitterLink != null){
                  let twitterUser = data.twitterLink.split('https://x.com/')[1]
                  if(data.twitterLink.includes('twitter')){
                      twitterUser = data.twitterLink.split('https://twitter.com/')[1]
                  }
                  if(twitterUser.includes('?')){
                      twitterUser = twitterUser.split('?')[0]
                  }
                  try{
                    data.twitterInfo =  await scrapeTwitterProfile(twitterUser)
                  }catch(e){
                      //console.log(e)
                  }                   
              } 
          }catch(e){
           //   console.log(e)
          }            
      //console.log(data)
      return data
  }catch(e){
      //console.log('dexscreenr ') 
      return null
  }
 
}

async function scrapeTwitterProfile(username) {     
      try{
        const queryParams = {
          variables: JSON.stringify({ screen_name: username }),
          features: JSON.stringify({
            hidden_profile_subscriptions_enabled: true,
            profile_label_improvements_pcf_label_in_post_enabled: true,
            rweb_tipjar_consumption_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            subscriptions_verification_info_is_identity_verified_enabled: true,
            subscriptions_verification_info_verified_since_enabled: true,
            highlights_tweets_tab_ui_enabled: true,
            responsive_web_twitter_article_notes_tab_enabled: true,
            subscriptions_feature_can_gift_premium: true,
            creator_subscriptions_tweet_preview_api_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true
          }),
          fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: false })
        };
        const url = `https://x.com/i/api/graphql/32pL5BWe9WKeSK1MoPvFQQ/UserByScreenName?variables=${encodeURIComponent(queryParams.variables)}&features=${encodeURIComponent(queryParams.features)}&fieldToggles=${encodeURIComponent(queryParams.fieldToggles)}`;
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Referer": "https://x.com/nativecryptoAi",
          "Content-Type": "application/json",
          "X-Client-UUID": "50a6f631-ce09-4d0a-b10c-94251b38d2ee",
          "x-twitter-auth-type": "OAuth2Session",
          "x-csrf-token": "c1bf1df97a3530f47221d48538c5df7eb87892411b50854f0a150042b4533e8bdaf77f190d395f053b90c724f6271f68d59f354a2b9ac358b8adf3181074b32aa18f28618e0fcf5ea32ad235939cd4be",
          "x-twitter-client-language": "en",
          "x-twitter-active-user": "yes",
          "x-client-transaction-id": "7GTk9bJSeRIilr+B4xPXvINDUjNkhS3XCN637NaQId2YfPc+Y5bFdX/5LLiTttW3GnrEZ+9aJSPr7pzD8+oyBpkj7zVN7w",
          "DNT": "1",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "Connection": "keep-alive",
          "Cookie": "guest_id=v1%3A172211504724893520; night_mode=2; kdt=ug7y4pWeOZLrQTSc69Gr9STWuTuDE6eKWsr5Ew31; twid=u%3D1404686882919923713; ct0=c1bf1df97a3530f47221d48538c5df7eb87892411b50854f0a150042b4533e8bdaf77f190d395f053b90c724f6271f68d59f354a2b9ac358b8adf3181074b32aa18f28618e0fcf5ea32ad235939cd4be; auth_token=db31ffd3c37da86f9449cddcd2ef5b4139c43344; d_prefs=MToxLGNvbnNlbnRfdmVyc2lvbjoyLHRleHRfdmVyc2lvbjoxMDAw; guest_id_ads=v1%3A172211504724893520; guest_id_marketing=v1%3A172211504724893520; personalization_id='v1_3f/lwFkrshWxcaSo8feurw=='; lang=en; __cf_bm=3m_HZDANY.ct_OnX71Db68TanfCY8yEK60_7dSF0Rzo-1742375870-1.0.1.1-U9o8er6QTpFuCs5_D8Ce8iibQIqvToebzdH_z1xhLrp5JblA8yiyBlEuavBOwQ2G2pM1cAJ1.dvTPzck.innEnVPjfJ85ruqN2dgYqcZ.4Y",
          "TE": "trailers"
        };
         
          let verified = 'No'
          let followers = 0
          let created = null
          let description = null
          let bannerUrl = null

          const res = await fetch(url, {
            method: "GET",
            headers: headers,
            body: null
          }).then(response => response.json())
          .then(data => {
            //console.log(data.data.user.result);
            if(data.data?.user?.result){
                let infoResult = data.data.user.result
                verified = 'Standard'
                followers = infoResult.legacy.normal_followers_count
                created = infoResult.legacy.created_at
                description = infoResult.legacy.description
                bannerUrl = infoResult.legacy.profile_banner_url
                if(infoResult.is_blue_verified){
                  verified = 'Premium'
                  if(infoResult.legacy.verified_type == 'Business'){
                    verified = 'Gold'
                 }
               }
            }
            
          })
          .catch(error => console.error("Error:", error));

        
         
         let returnResponse = {
          'created':created,
          'description':description,
          'baner':bannerUrl,
          'followers':followers,
          'verified':verified,
         }    
          
          return returnResponse
         
      }catch(e){
        return null
      }
  
  
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  
  // Get time components
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
}  



// Call the function with your pair address and chain
//getSocialsToken("0x3a4822847f32c9f82c5fDC77E340838F49691242", "bsc");
module.exports = { getSocialsToken };