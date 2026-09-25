import mongoose from "mongoose";

const adoptionRequestSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: true,
      index: true,
    },

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },

    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

adoptionRequestSchema.index({
  postId: 1,
  requesterId: 1,
});

const AdoptionRequest = mongoose.model(
  "AdoptionRequest",
  adoptionRequestSchema,
);

export default AdoptionRequest;