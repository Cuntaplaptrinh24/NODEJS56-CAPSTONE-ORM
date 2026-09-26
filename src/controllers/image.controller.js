import { imageService } from "../services/image.service.js";
import { commentService } from "../services/comment.service.js";
import { savedImageService } from "../services/savedImage.service.js";
import { success } from "../common/helpers/response.helper.js";
import { asyncHandler } from "../common/helpers/asyncHandler.helper.js";

export const imageController = {
  getImages: asyncHandler(async (req, res) => {
    const images = await imageService.getImages();
    return success(res, images, "Get images successfully");
  }),

  searchImages: asyncHandler(async (req, res) => {
    const images = await imageService.searchImages(req.query.name || "");
    return success(res, images, "Search images successfully");
  }),

  getImageById: asyncHandler(async (req, res) => {
    const image = await imageService.getImageById(req.params.imageId);
    return success(res, image, "Get image detail successfully");
  }),

  getComments: asyncHandler(async (req, res) => {
    const comments = await commentService.getCommentsByImageId(req.params.imageId);
    return success(res, comments, "Get comments successfully");
  }),

  postComment: asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(
      req.params.imageId,
      req.user.id, // userId lay tu JWT, khong nhap tu client
      req.body?.content
    );
    return success(res, comment, "Comment created", 201);
  }),

  getSavedStatus: asyncHandler(async (req, res) => {
    const data = await savedImageService.checkSaved(req.params.imageId, req.user.id);
    return success(res, data, "Get saved status successfully");
  }),

  saveImage: asyncHandler(async (req, res) => {
    const data = await savedImageService.saveImage(req.params.imageId, req.user.id);
    return success(res, data, "Image saved", 201);
  }),

  unsaveImage: asyncHandler(async (req, res) => {
    const data = await savedImageService.unsaveImage(req.params.imageId, req.user.id);
    return success(res, data, "Image unsaved");
  }),

  deleteImage: asyncHandler(async (req, res) => {
    const result = await imageService.deleteImage(req.params.imageId, req.user.id);
    return success(res, result, "Image deleted");
  }),
};
