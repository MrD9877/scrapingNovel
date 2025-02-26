import mongoose from "mongoose";
const { Schema } = mongoose;

const exploreSchema = new Schema({
  genre: [
    {
      type: Schema.Types.String,
    },
  ],
});

exploreSchema.index({ genres: "text" });

export const Explore = mongoose.model("Explore", exploreSchema);
