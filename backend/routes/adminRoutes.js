import express from "express";
import { getStats, getAnalytics } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, admin, getStats);
router.get("/analytics", protect, admin, getAnalytics);

export default router;
