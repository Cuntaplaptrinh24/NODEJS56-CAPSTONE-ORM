import bcrypt from "bcrypt";
import prisma from "../src/common/prisma/prismaClient.js";

const PASSWORD = "123456"; // mat khau don gian de cham

const users = [
  { email: "alice@gmail.com", fullName: "Alice Nguyen", age: 22, avatar: "https://i.pravatar.cc/150?img=1" },
  { email: "bob@gmail.com", fullName: "Bob Tran", age: 25, avatar: "https://i.pravatar.cc/150?img=2" },
  { email: "charlie@gmail.com", fullName: "Charlie Pham", age: 28, avatar: "https://i.pravatar.cc/150?img=3" },
];

const images = [
  { name: "Sunset Beach", description: "Hoang hon nuoc chay mau cam", url: "sunset" },
  { name: "Mountain Hike", description: "Doi nuoc noi Can", url: "mountain" },
  { name: "City Lights", description: "Thanh pho dem lung linh", url: "city" },
  { name: "Forest Camp", description: "Camping giua rung", url: "forest" },
  { name: "Autumn Leaves", description: "Mau thu doi", url: "autumn" },
  { name: "Ocean View", description: "Bien xanh", url: "ocean" },
  { name: "Coffee Time", description: "Ca phe sang", url: "coffee" },
  { name: "Night Sky", description: "Troi sao dem", url: "nightsky" },
  { name: "Old Town", description: "Pho co", url: "oldtown" },
  { name: "Waterfall", description: "Thac nuoc", url: "waterfall" },
];

// comment: [imageIndex, authorIndex, content]
const comments = [
  [0, 1, "Anh tuyet dep qua!"],
  [0, 2, "Cam on ban nha"],
  [0, 0, "Cam on nguoi dong gop!"],
  [1, 2, "Woa sang qua"],
  [1, 0, "Anh chup o dau vay?"],
  [2, 0, "Thanh pho qua dep lam"],
  [2, 1, "Dong hinh dem nay"],
  [3, 2, "Camping o dau cung vui"],
  [4, 0, "Mau thu doi duyen qua"],
  [5, 1, "Bien xanh quyen"],
  [6, 2, "Ca phe sang vay nua?"],
  [7, 0, "Troi sao dep qua"],
  [8, 1, "Pho co khong lo"],
  [9, 2, "Thac nuoc lao qua"],
];

// saved: [userIndex, imageIndex]
const saved = [
  [1, 0], [1, 2], [1, 5],
  [0, 2], [0, 7],
  [2, 1], [2, 3], [2, 9],
];

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  // Xoa theo thu tu quan he de khong vung FK. Seed chay lai nhieu lan van OK.
  await prisma.savedImage.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.image.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(
      await prisma.user.create({ data: { ...u, password: hashed } })
    );
  }

  const createdImages = [];
  for (const img of images) {
    createdImages.push(
      await prisma.image.create({
        data: {
          name: img.name,
          description: img.description,
          imageUrl: `https://picsum.photos/seed/${img.url}/600/400`,
          userId: createdUsers[(createdImages.length + 1) % createdUsers.length].id,
        },
      })
    );
  }

  for (const [imageIndex, userIndex, content] of comments) {
    await prisma.comment.create({
      data: {
        content,
        imageId: createdImages[imageIndex].id,
        userId: createdUsers[userIndex].id,
      },
    });
  }

  for (const [userIndex, imageIndex] of saved) {
    await prisma.savedImage.create({
      data: {
        userId: createdUsers[userIndex].id,
        imageId: createdImages[imageIndex].id,
      },
    });
  }

  console.log("Seed done:", {
    users: createdUsers.length,
    images: createdImages.length,
    comments: comments.length,
    savedImages: saved.length,
  });
}

main()
  .catch((e) => {
    console.error("Seed error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
