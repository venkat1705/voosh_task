import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const artistSchema = new mongoose.Schema(
  {
    artist_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    grammy: {
      type: Number,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Artist = mongoose.model("Artist", artistSchema);
