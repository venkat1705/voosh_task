import express from "express";
import {
  addTrack,
  deleteTrack,
  retrieveTrack,
  retrieveTracks,
  updateTrack,
} from "../controllers/track.controller.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/add-track",
  authenticateUser,
  authorizeRoles(["Admin"]),
  addTrack
);
router.get("/", authenticateUser, retrieveTracks);
router.get("/:track_id", authenticateUser, retrieveTrack);
router.put(
  "/:track_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  updateTrack
);
router.delete(
  "/:track_id",
  authenticateUser,
  authorizeRoles(["Admin", "Editor"]),
  deleteTrack
);

export default router;
