import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const storageDirectory = "uploads";

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(tif|tiff)$/i)) {
      return cb(new Error("Пожалуйста, загрузите TIF или TIFF файл"));
    }
    cb(null, true);
  },
}).single("image");

export const processImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next();
    }

    const filename = uuidv4() + path.extname(req.file.originalname);
    const imagePath = path.join(storageDirectory, filename);

    const uploadDir = path.join(__dirname, "../../", storageDirectory);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await fs.writeFileSync(imagePath, req.file.buffer);

    req.body.original_name = req.file.originalname;
    req.body.image = filename;
    next();
  } catch (error) {
    console.error("Ошибка при обработке файла:", error);

    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Ошибка при обработке файла" });
    return;
  }
};
