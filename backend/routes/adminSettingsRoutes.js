import express from "express";
import { getSettings, updateSettings } from "../controllers/adminSettingsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getSettings).post(protect, admin, updateSettings).put(protect, admin, updateSettings);

export default router;
