const puppeteer = require('puppeteer');
const fs = require('fs');
const { ethers } = require('ethers');
const path = require('path');

(async () => {
      const userDataDir = `/tmp/puppeteer_${Date.now()}`;

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/root/chrome_tools/chrome-linux64/chrome',
    userDataDir,
    protocolTimeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
 
  const page = await browser.newPage();
  
  await page.goto('https://data.arena.trade/groups/summary/token/0x8ffcc4076ba5c535206f5df9a4281977e1ba02d7', {
    waitUntil: 'networkidle2'
  });

  const content = await page.content(); // or page.evaluate(...) to scrape data
  console.log(content);

  await browser.close();
})();
