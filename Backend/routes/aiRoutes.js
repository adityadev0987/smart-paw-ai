import express from "express";
import { healthCheck } from "../controllers/aiController.js";

const router = express.Router();

router.post("/health-check", healthCheck);

export default router;