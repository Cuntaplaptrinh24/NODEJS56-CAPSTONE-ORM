// Chi dung local. Vercel import tu src/app.js, KHONG qua file nay.
import "dotenv/config";
import { config } from "./src/common/constants/config.js";
import app from "./src/app.js";

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Swagger docs: http://localhost:${config.port}/api-docs`);
});
