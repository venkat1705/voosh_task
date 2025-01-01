import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const trackSchema = new mongoose.Schema(
  {
    track_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    artist_id: {
      type: String,
      ref: "Artist",
    },
    album_id: {
      type: String,
      ref: "Album",
    },
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    duration: {
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

export const Track = mongoose.model("Track", trackSchema);
