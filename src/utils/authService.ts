import jwt from "jsonwebtoken";
import config from "./config";

const JWT_EXPIRES_IN = "1h";

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
};