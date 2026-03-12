import express from "express";
import { getAdminCoupons, createAdminCoupon } from "../controllers/adminCouponsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, admin, getAdminCoupons)
    .post(protect, admin, createAdminCoupon);

export default router;
