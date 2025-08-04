const puppeteer = require('puppeteer');

async function fetchBearerTokenWithPuppeteer() {
    const browser = await puppeteer.launch({
        executablePath: '/root/chrome_tools/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let tokenLogged = false; // Flag to ensure we log the first token only once
    let bearerToken = null;  // Variable to store the Bearer token

    // Listen for all network requests
    page.on('request', (request) => {
        // Check if the request contains the 'authorization' header with a Bearer token
        const authHeader = request.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ') && !tokenLogged) {
            // Extract the Bearer token
            bearerToken = authHeader.replace('Bearer ', '');
            tokenLogged = true;  // Set the flag to true so we don't log further tokens
        }
    });

    // Listen for all network responses
    page.on('response', async (response) => {
        const url = response.url();
        // You can optionally log response details here if needed
        // const status = response.status();
        // console.log('Response Status:', status);
    });

    // Navigate to the page
    await page.goto('https://lunarcrush.com/get-started');

    // Wait for a specific element to load (to ensure the page is ready)
    await page.waitForSelector('body');  // This ensures the body element is available (page is loaded)

    // Optionally, use setTimeout for a delay or wait for the page to finish loading
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    // Return the extracted Bearer token
    await browser.close();

    return bearerToken; // Return the token found
}

// Call the function and handle the result
fetchBearerTokenWithPuppeteer()
    .then((token) => {
        if (token) {
            console.log('Bearer Token Extracted:', token);
        } else {
            console.log('No Bearer Token Found');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
