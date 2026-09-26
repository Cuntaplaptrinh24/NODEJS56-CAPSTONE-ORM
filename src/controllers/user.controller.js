import { userService } from "../services/user.service.js";
import { success } from "../common/helpers/response.helper.js";
import { asyncHandler } from "../common/helpers/asyncHandler.helper.js";

export const userController = {
  getUserById: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    return success(res, user, "Get user successfully");
  }),

  getSavedImages: asyncHandler(async (req, res) => {
    const images = await userService.getSavedImages(req.params.userId);
    return success(res, images, "Get saved images successfully");
  }),

  getCreatedImages: asyncHandler(async (req, res) => {
    const images = await userService.getCreatedImages(req.params.userId);
    return success(res, images, "Get created images successfully");
  }),
};
