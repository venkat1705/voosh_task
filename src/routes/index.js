import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import artistRouter from "./artist.route.js";
import albumRouter from "./album.route.js";
import trackRouter from "./track.route.js";
import favouriteRouter from "./favourite.route.js";

const router = express.Router();

router.use(authRouter);
router.use("/users", userRouter);
router.use("/artists", artistRouter);
router.use("/albums", albumRouter);
router.use("/favorites", favouriteRouter);

export default router;
