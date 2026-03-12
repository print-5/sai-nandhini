import express from "express";
import { getCustomers } from "../controllers/adminCustomersController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getCustomers);

export default router;
