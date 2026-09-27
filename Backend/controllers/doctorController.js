import mongoose from "mongoose";
import Consultation from "../models/Consultation.js";
import ConsultationMessage from "../models/ConsultationMessage.js";
import HealthRecord from "../models/HealthRecord.js";
import Pet from "../models/Pet.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { notifyUser } from "../services/notifications.js";

const populatedConsultation = (query) =>
  query
    .populate("petId", "name species breed age gender profilePhoto")
    .populate("userId", "name email")
    .populate(
      "veterinarianId",
      "name email doctorProfile.profilePhoto doctorProfile.qualification doctorProfile.specialization",
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
      IN_PROGRESS: ["COMPLETED"],
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
      { $set: { status, ...(status === "COMPLETED" ? { completedAt: new Date(), slotReserved: false } : {}) } },
      { new: true, runValidators: true },
    );
    if (!updatedConsultation) return res.status(409).json({ success: false, message: "The consultation changed. Refresh and try again." });
    if (status === "COMPLETED") {
      await Task.updateOne({ consultationId: consultation._id }, { $set: { completed: true } });
      const pet = await Pet.findById(consultation.petId)
        .select("name userId")
        .lean();
      const notes = [
        consultation.clinicalObservations,
        consultation.doctorAdvice,
        consultation.recommendedCare,
        consultation.followUpInstructions,
        consultation.medicationInformation,
        consultation.doctorNotes,
      ]
        .filter(Boolean)
        .join("\n");
      await HealthRecord.findOneAndUpdate(
        { consultationId: consultation._id },
        { $set: { petId: consultation.petId, title: `Veterinary consultation: ${consultation.primaryConcern}`, date: new Date().toISOString().slice(0, 10), type: "Checkup", notes: [consultation.aiSummary, notes].filter(Boolean).join("\n\n") || "Consultation completed." } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      await notifyUser(
        req.app,
        consultation.userId,
        consultation._id,
        "consultation_completed",
        `${pet?.name || "Your pet"}'s consultation has been completed. Veterinarian notes are available.`,
      );
    } else {
      const labels = { ACCEPTED: "accepted", IN_PROGRESS: "started" };
      await notifyUser(
        req.app,
        consultation.userId,
        consultation._id,
        `consultation_${status.toLowerCase()}`,
        `Your veterinarian ${labels[status]} the consultation.`,
      );
    }
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
  if (!mongoose.isValidObjectId(req.params.id)) {
    res
      .status(400)
      .json({ success: false, message: "Invalid consultation ID." });
    return null;
  }
  const query =
    req.user.role === "doctor"
      ? { _id: req.params.id, veterinarianId: req.user.id }
      : { _id: req.params.id, userId: req.user.id };
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
    if (
      !["ASSIGNED", "PENDING", "ACCEPTED", "IN_PROGRESS"].includes(
        consultation.status,
      )
    )
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
    if (recipientId)
      await notifyUser(
        req.app,
        recipientId,
        consultation._id,
        req.user.role === "doctor" ? "doctor_message" : "owner_message",
        req.user.role === "doctor"
          ? "You have a new veterinarian message."
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
