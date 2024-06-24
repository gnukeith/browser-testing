const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');

const BROWSER_PATHS = {
  chromium: chromium,
  firefox: firefox,
  webkit: webkit
};

const browserName = process.argv[2]; // Pass browser name as a command line argument
const browserType = BROWSER_PATHS[browserName];

if (!browserType) {
  console.error('Unsupported browser. Supported browsers are: chromium, firefox, webkit.');
  process.exit(1);
}

(async () => {
  console.log(`Starting test for ${browserName}...`);

  const urls = fs.readFileSync('phishing_urls.txt', 'utf-8').split('\n').filter(Boolean);

  let totalScore = 0;

  const browser = await browserType.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`Testing URL ${i + 1}/${urls.length}: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });

      const pageContent = await page.content();

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
