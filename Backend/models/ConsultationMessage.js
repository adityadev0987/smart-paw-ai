import mongoose from "mongoose";

const consultationMessageSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["owner", "doctor"], required: true },
  message: { type: String, trim: true, default: "", maxlength: 4000 },
  messageType: { type: String, enum: ["text", "image", "audio"], default: "text" },
  mediaUrl: { type: String, default: "" },
  mediaMimeType: { type: String, default: "" },
  mediaDuration: { type: Number, default: null, min: 0, max: 600 },
  mediaStoragePath: { type: String, default: "", select: false },
}, { timestamps: true });

consultationMessageSchema.index({ consultationId: 1, createdAt: 1 });
export default mongoose.model("ConsultationMessage", consultationMessageSchema);
