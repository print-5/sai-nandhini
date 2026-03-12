import express from "express";
import { getActiveCoupons, validateCoupon } from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/active", getActiveCoupons);

// We define middleware logic inline to optionally extract the user instead of reject without it
const maybeProtect = (req, res, next) => {
    // try to run protect, but if it fails, just move on
    // this mimics the NextJS better-auth where it gets session if it exists but doesn't throw if not
    protect(req, res, (err) => {
        next();
    });
};

router.post("/validate", maybeProtect, validateCoupon);

export default router;
