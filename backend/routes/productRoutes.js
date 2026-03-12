import express from "express";
import {
    getProducts,
    createProduct,
    getProductById,
    deleteProduct,
    getProductReviews,
    submitProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getProducts)
    .post(protect, admin, createProduct);

// Single product
router.route("/:id")
    .get(getProductById)
    .delete(protect, admin, deleteProduct);

// Product reviews
router.get("/:id/reviews", getProductReviews);       // GET /api/products/:id/reviews
router.post("/reviews", protect, submitProductReview); // POST /api/products/reviews

export default router;
