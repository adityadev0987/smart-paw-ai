import CommunityPost from "../models/CommunityPost.js";
import Follow from "../models/Follow.js";
import AdoptionRequest from "../models/AdoptionRequest.js";

function getUserId(req) {
  return req.user?._id || req.user?.id || req.userId;
}

function serializePost(post) {
  const item = post.toObject ? post.toObject() : post;

  return {
    ...item,
    caption: item.content,
    type: item.postType,
    likesCount: item.likeCount,
    commentsCount: item.commentCount,
  };
}

export async function getCommunityFeed(req, res) {
  try {
    const type = req.query.type;
    const postType = type === "lost" ? "lost_found" : type;
    const filter = { isActive: true };

    if (["normal", "adoption", "lost_found"].includes(postType)) {
      filter.postType = postType;
    }

    const posts = await CommunityPost.find(filter)
      .populate("userId", "name email")
      .populate("petId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts.map(serializePost),
    });
  } catch (error) {
    console.error("Get community feed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch community posts.",
    });
  }
}

export async function getCommunityPost(req, res) {
  try {
    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      isActive: true,
    })
      .populate("userId", "name email")
      .populate("petId");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      post: serializePost(post),
    });
  } catch (error) {
    console.error("Get community post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch community post.",
    });
  }
}

export async function createCommunityPost(req, res) {
  try {
    const userId = getUserId(req);
    const { petId, type = "normal", caption = "", content = "", media = [] } = req.body;
    const postContent = String(caption || content).trim();
    const postType = type === "lost" ? "lost_found" : type;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!petId || !postContent) {
      return res.status(400).json({
        success: false,
        message: "Pet and post content are required.",
      });
    }

    if (!["normal", "adoption", "lost_found"].includes(postType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid community post type.",
      });
    }

    const post = await CommunityPost.create({
      userId,
      petId,
      postType,
      content: postContent,
      media: Array.isArray(media) ? media : [],
    });

    await post.populate([
      { path: "userId", select: "name email" },
      { path: "petId" },
    ]);

    return res.status(201).json({
      success: true,
      post: serializePost(post),
    });
  } catch (error) {
    console.error("Create community post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create community post.",
    });
  }
}

export async function deleteCommunityPost(req, res) {
  try {
    const userId = getUserId(req);
    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      userId,
      isActive: true,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    post.isActive = false;
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete community post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete community post.",
    });
  }
}

export async function toggleLike(req, res) {
  try {
    const { postId } = req.params;

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    const post = await CommunityPost.findOne({
      _id: postId,
      isActive: true,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const userObjectId = userId.toString();

    const alreadyLiked = post.likes.some(
      (like) => like.toString() === userObjectId,
    );

    // ==========================================
    // UNLIKE
    // ==========================================

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userObjectId,
      );

      post.likeCount = post.likes.length;

      await post.save();

      return res.status(200).json({
        success: true,
        liked: false,
        likeCount: post.likeCount,
        message: "Post unliked successfully.",
      });
    }

    // ==========================================
    // LIKE
    // ==========================================

    post.likes.push(userId);

    post.likeCount = post.likes.length;

    await post.save();

    return res.status(200).json({
      success: true,
      liked: true,
      likeCount: post.likeCount,
      message: "Post liked successfully.",
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update like.",
    });
  }
}
// ==========================================
// ADD COMMENT
// ==========================================

export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    const post = await CommunityPost.findOne({
      _id: postId,
      isActive: true,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    post.comments.push({
      userId,
      text: text.trim(),
    });

    post.commentCount = post.comments.length;

    await post.save();

    const newComment =
      post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: {
        id: newComment._id,
        userId: newComment.userId,
        text: newComment.text,
        createdAt: newComment.createdAt,
      },
      commentCount: post.commentCount,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment.",
    });
  }
}

// ==========================================
// GET COMMENTS
// ==========================================

export async function getComments(req, res) {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    const post = await CommunityPost.findOne({
      _id: postId,
      isActive: true,
    })
      .populate(
        "comments.userId",
        "name email",
      )
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comments = (post.comments || []).map(
      (comment) => ({
        id: comment._id,
        user: comment.userId
          ? {
              id: comment.userId._id,
              name: comment.userId.name,
              email: comment.userId.email,
            }
          : null,
        text: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }),
    );

    return res.status(200).json({
      success: true,
      comments,
      commentCount: comments.length,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments.",
    });
  }
}

// ==========================================
// DELETE COMMENT
// ==========================================

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!postId || !commentId) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment ID are required.",
      });
    }

    const post = await CommunityPost.findOne({
      _id: postId,
      isActive: true,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment.",
      });
    }

    comment.deleteOne();

    post.commentCount = post.comments.length;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      commentCount: post.commentCount,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
    });
  }
}

// ==========================================
// FOLLOW USER
// ==========================================

export async function followUser(req, res) {
  try {
    const { userId } = req.params;
    const followerId = getUserId(req);

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (followerId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        following: true,
        message: "Already following this user.",
      });
    }

    await Follow.create({
      follower: followerId,
      following: userId,
    });

    return res.status(201).json({
      success: true,
      following: true,
      message: "User followed successfully.",
    });
  } catch (error) {
    console.error("Follow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to follow user.",
    });
  }
}


// ==========================================
// UNFOLLOW USER
// ==========================================

export async function unfollowUser(req, res) {
  try {
    const { userId } = req.params;
    const followerId = getUserId(req);

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await Follow.deleteOne({
      follower: followerId,
      following: userId,
    });

    return res.status(200).json({
      success: true,
      following: false,
      removed: result.deletedCount > 0,
      message: "User unfollowed successfully.",
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user.",
    });
  }
}


// ==========================================
// GET FOLLOW STATUS
// ==========================================

export async function getFollowStatus(req, res) {
  try {
    const { userId } = req.params;
    const followerId = getUserId(req);

    if (!followerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const follow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    return res.status(200).json({
      success: true,
      following: Boolean(follow),
    });
  } catch (error) {
    console.error("Get follow status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get follow status.",
    });
  }
}


// ==========================================
// GET FOLLOWERS
// ==========================================

export async function getFollowers(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const followers = await Follow.find({
      following: userId,
    })
      .populate("follower", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      followers: followers.map(
        (item) => item.follower,
      ),
      count: followers.length,
    });
  } catch (error) {
    console.error("Get followers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch followers.",
    });
  }
}


// ==========================================
// GET FOLLOWING
// ==========================================

export async function getFollowing(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const following = await Follow.find({
      follower: userId,
    })
      .populate("following", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      following: following.map(
        (item) => item.following,
      ),
      count: following.length,
    });
  } catch (error) {
    console.error("Get following error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch following.",
    });
  }
}


// ==========================================
// CREATE ADOPTION REQUEST
// ==========================================

export async function createAdoptionRequest(req, res) {
  try {
    const { postId } = req.params;
    const { message = "" } = req.body;

    const requesterId = getUserId(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    const post = await CommunityPost.findOne({
      _id: postId,
      isActive: true,
      postType: "adoption",
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Adoption post not found.",
      });
    }

    if (
      post.userId.toString() ===
      requesterId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot request adoption of your own post.",
      });
    }

    const existingRequest =
      await AdoptionRequest.findOne({
        postId,
        requesterId,
        status: "pending",
      });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending adoption request.",
      });
    }

    const request = await AdoptionRequest.create({
      postId,
      petId: post.petId,
      requesterId,
      ownerId: post.userId,
      message: String(message).trim(),
    });

    return res.status(201).json({
      success: true,
      message:
        "Adoption request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Create adoption request error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create adoption request.",
    });
  }
}


// ==========================================
// GET MY ADOPTION REQUESTS
// ==========================================

export async function getMyAdoptionRequests(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    const requests = await AdoptionRequest.find({
      requesterId: userId,
    })
      .populate(
        "petId",
        "name species breed age gender color",
      )
      .populate(
        "ownerId",
        "name email",
      )
      .populate(
        "postId",
        "postType content media",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error(
      "Get my adoption requests error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch adoption requests.",
    });
  }
}


// ==========================================
// GET RECEIVED ADOPTION REQUESTS
// ==========================================

export async function getReceivedAdoptionRequests(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    const requests = await AdoptionRequest.find({
      ownerId: userId,
    })
      .populate(
        "petId",
        "name species breed age gender color",
      )
      .populate(
        "requesterId",
        "name email",
      )
      .populate(
        "postId",
        "postType content media",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error(
      "Get received adoption requests error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch received requests.",
    });
  }
}


// ==========================================
// UPDATE ADOPTION REQUEST
// ==========================================

export async function updateAdoptionRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const ownerId = getUserId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required.",
      });
    }

    if (
      !["accepted", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be accepted or rejected.",
      });
    }

    const request =
      await AdoptionRequest.findOne({
        _id: requestId,
        ownerId,
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This request has already been processed.",
      });
    }

    request.status = status;

    await request.save();

    return res.status(200).json({
      success: true,
      message:
        `Adoption request ${status} successfully.`,
      request,
    });
  } catch (error) {
    console.error(
      "Update adoption request error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update adoption request.",
    });
  }
}