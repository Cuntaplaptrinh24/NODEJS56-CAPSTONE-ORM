import { MESSAGES } from "../constants/messages.js";

// ID hop la: positive integer (1, 2, 3...). Tra 400 neu khong hop le,
// de khong de Prisma nem loi thanh 500.
export const parseId = (raw, label = "id") => {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    const err = new Error(`${label} khong hop le: ${raw}`);
    err.statusCode = 400;
    throw err;
  }
  return value;
};
