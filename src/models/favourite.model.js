import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const favouriteSchema = new mongoose.Schema(
  {
    favorite_id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    category: {
      type: String,
      enum: ["artist", "album", "track"],
      require: true,
    },
    item_id: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Favourite = mongoose.model("Favourite", favouriteSchema);
