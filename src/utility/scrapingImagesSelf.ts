import { writeFile } from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());
const searchTermCLI = process.argv.length >= 3 ? process.argv[2] : "mountains";

const scrapingImagesSelf = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ height: 1200, width: 2000, isMobile: false, isLandscape: true, deviceScaleFactor: 1 });

  page.on("response", async (resp) => {
    const headers = resp.headers();
    const url = new URL(resp.url());

    if (headers["content-type"]?.includes("image/avif") && url.href.startsWith("https://images.unsplash.com/photo-") && Number(headers["content-length"]) > 3000) {
      await resp.buffer().then(async (buffer) => {
        await writeFile(`./src/images/${url.pathname}.avif`, buffer, (err) => err && console.log("image was not saved", err.message));
      });
    }
  });

  await page.goto("https://unsplash.com");
  await page.waitForSelector(`input[data-testid="homepage-header-search-form-input"]`);
  await page.type(`input[data-testid="homepage-header-search-form-input"]`, searchTermCLI, { delay: 100 });
  const btn = await page.waitForSelector('button[data-testid="homepage-header-search-form-button"]');
  await btn?.click();
  await page.waitForNetworkIdle();
  await page.screenshot({ path: `./src/images/unsplashResuts-${searchTermCLI}.png`, fullPage: true });

  await browser.close();
};

export default scrapingImagesSelf;
