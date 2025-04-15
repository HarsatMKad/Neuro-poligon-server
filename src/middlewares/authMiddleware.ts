import { Request, Response, NextFunction } from "express";
import config from "../utils/config";
import Users from "../models/users";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).json({ message: "Доступ отклонен. Нет токена доступа." });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await Users.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    if(user.is_deleted){
      res.status(404).json({ message: "Пользователь удален" });
      return;
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.log(`Неверный токен.`, error);
    res.status(400).json({ message: "Неверный токен" });
    return;
  }
};
