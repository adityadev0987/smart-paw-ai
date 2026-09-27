import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", default: null },
  type: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 300 },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });
export default mongoose.model("Notification", notificationSchema);
