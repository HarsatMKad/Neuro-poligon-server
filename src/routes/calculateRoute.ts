import express from "express";
import { calculatePolygons, downloadPolygons, downloadNeiroplan } from "../contollers/polygonsController";

const router = express.Router();

router.post("/", calculatePolygons)
router.post("/download", downloadPolygons)
router.post("/ortoneiroplan", downloadNeiroplan)

export default router