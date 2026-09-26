import jwt from "jsonwebtoken";
import { config } from "../constants/config.js";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
