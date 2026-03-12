import express from "express";
import { getInventoryTransactions, createInventoryTransaction } from "../controllers/inventoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getInventoryTransactions).post(protect, admin, createInventoryTransaction);

export default router;
