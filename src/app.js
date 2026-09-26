// Express application - duoc dung chung cho LOCAL (server.js) va VERCEL (api/index.js).
// File nay KHONG app.listen(), chi dinh nghia va export app.
import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import rootRouter from "./routers/root.router.js";
import { notFound } from "./common/middlewares/notFound.middleware.js";
import { errorHandler } from "./common/middlewares/errorHandler.middleware.js";
import { swaggerSpec } from "./common/constants/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI — co sang /api-docs (khong anh huong luong API chinh)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ status: "success", statusCode: 200, message: "Capstone Pinterest API is running", data: null });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "success", statusCode: 200, message: "OK", data: { status: "ok" } });
});
app.use("/api", rootRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
