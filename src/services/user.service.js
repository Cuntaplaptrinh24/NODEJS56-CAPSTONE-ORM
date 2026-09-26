import prisma from "../common/prisma/prismaClient.js";
import { parseId } from "../common/helpers/validate.helper.js";
import { MESSAGES } from "../common/constants/messages.js";

const userPublic = {
  id: true,
  email: true,
  fullName: true,
  age: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};

const creatorSelect = {
  id: true,
  email: true,
  fullName: true,
  avatar: true,
};

const notFoundUser = () => {
  const err = new Error(MESSAGES.USER_NOT_FOUND);
  err.statusCode = 404;
  throw err;
};

export const userService = {
  getUserById: async (userId) => {
    const id = parseId(userId, "userId");
    const user = await prisma.user.findUnique({
      where: { id },
      select: userPublic, // password khong bao gio tra ve client
    });
    if (!user) notFoundUser();
    return user;
  },

  getSavedImages: async (userId) => {
    const id = parseId(userId, "userId");
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) notFoundUser();
    const rows = await prisma.savedImage.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { image: { include: { user: { select: creatorSelect } } } },
    });
    return rows.map((r) => r.image);
  },

  getCreatedImages: async (userId) => {
    const id = parseId(userId, "userId");
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) notFoundUser();
    return prisma.image.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: creatorSelect } },
    });
  },
};
