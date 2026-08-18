import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
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
        "Vaccination",
        "Checkup",
        "Medicine",
        "Treatment",
        "Other",
      ],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const HealthRecord = mongoose.model(
  "HealthRecord",
  healthRecordSchema,
);

export default HealthRecord;