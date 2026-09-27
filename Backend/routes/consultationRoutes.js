import express from "express";
import { createConsultationAssessment, getConsultations, getConsultation, requestConsultation, cancelConsultation, rescheduleConsultation } from "../controllers/consultationController.js";
import { getMessages, sendMessage } from "../controllers/doctorController.js";
import { requireRole } from "../middleware/authMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/", requireRole("owner"), createConsultationAssessment);
router.get("/", requireRole("owner"), getConsultations);
router.get("/:consultationId", getConsultation);
router.get("/:consultationId/messages", getMessages);
router.post("/:consultationId/messages", sendMessage);
router.patch("/:consultationId", requireRole("owner"), requestConsultation);
router.patch("/:consultationId/status", requireRole("owner"), cancelConsultation);
router.patch("/:consultationId/reschedule", requireRole("owner"), rescheduleConsultation);

export default router;
