import express from "express";

import {
  createHealthRecord,
  getHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
} from "../controllers/healthRecordController.js";

const router = express.Router();

router.post("/", createHealthRecord);
router.get("/", getHealthRecords);
router.put("/:id", updateHealthRecord);
router.delete("/:id", deleteHealthRecord);

export default router;