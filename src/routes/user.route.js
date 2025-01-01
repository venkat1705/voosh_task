import express from "express";
import {
  authenticateUser,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  addUser,
  deleteUser,
  retrieveUsers,
  updatePassword,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", authenticateUser, authorizeRoles(["Admin"]), retrieveUsers);
router.post("/add-user", authenticateUser, authorizeRoles(["Admin"]), addUser);
router.delete(
  "/:user_id",
  authenticateUser,
  authorizeRoles(["Admin"]),
  deleteUser
);
router.put("/update-password", authenticateUser, updatePassword);

export default router;
