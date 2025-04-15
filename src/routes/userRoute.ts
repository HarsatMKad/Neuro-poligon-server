import express from "express";
import { getUsers, registerUser, login, getUsersById, deleteUser, restoreUser, updateUser, changeSubscription } from "../contollers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", registerUser);

router.get("/", authenticateToken, getUsers)
router.get("/info", authenticateToken, getUsersById)
router.delete("/", authenticateToken, deleteUser)
router.delete("/restore", authenticateToken, restoreUser)
router.put("/", authenticateToken, updateUser)
router.put("/sub/:subId", authenticateToken, changeSubscription)

export default router;