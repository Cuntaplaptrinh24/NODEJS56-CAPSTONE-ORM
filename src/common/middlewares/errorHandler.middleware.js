import { config } from "../constants/config.js";

export const errorHandler = (err, req, res, _next) => {
  const status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  if (status >= 500) {
    console.error("[Error]", message, err.stack?.split("\n")[0] || "");
  }
  const body = { status: "error", statusCode: status, message };
  if (config.nodeEnv !== "production" && err.stack && status >= 500) {
    // Giu stack o dev de debug, nhung khong gui ra production
    body.stack = err.stack;
  }
  res.status(status).json(body);
};
