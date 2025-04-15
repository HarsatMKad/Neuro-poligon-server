import { Request, Response, NextFunction } from "express";
import config from "../utils/config";
import Users from "../models/users";
import jwt from "jsonwebtoken";
import Subscription, { ISubscriptions } from "../models/subscriptions";

interface AuthRequest extends Request {
  user?: { id: string };
}

export function checkSub(requiredLevel: number) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization");

      if (!token) {
        res
          .status(401)
          .json({ message: "Доступ отклонен. Нет токена доступа." });
        return;
      }

      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

      const user = await Users.findById(decoded.id).populate<{
        subscription: ISubscriptions | null;
      }>("subscription");
      if (!user) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }

      if (!user.subscription) {
        res.status(404).json({ message: "Подписка отсутствует" });
        return;
      }

      if (Date.now() >= user.expiration_sup_date) {
        res.status(403).json({ message: "Срок действия подписки истек" });
        return;
      }

      if (user.subscription.lvl < requiredLevel) {
        res.status(403).json({ message: "Недостаточный уровень подписки" });
        return;
      }

      next();
    } catch (error) {
      console.log(`Неверный токен.`, error);
      res.status(400).json({ message: "Неверный токен" });
      return;
    }
  };
}
