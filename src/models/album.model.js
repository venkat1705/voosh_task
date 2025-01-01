import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const albumSchema = new mongoose.Schema(
  {
    album_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    year: {
      type: Number,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    artist_id: {
      type: String,
      ref: "Artist",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Album = mongoose.model("Album", albumSchema);
