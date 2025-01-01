import express from "express";
import {
  authenticateUser,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  addAlbum,
  deleteAlbum,
  retrieveAlbum,
  retrieveAlbums,
  updateAlbum,
} from "../controllers/album.controller.js";

const router = express.Router();

router.post(
  "/add-album",
  authenticateUser,
  authorizeRoles(["Admin"]),
  addAlbum
);

router.get("/", authenticateUser, retrieveAlbums);
router.get("/:album_id", authenticateUser, retrieveAlbum);
router.put(
  "/:album_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  updateAlbum
);
router.delete(
  "/:album_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  deleteAlbum
);

export default router;
