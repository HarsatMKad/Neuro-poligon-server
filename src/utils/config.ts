import * as dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  mongoURL: process.env.MONGO_URL || "mongodb://localhost:27017/project",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
};

export default config;