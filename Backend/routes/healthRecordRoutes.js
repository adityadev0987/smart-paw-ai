import express from "express";

import {
  createHealthRecord,
  getHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
} from "../controllers/healthRecordController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createHealthRecord);

router.get("/", protect, getHealthRecords);

router.put("/:id", protect, updateHealthRecord);

router.delete("/:id", protect, deleteHealthRecord);

export default router;