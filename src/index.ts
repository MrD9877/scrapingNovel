import "tslib";
import dotenv from "dotenv";
import novelInfoScrapper from "./utility/novelInfo";
import novelChapterScraper from "./utility/novelChapter";
import { generateRandom } from "./utility/random";
import mongoose from "mongoose";

dotenv.config();

const searchnovelCLI = process.argv.length >= 3 ? process.argv[2] : "comprehension-ability-creating-and-teaching-the-dao-in-various-worlds";
const startChapterCLI = process.argv.length >= 4 ? process.argv[3] : "1";
const stopChapterCLI = process.argv.length >= 5 ? process.argv[4] : "1";
(async () => {
  try {
    await mongoose.connect("mongodb+srv://dhuruvbansl99:Shubham123@cluster0.jos6q.mongodb.net/NovelStore");
  } catch (err) {
    throw err;
  }
  let novelId = generateRandom(32);
  try {
    const resp = await novelInfoScrapper(searchnovelCLI, novelId);
    if (!resp.acknowledge) {
      console.log("not acknowledge", novelId);
      if (resp.message.includes("Dublicate")) novelId = resp.data.novelId;
      else throw Error(resp.message);
      console.log("not acknowledge", novelId);
    }
  } catch (err) {
    throw err;
  }
  try {
    await novelChapterScraper(searchnovelCLI, Number(startChapterCLI), Number(stopChapterCLI), novelId);
  } catch {
    console.log("error on chapter call");
  } finally {
    await mongoose.connection.close();
  }
})();
