import jwt from "jsonwebtoken";
import config from "./config";

const JWT_EXPIRES_IN = "1h";

export const generateToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
};