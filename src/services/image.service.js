import prisma from "../common/prisma/prismaClient.js";
import { parseId } from "../common/helpers/validate.helper.js";
import { MESSAGES } from "../common/constants/messages.js";

const notFound = (message) => {
  const err = new Error(message);
  err.statusCode = 404;
  throw err;
};

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  age: true,
  avatar: true,
  createdAt: true,
};

export const imageService = {
  getImages: async () => {
    return prisma.image.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: userSelect } },
    });
  },

  searchImages: async (name = "") => {
    return prisma.image.findMany({
      where: { name: { contains: name } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: userSelect } },
    });
  },

  getImageById: async (imageId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({
      where: { id },
      include: { user: { select: userSelect } },
    });
    if (!image) notFound(MESSAGES.IMAGE_NOT_FOUND);
    return image;
  },

  deleteImage: async (imageId, currentUserId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) notFound(MESSAGES.IMAGE_NOT_FOUND);
    if (image.userId !== currentUserId) {
      const err = new Error(MESSAGES.NOT_IMAGE_OWNER);
      err.statusCode = 403;
      throw err;
    }
    await prisma.image.delete({ where: { id } });
    return { id };
  },
};
