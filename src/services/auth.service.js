import bcrypt from "bcrypt";
import prisma from "../common/prisma/prismaClient.js";
import { signAccessToken } from "../common/helpers/jwt.helper.js";
import { MESSAGES } from "../common/constants/messages.js";

export const authService = {
  register: async ({ email, password, fullName, age, avatar }) => {
    if (!email || !password || !fullName) {
      const err = new Error(MESSAGES.MISSING_FIELDS);
      err.statusCode = 400;
      throw err;
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      const err = new Error(MESSAGES.EMAIL_ALREADY_EXISTS);
      err.statusCode = 409;
      throw err;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, fullName, age, avatar },
    });
    const token = signAccessToken({ userId: user.id });
    const { password: _pw, ...safe } = user;
    return { user: safe, accessToken: token };
  },

  login: async ({ email, password }) => {
    if (!email || !password) {
      const err = new Error(MESSAGES.MISSING_FIELDS);
      err.statusCode = 400;
      throw err;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const err = new Error(MESSAGES.INVALID_CREDENTIALS);
      err.statusCode = 401;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const err = new Error(MESSAGES.INVALID_CREDENTIALS);
      err.statusCode = 401;
      throw err;
    }
    const token = signAccessToken({ userId: user.id });
    const { password: _pw, ...safe } = user;
    return { user: safe, accessToken: token };
  },
};
