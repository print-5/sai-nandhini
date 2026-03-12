import express from "express";
import { getHeroSlides, createHeroSlide } from "../controllers/heroSlideController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getHeroSlides).post(protect, admin, createHeroSlide);

export default router;
