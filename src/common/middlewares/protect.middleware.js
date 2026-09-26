import { verifyAccessToken } from "../helpers/jwt.helper.js";
import prisma from "../prisma/prismaClient.js";

export const protect = async (req, res, next) => {
  const raw = req.headers.authorization || req.headers.Authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : "";
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", statusCode: 401, message: "Unauthorized: token is required" });
  }
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", statusCode: 401, message: "Unauthorized: user no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "error", statusCode: 401, message: err.message || "Invalid or expired token" });
  }
};
