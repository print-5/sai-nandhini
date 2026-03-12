import express from "express";
import { findPlace } from "../controllers/findPlaceController.js";

const router = express.Router();

router.get("/", findPlace);

export default router;
