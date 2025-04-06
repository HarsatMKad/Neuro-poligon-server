import express from "express";
import { getUsers, registerUser, login } from "../contollers/userController";
import { createCustomSubstrates, getCustomSubstrates } from "../contollers/customSubstratesController";
import { upload, processImage } from "../middlewares/uploadImageMiddleware";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/register/student", registerUser);
router.get("/users", authenticateToken, getUsers)

router.post("/substrates", authenticateToken, upload, processImage, createCustomSubstrates)
router.get("/substrates", authenticateToken, getCustomSubstrates)
router.get("/substrates/:index", authenticateToken, getCustomSubstrates)

export default router;