import express from "express";
import { getUsers, registerUser, login, getUsersById } from "../contollers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", registerUser);
router.get("/users", authenticateToken, getUsers)
router.get("/info", authenticateToken, getUsersById)

export default router;