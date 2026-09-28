import mongoose from "mongoose";
import Consultation from "../models/Consultation.js";
import Pet from "../models/Pet.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { notifyUser } from "../services/notifications.js";
import { runHealthAgent } from "../agent/agent.js";

const disclaimer = "This AI assessment is for preliminary guidance only and does not replace professional veterinary advice.";
const durationOptions = ["Today", "1-2 days", "3-7 days", "More than a week", "More than a month"];
const concernAreas = {
  "Skin problem": "A skin or coat concern may be relevant and needs veterinary evaluation.",
  "Digestive problem": "A digestive concern may be relevant and needs veterinary evaluation.",
  Injury: "An injury-related concern may need veterinary evaluation.",
  Fever: "A temperature or infection-related concern may need veterinary evaluation.",
  "Appetite problem": "Changes in appetite may be associated with several health concerns.",
  "Breathing problem": "A breathing-related concern needs careful veterinary evaluation.",
  "Behaviour change": "A behavior change may be associated with health or environmental factors.",
  Other: "The reported symptoms need assessment by a veterinary professional.",
};

function riskFromAssessment(result, input) {
  if (result?.urgent || result?.triage?.level === "RED") return "EMERGENCY";
  if (input.severity === "Severe" || input.activityLevel === "Very weak" || input.appetite === "Not eating") return "HIGH";
  if (result?.triage?.level === "YELLOW" || input.severity === "Moderate" || input.appetite === "Reduced" || input.waterIntake !== "Normal" || input.activityLevel === "Less active") return "MODERATE";
  return "LOW";
}

export async function createConsultationAssessment(req, res) {
  try {
    const userId = req.user?.id;
    const { petId, primaryConcern, symptoms, duration, severity, appetite, waterIntake, activityLevel, additionalNotes = "", media = [] } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    if (!mongoose.isValidObjectId(petId)) return res.status(400).json({ success: false, message: "Select a valid pet." });
    if (!primaryConcern || !String(symptoms || "").trim() || !duration || !severity || !appetite || !waterIntake || !activityLevel) return res.status(400).json({ success: false, message: "Complete the required health concern fields." });
    if (!durationOptions.includes(duration) || !["Mild", "Moderate", "Severe"].includes(severity) || !["Normal", "Reduced", "Not eating"].includes(appetite) || !["Normal", "Increased", "Reduced"].includes(waterIntake) || !["Normal", "Less active", "Very weak"].includes(activityLevel)) return res.status(400).json({ success: false, message: "One or more health concern selections are invalid." });
    if (!Array.isArray(media) || media.length > 5 || media.some((url) => typeof url !== "string" || !url.startsWith("/uploads/community/") || url.length > 2048)) return res.status(400).json({ success: false, message: "Use up to 5 valid uploaded health photos." });
    const pet = await Pet.findOne({ _id: petId, userId }).select("name species breed age gender profilePhoto medical preventiveCare behavior").lean();
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found." });

    const completeSymptoms = [
      `Primary concern: ${primaryConcern}.`, `Symptoms: ${String(symptoms).trim()}.`, `Duration: ${duration}.`, `Severity: ${severity}.`,
      `Appetite: ${appetite}.`, `Water intake: ${waterIntake}.`, `Activity: ${activityLevel}.`, additionalNotes ? `Additional notes: ${String(additionalNotes).trim()}.` : "",
    ].filter(Boolean).join(" ");
    const assessment = await runHealthAgent({ petId, symptoms: completeSymptoms, conversation: [] });
    const riskLevel = riskFromAssessment(assessment, { severity, activityLevel, appetite, waterIntake });
    const isEmergency = riskLevel === "EMERGENCY";
    const possibleConcerns = isEmergency
      ? ["A potentially urgent warning sign was detected. Prompt veterinary evaluation is recommended."]
      : [concernAreas[primaryConcern] || concernAreas.Other];
    const recommendations = Array.isArray(assessment.nextSteps) ? assessment.nextSteps.slice(0, 5) : [];
    const aiSummary = [assessment.assessment, assessment.question ? `The AI also asks: ${assessment.question}` : ""].filter(Boolean).join(" ") || "The reported symptoms need veterinary evaluation.";
    const healthSnapshot = {
      petName: pet.name, primaryConcern, duration, severity, symptoms: String(symptoms).trim(),
      aiRiskLevel: riskLevel,
      recommendedAction: riskLevel === "EMERGENCY" ? "Seek urgent veterinary care now" : riskLevel === "HIGH" ? "Contact a veterinarian promptly" : "Veterinary consultation recommended",
    };
    const consultation = await Consultation.create({
      userId, petId, primaryConcern, symptoms: String(symptoms).trim(), duration, severity, appetite, waterIntake, activityLevel,
      additionalNotes: String(additionalNotes).trim(), media,
      aiAssessment: { summary: aiSummary, possibleConcerns, recommendedActions: recommendations, disclaimer },
      aiRiskLevel: riskLevel, aiSummary, healthSnapshot, status: "AI_ASSESSMENT",
    });
    const populated = await Consultation.findById(consultation._id).populate("petId", "name species breed age gender profilePhoto").populate("veterinarianId", "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.registrationNumber doctorProfile.qualification doctorProfile.specialization doctorProfile.isOnline").lean();
    return res.status(201).json({ success: true, consultation: populated });
  } catch (error) {
    console.error("Consultation assessment error:", error);
    return res.status(502).json({ success: false, message: "Unable to prepare the preliminary assessment. Please try again." });
  }
}

export async function getConsultations(req, res) {
  try {
    const consultations = await Consultation.find({ userId: req.user.id }).populate("petId", "name species breed age gender profilePhoto").populate("veterinarianId", "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.registrationNumber doctorProfile.qualification doctorProfile.specialization doctorProfile.isOnline").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, consultations });
  } catch (error) {
    console.error("Get consultations error:", error);
    return res.status(500).json({ success: false, message: "Unable to load consultation history." });
  }
}

export async function getConsultation(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.consultationId)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    const access = req.user.role === "doctor" ? { veterinarianId: req.user.id } : { userId: req.user.id };
    const consultation = await Consultation.findOne({ _id: req.params.consultationId, ...access }).populate("petId", "name species breed age gender profilePhoto").populate("userId", "name email").populate("veterinarianId", "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.registrationNumber doctorProfile.qualification doctorProfile.specialization doctorProfile.isOnline").lean();
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found." });
    return res.json({ success: true, consultation });
  } catch (error) {
    console.error("Get consultation error:", error);
    return res.status(500).json({ success: false, message: "Unable to load consultation details." });
  }
}

export async function requestConsultation(req, res) {
  try {
    const { consultationType, requestedDate, requestedTime, ownerMessage = "" } = req.body;
    if (!mongoose.isValidObjectId(req.params.consultationId)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    if (!["Video Consultation", "Chat Consultation"].includes(consultationType) || !requestedDate || !/^([01]\d|2[0-3]):[0-5]\d$/.test(requestedTime || "")) return res.status(400).json({ success: false, message: "Choose a consultation type, date, and valid preferred time." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(requestedDate))) return res.status(400).json({ success: false, message: "Choose a valid consultation date." });
    const date = new Date(requestedDate);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== requestedDate || date < new Date(new Date().setHours(0, 0, 0, 0))) return res.status(400).json({ success: false, message: "Choose a current or future consultation date." });
    const consultation = await Consultation.findOne({ _id: req.params.consultationId, userId: req.user.id });
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found." });
    if (consultation.status !== "AI_ASSESSMENT") return res.status(409).json({ success: false, message: "This consultation has already been requested." });
    const pet = await Pet.findOne({ _id: consultation.petId, userId: req.user.id }).select("name").lean();
    if (!pet) return res.status(404).json({ success: false, message: "The pet for this consultation could not be found." });
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(`${requestedDate}T00:00:00.000Z`).getUTCDay()];
    const specialtyTerms = { "Skin problem": ["skin", "dermatology"], "Digestive problem": ["digestive", "internal medicine", "gastro"], Injury: ["surgery", "emergency", "trauma"], Fever: ["general", "internal medicine"], "Appetite problem": ["general", "internal medicine"], "Breathing problem": ["respiratory", "emergency", "internal medicine"], "Behaviour change": ["behavior", "general"] };
    const requiredTerms = specialtyTerms[consultation.primaryConcern] || [];
    const doctors = await User.find({ role: "doctor", "doctorProfile.isApproved": true, "doctorProfile.isAcceptingConsultations": true, "doctorProfile.availableDays": dayName }).select("name doctorProfile").lean();
    const availableDoctors = doctors.filter((doctor) => {
      const canTakeTime = doctor.doctorProfile?.timeSlots?.some((slot) => slot.start <= requestedTime && requestedTime < slot.end);
      const specialties = (doctor.doctorProfile?.specialization || []).map((item) => item.toLowerCase());
      const applicable = !requiredTerms.length || !specialties.length || specialties.some((specialty) => specialty.includes("general") || requiredTerms.some((term) => specialty.includes(term)));
      return canTakeTime && applicable;
    });
    const occupiedCounts = await Promise.all(availableDoctors.map((doctor) => Consultation.countDocuments({ veterinarianId: doctor._id, requestedDate: date, slotReserved: true })));
    const candidates = availableDoctors.map((doctor, index) => ({ doctor, load: occupiedCounts[index] })).sort((a, b) => a.load - b.load);
    let bookedConsultation = null;
    let assignedDoctor = null;
    for (const { doctor } of candidates) {
      try {
        bookedConsultation = await Consultation.findOneAndUpdate(
          { _id: consultation._id, userId: req.user.id, status: "AI_ASSESSMENT" },
          { $set: { consultationType, requestedDate: date, requestedTime, ownerMessage: String(ownerMessage).trim(), status: "ASSIGNED", veterinarianId: doctor._id, slotReserved: true } },
          { new: true, runValidators: true },
        );
        if (bookedConsultation) { assignedDoctor = doctor; break; }
        return res.status(409).json({ success: false, message: "This consultation has already been requested." });
      } catch (reservationError) {
        if (reservationError?.code !== 11000) throw reservationError;
      }
    }
    if (!bookedConsultation) return res.status(409).json({ success: false, message: "No veterinarian is currently available for this time slot. Please select another time." });

    try {
      await Task.findOneAndUpdate({ consultationId: consultation._id }, { $set: {
        petId: consultation.petId, petName: pet.name, title: `Veterinary Consultation - ${pet.name}`, date: String(requestedDate), time: requestedTime,
        type: "Consultation", consultationType, primaryConcern: consultation.primaryConcern, doctorName: assignedDoctor.name, eventStatus: "scheduled", completed: false,
      } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    } catch (plannerError) {
      await Consultation.updateOne({ _id: consultation._id, userId: req.user.id, status: "ASSIGNED" }, { $set: { status: "AI_ASSESSMENT", consultationType: "", requestedDate: null, requestedTime: "", ownerMessage: "", veterinarianId: null, slotReserved: false } });
      throw plannerError;
    }
    await notifyUser(req.app, req.user.id, consultation._id, "doctor_assigned", `Dr. ${assignedDoctor.name} has been assigned to ${pet.name}'s consultation.`);
    await notifyUser(req.app, assignedDoctor._id, consultation._id, "consultation_assigned", `New consultation assigned: ${pet.name} on ${requestedDate} at ${requestedTime}.`);
    const populated = await Consultation.findById(consultation._id).populate("petId", "name species breed age gender profilePhoto").populate("veterinarianId", "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.registrationNumber doctorProfile.qualification doctorProfile.specialization doctorProfile.isOnline").lean();
    req.app.get("io")?.to(`consultation:${consultation._id}`).emit("consultation:updated", populated);
    return res.json({ success: true, consultation: populated, message: "Consultation request submitted successfully." });
  } catch (error) {
    console.error("Request consultation error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit consultation request." });
  }
}

export async function cancelConsultation(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.consultationId)) return res.status(400).json({ success: false, message: "Invalid consultation ID." });
    const consultation = await Consultation.findOneAndUpdate({ _id: req.params.consultationId, userId: req.user.id, status: { $in: ["ASSIGNED", "PENDING", "ACCEPTED"] } }, { $set: { status: "CANCELLED", slotReserved: false } }, { new: true });
    if (!consultation) return res.status(404).json({ success: false, message: "An active consultation could not be found." });
    await Task.updateOne({ consultationId: consultation._id }, { $set: { eventStatus: "cancelled", completed: true } });
    await notifyUser(req.app, consultation.veterinarianId, consultation._id, "consultation_cancelled", "A consultation assigned to you was cancelled by the pet owner.");
    req.app.get("io")?.to(`consultation:${consultation._id}`).emit("consultation:updated", consultation);
    return res.json({ success: true, consultation, message: "Consultation cancelled." });
  } catch (error) {
    console.error("Cancel consultation error:", error);
    return res.status(500).json({ success: false, message: "Unable to cancel consultation." });
  }
}

export async function rescheduleConsultation(req, res) {
  try {
    const { consultationType, requestedDate, requestedTime, ownerMessage = "" } = req.body;
    if (!mongoose.isValidObjectId(req.params.consultationId) || !["Video Consultation", "Chat Consultation"].includes(consultationType) || !/^\d{4}-\d{2}-\d{2}$/.test(String(requestedDate || "")) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(requestedTime || "")) return res.status(400).json({ success: false, message: "Choose a consultation type, date, and valid preferred time." });
    const date = new Date(requestedDate);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== requestedDate || date < new Date(new Date().setHours(0, 0, 0, 0))) return res.status(400).json({ success: false, message: "Choose a current or future consultation date." });
    const consultation = await Consultation.findOne({ _id: req.params.consultationId, userId: req.user.id, status: { $in: ["ASSIGNED", "PENDING", "ACCEPTED"] } });
    if (!consultation) return res.status(404).json({ success: false, message: "An active consultation could not be found." });
    const pet = await Pet.findOne({ _id: consultation.petId, userId: req.user.id }).select("name").lean();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(`${requestedDate}T00:00:00.000Z`).getUTCDay()];
    const specialtyTerms = { "Skin problem": ["skin", "dermatology"], "Digestive problem": ["digestive", "internal medicine", "gastro"], Injury: ["surgery", "emergency", "trauma"], Fever: ["general", "internal medicine"], "Appetite problem": ["general", "internal medicine"], "Breathing problem": ["respiratory", "emergency", "internal medicine"], "Behaviour change": ["behavior", "general"] };
    const requiredTerms = specialtyTerms[consultation.primaryConcern] || [];
    const doctors = await User.find({ role: "doctor", "doctorProfile.isApproved": true, "doctorProfile.isAcceptingConsultations": true, "doctorProfile.availableDays": weekday }).select("name doctorProfile").lean();
    const candidates = doctors.filter((doctor) => doctor.doctorProfile?.timeSlots?.some((slot) => slot.start <= requestedTime && requestedTime < slot.end) && (!requiredTerms.length || !doctor.doctorProfile?.specialization?.length || doctor.doctorProfile.specialization.some((value) => requiredTerms.some((term) => value.toLowerCase().includes(term)) || value.toLowerCase().includes("general"))));
    let updated = null; let doctor = null;
    for (const candidate of candidates) {
      try {
        updated = await Consultation.findOneAndUpdate({ _id: consultation._id, userId: req.user.id, status: { $in: ["ASSIGNED", "PENDING", "ACCEPTED"] } }, { $set: { consultationType, requestedDate: date, requestedTime, ownerMessage: String(ownerMessage).trim(), veterinarianId: candidate._id, status: "ASSIGNED", slotReserved: true } }, { new: true, runValidators: true });
        if (updated) { doctor = candidate; break; }
      } catch (error) { if (error?.code !== 11000) throw error; }
    }
    if (!updated) return res.status(409).json({ success: false, message: "No veterinarian is currently available for this time slot. Please select another time." });
    try {
      await Task.findOneAndUpdate({ consultationId: consultation._id }, { $set: { petId: consultation.petId, petName: pet.name, title: `Veterinary Consultation - ${pet.name}`, date: String(requestedDate), time: requestedTime, type: "Consultation", consultationType, primaryConcern: consultation.primaryConcern, doctorName: doctor.name, eventStatus: "scheduled", completed: false } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    } catch (plannerError) {
      await Consultation.updateOne({ _id: consultation._id, userId: req.user.id, status: "ASSIGNED", requestedDate: date, requestedTime }, { $set: { status: consultation.status, requestedDate: consultation.requestedDate, requestedTime: consultation.requestedTime, consultationType: consultation.consultationType, ownerMessage: consultation.ownerMessage, veterinarianId: consultation.veterinarianId, slotReserved: true } });
      throw plannerError;
    }
    if (String(consultation.veterinarianId) !== String(doctor._id)) await notifyUser(req.app, consultation.veterinarianId, consultation._id, "consultation_rescheduled", `${pet.name}'s consultation was reassigned to another veterinarian.`);
    await notifyUser(req.app, req.user.id, consultation._id, "consultation_rescheduled", `${pet.name}'s consultation has been rescheduled with Dr. ${doctor.name}.`);
    await notifyUser(req.app, doctor._id, consultation._id, "consultation_rescheduled", `${pet.name}'s consultation was scheduled for ${requestedDate} at ${requestedTime}.`);
    const populated = await Consultation.findById(updated._id).populate("petId", "name species breed age gender profilePhoto").populate("veterinarianId", "name email doctorProfile.profilePhoto doctorProfile.clinicName doctorProfile.registrationNumber doctorProfile.qualification doctorProfile.specialization doctorProfile.isOnline").lean();
    req.app.get("io")?.to(`consultation:${consultation._id}`).emit("consultation:updated", populated);
    return res.json({ success: true, consultation: populated, message: "Consultation rescheduled successfully." });
  } catch (error) {
    console.error("Reschedule consultation error:", error);
    return res.status(500).json({ success: false, message: "Unable to reschedule consultation." });
  }
}
