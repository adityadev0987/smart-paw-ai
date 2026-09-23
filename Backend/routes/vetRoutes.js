import express from "express";
import {
	getNearbyVets,
	searchVets,
} from "../controllers/vetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/nearby", protect, getNearbyVets);
router.get("/search", protect, searchVets);

export default router;