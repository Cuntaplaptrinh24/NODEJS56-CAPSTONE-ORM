import prisma from "../common/prisma/prismaClient.js";
import { parseId } from "../common/helpers/validate.helper.js";
import { MESSAGES } from "../common/constants/messages.js";

const commentWithUser = {
  user: { select: { id: true, email: true, fullName: true, avatar: true } },
};

export const commentService = {
  getCommentsByImageId: async (imageId) => {
    const id = parseId(imageId, "imageId");
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      const err = new Error(MESSAGES.IMAGE_NOT_FOUND);
      err.statusCode = 404;
      throw err;
    }
    return prisma.comment.findMany({
      where: { imageId: id },
      orderBy: { createdAt: "asc" },
      include: commentWithUser,
    });
  },

  createComment: async (imageId, currentUserId, content) => {
    const id = parseId(imageId, "imageId");
    if (typeof content !== "string" || !content.trim()) {
      const err = new Error(MESSAGES.EMPTY_COMMENT);
      err.statusCode = 400;
      throw err;
    }
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      const err = new Error(MESSAGES.IMAGE_NOT_FOUND);
      err.statusCode = 404;
      throw err;
    }
    // userId luon lay tu JWT (req.user.id), khong nhap tu client.
    return prisma.comment.create({
      data: { content: content.trim(), imageId: id, userId: currentUserId },
      include: commentWithUser,
    });
  },
};
