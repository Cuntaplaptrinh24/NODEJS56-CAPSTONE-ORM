import prisma from "../common/prisma/prismaClient.js";
import { parseId } from "../common/helpers/validate.helper.js";
import { MESSAGES } from "../common/constants/messages.js";

const notFoundImage = () => {
  const err = new Error(MESSAGES.IMAGE_NOT_FOUND);
  err.statusCode = 404;
  throw err;
};

export const savedImageService = {
  checkSaved: async (imageId, currentUserId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) notFoundImage();
    const saved = await prisma.savedImage.findUnique({
      where: { userId_imageId: { userId: currentUserId, imageId: id } },
    });
    return { saved: Boolean(saved) };
  },

  saveImage: async (imageId, currentUserId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) notFoundImage();
    // Idempotent: da luu roi thi tra ve ban ghi hien tai, khong loi.
    return prisma.savedImage.upsert({
      where: { userId_imageId: { userId: currentUserId, imageId: id } },
      update: {},
      create: { userId: currentUserId, imageId: id },
      include: { image: true },
    });
  },

  unsaveImage: async (imageId, currentUserId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) notFoundImage();
    await prisma.savedImage.deleteMany({
      where: { userId: currentUserId, imageId: id },
    });
    return { saved: false };
  },
};
