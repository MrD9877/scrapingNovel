import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { generateRandom } from "./random";
import { Chapter, ChapterType } from "../schema/chapter";
import { FuntionResponse } from "./novelInfo";
import { Novel } from "../schema/novel";
import mongoose from "mongoose";

// https://novgo.co/novel/
puppeteer.use(StealthPlugin());
export const headless = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
export const head = { headless: false };

export const getContent = async (page: Page): Promise<FuntionResponse> => {
  await page.waitForSelector(".text-left");

  const content = await page.$$eval(".text-left p", (data) => {
    return data.map((p) => {
      return p.innerText;
    });
  });
  if (content && content.length > 1 && content[0]) {
    const title: string = content[0];
    content.shift();
    return { acknowledge: true, data: { title, content } };
  } else {
    return { acknowledge: false, message: "content not found" };
  }
};

export const goToNext = async (page: Page) => {
  await Promise.all([page.waitForNavigation(), page.click(".nav-next")]);
};

export const saveChapterToDb = async (data: ChapterType): Promise<FuntionResponse> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const novel = await Novel.findOne({ novelId: data.novelId }).session(session);
    if (!novel) {
      await session.abortTransaction();
      return { acknowledge: false, message: "No novelInfo found" };
    }
    if (!novel.index[data.chapterNumber - 1]) {
      await session.abortTransaction();
      return { acknowledge: false, message: "Invalid chapter number" };
    }

    if (novel.index[data.chapterNumber - 1].chapterId) {
      await session.abortTransaction();
      return { acknowledge: false, message: "Dublicate Chapter found" };
    }
    novel.index[data.chapterNumber - 1].chapterId = data.chapterId;
    await novel.save({ session });

    const chapter = new Chapter({ ...data });
    await chapter.save({ session });
    await session.commitTransaction();
    return { acknowledge: true };
  } catch (err) {
    return { acknowledge: false, message: (err as Error).message };
  } finally {
    await session.endSession(); // Ensure session is always closed
  }
};

const novelChapterScraper = async (novel: string, chapter: number, stopAfter: number, novelId: string): Promise<FuntionResponse> => {
  const browser = await puppeteer.launch(headless);
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, isLandscape: false, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

  await page.goto(`https://novgo.co/novel/${novel}/chapter-${chapter}`);

  let resp: FuntionResponse | undefined;

  for (let i = chapter; i <= stopAfter; i++) {
    const chapterId = generateRandom(32);
    const dataTosave = await getContent(page);

    if (dataTosave.acknowledge) {
      console.log(`chapter ${i} scraped`);
      const saveToDb = await saveChapterToDb({ chapterId, novelId, ...dataTosave.data, chapterNumber: i });

      saveToDb.acknowledge && console.log(`chapter ${i} saved`);

      if (!saveToDb.acknowledge) {
        const chapterWithProblem = i;
        i = stopAfter;
        resp = { acknowledge: false, message: saveToDb.message, data: { chapterWithProblem } };
      }
    } else {
      const chapterWithProblem = i;
      i = stopAfter;
      resp = { acknowledge: false, message: dataTosave.message, data: { chapterWithProblem } };
    }
    // stop from going to next page
    if (i !== stopAfter) {
      await goToNext(page);
    }
  }
  await browser.close();
  resp = { acknowledge: true };
  return resp;
};

export default novelChapterScraper;
