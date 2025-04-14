import express from "express";
import userRoute from "./routes/userRoute";
import customSubstratesRoute from "./routes/customSubstratesRoute";
import calculateRouter from "./routes/calculateRoute";
import { authenticateToken } from "./middlewares/authMiddleware";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/users", userRoute)
app.use("/api/substrates", authenticateToken, customSubstratesRoute)
app.use("/api/calculate", authenticateToken, calculateRouter)

export default app;