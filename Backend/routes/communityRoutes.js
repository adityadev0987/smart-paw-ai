import express from "express";

import {
  // Community posts
  createCommunityPost,
  getCommunityFeed,
  getCommunityPost,
  deleteCommunityPost,

  // Likes
  toggleLike,

  // Comments
  addComment,
  getComments,
  deleteComment,

  // Follow
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,

  // Adoption
  createAdoptionRequest,
  getMyAdoptionRequests,
  getReceivedAdoptionRequests,
  updateAdoptionRequest,
} from "../controllers/communityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// COMMUNITY POSTS
// ==========================================

// GET COMMUNITY FEED
router.get(
  "/posts",
  protect,
  getCommunityFeed,
);

// GET SINGLE POST
router.get(
  "/posts/:postId",
  protect,
  getCommunityPost,
);

// CREATE COMMUNITY POST
router.post(
  "/posts",
  protect,
  createCommunityPost,
);

// DELETE COMMUNITY POST
router.delete(
  "/posts/:postId",
  protect,
  deleteCommunityPost,
);


// ==========================================
// LIKE / UNLIKE
// ==========================================

router.post(
  "/posts/:postId/like",
  protect,
  toggleLike,
);


// ==========================================
// COMMENTS
// ==========================================

// ADD COMMENT
router.post(
  "/posts/:postId/comments",
  protect,
  addComment,
);

// GET COMMENTS
router.get(
  "/posts/:postId/comments",
  protect,
  getComments,
);

// DELETE COMMENT
router.delete(
  "/posts/:postId/comments/:commentId",
  protect,
  deleteComment,
);


// ==========================================
// FOLLOW SYSTEM
// ==========================================

// FOLLOW USER
router.post(
  "/users/:userId/follow",
  protect,
  followUser,
);

// UNFOLLOW USER
router.delete(
  "/users/:userId/follow",
  protect,
  unfollowUser,
);

// CHECK FOLLOW STATUS
router.get(
  "/users/:userId/follow-status",
  protect,
  getFollowStatus,
);

// GET FOLLOWERS
router.get(
  "/users/:userId/followers",
  protect,
  getFollowers,
);

// GET FOLLOWING
router.get(
  "/users/:userId/following",
  protect,
  getFollowing,
);


// ==========================================
// ADOPTION
// ==========================================

// CREATE ADOPTION REQUEST
router.post(
  "/posts/:postId/adoption-request",
  protect,
  createAdoptionRequest,
);

// GET MY ADOPTION REQUESTS
router.get(
  "/adoption-requests/mine",
  protect,
  getMyAdoptionRequests,
);

// GET RECEIVED ADOPTION REQUESTS
router.get(
  "/adoption-requests/received",
  protect,
  getReceivedAdoptionRequests,
);

// ACCEPT / REJECT ADOPTION REQUEST
router.patch(
  "/adoption-requests/:requestId",
  protect,
  updateAdoptionRequest,
);


// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;