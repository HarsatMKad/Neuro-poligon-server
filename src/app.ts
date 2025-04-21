import express from "express";
import userRoute from "./routes/userRoute";
import customSubstratesRoute from "./routes/substratesRoute";
import calculateRouter from "./routes/calculateRoute";
import { authenticateToken } from "./middlewares/authMiddleware";
import subscriptionRouter from "./routes/subscriptionRoute";
import { checkSub } from "./middlewares/checkSub";
import { readshp } from "./contollers/polygonsController";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/users", userRoute)
app.use("/api/substrates", authenticateToken, checkSub(1), customSubstratesRoute)
app.use("/api/calculate", authenticateToken, checkSub(1), calculateRouter)
app.use("/api/sub", authenticateToken, subscriptionRouter)

export default app;