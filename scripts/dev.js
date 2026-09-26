#!/usr/bin/env node
// Dev bootstrap: chi can `npm run dev`.
// 1. Kiem tra Docker Engine (khong dung MySQL80 he thong).
// 2. docker compose up -d (idempotent, co san thi khong recreate).
// 3. Cho MySQL healthy moi chay Prisma.
// 4. prisma generate + migrate deploy.
// 5. Seed CHI khi database trong (khong lam mat data test).
// 6. Chay nodemon server.js.
import "dotenv/config";
import { execa } from "execa";
import { PrismaClient } from "@prisma/client";

const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm";
const DOCKER_BIN = "docker";
const MAX_DB_WAIT_MS = Number(process.env.DEV_DB_WAIT_MS || 120000);

const log = (...args) => console.log("[dev]", ...args);
const fail = (message) => {
  console.error(`\n[dev] ${message}\n`);
  process.exit(1);
};

async function dockerAvailable() {
  try {
    await execa(DOCKER_BIN, ["info"], { stdio: "ignore", timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

async function mysqlHealthyInContainer() {
  try {
    const { stdout } = await execa(
      DOCKER_BIN,
      ["exec", "pinterest_mysql", "mysqladmin", "ping", "-h", "127.0.0.1", "-u", "root", "-ppinterest_root_pass"],
      { stdio: "pipe", timeout: 10000 }
    );
    return /alive/i.test(stdout);
  } catch {
    return false;
  }
}

async function waitForMysql() {
  const startedAt = Date.now();
  log("Dang doi MySQL container healthy...");
  for (;;) {
    if (await mysqlHealthyInContainer()) {
      log("MySQL da healthy.");
      return;
    }
    if (Date.now() - startedAt > MAX_DB_WAIT_MS) {
      fail("MySQL khong healthy trong thoi gian cho. Hay chay `docker compose ps` de kiem tra container pinterest_mysql.");
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

async function prismaCount(table) {
  const prisma = new PrismaClient();
  try {
    if (table === "user") return await prisma.user.count();
    if (table === "image") return await prisma.image.count();
    return 0;
  } catch (err) {
    log(`Chua doc duoc bang ${table} (${err.code || err.message}). Se chay migrate.`);
    return -1;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function seedIfEmpty() {
  const users = await prismaCount("user");
  const images = await prismaCount("image");
  if (users === 0 || images === 0 || users === -1 || images === -1) {
    log(`Database trong (users=${users}, images=${images}) -> chay seed mau.`);
    await execa(NPM_BIN, ["run", "seed"], { stdio: "inherit" });
    return;
  }
  log(`Database da co du lieu (users=${users}, images=${images}) -> bo qua seed, khong lam mat data test.`);
}

async function main() {
  if (!(await dockerAvailable())) {
    fail("Docker Desktop chua chay. Hay mo Docker Desktop roi chay lai `npm run dev`.");
  }

  log("Kiem tra/khoi dong MySQL project (docker compose up -d)...");
  try {
    await execa(DOCKER_BIN, ["compose", "up", "-d"], { stdio: "inherit", timeout: 180000 });
  } catch (err) {
    fail(`Khong the khoi dong database: ${err.shortMessage || err.message}`);
  }

  await waitForMysql();

  log("Chay prisma generate...");
  try {
    await execa("npx", ["prisma", "generate"], { stdio: "inherit", timeout: 120000, shell: process.platform === "win32" });
  } catch (err) {
    fail(`prisma generate that bai: ${err.shortMessage || err.message}`);
  }

  log("Chay prisma migrate deploy...");
  try {
    await execa("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", timeout: 120000, shell: process.platform === "win32" });
  } catch (err) {
    fail(`prisma migrate deploy that bai: ${err.shortMessage || err.message}`);
  }

  await seedIfEmpty();

  log("Khoi dong server (nodemon server.js)...");
  // execa xu ly tot Windows .cmd proxy (spawn truc tiep se EINVAL tren PowerShell).
  const server = execa(NPM_BIN, ["exec", "nodemon", "server.js"], {
    stdio: "inherit",
    buffer: false,
  });
  process.on("SIGINT", () => server.kill("SIGINT"));
  process.on("SIGTERM", () => server.kill("SIGTERM"));
  // Ctrl+C la cach dung binh thuong, khong in loi.
  try {
    await server;
  } catch (err) {
    if (!err.isCanceled && !err.isTerminated) throw err;
    log("Da dung server.");
  }
}

main();
