const fs = require('fs');
const puppeteer = require('puppeteer');

// Updated paths for Linux
// you will have to download the browser you want to test and provide the path to the executable file
const BROWSER_PATHS = {
  firefox: '/usr/bin/firefox', 
  chrome: '/usr/bin/google-chrome', 
  brave: '/usr/bin/brave', 
};

const browserName = process.argv[2]; // Pass browser name as a command line argument
const browserPath = BROWSER_PATHS[browserName];

if (!browserPath) {
  console.error('Unsupported browser. Supported browsers are: firefox, chrome, brave.');
  process.exit(1);
}

(async () => {
  console.log(`Starting test for ${browserName}...`);

  const urls = fs.readFileSync('phishing_sites.txt', 'utf-8').split('\n').filter(Boolean);

  let totalScore = 0;

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: false // Run in headful mode
  });
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`Testing URL ${i + 1}/${urls.length}: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });

      const pageContent = await page.content();

      // Scoring logic
      if (pageContent.includes('Deceptive site ahead') || pageContent.includes('Phishing site warning')) {
        totalScore += 0.5;
        console.log(`Warning detected for URL: ${url}`);
      } else {
        totalScore += 0;
        console.log(`No warning for URL: ${url}`);
      }
    } catch (error) {
      totalScore += 1;
      console.log(`URL blocked: ${url}`);
    }
  }

  await browser.close();

  const scorePercentage = (totalScore / urls.length) * 100;
  console.log(`Browser Phishing Protection Score for ${browserName}: ${scorePercentage.toFixed(2)}%`);
})();