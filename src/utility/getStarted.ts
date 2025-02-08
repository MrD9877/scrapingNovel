import puppeteer from "puppeteer";

const getStarted = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, isMobile: false, isLandscape: true, hasTouch: false, deviceScaleFactor: 1 });

  await page.goto("https://webnovel.com");
  const content = await page.content();
  console.log(content);
  await page.screenshot({ type: "png", fullPage: true, path: "./src/images/testImage1.png", encoding: "binary" });

  await browser.close();
};
export default getStarted;
