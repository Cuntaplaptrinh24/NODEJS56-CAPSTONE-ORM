// Express application - dung chung cho LOCAL (server.js) va VERCEL (src/app.js).
// File nay KHONG app.listen(), chi dinh nghia va export app.
import "dotenv/config";
import express from "express";
import cors from "cors";
import rootRouter from "./routers/root.router.js";
import { notFound } from "./common/middlewares/notFound.middleware.js";
import { errorHandler } from "./common/middlewares/errorHandler.middleware.js";
import { swaggerSpec } from "./common/constants/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI standalone (CDN) - on dinh tren Vercel (khong dung static assets tu swagger-ui-express).
app.get("/api-docs", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Pinterest API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  <style>body{margin:0} #swagger-ui{padding-top:16px}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/api/openapi.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>`);
});

// OpenAPI JSON cho Swagger UI (va cac cong cu import spec).
app.get("/api/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});

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
