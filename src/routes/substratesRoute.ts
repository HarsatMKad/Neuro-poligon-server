import express from "express";
import { createCustomSubstrates, getSubstrates, getSubstrateById } from "../contollers/substratesController";
import { upload, processImage } from "../middlewares/uploadImageMiddleware";

const router = express.Router();

router.post("/", upload, processImage, createCustomSubstrates)
router.get("/", getSubstrates)
router.get("/:id", getSubstrateById)

export default router;