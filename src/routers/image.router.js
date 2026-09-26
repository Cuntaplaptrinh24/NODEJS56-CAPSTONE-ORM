import express from "express";
import { imageController } from "../controllers/image.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const imageRouter = express.Router();

imageRouter.get("/", imageController.getImages);
imageRouter.get("/search", imageController.searchImages);
imageRouter.get("/:imageId", imageController.getImageById);
imageRouter.get("/:imageId/comments", imageController.getComments);
imageRouter.post("/:imageId/comments", protect, imageController.postComment);
imageRouter.get("/:imageId/saved", protect, imageController.getSavedStatus);
imageRouter.post("/:imageId/save", protect, imageController.saveImage);
imageRouter.delete("/:imageId/save", protect, imageController.unsaveImage);
imageRouter.delete("/:imageId", protect, imageController.deleteImage);

export default imageRouter;
