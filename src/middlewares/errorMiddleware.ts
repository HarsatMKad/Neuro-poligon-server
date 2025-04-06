import { Request, Response } from "express";

export const errorHandler = (error: string, req: Request, res: Response) => {
    console.error(error);
    res.status(500).json({ message: "Что то пошло не так.", error: error });
}