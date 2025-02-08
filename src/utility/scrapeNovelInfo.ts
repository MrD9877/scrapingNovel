import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeNovelInfo(book: string) {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  // Set user agent to appear more human-like
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

  // Go to the site
  await page.goto(`https://novgo.co/novel/${book}/`, { waitUntil: "networkidle2" });

  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve("");
        }
      }, 200);
    });
  });

  // Wait for the content to load
  await page.waitForSelector("h2, h3", { timeout: 10000 });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h3,p,ul")).map((el) => (el as HTMLElement).innerText);
  });

  const filteredData = [];
  for (const item of data) {
    if (item.includes("© 2025 NOVGO. All rights reserved")) break; // Stop saving when this appears
    filteredData.push(item);
  }
  // console.log(filteredData);
  const formattedData = filteredData.flatMap((text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
  );
  const jsonData = JSON.stringify(formattedData, null, 2);
  console.log(jsonData);
  console.log("Data saved chapter", book);

  await browser.close();
}
