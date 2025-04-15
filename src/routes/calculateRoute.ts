import express from "express";
import { calculatePolygons, downloadPolygons } from "../contollers/polygonsController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", calculatePolygons)
router.get("/download", downloadPolygons)

export default router