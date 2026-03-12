import express from "express";
import { getAdminPage, updateAdminPage, getOrdersReport, resetDemoData } from "../controllers/adminMiscController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/page")
    .get(protect, admin, getAdminPage)
    .post(protect, admin, updateAdminPage);

router.get("/reports/orders", protect, admin, getOrdersReport);
router.post("/reset-demo-data", protect, admin, resetDemoData);

export default router;
