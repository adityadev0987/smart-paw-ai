import mongoose from "mongoose";

const adoptionListingSchema = new mongoose.Schema(
  {
    ownerId: {
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
    about: { type: String, trim: true, required: true, maxlength: 2000 },
    reason: { type: String, trim: true, required: true, maxlength: 1000 },
    location: { type: String, trim: true, default: "", maxlength: 200 },
    contact: { type: String, trim: true, default: "", maxlength: 200 },
    requirements: { type: String, trim: true, default: "", maxlength: 1000 },
    temperament: { type: String, trim: true, default: "", maxlength: 500 },
    healthInfo: { type: String, trim: true, default: "", maxlength: 1000 },
    media: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("AdoptionListing", adoptionListingSchema);
