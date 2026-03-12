import express from "express";
import { getAdminEnquiries, updateAdminEnquiry } from "../controllers/adminEnquiriesController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, admin, getAdminEnquiries)
    .patch(protect, admin, updateAdminEnquiry);

export default router;
