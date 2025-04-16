import express from "express";
import { createSubscription, deleteSubscription, updateSubscription, getSubscriptions } from "../contollers/subscriptionsController";
import { checkSub } from "../middlewares/checkSub";

const router = express.Router();

router.get("/", getSubscriptions)
router.post("/", createSubscription)
router.put("/:id", checkSub(1), updateSubscription)
router.delete("/", checkSub(1), deleteSubscription)

export default router;