import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";

async function downloadImage(url: string, filename: string) {
  try {
    const response = await axios({
      url,
      responseType: "stream",
    });

    const filePath = path.join(__dirname, "images", filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(""));
      writer.on("error", () => reject());
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
}

export async function scrapeImages(book: string) {
  const browser = await puppeteer.launch({ headless: false }); // Set to false to debug
  const page = await browser.newPage();

  await page.goto(`${book}`, { waitUntil: "networkidle2" });

  // Scroll multiple times to load lazy-loaded images
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

  // Wait for images to appear
  await page.waitForSelector("img", { visible: true });

  // Extract image URLs (handle lazy-loaded images)
  const imageUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .map((img) => img.getAttribute("src") || img.getAttribute("data-src"))
      .filter((src) => src && src.startsWith("http"));
  });

  if (!fs.existsSync(path.join(__dirname, "images"))) {
    fs.mkdirSync(path.join(__dirname, "images"));
  }
  console.log("Scraped Image URLs:", imageUrls);

  // Download each image
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const filename = `image_${i + 1}.jpg`;
    console.log(`Downloading ${url} as ${filename}...`);
    if (url && url !== "https://novgo.co/wp-content/uploads/2025/01/02_300_250.gif") await downloadImage(url, filename);
  }

  await browser.close();
}
