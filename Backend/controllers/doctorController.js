import mongoose from "mongoose";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import Consultation from "../models/Consultation.js";
import ConsultationMessage from "../models/ConsultationMessage.js";
import HealthRecord from "../models/HealthRecord.js";
import Pet from "../models/Pet.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { notifyUser } from "../services/notifications.js";
import { createConsultationReportPdf } from "../services/consultationReportPdf.js";

const populatedConsultation = (query) =>
  query
    .populate("petId", "name species breed age gender profilePhoto")
    .populate("userId", "name email")
    .populate(
      "veterinarianId",
      "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.qualification doctorProfile.registrationNumber doctorProfile.specialization",
    )
    .lean();

export async function getDoctorDashboard(req, res) {
  const consultations = await populatedConsultation(
    Consultation.find({ veterinarianId: req.user.id }).sort({
      requestedDate: 1,
      requestedTime: 1,
    }),
  );
  const today = new Date().toISOString().slice(0, 10);
  return res.json({
    success: true,
    consultations,
    stats: {
      pending: consultations.filter(
        (item) => item.status === "ASSIGNED" || item.status === "PENDING",
      ).length,
      today: consultations.filter(
        (item) =>
          item.requestedDate &&
          new Date(item.requestedDate).toISOString().slice(0, 10) === today,
      ).length,
      upcoming: consultations.filter((item) =>
        ["ASSIGNED", "ACCEPTED"].includes(item.status),
      ).length,
      active: consultations.filter((item) => item.status === "IN_PROGRESS")
        .length,
      completed: consultations.filter((item) => item.status === "COMPLETED")
        .length,
    },
  });
}

export async function updateConsultationStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    const { status } = req.body;
    const transitions = {
      ASSIGNED: ["ACCEPTED"],
      PENDING: ["ACCEPTED"],
      ACCEPTED: ["IN_PROGRESS"],
    };
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      veterinarianId: req.user.id,
    });
    if (!consultation)
      return res
        .status(404)
        .json({ success: false, message: "Assigned consultation not found." });
    if (!transitions[consultation.status]?.includes(status))
      return res
        .status(409)
        .json({
          success: false,
          message: "This consultation status transition is not available.",
        });
    const updatedConsultation = await Consultation.findOneAndUpdate(
      { _id: consultation._id, veterinarianId: req.user.id, status: consultation.status },
      { $set: { status, ...(status === "IN_PROGRESS" ? { startedAt: new Date() } : {}) } },
      { new: true, runValidators: true },
    );
    if (!updatedConsultation) return res.status(409).json({ success: false, message: "The consultation changed. Refresh and try again." });
    const labels = { ACCEPTED: "accepted", IN_PROGRESS: "started" };
    await notifyUser(
      req.app,
      consultation.userId,
      consultation._id,
      `consultation_${status.toLowerCase()}`,
      `Your veterinarian ${labels[status]} the consultation.`,
    );
    const populated = await populatedConsultation(
      Consultation.findById(updatedConsultation._id),
    );
    req.app
      .get("io")
      ?.to(`consultation:${consultation._id}`)
      .emit("consultation:updated", populated);
    return res.json({ success: true, consultation: populated });
  } catch (error) {
    console.error("Doctor status update error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Unable to update consultation status.",
      });
  }
}

export async function updateVeterinarianNotes(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    const fields = [
      "clinicalObservations",
      "doctorAdvice",
      "recommendedCare",
      "followUpInstructions",
      "medicationInformation",
      "doctorNotes",
    ];
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      veterinarianId: req.user.id,
    });
    if (!consultation)
      return res
        .status(404)
        .json({ success: false, message: "Assigned consultation not found." });
    for (const field of fields)
      if (req.body[field] !== undefined)
        consultation[field] = String(req.body[field]).trim().slice(0, 5000);
    if (req.body.doctorAdvice !== undefined)
      consultation.recommendations = consultation.doctorAdvice;
    await consultation.save();
    await notifyUser(
      req.app,
      consultation.userId,
      consultation._id,
      "doctor_advice",
      "Your veterinarian updated consultation notes and advice.",
    );
    const populated = await populatedConsultation(
      Consultation.findById(consultation._id),
    );
    req.app
      .get("io")
      ?.to(`consultation:${consultation._id}`)
      .emit("consultation:updated", populated);
    return res.json({ success: true, consultation: populated });
  } catch (error) {
    console.error("Veterinarian notes error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to save veterinarian notes." });
  }
}

async function authorizedConsultation(req, res) {
  const consultationId = req.params.id || req.params.consultationId;
  if (!mongoose.isValidObjectId(consultationId)) {
    res
      .status(400)
      .json({ success: false, message: "Invalid consultation ID." });
    return null;
  }
  const query =
    req.user.role === "doctor"
      ? { _id: consultationId, veterinarianId: req.user.id }
      : { _id: consultationId, userId: req.user.id };
  const consultation = await Consultation.findOne(query);
  if (!consultation)
    res
      .status(404)
      .json({ success: false, message: "Consultation not found." });
  return consultation;
}

export async function getMessages(req, res) {
  try {
    const consultation = await authorizedConsultation(req, res);
    if (!consultation) return;
    const messages = await ConsultationMessage.find({
      consultationId: consultation._id,
    })
      .populate("senderId", "name role doctorProfile.profilePhoto")
      .sort({ createdAt: 1 })
      .lean();
    return res.json({ success: true, messages });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Unable to load consultation messages.",
      });
  }
}

export async function sendMessage(req, res) {
  try {
    const consultation = await authorizedConsultation(req, res);
    if (!consultation) return;
    if (consultation.status !== "IN_PROGRESS")
      return res
        .status(409)
        .json({ success: false, message: "This consultation chat is closed." });
    const messageText = String(req.body.message || "").trim();
    if (!messageText || messageText.length > 4000)
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a message up to 4,000 characters.",
        });
    const isFirstDoctorMessage = req.user.role === "doctor"
      ? (await ConsultationMessage.countDocuments({ consultationId: consultation._id, senderRole: "doctor" })) === 0
      : false;
    const message = await ConsultationMessage.create({
      consultationId: consultation._id,
      senderId: req.user.id,
      senderRole: req.user.role,
      message: messageText,
    });
    const populated = await ConsultationMessage.findById(message._id)
      .populate("senderId", "name role doctorProfile.profilePhoto")
      .lean();
    req.app
      .get("io")
      ?.to(`consultation:${consultation._id}`)
      .emit("chat:message", populated);
    const recipientId =
      req.user.role === "doctor"
        ? consultation.userId
        : consultation.veterinarianId;
    if (recipientId && (req.user.role !== "doctor" || isFirstDoctorMessage))
      await notifyUser(
        req.app,
        recipientId,
        consultation._id,
        req.user.role === "doctor" ? "doctor_message" : "owner_message",
        req.user.role === "doctor"
          ? "Your doctor has started the consultation and sent you a message."
          : "You have a new message from a pet owner.",
      );
    return res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error("Consultation message error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to send message." });
  }
}

export async function submitConsultationReport(req, res) {
  let generatedPdfPath = "";
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    const consultation = await Consultation.findOne({ _id: req.params.id, veterinarianId: req.user.id });
    if (!consultation) return res.status(404).json({ success: false, message: "Assigned consultation not found." });
    // Make retries safe when the database commit succeeded but the response
    // was interrupted before the browser received it.
    if (consultation.report?.submittedAt) {
      const existing = await populatedConsultation(Consultation.findById(consultation._id));
      return res.json({ success: true, consultation: existing, message: "The final report was already saved." });
    }
    if (!["IN_PROGRESS", "COMPLETED"].includes(consultation.status)) return res.status(409).json({ success: false, message: "Start the consultation before submitting its final report." });
    const fields = ["summary", "symptomsDiscussed", "observations", "diagnosis", "treatment", "advice", "medicines", "dosageInstructions", "frequency", "medicationDuration", "homeCare", "dietHydration", "followUp", "emergencyInstructions", "additionalNotes", "finalRemarks"];
    const report = {};
    for (const field of fields) {
      const value = String(req.body[field] || "").trim();
      const maxLength = ["followUp", "emergencyInstructions", "dietHydration"].includes(field) ? 3000 : 5000;
      if (value.length > maxLength) return res.status(400).json({ success: false, message: `Report fields must be ${maxLength} characters or fewer.` });
      report[field] = value;
    }
    if (!report.summary || !report.symptomsDiscussed || !report.observations || !report.diagnosis || !report.treatment) return res.status(400).json({ success: false, message: "Complete the summary, symptoms, clinical observations, diagnosis, and treatment before saving the final report." });
    if (report.medicines && (!report.dosageInstructions || !report.frequency || !report.medicationDuration)) return res.status(400).json({ success: false, message: "Add medication dosage, frequency, and duration for the prescribed medicine." });
    const [doctor, owner, pet] = await Promise.all([
      User.findById(req.user.id).select("name doctorProfile.clinicName doctorProfile.registrationNumber").lean(),
      User.findById(consultation.userId).select("name").lean(),
      Pet.findById(consultation.petId).select("name species breed age gender").lean(),
    ]);
    if (!doctor || !owner || !pet) return res.status(404).json({ success: false, message: "The doctor, owner, or pet profile could not be found." });
    const submittedAt = new Date();
    Object.assign(report, {
      clinicName: doctor.doctorProfile?.clinicName || "Smart Paw AI Veterinary Center",
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorRegistrationNumber: doctor.doctorProfile?.registrationNumber || "",
      ownerId: owner._id,
      ownerName: owner.name,
      petId: pet._id,
      petName: pet.name,
      species: pet.species || "",
      breed: pet.breed || "",
      age: pet.age ?? "",
      gender: pet.gender || "",
      consultationDate: consultation.requestedDate || consultation.createdAt,
      consultationDateLabel: new Date(consultation.requestedDate || consultation.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }),
      consultationTime: consultation.requestedTime || "",
      consultationId: String(consultation._id),
      chiefComplaint: consultation.primaryConcern,
      symptomsDiscussed: report.symptomsDiscussed || consultation.symptoms,
      submittedAt,
      pdfGeneratedAt: null,
      reportGeneratedLabel: submittedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    });
    const relativePdfPath = path.posix.join("reports", `${consultation._id}-${randomUUID()}.pdf`);

    // Final report and completion are committed together on the existing consultation.
    const updatedConsultation = await Consultation.findOneAndUpdate(
      { _id: consultation._id, veterinarianId: req.user.id, status: { $in: ["IN_PROGRESS", "COMPLETED"] }, "report.submittedAt": null },
      { $set: {
        report,
        status: "COMPLETED",
        completedAt: submittedAt,
        slotReserved: false,
        clinicalObservations: report.observations,
        doctorAdvice: report.advice,
        recommendations: report.advice || report.homeCare,
        medicationInformation: [report.medicines, report.dosageInstructions, report.frequency, report.medicationDuration].filter(Boolean).join("\n").slice(0, 3000),
        followUpInstructions: report.followUp,
        doctorNotes: [report.diagnosis, report.additionalNotes, report.finalRemarks].filter(Boolean).join("\n\n").slice(0, 5000),
      } },
      { new: true, runValidators: true },
    );
    if (!updatedConsultation) {
      return res.status(409).json({ success: false, message: "A report has already been submitted or this consultation is no longer active." });
    }

    // Persist the medical report even if PDF rendering or filesystem storage
    // is temporarily unavailable. The owner and doctor can still read the
    // structured report while the PDF issue is visible in the server log.
    try {
      generatedPdfPath = await createConsultationReportPdf(report, relativePdfPath);
      const pdfSaved = await Consultation.updateOne(
        { _id: consultation._id, veterinarianId: req.user.id, "report.submittedAt": submittedAt },
        { $set: { "report.pdfStoragePath": relativePdfPath, "report.pdfGeneratedAt": new Date() } },
      );
      if (!pdfSaved.matchedCount) {
        await rm(generatedPdfPath, { force: true });
        generatedPdfPath = "";
      }
    } catch (pdfError) {
      if (generatedPdfPath) await rm(generatedPdfPath, { force: true }).catch(() => {});
      generatedPdfPath = "";
      console.error("Consultation report PDF generation failed:", pdfError);
    }
    const notes = fields.map((field) => `${field}: ${report[field]}`).filter((line) => !line.endsWith(": ")).join("\n");
    const sideEffects = await Promise.allSettled([
      Task.updateOne({ consultationId: consultation._id }, { $set: { completed: true, eventStatus: "completed" } }),
      HealthRecord.findOneAndUpdate(
        { consultationId: consultation._id },
        { $set: { petId: updatedConsultation.petId, title: `Veterinary consultation: ${consultation.primaryConcern}`, date: submittedAt.toISOString().slice(0, 10), type: "Checkup", notes: [report.summary, notes].filter(Boolean).join("\n\n") } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
      notifyUser(req.app, consultation.userId, consultation._id, "consultation_report", "Your veterinarian has submitted the final consultation report. Open consultation history to review it."),
    ]);
    sideEffects.filter((result) => result.status === "rejected").forEach((result) => console.error("Consultation report follow-up failed:", result.reason));
    const populated = await populatedConsultation(Consultation.findById(updatedConsultation._id));
    req.app.get("io")?.to(`consultation:${consultation._id}`).emit("consultation:updated", populated);
    return res.json({ success: true, consultation: populated });
  } catch (error) {
    if (generatedPdfPath) await rm(generatedPdfPath, { force: true }).catch(() => {});
    console.error("Consultation report error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit the consultation report." });
  }
}

export async function getConsultationReport(req, res) {
  try {
    const consultation = await authorizedConsultation(req, res);
    if (!consultation) return;
    if (!consultation.report?.submittedAt) return res.status(404).json({ success: false, message: "The final report is not available yet." });
    return res.json({ success: true, report: consultation.report, consultationId: consultation._id });
  } catch (error) {
    console.error("Consultation report read error:", error);
    return res.status(500).json({ success: false, message: "Unable to load the consultation report." });
  }
}

export async function getConsultationReportPdf(req, res) {
  try {
    const consultation = await authorizedConsultation(req, res);
    if (!consultation) return;
    const relativePath = consultation.report?.pdfStoragePath;
    if (!consultation.report?.submittedAt || !relativePath) return res.status(404).json({ success: false, message: "The report PDF is not available yet." });
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const pdfPath = path.resolve(uploadsRoot, relativePath);
    if (!pdfPath.startsWith(`${uploadsRoot}${path.sep}`)) return res.status(400).json({ success: false, message: "Invalid report file path." });
    return res.sendFile(pdfPath, (error) => {
      if (error && !res.headersSent) res.status(error.statusCode || 404).json({ success: false, message: "The report PDF could not be found." });
    });
  } catch (error) {
    console.error("Consultation report PDF error:", error);
    return res.status(500).json({ success: false, message: "Unable to open the report PDF." });
  }
}

export async function updateDoctorPresence(req, res) {
  const isOnline = Boolean(req.body.isOnline);
  await User.updateOne(
    { _id: req.user.id, role: "doctor" },
    {
      $set: {
        "doctorProfile.isOnline": isOnline,
        "doctorProfile.lastSeenAt": isOnline ? null : new Date(),
      },
    },
  );
  return res.json({ success: true, isOnline });
}
