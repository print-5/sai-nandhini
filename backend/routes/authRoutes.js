import express from "express";
import {
    authUser,
    registerUser,
    getUserProfile,
    setPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.route("/profile").get(protect, getUserProfile);
router.post("/set-password", protect, setPassword);

export default router;
