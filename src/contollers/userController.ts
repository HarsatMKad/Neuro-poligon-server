import { Request, Response, NextFunction } from "express";
import Users from "../models/users";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/authService";
import Subscription from "../models/subscriptions";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        message: "Пользователь с таким email уже зарегистрирован",
        token: "",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = generateToken(newUser._id);
    res.status(201).json({ message: "Регистрация успешна", token: token });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Неверный email или пароль" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(400).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user._id);

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(404).json({ message: "пользователь не зарегистрирован." });
      return;
    }
    const userId = req.user.id;
    const { username, email, password } = req.body;

    const updateFields: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    if (username) {
      updateFields.username = username;
    }

    if (email) {
      updateFields.email = email;
    }

    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "пользователь не существует." });
      return;
    }

    if (password) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        res.status(400).json({ message: "Пароли не должны совпадать" });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: "Не переданы параметры для обновления" });
      return;
    }

    const updatedUser = await Users.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).populate("subscription");

    res
      .status(201)
      .json({ message: "Пользователь успешно обновлен", updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userList = await Users.find();
    res.status(200).json(userList);
  } catch (error) {
    next(error);
  }
};

export const getUsersById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(404).json({ message: "пользователь не зарегистрирован." });
      return;
    }
    const userId = req.user.id;
    const user = await Users.findById(userId).populate("subscription");

    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      expiration_sup_date: user.expiration_sup_date,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const editDeleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  delete_value: Boolean
) => {
  try {
    if (!req.user) {
      res.status(404).json({ message: "пользователь не зарегистрирован." });
      return;
    }

    const userId = req.user.id;

    const deletedUser = await Users.findByIdAndUpdate(
      userId,
      { is_deleted: delete_value },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deletedUser) {
      res.status(404).json({ message: "пользователь не найден." });
      return;
    }

    res.status(200).json(deletedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await editDeleteUser(req, res, next, true);
};

export const restoreUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await editDeleteUser(req, res, next, false);
};

export const changeSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(404).json({ message: "пользователь не зарегистрирован." });
      return;
    }
    const { subId } = req.params;

    console.log("subId", subId);

    const subscription = await Subscription.findById(subId);
    console.log(subscription);

    if (!subscription) {
      res.status(404).json({ message: "Подписка не найдена." });
      return;
    }

    if (!subscription.valid) {
      res.status(403).json({ message: "Подписка не действительна." });
      return;
    }

    const expirationSubDate = Date.now() + subscription.duration;
    const user = await Users.findByIdAndUpdate(userId.id, {
      subscription: subId,
      expiration_sup_date: expirationSubDate,
    }).populate("subscription");
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
