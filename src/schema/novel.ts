import mongoose from "mongoose";
const { Schema } = mongoose;

export interface NovelInfo {
  overview: string[];
  totalChapters: number;
  lastUpdate: Date;
  cover: string;
  name: string;
  author: string;
  novelId: string;
  genres: string[];
  tags: string;
  status: string;
}
const novelSchema = new Schema({
  novelId: {
    type: Schema.Types.String,
    required: true,
  },
  overview: [
    {
      type: Schema.Types.String,
    },
  ],
  totalChapters: {
    type: Schema.Types.Number,
  },
  genres: [
    {
      type: Schema.Types.String,
    },
  ],
  tags: {
    type: Schema.Types.String,
  },
  lastUpdate: {
    type: Schema.Types.Date,
  },
  cover: {
    type: Schema.Types.String,
  },
  name: {
    type: Schema.Types.String,
  },
  author: {
    type: Schema.Types.String,
  },

  status: {
    type: Schema.Types.String,
  },
  index: [
    {
      chapterId: {
        type: Schema.Types.String,
      },
      title: {
        type: Schema.Types.String,
        require: true,
        default: "chapter",
      },
      updateDate: {
        type: Schema.Types.String,
      },
    },
  ],
});

novelSchema.pre("save", function (next) {
  this.totalChapters = this.index.length;
  next();
});
novelSchema.index({ name: "text", tags: "text", genres: "text" });
export const Novel = mongoose.model("novel", novelSchema);
