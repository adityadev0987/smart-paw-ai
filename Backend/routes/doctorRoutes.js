import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getDoctorDashboard, updateConsultationStatus, updateDoctorPresence, updateVeterinarianNotes, submitConsultationReport } from "../controllers/doctorController.js";

const router = express.Router();
router.use(protect, requireRole("doctor"));
router.get("/consultations", getDoctorDashboard);
router.patch("/consultations/:id/status", updateConsultationStatus);
router.patch("/consultations/:id/notes", updateVeterinarianNotes);
router.post("/consultations/:id/report", submitConsultationReport);
router.patch("/presence", updateDoctorPresence);
export default router;
