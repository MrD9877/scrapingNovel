import "tslib";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateRandom } from "./utility/random";
import { scrapeNovelChapters } from "./utility/scrapeChapter";
import { scrapeNovelInfo } from "./utility/scrapeNovelInfo";
import { scrapeImages } from "./utility/scrapeImage";
import scrapingImagesSelf from "./utility/scrapingImagesSelf";

dotenv.config();

const MONGO_DB_STRING = "mongodb+srv://dhuruvbansl99:Shubham123@cluster0.jos6q.mongodb.net/webnovel";

// async function getBook() {
//   if (MONGO_DB_STRING) {
//     await mongoose.connect(MONGO_DB_STRING);
//     for (let i = 1; i < 3; i++) {
//       await scrapeNovelChapters("global-game-afk-in-the-zombie-apocalypse-game", i);
//     }
//     const novelId = generateRandom(32);
//   }
//   await scrapeImages("https://unsplash.com/photos/a-view-of-the-clouds-from-an-airplane-window-QsPG0AG_SIU");
// }
// getBook();

scrapingImagesSelf();
