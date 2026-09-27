import mongoose from "mongoose";

const consultationMessageSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["owner", "doctor"], required: true },
  message: { type: String, trim: true, required: true, maxlength: 4000 },
}, { timestamps: true });

consultationMessageSchema.index({ consultationId: 1, createdAt: 1 });
export default mongoose.model("ConsultationMessage", consultationMessageSchema);
