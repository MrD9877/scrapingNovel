import { writeFile } from "fs";
import { HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { generateRandom } from "./random";
import { Novel, NovelInfo } from "../schema/novel";
import { uploadImage } from "./awsBucket";

export type FuntionResponse = { acknowledge: true; data?: any } | { acknowledge: false; message: string; data?: any };

interface Index {
  title: string;
  updateDate: string;
}

interface PostContent {
  author: string;
  genres: string[];
  tags: string;
  status: string;
}

type SaveDataType = Omit<NovelInfo, "lastUpdate" | "totalChapters"> & { index: Index[] };

let images: Buffer<ArrayBufferLike>[] = [];

// https://novgo.co/novel/
puppeteer.use(StealthPlugin());
const headless = { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
const head = { headless: false };

export const getCoverImage = async (resp: HTTPResponse, novel: string, imageId: string) => {
  const header = resp.headers();
  const url = new URL(resp.url());
  if (header["content-type"]?.includes("image/jpeg") && Number(header["content-length"]) > 1000 && !url.href.includes("wp-content/themes/madara/images/bg-search.jpg")) {
    await resp
      .buffer()
      .then(async (buffer) => {
        images.push(buffer);
      })
      .catch((err) => {
        if (err) throw err;
      });
  }
};

export const getSummary = async (page: Page, novel: string) => {
  await page.waitForSelector(".description-summary");
  const summary = await page.$eval(".description-summary", (el) => (el as HTMLElement).innerText);
  const summaryData = summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  return summaryData;
};

export const getIndex = async (page: Page): Promise<Index[]> => {
  const changeOrderbtn = await page.waitForSelector(".btn-reverse-order");
  await changeOrderbtn?.click();
  await page.waitForSelector(".listing-chapters_wrap");
  const index = await page.$$eval(".listing-chapters_wrap li", (data) => {
    function formateDate(today: Date) {
      let day = today.getDate();
      const month = today.toLocaleString("en-IN", { month: "short" }); // Short month name
      const year = today.getFullYear();
      return `${day} ${month}, ${year}`;
    }

    function changeDate(date: string): string {
      if (date.includes("days")) {
        const today = Date.now();
        const updatedDate = Number(date[0]) * 24 * 60 * 60 * 1000;

        return formateDate(new Date(today - updatedDate));
      } else {
        return formateDate(new Date());
      }
    }
    return data.map((row) => {
      const title = row.querySelector("a");
      let date = row.querySelector("i")?.innerText;
      if (date?.includes("ago")) {
        date = changeDate(date);
      }
      if (!date) date = formateDate(new Date());
      return {
        title: (title as HTMLElement).innerText,
        updateDate: date,
      };
    });
  });
  return index;
};

export const getPostContent = async (page: Page) => {
  await page.waitForSelector(".post-content div");
  const postContent_omit_status: Omit<PostContent, "status"> = await page.$eval(".post-content", (data) => {
    const author = data.querySelectorAll(".author-content")[0];
    const genres = data.querySelectorAll(".genres-content")[0];
    const tags = data.querySelectorAll(".tags-content")[0];
    return {
      author: (author as HTMLElement).innerText,
      genres: (genres as HTMLElement).innerText.split(","),
      tags: (tags as HTMLElement).innerText,
    };
  });
  await page.waitForSelector(".post-status");
  const status = await page.$eval(".post-status", (data) => {
    const getstatus = data.querySelectorAll(".summary-content")[0];
    return (getstatus as HTMLAreaElement).innerText;
  });
  const postContent = { ...postContent_omit_status, status };
  return postContent;
};

export const getNovelName = async (page: Page) => {
  await page.waitForSelector(".post-title");

  const name = await page.$eval(".post-title", (data) => {
    const topic = data.querySelector("h1");
    return topic?.innerText;
  });
  return name;
};

const saveDataToDb = async (data: SaveDataType): Promise<FuntionResponse> => {
  try {
    const novel = new Novel({ ...data });
    await novel.save();
    return { acknowledge: true };
  } catch (err) {
    throw { acknowledge: false, message: (err as Error).message };
  }
};

const checkNovelDb = async (name: string): Promise<FuntionResponse> => {
  try {
    const novel = await Novel.findOne({ name });
    if (novel) {
      return { acknowledge: false, message: "Dublicate Novel Found", data: { novelId: novel.novelId } };
    } else {
      return { acknowledge: true };
    }
  } catch (err) {
    throw Error(`DB Error: ${(err as Error).message}`);
  }
};

const novelInfoScrapper = async (novel: string, novelId: string) => {
  const browser = await puppeteer.launch(headless);
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, isLandscape: false, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

  const imageId = generateRandom(32);
  //   get cover
  page.on("response", async (res) => await getCoverImage(res, novel, imageId));

  await page.goto(`https://novgo.co/novel/${novel}`);

  // get novel name
  const name = await getNovelName(page);
  if (!name) throw Error("no name found");
  const dublicate = await checkNovelDb(name);

  if (!dublicate.acknowledge) return dublicate;

  await uploadImage(images[0], imageId);

  //   get summary
  const overview = await getSummary(page, novel);
  //   get index
  const index = await getIndex(page);
  //   get postContent
  const postContent = await getPostContent(page);

  const saveData = { overview, index, ...postContent, cover: imageId, novelId, name };

  console.log(`Novel Info of ${name} scraped`);

  const saveResp = await saveDataToDb(saveData);

  if (saveResp.acknowledge) {
    console.log(`Novel Info of ${name} saved`);
  }

  await browser.close();
  return saveResp;
};

export default novelInfoScrapper;
