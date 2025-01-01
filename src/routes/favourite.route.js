import express from "express";
import {
  addFavourite,
  deleteFavourite,
  retrieveFavourites,
} from "../controllers/favourite.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add-favorite", authenticateUser, addFavourite);
router.get("/:category", authenticateUser, retrieveFavourites);
router.delete(
  "/remove-favorite/:favorite_id",
  authenticateUser,
  deleteFavourite
);

export default router;
