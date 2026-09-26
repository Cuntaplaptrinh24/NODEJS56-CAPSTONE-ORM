import express from "express";
import authRouter from "./auth.router.js";
import imageRouter from "./image.router.js";
import userRouter from "./user.router.js";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/images", imageRouter);
rootRouter.use("/users", userRouter);

export default rootRouter;
