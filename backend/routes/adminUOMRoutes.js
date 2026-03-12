import express from "express";
import { getUOMs, createUOM } from "../controllers/adminUOMController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getUOMs).post(protect, admin, createUOM);

export default router;
