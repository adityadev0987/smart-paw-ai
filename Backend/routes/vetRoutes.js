import express from "express";
import { getNearbyVets } from "../controllers/vetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/nearby", protect, getNearbyVets);

export default router;