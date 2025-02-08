import puppeteer from "puppeteer";
// .yt-searchbox-input
// .ytSearchboxComponentSearchButton
// .count-text .style-scope .ytd-comments-header-renderer
const searchTermCLI = process.argv.length >= 3 ? process.argv[2] : "Puppeteer: Headless Automated Testing, Scraping, and Downloading";
const searchTermENV = process.env.searchTermENV;

const testYoutube = async () => {
  const browser = await puppeteer.launch({ headless: false, args: ["--disable-gpu"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, isMobile: false, isLandscape: true, deviceScaleFactor: 1 });

  await page.goto("https://www.youtube.com/");
  await page.waitForSelector(".yt-searchbox-input");
  await page.type(".yt-searchbox-input", searchTermCLI, { delay: 100 });
  await page.emulateVisionDeficiency("blurredVision");
  await page.screenshot({ path: "./src/images/ytScreenShotBlur.png", fullPage: true });
  await page.emulateVisionDeficiency("none");
  await page.screenshot({ path: "./src/images/ytScreenShot.png", fullPage: true });

  await Promise.all([page.waitForNavigation(), page.click(".ytSearchboxComponentSearchButton")]);
  await page.waitForSelector("ytd-video-renderer h3 a#video-title");
  await page.screenshot({ path: "./src/images/ytScreenShotSearchResult.png", fullPage: true });

  const firstMatch = await page.$eval("ytd-video-renderer h3 a#video-title", (el) => el.innerText);

  console.log({ firstMatch });

  await Promise.all([page.waitForNavigation(), page.click("ytd-video-renderer h3 a#video-title"), new Promise((resolve) => setTimeout(resolve, 1500))]);
  await page.screenshot({ path: "./src/images/ytSearchResultInner.png", fullPage: true });
  await page.waitForSelector("ytd-comments-header-renderer h2");
  const comments = await page.$eval("ytd-comments-header-renderer h2", (el) => (el as HTMLElement).innerText);
  console.log({ comments });

  await browser.close();
};

export default testYoutube;
