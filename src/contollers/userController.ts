import { Request, Response, NextFunction } from "express";
import Users from "../models/users";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/authService";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

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
      name,
      email,
      password: hashedPassword,
      subscription_lvl: "Base",
      expiration_sup_date: null,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({ message: "Регистрация успешна", token: token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response) => {
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
    res.status(400).json({ error });
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userList = await Users.find();
    res.json(userList);
  } catch (error) {
    next(error);
  }
};
