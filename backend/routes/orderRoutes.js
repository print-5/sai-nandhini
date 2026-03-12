import express from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// A real ecommerce might allow guests to create orders, 
// so we may not always want `protect` on createOrder. 
// For now, we mimic Next.js logic.
router.route("/").post(createOrder).get(protect, getMyOrders);

export default router;
