import express from "express";

import {
  register,
  login,
  getMe,
  registerDoctor,
  updateDoctorProfile,
} from "../controllers/authController.js";

import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", register);
router.post("/doctors/register", registerDoctor);

// Login
router.post("/login", login);

// Get currently authenticated user
router.get("/me", protect, getMe);
router.patch("/doctors/profile", protect, requireRole("doctor"), updateDoctorProfile);

export default router;
