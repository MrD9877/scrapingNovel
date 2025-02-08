import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeNovelChapters(book: string, chapter: number) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set user agent to appear more human-like
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

  // Go to the site
  await page.goto(`https://novgo.co/novel/${book}/chapter-${chapter}`, { waitUntil: "networkidle2" });

  // Extract titless
  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h3,p")).map((el) => (el as HTMLElement).innerText);
  });

  const filteredData = [];
  for (const item of data) {
    if (item.includes("© 2025 NOVGO. All rights reserved")) break; // Stop saving when this appears
    filteredData.push(item);
  }
  const jsonData = JSON.stringify(filteredData, null, 2).replace(/\\n/g, "\n");

  console.log(jsonData);

  console.log("Data saved chapter", chapter);

  await browser.close();
}
