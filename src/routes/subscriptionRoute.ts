import express from "express";
import { createSubscription, deleteSubscription, updateSubscription, getSubscriptions } from "../contollers/subscriptionsController";

const router = express.Router();

router.get("/", getSubscriptions)
router.post("/", createSubscription)
router.put("/:id", updateSubscription)
router.delete("/", deleteSubscription)

export default router;