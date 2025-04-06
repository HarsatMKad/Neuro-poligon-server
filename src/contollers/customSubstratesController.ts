import { Request, Response, NextFunction } from "express";
import CustomSubstrates from "../models/customSubstrates";
import fs from "fs";
import path from "path";

const storageDirectory = "uploads/";

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
    const imagePath = req.body.image;

    const newCustomSubstrates = new CustomSubstrates({
      user_id: userId,
      image: imagePath,
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

export const getCustomSubstrates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try { 
    const user_id = (req as any).user.index;

    const CustomSubstratesList = await CustomSubstrates.find(user_id);
    res.json(CustomSubstratesList);
  } catch (error) {
    next(error);
  }
};

export const getCustomSubstrateByIndex = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try { 
      const user_id = (req as any).user.id;
  
      const substrateIndex =  req.params;
  
      const CustomSubstratesList = await CustomSubstrates.find(user_id);

      const imgPath = CustomSubstratesList[0].image
      const fp = path.join(__dirname, storageDirectory, imgPath);

      res.sendFile(fp);
    } catch (error) {
      next(error);
    }
  };