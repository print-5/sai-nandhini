import express from "express";
import { getSubcategories, createSubcategory, deleteSubcategory } from "../controllers/adminSubcategoriesController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getSubcategories)
    .post(protect, admin, createSubcategory)
    .delete(protect, admin, deleteSubcategory);

export default router;
