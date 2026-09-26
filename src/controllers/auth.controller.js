import { authService } from "../services/auth.service.js";
import { success } from "../common/helpers/response.helper.js";
import { asyncHandler } from "../common/helpers/asyncHandler.helper.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body || {});
    return success(res, result, "Register successfully", 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body || {});
    return success(res, result, "Login successfully");
  }),
};
