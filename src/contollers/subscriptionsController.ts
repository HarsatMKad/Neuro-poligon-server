import { Request, Response, NextFunction } from "express";
import Subscription from "../models/subscriptions";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { validFilter } = req.body;

    let query: { valid?: boolean } = {valid: true};

    if (validFilter == false) {
      query = {};
    }

    const subscriptions = await Subscription.find(query);
    res.status(200).json(subscriptions);
  } catch (error: any) {
    next(error);
  }
};

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = new Subscription(req.body);

    const newSubscription = await subscription.save();
    res.status(201).json(newSubscription);
  } catch (error: any) {
    next(error);
  }
};

// Обновление подписки
export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSubscription) {
      res.status(404).json({ message: "Подписка не найдена" });
      return;
    }

    res.status(200).json(updatedSubscription);
  } catch (error: any) {
    next(error);
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
      res.status(404).json({ message: "Подписка не найдена" });
      return;
    }

    res.status(200).json({ message: "Подписка успешно удалена" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
