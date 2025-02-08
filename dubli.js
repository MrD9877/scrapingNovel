const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function scrapeNovgo() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36");

  await page.goto("https://novgo.co/novel/global-game-afk-in-the-zombie-apocalypse-game/chapter-2703/", { waitUntil: "domcontentloaded" });

  // Scroll to load content
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  // Wait for the content to load
  await page.waitForSelector("h2, h3", { timeout: 10000 });

  // Extract data
  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("p")).map((el) => el.innerText.trim());
  });

  console.log("Scraped Data:", data);

  await browser.close();
}

scrapeNovgo();
