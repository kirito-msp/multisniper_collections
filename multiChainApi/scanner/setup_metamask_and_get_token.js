const puppeteer = require('puppeteer');
const fs = require('fs');
const { ethers } = require('ethers');
const path = require('path');

const metamaskPath = '/root/metamask/extension';
const SEED_PHRASE = "multiply resemble embark point runway sniff east begin stereo produce bomb ketchup";
const PASSWORD = "StrongPassword123";
const wallet = ethers.Wallet.fromMnemonic(SEED_PHRASE);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const ensureDir = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};


const clickButtonByText = async (page, text) => {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const label = await (await btn.getProperty('innerText')).jsonValue();
    if (label && label.toLowerCase().includes(text.toLowerCase())) {
      await btn.click();
      return true;
    }
  }
  return false;
};

const clickDivButtonByText = async (page, text) => {
  const elements = await page.$$('button, div[role="button"], li');
  for (const el of elements) {
    const label = await (await el.getProperty('innerText')).jsonValue();
    if (label && label.trim().toLowerCase() === text.toLowerCase()) {
      await el.click();
      return true;
    }
  }
  return false;
};

const clickExactText = async (page, targetText) => {
  const elements = await page.$$('button, div[role="button"], li, div, span');
  for (const el of elements) {
    const text = await (await el.getProperty('innerText')).jsonValue();
    if (text && text.trim().toLowerCase() === targetText.toLowerCase()) {
      try {
        await el.click();
        return true;
      } catch {}
    }
  }
  return false;
};

(async () => {
  const userDataDir = `/tmp/puppeteer_${Date.now()}`;

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/root/chrome_tools/chrome-linux64/chrome',
    userDataDir,
    protocolTimeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${metamaskPath}`,
      `--load-extension=${metamaskPath}`
    ]
  });

  try {
    const pages = await browser.pages();
    const extensionPage = pages.find(p => p.url().startsWith('chrome-extension://')) || await new Promise(resolve => {
      browser.on('targetcreated', async target => {
        if (target.type() === 'page' && target.url().startsWith('chrome-extension://')) {
          resolve(await target.page());
        }
      });
    });

    await extensionPage.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
    await extensionPage.click('input[type="checkbox"]');
    await delay(500);
    await clickButtonByText(extensionPage, 'import an existing wallet');
   // await takeScreenshot(extensionPage, 'import_wallet');
    await delay(500);
    await clickButtonByText(extensionPage, 'no thanks');
   // await takeScreenshot(extensionPage, 'no_thanks');
    await delay(500);

    const wordFields = await extensionPage.$$('input[autocomplete="off"]');
    const words = SEED_PHRASE.split(' ');
    for (let i = 0; i < 12; i++) {
      await wordFields[i].type(words[i]);
      await delay(100);
    }

    await clickButtonByText(extensionPage, 'confirm');
    //await takeScreenshot(extensionPage, 'confirm');
    await delay(3000);

    const passInputs = await extensionPage.$$('input[type="password"]');
    await passInputs[0].type(PASSWORD);
    await passInputs[1].type(PASSWORD);

    const checkbox = await extensionPage.$('input[type="checkbox"]');
    if (checkbox) {
      await checkbox.click();
      await delay(300);
    }

    await clickButtonByText(extensionPage, 'import');
    //await takeScreenshot(extensionPage, 'import');
    await delay(4000);
    await clickButtonByText(extensionPage, 'all done');
    //await takeScreenshot(extensionPage, 'all_done');

    const zoraPage = await browser.newPage();
    await zoraPage.goto('https://zora.co', { waitUntil: 'networkidle2' });
    //await takeScreenshot(zoraPage, 'zora_homepage'); 

    await zoraPage.mouse.click(10, 10);
    await delay(500);
    //await takeScreenshot(zoraPage, 'zora_modal_closed');

    await clickDivButtonByText(zoraPage, 'Log in');   
    //await takeScreenshot(zoraPage, 'zora_login'); 
    await delay(1500);

    await zoraPage.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    await clickDivButtonByText(zoraPage, 'Other wallets'); 
    //await takeScreenshot(zoraPage, 'zora_other_wallets');  
    await delay(1500);

    const clicked = await clickExactText(zoraPage, 'MetaMask');
    if (!clicked) throw new Error("❌ Failed to click 'MetaMask'");
    await delay(1500);

    const initData = await fetchFromBrowserContext(zoraPage, wallet.address);
    const issuedAt = new Date().toISOString();

    const siweMessage = [
      `zora.co wants you to sign in with your Ethereum account:`,
      `${wallet.address}`,
      ``,
      `By signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.`,
      ``,
      `URI: https://zora.co`,
      `Version: 1`,
      `Chain ID: 8453`,
      `Nonce: ${initData.nonce}`,
      `Issued At: ${issuedAt}`,
      `Resources:`,
      `- https://privy.io`
    ].join('\n');

    const signature = await wallet.signMessage(siweMessage);

    const authResult = await zoraPage.evaluate(async ({ message, signature }) => {
      const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'privy-app-id': 'clpgf04wn04hnkw0fv1m11mnb',
        'privy-client-id': 'client-WY2f8mnC65aGnM2LmXpwBU5GqK3kxYqJoV7pSNRJLWrp6',
        'privy-ca-id': '77151880-b967-4c79-ac35-2720602e6086',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://zora.co/',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?1'
      };

      const res = await fetch('https://privy.zora.co/api/v1/siwe/authenticate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          signature,
          chainId: 'eip155:8453',
          walletClientType: 'metamask',
          connectorType: 'injected',
          mode: 'login-or-sign-up'
        })
      });

      return await res.json();
    }, { message: siweMessage, signature });

    if (authResult.token) {
      fs.writeFileSync('zoraAuth.json', JSON.stringify({ token: authResult.token }, null, 2));
      console.log("✅ Token saved to zoraAuth.json");
    } else {
      console.error("❌ Token not returned:", authResult?.error || 'Unknown error');
    }

    await browser.close();
    console.log("🧹 Chrome closed. Restarting in 10 minutes...");
    setTimeout(() => process.exit(0), 10 * 60 * 1000);
  } catch (err) {
    console.error("❌ Error:", err.message);
    await browser.close();
    process.exit(1);
  }
})();

const fetchFromBrowserContext = async (page, address) => {
  return await page.evaluate(async (addr) => {
    const headers = {
      'sec-ch-ua-platform': '"Android"',
      'Referer': 'https://zora.co/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      'Content-Type': 'application/json',
      'sec-ch-ua-mobile': '?1'
    };

    const session_id = crypto.randomUUID();
    const now = new Date().toISOString();

    await fetch('https://api.zora.co/zora/client_event', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [
          {
            referrer_page: "/onboarding",
            event_type: "page_view",
            client_timestamp: now,
            session_id,
            domain: "zora.co",
            url_path: "/",
            page_name: "Discover",
            app: "discover",
            device_id: "0",
            platform: "web"
          },
          {
            event_type: "privy_modal_viewed",
            client_timestamp: now,
            session_id,
            domain: "zora.co",
            url_path: "/",
            page_name: "Discover",
            app: "discover",
            device_id: "0",
            platform: "web"
          }
        ]
      })
    });

    const privyHeaders = {
      ...headers,
      'privy-app-id': 'clpgf04wn04hnkw0fv1m11mnb',
      'privy-client-id': 'client-WY2f8mnC65aGnM2LmXpwBU5GqK3kxYqJoV7pSNRJLWrp6',
      'privy-ca-id': '77151880-b967-4c79-ac35-2720602e6086'
    };

    const initRes = await fetch('https://privy.zora.co/api/v1/siwe/init', {
      method: 'POST',
      headers: privyHeaders,
      body: JSON.stringify({ address: addr })
    });

    return await initRes.json();
  }, address);
};


const takeScreenshot = async (page, step) => {
  const dir = path.resolve(__dirname, 'screenshots');
  ensureDir(dir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filepath = path.join(dir, `${timestamp}_${step}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot taken: ${filepath}`);
};
