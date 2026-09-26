import express from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/:userId", userController.getUserById);
userRouter.get("/:userId/saved-images", userController.getSavedImages);
userRouter.get("/:userId/created-images", userController.getCreatedImages);

export default userRouter;
