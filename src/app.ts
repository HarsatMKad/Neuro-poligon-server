import express, { Request, Response } from "express";
import userRoute from "./routes/userRoutes";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

app.use("/api", userRoute)

export default app;