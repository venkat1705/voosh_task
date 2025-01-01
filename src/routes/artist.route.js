import express from "express";
import {
  addArtist,
  deleteArtist,
  retrieveArtist,
  retrieveArtists,
  updateArtist,
} from "../controllers/artist.controller.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/add-artist",
  authenticateUser,
  authorizeRoles(["Admin"]),
  addArtist
);
router.get("/", authenticateUser, retrieveArtists);
router.get("/:artist_id", authenticateUser, retrieveArtist);
router.put(
  "/:artist_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  updateArtist
);
router.delete(
  "/:artist_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  deleteArtist
);

export default router;
