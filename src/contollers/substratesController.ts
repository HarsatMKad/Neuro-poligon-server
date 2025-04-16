import { Request, Response, NextFunction } from "express";
import Substrates from "../models/substrates";
import fs from "fs";
import path from "path";
import Users from "../models/users";
import { ISubscriptions } from "../models/subscriptions";

const storageDirectory = "uploads/";

interface AuthRequest extends Request {
  user?: { id: string };
}

async function deleteImageFile(image: String) {
  try {
    await fs.unlinkSync(storageDirectory + image);
  } catch (unlinkError) {
    console.error("Ошибка при удалении загруженного файла:", unlinkError);
  }
}

export const createCustomSubstrates = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.image) {
      res.status(400).json({ message: "Пожалуйста, загрузите изображение" });
      return;
    }

    if (!req.user) {
      res.status(404).json({ message: "Пользователь не зарегистрировался" });
      return;
    }

    const userId = req.user.id;
    const { image, original_name, substrates_max } = req.body;

    const substratesCount = await Substrates.countDocuments({
      user_id: userId,
    });

    const user = await Users.findById(userId).populate<{
      subscription: ISubscriptions | null;
    }>("subscription");

    if (!user?.subscription) {
      res.status(403).json({ message: "Подписка отсутствует" });

      if (req.body.image) {
        deleteImageFile(req.body.image);
      }
      return;
    }

    const substratesMax = user.subscription.substrates_max;
    if (substratesCount >= substratesMax) {
      res.status(403).json({
        substratesCount,
        substratesMax,
        message: "Достигнуто максимальное количество подложек",
      });

      if (req.body.image) {
        deleteImageFile(req.body.image);
      }
      return;
    }

    const newCustomSubstrates = new Substrates({
      user_id: userId,
      image,
      original_name,
      substrates_max,
    });
    await newCustomSubstrates.save();

    res.status(201).json({
      message: "Изображение успешно добавлено",
      CustomSubstrates: newCustomSubstrates,
    });
  } catch (error) {
    console.error(error);

    if (req.body.image) {
      deleteImageFile(req.body.image);
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

    const customSubstratesList = await Substrates.find({ user_id });
    res.status(200).json(customSubstratesList);
  } catch (error) {
    next(error);
  }
};

export const getSubstrateFileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const customSubstrate = await Substrates.findById(id);

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

    res
      .status(200)
      .sendFile(imagePath, { headers: { "Content-Type": "image/tiff" } });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const customSubstrate = await Substrates.findById(id);

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

    deleteImageFile(customSubstrate.image)
    await Substrates.findByIdAndDelete(id);

    res.status(201).json({ message: "Файл успешно удален" });
  } catch (error) {
    next(error);
  }
};