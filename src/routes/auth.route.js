import express from "express";
import {
  loginUser,
  logout,
  registerUser,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/logout", authenticateUser, logout);

export default router;
