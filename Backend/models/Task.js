import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Activity",
        "Health",
        "Medicine",
        "Checkup",
        "Consultation",
      ],
    },

    time: { type: String, trim: true, default: "" },
    petName: { type: String, trim: true, default: "" },
    consultationType: { type: String, trim: true, default: "" },
    primaryConcern: { type: String, trim: true, default: "" },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: undefined,
      unique: true,
      sparse: true,
    },
    doctorName: { type: String, trim: true, default: "" },
    eventStatus: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
