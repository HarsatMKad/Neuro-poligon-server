import { Request, Response, NextFunction } from "express";
import CustomSubstrates from "../models/customSubstrates";
import fs from "fs";
import path from "path";

const storageDirectory = "uploads/";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createCustomSubstrates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.image) {
      res.status(400).json({ message: "Пожалуйста, загрузите изображение" });
      return;
    }

    const userId = (req as any).user.id;
    const { image, original_name } = req.body;

    const newCustomSubstrates = new CustomSubstrates({
      user_id: userId,
      image,
      original_name,
    });
    await newCustomSubstrates.save();

    res.status(201).json({
      message: "Изображение успешно добавлено",
      CustomSubstrates: newCustomSubstrates,
    });
  } catch (error) {
    console.error(error);

    if (req.body.image) {
      try {
        await fs.unlinkSync(storageDirectory + req.body.image);
      } catch (unlinkError) {
        console.error("Ошибка при удалении загруженного файла:", unlinkError);
      }
    }
    next(error);
  }
};

export const getSubstrates = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(404).json({ message: "Пользователь не зарегистрирован" });
      return;
    }

    const user_id = req.user.id;

    const customSubstratesList = await CustomSubstrates.find({ user_id });
    res.status(201).json(customSubstratesList);
  } catch (error) {
    next(error);
  }
};

export const getSubstrateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const customSubstrate = await CustomSubstrates.findById(id);

    if (!customSubstrate) {
      res.status(404).json({ message: "Файл не найден" });
      return;
    }

    const imagePath = path.join(
      __dirname,
      "../../",
      storageDirectory,
      customSubstrate.image
    );

    if (!fs.existsSync(imagePath)) {
      res.status(404).json({ message: "Файл не найден на диске" });
      return;
    }

    res.status(201).sendFile(imagePath, { headers: { "Content-Type": "image/tiff" } });
  } catch (error) {
    next(error);
  }
};
