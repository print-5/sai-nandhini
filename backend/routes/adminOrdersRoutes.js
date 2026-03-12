import express from "express";
import { getAdminOrders, updateAdminOrdersBulk, updateAdminOrder } from "../controllers/adminOrdersController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, admin, getAdminOrders)
    .put(protect, admin, updateAdminOrdersBulk);

router.put("/:id", protect, admin, updateAdminOrder);

export default router;
