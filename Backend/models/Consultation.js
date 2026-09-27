import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },
    primaryConcern: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    symptoms: { type: String, required: true, trim: true, maxlength: 3000 },
    duration: {
      type: String,
      required: true,
      enum: [
        "Today",
        "1-2 days",
        "3-7 days",
        "More than a week",
        "More than a month",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["Mild", "Moderate", "Severe"],
    },
    appetite: {
      type: String,
      required: true,
      enum: ["Normal", "Reduced", "Not eating"],
    },
    waterIntake: {
      type: String,
      required: true,
      enum: ["Normal", "Increased", "Reduced"],
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ["Normal", "Less active", "Very weak"],
    },
    additionalNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    media: [{ type: String, trim: true, maxlength: 2048 }],
    aiAssessment: {
      summary: { type: String, default: "" },
      possibleConcerns: [{ type: String }],
      recommendedActions: [{ type: String }],
      disclaimer: {
        type: String,
        default:
          "This AI assessment is for preliminary guidance only and does not replace professional veterinary advice.",
      },
    },
    aiRiskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "EMERGENCY"],
      default: "LOW",
    },
    aiSummary: { type: String, default: "" },
    healthSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    consultationType: {
      type: String,
      enum: ["Video Consultation", "Chat Consultation", ""],
      default: "",
    },
    requestedDate: { type: Date, default: null },
    requestedTime: { type: String, trim: true, default: "" },
    ownerMessage: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["AI_ASSESSMENT", "PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "AI_ASSESSMENT",
      index: true,
    },
    veterinarianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    slotReserved: { type: Boolean, default: false },
    doctorNotes: { type: String, trim: true, maxlength: 5000, default: "" },
    recommendations: { type: String, trim: true, maxlength: 5000, default: "" },
    clinicalObservations: { type: String, trim: true, maxlength: 5000, default: "" },
    doctorAdvice: { type: String, trim: true, maxlength: 5000, default: "" },
    recommendedCare: { type: String, trim: true, maxlength: 5000, default: "" },
    followUpInstructions: { type: String, trim: true, maxlength: 3000, default: "" },
    medicationInformation: { type: String, trim: true, maxlength: 3000, default: "" },
    completedAt: { type: Date, default: null },
    attachments: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

consultationSchema.index({ userId: 1, createdAt: -1 });
consultationSchema.index(
  { veterinarianId: 1, requestedDate: 1, requestedTime: 1 },
  { unique: true, partialFilterExpression: { slotReserved: true }, name: "unique_reserved_vet_slot" },
);

export default mongoose.model("Consultation", consultationSchema);
