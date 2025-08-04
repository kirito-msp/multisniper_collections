const axios = require('axios');
const mongoose = require('mongoose');
const config = require('../config.json');
const { Telegraf, Markup } = require('telegraf');
const botMain = new Telegraf(""YOUR TELEGRAM BOT TOKEN"");
const NewsModel = require('../models/News');
const puppeteer = require('puppeteer');

// MongoDB Connection
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

let authBearer = "9p5spberj6g0g8im9b11l25obg8fge";  // Initial Bearer token

// Function to fetch new Bearer token using Puppeteer
async function fetchBearerTokenWithPuppeteer() {
    const browser = await puppeteer.launch({
        executablePath: '/root/chrome_tools/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let tokenLogged = false;
    let bearerToken = null;

    page.on('request', (request) => {
        const authHeader = request.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ') && !tokenLogged) {
            bearerToken = authHeader.replace('Bearer ', '');
            tokenLogged = true;
        }
    });

    await page.goto('https://lunarcrush.com/get-started');
    await page.waitForSelector('body');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    await browser.close();
    return bearerToken;
}

// Function to fetch Crypto Data
async function fetchCryptoData() {
  const url = "https://lunarcrush.com/api3/storm/topic/_cryptocurrencies";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
    "Accept": "*/*",
    "Authorization": "Bearer " + authBearer,
    "X-Lunar-Client": "yolo",
  };

  try {
    const response = await axios.get(url, { headers });
    let news = response.data.data.news;
    await storeAndPostNews(news);
    console.log("News processing finished, waiting 15 seconds before the next fetch...");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized. Attempting to fetch a new Bearer token...");
      
      // Attempt to fetch a new Bearer token
      const newBearerToken = await fetchBearerTokenWithPuppeteer();
      
      if (newBearerToken) {
        console.log("New Bearer Token retrieved:", newBearerToken);
        authBearer = newBearerToken; // Update the token and retry the fetch
        await fetchCryptoData();  // Retry fetching crypto data with the new token
      } else {
        console.error("Failed to retrieve a new Bearer token. Exiting the script.");
        process.exit(0); // Exit the process if no token is retrieved
      }
    } else {
      console.error('Error fetching data:', error.message);
    }
  }
}

// Function to store and post news
async function storeAndPostNews(news) {
  try {
    for (const [key, element] of Object.entries(news)) {
      const existingNews = await NewsModel.findOne({ id: element.id });
      if (!existingNews) {
        const newNews = new NewsModel({
          id: element.id,
          title: element.title,
          categories: element.categories,
          post_link: element.post_link,
          related_topics: element.related_topics
        });
        
        await newNews.save();
        console.log(`News item with ID ${element.id} has been stored.`);
        try {
          const title = element.title;
          const categories = element.categories.map(cat => `<code>${cat}</code>`).join(' ');
          const postLink = element.post_link;
          const relatedTopics = element.related_topics.map(topic => `<code>${topic}</code>`).join(' ');

          const message = `📰${title}\n\nCategories: ${categories}\nPost Link: ${postLink}\nRelated Topics: ${relatedTopics}`;
          const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES"; // Replace with actual group ID
          botMain.telegram.sendMessage(grupDev, message, {
            parse_mode: 'HTML',
            message_thread_id: 297946  // Optional: Use if needed
          }).catch((error) => {
            console.error("Error sending message:", error);
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  } catch (error) {
    console.error("Error processing news:", error);
  }
}

// This function will initiate the fetching process and wait for the interval before restarting
async function fetchWithDelay() {
  await fetchCryptoData();
  setTimeout(fetchWithDelay, 60000); // 15 seconds delay before next fetch
}

// Start the process
fetchWithDelay();
