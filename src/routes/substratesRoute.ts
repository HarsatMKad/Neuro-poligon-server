import express from "express";
import { createCustomSubstrates, getSubstrates, getSubstrateFileById, deleteImage } from "../contollers/substratesController";
import { upload, processImage } from "../middlewares/uploadImageMiddleware";

const router = express.Router();

router.post("/", upload, processImage, createCustomSubstrates)
router.get("/", getSubstrates)
router.get("/:id", getSubstrateFileById)
router.delete("/:id", deleteImage)

export default router;