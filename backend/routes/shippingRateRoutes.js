import express from "express";
import { getShippingRates, createShippingRate, updateShippingRate } from "../controllers/shippingRateController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getShippingRates).post(protect, admin, createShippingRate)
// Handle both PUT / and PUT /:id since the frontend logic sends _id in body
router.put("/", protect, admin, updateShippingRate);
router.put("/:id", protect, admin, updateShippingRate);

export default router;
