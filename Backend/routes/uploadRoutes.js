import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import uploadCommunityImage from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ==========================================
// UPLOAD COMMUNITY IMAGE
// ==========================================

router.post(
  "/community-image",
  protect,
  (req, res, next) => {
    uploadCommunityImage.single("image")(req, res, (error) => {
      if (error) {
        const isFileLimit = error.code === "LIMIT_FILE_SIZE";
        return res.status(400).json({
          success: false,
          message: isFileLimit
            ? "Each photo must be 5 MB or smaller."
            : error.message || "Unable to upload this photo.",
        });
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required.",
        });
      }

      const imageUrl = `/uploads/community/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
      });
    } catch (error) {
      console.error(
        "Community image upload error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Failed to upload image.",
      });
    }
  },
);

export default router;
