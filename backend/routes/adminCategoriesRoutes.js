import express from "express";
import {
    getAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory
} from "../controllers/adminCategoriesController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getAdminCategories)
    .post(protect, admin, createAdminCategory)
    .put(protect, admin, updateAdminCategory)
    .delete(protect, admin, deleteAdminCategory);

export default router;
