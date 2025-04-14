import express from "express";
import { calculatePolygons, downloadPolygons } from "../contollers/polygonsController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, calculatePolygons)
router.get("/download", authenticateToken, downloadPolygons)

export default router