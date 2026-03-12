import express from "express";
import { getAdminReviews, updateAdminReview, deleteAdminReview } from "../controllers/adminReviewsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, admin, getAdminReviews)
    .put(protect, admin, updateAdminReview)
    .delete(protect, admin, deleteAdminReview);

export default router;
