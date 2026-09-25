import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

const communityPostSchema = new mongoose.Schema(
  {
    // User who created the post
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Pet associated with the post
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },

    // Community post type
    postType: {
      type: String,
      enum: ["normal", "adoption", "lost_found"],
      default: "normal",
      index: true,
    },

    // Post text
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Images / videos
    media: [
      {
        type: String,
        trim: true,
      },
    ],

    // Users who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Keep count for fast feed rendering
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Comments
    comments: [commentSchema],

    // Keep count for fast feed rendering
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Soft delete / hide
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helpful indexes for feed queries
communityPostSchema.index({
  postType: 1,
  isActive: 1,
  createdAt: -1,
});

communityPostSchema.index({
  userId: 1,
  createdAt: -1,
});

communityPostSchema.index({
  petId: 1,
  createdAt: -1,
});

const CommunityPost = mongoose.model(
  "CommunityPost",
  communityPostSchema,
);

export default CommunityPost;