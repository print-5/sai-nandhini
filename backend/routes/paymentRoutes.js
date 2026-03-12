import express from "express";
import { createPayment, verifyPayment, razorpayWebhook } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Optional auth middleware - allows both authenticated and guest users
const optionalAuth = async (req, res, next) => {
    // Try to authenticate, but don't fail if no token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const jwt = (await import("jsonwebtoken")).default;
            const User = (await import("../models/User.js")).default;
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            // Token invalid, but continue as guest
            console.log("Optional auth failed, continuing as guest");
        }
    } else if (req.cookies && req.cookies['better-auth.session_token']) {
        // BetterAuth session exists, allow through
        // TODO: Implement proper session verification
    }
    next();
};

// Using express.raw() to get raw string body for webhook signature validation
router.post("/razorpay", optionalAuth, createPayment);
router.post("/verify", verifyPayment);
router.post("/webhook", express.raw({ type: 'application/json' }), razorpayWebhook);

export default router;
