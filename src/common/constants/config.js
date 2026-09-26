// Central config: dotenv duoc load 1 lan o day, cac module khac chi import tu file nay.
import "dotenv/config";

const required = ["JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Thieu bien moi truong bat buoc: ${missing.join(", ")}. ` +
      `Hay tao file .env tu .env.example roi chay lai.`
  );
}

export const config = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cybersoftToken: process.env.CYBERSOFT_TOKEN || "",
};
