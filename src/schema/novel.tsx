import mongoose from "mongoose";
const { Schema } = mongoose;

export interface NovelInfo {
  overview: string;
  totalChapters: number;
  lastUpdate: Date;
  cover: string;
  title: string;
  author: string;
  novelId: string;
}
const novelSchema = new Schema({
  novelId: {
    type: Schema.Types.String,
    required: true,
  },
  overview: {
    type: Schema.Types.String,
  },
  totalChapters: {
    type: Schema.Types.Number,
  },
  lastUpdate: {
    type: Schema.Types.Date,
  },
  cover: {
    type: Schema.Types.String,
  },
  title: {
    type: Schema.Types.String,
  },
  author: {
    type: Schema.Types.String,
  },
  chapter: [
    {
      topic: Schema.Types.String,
      constent: Schema.Types.String,
    },
  ],
});

export const Novel = mongoose.model("novel", novelSchema);
