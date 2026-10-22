import express from "express";
import { createConsultationAssessment, getConsultations, getConsultation, requestConsultation, cancelConsultation, rescheduleConsultation } from "../controllers/consultationController.js";
import { getMessages, sendMessage, getConsultationMessageMedia, getConsultationReport, getConsultationReportPdf } from "../controllers/doctorController.js";
import { requireRole } from "../middleware/authMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeConsultationChat, uploadConsultationMedia } from "../middleware/consultationMediaUpload.js";

const router = express.Router();
router.use(protect);
router.post("/", requireRole("owner"), createConsultationAssessment);
router.get("/", requireRole("owner"), getConsultations);
router.get("/:consultationId", getConsultation);
router.get("/:consultationId/report", getConsultationReport);
router.get("/:consultationId/report/pdf", getConsultationReportPdf);
router.get("/:consultationId/messages", getMessages);
router.post("/:consultationId/messages", authorizeConsultationChat, (req, res, next) => uploadConsultationMedia(req, res, (error) => {
  if (error) return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "Media files must be 20 MB or smaller." : error.message || "Unable to upload this media." });
  next();
}), sendMessage);
router.get("/:consultationId/messages/:messageId/media", getConsultationMessageMedia);
router.patch("/:consultationId", requireRole("owner"), requestConsultation);
router.patch("/:consultationId/status", requireRole("owner"), cancelConsultation);
router.patch("/:consultationId/reschedule", requireRole("owner"), rescheduleConsultation);

export default router;
