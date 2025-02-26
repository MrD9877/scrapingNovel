import { Mongoose } from "mongoose";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Explore } from "../schema/genre";

puppeteer.use(StealthPlugin());
const headless = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
const head = { headless: false };

const saveList = async (list: Array<string>) => {
  const lastEntry = await Explore.find();
  if (lastEntry.length > 0) {
    lastEntry[0].genre = list;
    await lastEntry[0].save();
  } else {
    const explore = new Explore({ genre: list });
    await explore.save();
  }
};

const novelGenreScrapper = async () => {
  const browser = await puppeteer.launch(head);
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, isLandscape: false, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

  await page.goto(`https://novgo.co/novel/`);
  const more = await page.waitForSelector("#menu-item-443");

  await more?.click();

  await page.waitForSelector("div > .sub-nav_content");

  const data = await page.$eval("div > .sub-nav_content", (data) => {
    return (data as HTMLElement).innerText;
  });
  const list = data.split("\n").filter((item) => {
    if (item !== " " && item !== " NSFW AI CHAT" && item !== "MORE") {
      return item;
    }
  });

  await saveList(list);

  await browser.close();
};

export default novelGenreScrapper;
