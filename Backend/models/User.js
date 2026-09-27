import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: { type: String, enum: ["owner", "doctor"], default: "owner", index: true },
    doctorProfile: {
      profilePhoto: { type: String, trim: true, default: "" },
      qualification: { type: String, trim: true, default: "" },
      specialization: [{ type: String, trim: true }],
      experience: { type: Number, min: 0, default: 0 },
      isApproved: { type: Boolean, default: false },
      isAcceptingConsultations: { type: Boolean, default: false },
      availableDays: [{ type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }],
      timeSlots: [{ start: { type: String, trim: true }, end: { type: String, trim: true } }],
      isOnline: { type: Boolean, default: false },
      lastSeenAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
