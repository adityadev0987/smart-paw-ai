import express from "express";

import { getHealthCheckMedia, healthCheck, uploadHealthCheckMedia } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/health-check", protect, healthCheck);
router.post("/health-check/media", protect, requireRole("owner"), (req, res, next) => multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 1 } }).single("media")(req, res, (error) => {
  if (error) return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "Media files must be 20 MB or smaller." : error.message || "Unable to upload this media." });
  next();
}), uploadHealthCheckMedia);
router.get("/health-check/media/:filename", protect, requireRole("owner"), getHealthCheckMedia);

export default router;
