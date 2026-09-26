import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import {
  Heart,
  MessageCircle,
  Share2,
  Pencil,
  Plus,
  PawPrint,
  Search,
  Home,
  Users,
  HeartHandshake,
  MapPin,
  Image as ImageIcon,
  Smile,
  ChevronRight,
  Sparkles,
  Send,
  Trash2,
  UserPlus,
  UserCheck,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = new URL(API_BASE_URL).origin;
const MAX_COMMUNITY_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getMediaUrl(url) {
  return url?.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

function getAuthHeaders() {
  const token = localStorage.getItem("smartPawToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function formatDate(date) {
  if (!date) return "";

  const created = new Date(date);
  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - created.getTime()) / 1000,
  );

  if (diff < 60) return "Just now";

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return created.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Non-JSON responses are handled with the default null value.
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong. Please try again.",
    );
  }

  return data;
}

function Community() {
  const { postId: sharedPostId } = useParams();
  const { currentUser } = useAppContext();
  const [activeSection, setActiveSection] = useState("feed");

  const [posts, setPosts] = useState([]);
  const [pets, setPets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(true);

  const [error, setError] = useState("");
  const [petsError, setPetsError] = useState("");

  const [showCreatePost, setShowCreatePost] =
    useState(false);

  const [caption, setCaption] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [postType, setPostType] = useState("normal");
  const [selectedPetId, setSelectedPetId] =
    useState("");

  const [creating, setCreating] = useState(false);

  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentsLoading, setCommentsLoading] =
    useState({});

  const [commentSubmitting, setCommentSubmitting] =
    useState({});

  const [followingUsers, setFollowingUsers] =
    useState({});

  const [followLoading, setFollowLoading] =
    useState({});

  const [adoptionLoading, setAdoptionLoading] =
    useState({});

  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState("");

  const [searchText, setSearchText] = useState("");

  const navigation = [
    {
      id: "feed",
      label: "Community Feed",
      icon: Home,
    },
    {
      id: "adoption",
      label: "Adoption",
      icon: HeartHandshake,
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
    },
  ];

  // ==================================================
  // LOAD POSTS
  // ==================================================

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let url = sharedPostId
        ? `${API_BASE_URL}/community/posts/${sharedPostId}`
        : `${API_BASE_URL}/community/posts`;

      if (!sharedPostId && activeSection === "adoption") {
        url += "?type=adoption";
      }

      const data = await apiRequest(url);

      const loadedPosts = sharedPostId
        ? (data?.post ? [data.post] : [])
        : (Array.isArray(data?.posts) ? data.posts : []);

      setPosts(loadedPosts);

      const initialLikes = {};
      const initialCounts = {};

      loadedPosts.forEach((post) => {
        initialLikes[post._id] = false;

        initialCounts[post._id] =
          Number(post.likesCount || post.likeCount || 0);
      });

      setLikedPosts(initialLikes);
      setLikeCounts(initialCounts);
    } catch (err) {
      console.error("Community feed error:", err);

      setError(
        err.message || "Unable to load community posts.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeSection, sharedPostId]);

  // ==================================================
  // LOAD USER PETS
  // ==================================================

  const loadPets = useCallback(async () => {
    try {
      setPetsLoading(true);
      setPetsError("");

      const data = await apiRequest(
        `${API_BASE_URL}/pets`,
      );

      const loadedPets = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.pets)
          ? data.pets
          : [];

      setPets(loadedPets);

      if (loadedPets.length > 0) {
        setSelectedPetId(
          loadedPets[0]._id || loadedPets[0].id,
        );
      }
    } catch (err) {
      console.error("Load pets error:", err);

      setPetsError(
        err.message || "Unable to load your pets.",
      );
    } finally {
      setPetsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "friends") return undefined;
    const timer = window.setTimeout(() => void loadPosts(), 0);
    return () => window.clearTimeout(timer);
  }, [activeSection, loadPosts]);

  const loadFriends = useCallback(async () => {
    try {
      setFriendsLoading(true);
      setFriendsError("");
      const data = await apiRequest(`${API_BASE_URL}/community/users/me/following`);
      setFriends(Array.isArray(data?.following) ? data.following : []);
    } catch (err) {
      setFriendsError(err.message || "Unable to load friends.");
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPets(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPets]);

  // ==================================================
  // LIKE / UNLIKE
  // ==================================================

  async function toggleLike(postId) {
    try {
      const data = await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}/like`,
        {
          method: "POST",
        },
      );

      setLikedPosts((previous) => ({
        ...previous,
        [postId]: Boolean(data?.liked),
      }));

      setLikeCounts((previous) => ({
        ...previous,
        [postId]: Number(data?.likeCount || 0),
      }));
    } catch (err) {
      console.error("Toggle like error:", err);

      alert(
        err.message || "Unable to update like.",
      );
    }
  }

  // ==================================================
  // COMMENTS
  // ==================================================

  async function loadComments(postId) {
    try {
      setCommentsLoading((previous) => ({
        ...previous,
        [postId]: true,
      }));

      const data = await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
      );

      setComments((previous) => ({
        ...previous,
        [postId]: Array.isArray(data?.comments)
          ? data.comments
          : [],
      }));
    } catch (err) {
      console.error("Load comments error:", err);

      alert(
        err.message || "Unable to load comments.",
      );
    } finally {
      setCommentsLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  async function toggleComments(postId) {
    const currentlyOpen = Boolean(
      openComments[postId],
    );

    setOpenComments((previous) => ({
      ...previous,
      [postId]: !currentlyOpen,
    }));

    if (!currentlyOpen && !comments[postId]) {
      await loadComments(postId);
    }
  }

  async function addComment(postId) {
    const text = (
      commentInputs[postId] || ""
    ).trim();

    if (!text) return;

    try {
      setCommentSubmitting((previous) => ({
        ...previous,
        [postId]: true,
      }));

      const data = await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        },
      );

      const newComment = data?.comment;

      setComments((previous) => ({
        ...previous,
        [postId]: [
          ...(previous[postId] || []),
          {
            id: newComment?.id,
            user: {
              id: newComment?.userId,
              name:
                localStorage.getItem(
                  "smartPawUserName",
                ) || "You",
            },
            text: newComment?.text || text,
            createdAt:
              newComment?.createdAt ||
              new Date().toISOString(),
          },
        ],
      }));

      setCommentInputs((previous) => ({
        ...previous,
        [postId]: "",
      }));

      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? {
                ...post,
                commentsCount:
                  Number(
                    post.commentsCount || 0,
                  ) + 1,
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Add comment error:", err);

      alert(
        err.message || "Unable to add comment.",
      );
    } finally {
      setCommentSubmitting((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  async function deleteComment(
    postId,
    commentId,
  ) {
    try {
      await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        },
      );

      setComments((previous) => ({
        ...previous,
        [postId]: (
          previous[postId] || []
        ).filter(
          (comment) =>
            comment.id !== commentId,
          ),
      }));

      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? {
                ...post,
                commentsCount: Math.max(
                  0,
                  Number(
                    post.commentsCount || 0,
                  ) - 1,
                ),
              }
            : post,
        ),
      );
    } catch (err) {
      console.error(
        "Delete comment error:",
        err,
      );

      alert(
        err.message ||
          "Unable to delete comment.",
      );
    }
  }

  // ==================================================
  // FOLLOW / UNFOLLOW
  // ==================================================

  async function loadFollowStatus(userId) {
    if (!userId) return;

    try {
      const data = await apiRequest(
        `${API_BASE_URL}/community/users/${userId}/follow-status`,
      );

      setFollowingUsers((previous) => ({
        ...previous,
        [userId]: Boolean(data?.following),
      }));
      return Boolean(data?.following);
    } catch (err) {
      console.error(
        "Follow status error:",
        err,
      );
      return null;
    }
  }

  async function toggleFollow(userId, followingOverride) {
    if (!userId) return;

    try {
      setFollowLoading((previous) => ({
        ...previous,
        [userId]: true,
      }));

      const currentlyFollowing = typeof followingOverride === "boolean"
        ? followingOverride
        : Boolean(followingUsers[userId]);

      const method = currentlyFollowing
        ? "DELETE"
        : "POST";

      const data = await apiRequest(
        `${API_BASE_URL}/community/users/${userId}/follow`,
        {
          method,
        },
      );

      setFollowingUsers((previous) => ({
        ...previous,
        [userId]: Boolean(data?.following),
      }));
      if (activeSection === "friends") await loadFriends();
    } catch (err) {
      console.error(
        "Toggle follow error:",
        err,
      );

      alert(
        err.message ||
          "Unable to update follow status.",
      );
    } finally {
      setFollowLoading((previous) => ({
        ...previous,
        [userId]: false,
      }));
    }
  }

  // ==================================================
  // ADOPTION REQUEST
  // ==================================================

  async function requestAdoption(postId) {
    try {
      setAdoptionLoading((previous) => ({
        ...previous,
        [postId]: true,
      }));

      await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}/adoption-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message:
              "I am interested in adopting this pet.",
          }),
        },
      );

      alert(
        "Adoption request submitted successfully.",
      );
    } catch (err) {
      console.error(
        "Adoption request error:",
        err,
      );

      alert(
        err.message ||
          "Unable to submit adoption request.",
      );
    } finally {
      setAdoptionLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  // ==================================================
  // CREATE POST
  // ==================================================

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setUploadError("");
    if (selectedImages.length + files.length > MAX_COMMUNITY_IMAGES) {
      setUploadError(`Choose up to ${MAX_COMMUNITY_IMAGES} photos per post.`);
      return;
    }
    const invalid = files.find((file) =>
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_IMAGE_SIZE,
    );
    if (invalid) {
      setUploadError(invalid.size > MAX_IMAGE_SIZE
        ? `${invalid.name} is larger than 5 MB.`
        : `${invalid.name} is not a supported photo. Use JPG, PNG or WebP.`);
      return;
    }
    setSelectedImages((previous) => [
      ...previous,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }

  function clearSelectedImages() {
    selectedImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setSelectedImages([]);
    setUploadError("");
  }

  async function sharePost(post) {
    const url = `${window.location.origin}/community/posts/${post._id}`;
    const shareData = {
      title: `${post.petId?.name || "Pet"}'s community post`,
      text: post.content || post.caption || "See this post on Smart Paw AI",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Post link copied.");
      } else {
        window.prompt("Copy this post link:", url);
      }
    } catch (err) {
      if (err.name !== "AbortError") alert("Unable to share this post.");
    }
  }

  async function createPost() {
    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      alert("Please write something first.");
      return;
    }

    if (!selectedPetId) {
      alert("Please select a pet.");
      return;
    }

    try {
      setCreating(true);

      const uploadedMedia = await Promise.all(selectedImages.map(async ({ file }) => {
        const formData = new FormData();
        formData.append("image", file);
        const result = await apiRequest(`${API_BASE_URL}/uploads/community-image`, {
          method: "POST",
          body: formData,
        });
        if (!result?.imageUrl) throw new Error("Image upload did not return a photo URL.");
        return result.imageUrl;
      }));

      await apiRequest(
        `${API_BASE_URL}/community/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petId: selectedPetId,
            type: postType,
            caption: trimmedCaption,
            media: uploadedMedia,
          }),
        },
      );

      setCaption("");
      clearSelectedImages();
      setPostType("normal");
      setShowCreatePost(false);

      await loadPosts();
    } catch (err) {
      console.error(
        "Create post error:",
        err,
      );

      alert(
        err.message ||
          "Unable to create post.",
      );
    } finally {
      setCreating(false);
    }
  }

  // ==================================================
  // DELETE POST
  // ==================================================

  async function deletePost(postId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `${API_BASE_URL}/community/posts/${postId}`,
        {
          method: "DELETE",
        },
      );

      setPosts((previous) =>
        previous.filter(
          (post) => post._id !== postId,
        ),
      );
    } catch (err) {
      console.error(
        "Delete post error:",
        err,
      );

      alert(
        err.message ||
          "Unable to delete post.",
      );
    }
  }

  function openEditPost(post) {
    setEditingPost(post);
    setEditCaption(post.content || post.caption || "");
  }

  async function savePostEdit() {
    const content = editCaption.trim();
    if (!editingPost || !content) return;

    try {
      setEditSubmitting(true);
      const data = await apiRequest(`${API_BASE_URL}/community/posts/${editingPost._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setPosts((previous) => previous.map((post) =>
        post._id === editingPost._id ? data.post : post,
      ));
      setEditingPost(null);
      setEditCaption("");
    } catch (err) {
      alert(err.message || "Unable to update post.");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleFollowClick(userId) {
    let currentlyFollowing = followingUsers[userId];
    if (typeof currentlyFollowing !== "boolean") {
      currentlyFollowing = await loadFollowStatus(userId);
    }
    if (typeof currentlyFollowing === "boolean") {
      await toggleFollow(userId, currentlyFollowing);
    }
  }

  // ==================================================
  // FILTER SEARCH
  // ==================================================

  const filteredPosts = posts.filter((post) => {
    if (!searchText.trim()) return true;

    const search = searchText
      .toLowerCase()
      .trim();

    const text = [
      post.content,
      post.caption,
      post.userId?.name,
      post.petId?.name,
      post.petId?.breed,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search);
  });

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#080d12] dark:text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0d131a]/95">

        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center gap-5 px-4 sm:px-6">

          <div className="flex min-w-fit items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <PawPrint size={22} />
            </div>

            <div className="hidden sm:block">

              <p className="text-lg font-black tracking-tight">
                Smart Paw
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Pet Community
              </p>

            </div>

          </div>

          <div className="mx-auto hidden max-w-md flex-1 md:block">

            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5 dark:bg-[#151d26]">

              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                type="text"
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value,
                  )
                }
                placeholder="Search pets, people or posts..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

          <div className="ml-auto flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setShowCreatePost(true)
              }
              className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              <Plus size={17} />

              <span className="hidden sm:inline">
                Create Post
              </span>
            </button>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500 sm:flex dark:bg-orange-500/10">
              <PawPrint size={17} />
            </div>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">

        {/* ==================================================
            LEFT SIDEBAR
        ================================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-[94px]">

            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0d131a]">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                  <PawPrint size={20} />
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold">
                    Pet Parent
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    Smart Paw member
                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-1">

              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      if (item.id === "friends") loadFriends();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#111923] dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} />

                    {item.label}
                  </button>
                );
              })}

            </div>

            <div className="mt-8 rounded-2xl bg-orange-500 p-4 text-white">

              <PawPrint size={22} />

              <p className="mt-3 text-sm font-bold">
                Love pets?
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-100">
                Share your pet's daily moments
                with the Smart Paw community.
              </p>

            </div>

          </div>

        </aside>

        {/* ==================================================
            CENTER FEED
        ================================================== */}

        <section className="min-w-0">

          {/* MOBILE TABS */}

          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id === "friends") loadFriends();
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                    activeSection === item.id
                      ? "bg-orange-500 text-white"
                      : "bg-white text-slate-500 dark:bg-[#0d131a] dark:text-slate-400"
                  }`}
                >
                  <Icon size={15} />

                  {item.label}
                </button>
              );
            })}

          </div>

          {/* TITLE */}

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                Community
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">

                {activeSection === "feed" &&
                  "Your Pet Feed"}

                {activeSection === "adoption" &&
                  "Pets Looking for a Home"}

                {activeSection === "friends" &&
                  "Friends You Follow"}

              </h1>

            </div>

          </div>

          {activeSection === "friends" && (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0d131a]">
              {friendsLoading ? (
                <p className="py-6 text-center text-sm text-slate-400">Loading friends...</p>
              ) : friendsError ? (
                <div className="py-5 text-center">
                  <p role="alert" className="text-sm text-red-500">{friendsError}</p>
                  <button type="button" onClick={loadFriends} className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white">Try again</button>
                </div>
              ) : friends.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">You are not following anyone yet. Follow a pet parent from the feed to see them here.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => {
                    const friendId = friend._id || friend.id;
                    return (
                      <div key={friendId} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-[#111923]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                          <PawPrint size={18} />
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm font-bold">{friend.name || "Pet Parent"}</p>
                        <button
                          type="button"
                          disabled={Boolean(followLoading[friendId])}
                          onClick={() => toggleFollow(friendId, true)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:border-orange-300 hover:text-orange-500 disabled:opacity-50 dark:border-slate-700"
                        >
                          {followLoading[friendId] ? "Updating..." : "Unfollow"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CREATE POST BOX */}

          {activeSection === "feed" && (
            <button
              type="button"
              onClick={() =>
                setShowCreatePost(true)
              }
              className="mb-5 flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-300 dark:border-slate-800 dark:bg-[#0d131a]"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                <PawPrint size={18} />
              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold text-slate-400">
                  Share something about your pet...
                </p>

                <div className="mt-2 flex gap-4 text-xs font-semibold text-slate-400">

                  <span className="flex items-center gap-1">
                    <ImageIcon size={14} />
                    Photo
                  </span>

                  <span className="flex items-center gap-1">
                    <Smile size={14} />
                    Feeling
                  </span>

                </div>

              </div>

              <div className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white">
                Post
              </div>

            </button>
          )}

          {/* LOADING */}

          {loading && activeSection !== "friends" && (
            <div className="space-y-4">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-white dark:bg-[#0d131a]"
                />
              ))}

            </div>
          )}

          {/* ERROR */}

          {!loading && error && activeSection !== "friends" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-950/20">

              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadPosts}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white"
              >
                Try Again
              </button>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            activeSection !== "friends" &&
            !error &&
            filteredPosts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0d131a]">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                  <PawPrint size={30} />
                </div>

                <h2 className="mt-5 text-lg font-black">
                  No posts found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  Be the first pet parent to
                  share something with the
                  Smart Paw community.
                </p>

              </div>
            )}

          {/* POSTS */}

          {!loading &&
            activeSection !== "friends" &&
            !error &&
            filteredPosts.map((post) => {

              const postId = post._id;

              const userId =
                post.userId?._id ||
                post.userId?.id;
              const isOwner = String(userId) === String(currentUser?._id || currentUser?.id);

              const pet = post.petId;

              const isLiked =
                Boolean(likedPosts[postId]);

              const currentLikeCount =
                likeCounts[postId] ??
                Number(
                  post.likesCount ||
                    post.likeCount ||
                    0,
                );

              const currentComments =
                comments[postId] || [];

              const isCommentsOpen =
                Boolean(
                  openComments[postId],
                );

              const isAdoption =
                post.type === "adoption" ||
                post.postType === "adoption";

              return (
                <article
                  key={postId}
                  className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0d131a]"
                >

                  {/* POST HEADER */}

                  <div className="flex items-center justify-between p-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10" aria-label={`${post.userId?.name || "Pet Parent"} avatar`}>
                        <PawPrint size={20} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <p className="truncate text-sm font-black">
                            {post.userId?.name ||
                              "Pet Parent"}
                          </p>

                          {isAdoption && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black uppercase text-green-700 dark:bg-green-500/10 dark:text-green-400">
                              Adoption
                            </span>
                          )}

                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">

                          <span>
                            {formatDate(
                              post.createdAt,
                            )}
                          </span>

                          {pet?.name && (
                            <>
                              <span>•</span>
                              <span>
                                {pet.name}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-1">

                      {userId && !isOwner && (
                        <button
                          type="button"
                          disabled={
                            followLoading[userId]
                          }
                          onClick={() => handleFollowClick(userId)}
                          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-orange-500 dark:hover:bg-slate-800"
                          title={
                            followingUsers[
                              userId
                            ]
                              ? "Unfollow"
                              : "Follow"
                          }
                        >
                          {followingUsers[
                            userId
                          ] ? (
                            <UserCheck
                              size={18}
                            />
                          ) : (
                            <UserPlus
                              size={18}
                            />
                          )}
                        </button>
                      )}

                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditPost(post)}
                            aria-label="Edit post"
                            title="Edit post"
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-orange-500 dark:hover:bg-slate-800"
                          ><Pencil size={17} /></button>
                          <button
                            type="button"
                            onClick={() => deletePost(postId)}
                            aria-label="Delete post"
                            title="Delete post"
                            className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-800"
                          ><Trash2 size={17} /></button>
                        </>
                      )}

                    </div>

                  </div>

                  {/* PET INFO */}

                  {pet && (
                    <div className="mx-4 mb-4 rounded-xl bg-slate-50 p-3 dark:bg-[#111923]">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                          <PawPrint
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-black">
                            {pet.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {[
                              pet.species,
                              pet.breed,
                              pet.age
                                ? `${pet.age} years`
                                : null,
                              pet.gender,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>

                        </div>

                        <ChevronRight
                          size={18}
                          className="text-slate-400"
                        />

                      </div>

                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="px-4 pb-4">

                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                      {post.content ||
                        post.caption}
                    </p>

                  </div>

                  {Array.isArray(post.media) && post.media.length > 0 && (
                    <div className={`mb-4 grid gap-1 px-4 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {post.media.map((imageUrl, index) => (
                        <img
                          key={`${imageUrl}-${index}`}
                          src={getMediaUrl(imageUrl)}
                          alt={`Photo ${index + 1} in ${pet?.name || "pet"}'s post`}
                          loading="lazy"
                          className="h-auto max-h-[80vh] w-full rounded-xl object-contain"
                        />
                      ))}
                    </div>
                  )}

                  {/* LOCATION */}

                  {post.location && (
                    <div className="flex items-center gap-1 px-4 pb-3 text-xs text-slate-400">
                      <MapPin size={13} />
                      {post.location}
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-5">

                        <button
                          type="button"
                          onClick={() =>
                            toggleLike(
                              postId,
                            )
                          }
                          className={`flex items-center gap-2 text-sm font-semibold transition ${
                            isLiked
                              ? "text-red-500"
                              : "text-slate-500 hover:text-red-500 dark:text-slate-400"
                          }`}
                        >
                          <Heart
                            size={19}
                            fill={
                              isLiked
                                ? "currentColor"
                                : "none"
                            }
                          />

                          {currentLikeCount}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleComments(
                              postId,
                            )
                          }
                          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 dark:text-slate-400"
                        >
                          <MessageCircle
                            size={19}
                          />

                          {Number(
                            post.commentsCount ||
                              post.commentCount ||
                              0,
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => sharePost(post)}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 dark:text-slate-400"
                        >
                          <Share2
                            size={18}
                          />

                          <span className="hidden sm:inline">
                            Share
                          </span>
                        </button>

                      </div>

                      {isAdoption && (
                        <button
                          type="button"
                          disabled={
                            adoptionLoading[
                              postId
                            ]
                          }
                          onClick={() =>
                            requestAdoption(
                              postId,
                            )
                          }
                          className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {adoptionLoading[
                            postId
                          ]
                            ? "Sending..."
                            : "Request Adoption"}
                        </button>
                      )}

                    </div>

                  </div>

                  {/* COMMENTS */}

                  {isCommentsOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#0a1016]">

                      <div className="mb-4 flex items-center justify-between">

                        <p className="text-sm font-black">
                          Comments
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenComments(
                              (previous) => ({
                                ...previous,
                                [postId]: false,
                              }),
                            )
                          }
                          className="rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <X size={16} />
                        </button>

                      </div>

                      {commentsLoading[
                        postId
                      ] ? (
                        <div className="py-5 text-center text-xs text-slate-400">
                          Loading comments...
                        </div>
                      ) : currentComments.length ===
                        0 ? (
                        <div className="py-5 text-center text-xs text-slate-400">
                          No comments yet.
                          Be the first to
                          comment.
                        </div>
                      ) : (
                        <div className="space-y-3">

                          {currentComments.map(
                            (comment) => (
                              <div
                                key={
                                  comment.id
                                }
                                className="flex gap-3"
                              >

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                                  <PawPrint
                                    size={14}
                                  />
                                </div>

                                <div className="min-w-0 flex-1 rounded-xl bg-white p-3 dark:bg-[#111923]">

                                  <div className="flex items-start justify-between gap-2">

                                    <div>

                                      <p className="text-xs font-black">
                                        {comment
                                          .user
                                          ?.name ||
                                          "Pet Parent"}
                                      </p>

                                      <p className="mt-0.5 text-[10px] text-slate-400">
                                        {formatDate(
                                          comment.createdAt,
                                        )}
                                      </p>

                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteComment(
                                          postId,
                                          comment.id,
                                        )
                                      }
                                      className="text-slate-400 hover:text-red-500"
                                      title="Delete comment"
                                    >
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />
                                    </button>

                                  </div>

                                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                    {
                                      comment.text
                                    }
                                  </p>

                                </div>

                              </div>
                            ),
                          )}

                        </div>
                      )}

                      {/* ADD COMMENT */}

                      <div className="mt-4 flex items-center gap-2">

                        <input
                          type="text"
                          value={
                            commentInputs[
                              postId
                            ] || ""
                          }
                          onChange={(event) =>
                            setCommentInputs(
                              (previous) => ({
                                ...previous,
                                [postId]:
                                  event.target
                                    .value,
                              }),
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              addComment(
                                postId,
                              );
                            }
                          }}
                          placeholder="Write a comment..."
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-[#111923]"
                        />

                        <button
                          type="button"
                          disabled={
                            commentSubmitting[
                              postId
                            ]
                          }
                          onClick={() =>
                            addComment(
                              postId,
                            )
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>

                      </div>

                    </div>
                  )}

                </article>
              );
            })}

        </section>

        {/* ==================================================
            RIGHT SIDEBAR
        ================================================== */}

        <aside className="hidden lg:block">

          <div className="sticky top-[94px] space-y-5">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-500">
                    Your Pets
                  </p>

                  <h2 className="mt-1 text-lg font-black">
                    Pet Profiles
                  </h2>

                </div>

                <PawPrint
                  size={20}
                  className="text-orange-500"
                />

              </div>

              {petsLoading ? (
                <div className="mt-4 space-y-3">

                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                    />
                  ))}

                </div>
              ) : pets.length === 0 ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center dark:bg-[#111923]">

                  <p className="text-xs text-slate-400">
                    No pets found.
                  </p>

                </div>
              ) : (
                <div className="mt-4 space-y-2">

                  {pets.slice(0, 4).map(
                    (pet) => {
                      const petId =
                        pet._id ||
                        pet.id;

                      return (
                        <button
                          key={petId}
                          type="button"
                          onClick={() =>
                            setSelectedPetId(
                              petId,
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                            selectedPetId ===
                            petId
                              ? "bg-orange-50 dark:bg-orange-500/10"
                              : "hover:bg-slate-50 dark:hover:bg-[#111923]"
                          }`}
                        >

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                            <PawPrint
                              size={16}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-xs font-black">
                              {pet.name}
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                              {pet.breed ||
                                pet.species ||
                                "Pet"}
                            </p>

                          </div>

                        </button>
                      );
                    },
                  )}

                </div>
              )}

              {petsError && (
                <p className="mt-3 text-xs text-red-500">
                  {petsError}
                </p>
              )}

            </div>

            <div className="rounded-2xl bg-orange-500 p-5 text-white">

              <Sparkles size={22} />

              <h3 className="mt-4 text-base font-black">
                Make the community better
              </h3>

              <p className="mt-2 text-xs leading-5 text-orange-100">
                Share useful pet moments,
                adoption opportunities and
                experiences with other pet
                parents.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreatePost(true)
                }
                className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-orange-500"
              >
                <Plus size={15} />
                Create a Post
              </button>

            </div>

          </div>

        </aside>

      </div>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d131a]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-500">Community</p>
                <h2 className="mt-1 text-xl font-black">Edit your post</h2>
              </div>
              <button type="button" onClick={() => setEditingPost(null)} aria-label="Close edit dialog" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={19} /></button>
            </div>
            <div className="space-y-4 p-5">
              <label htmlFor="edit-community-caption" className="block text-xs font-black uppercase tracking-wider text-slate-500">Caption</label>
              <textarea
                id="edit-community-caption"
                value={editCaption}
                onChange={(event) => setEditCaption(event.target.value)}
                rows={5}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-[#111923]"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500 dark:border-slate-700">Cancel</button>
                <button type="button" disabled={editSubmitting || !editCaption.trim()} onClick={savePostEdit} className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-50">{editSubmitting ? "Saving..." : "Save changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          CREATE POST MODAL
      ================================================== */}

      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d131a]">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-500">
                  Community
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Create a Post
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreatePost(false);
                  clearSelectedImages();
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-5 p-5">

              {/* PET */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Pet
                </label>

                {petsLoading ? (
                  <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-400 dark:bg-slate-800">
                    Loading your pets...
                  </div>
                ) : pets.length === 0 ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-500">
                    You need to add a pet before
                    creating a community post.
                  </div>
                ) : (
                  <select
                    value={selectedPetId}
                    onChange={(event) =>
                      setSelectedPetId(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-[#111923]"
                  >
                    <option value="">
                      Select your pet
                    </option>

                    {pets.map((pet) => (
                      <option
                        key={
                          pet._id || pet.id
                        }
                        value={
                          pet._id || pet.id
                        }
                      >
                        {pet.name}
                        {pet.breed
                          ? ` • ${pet.breed}`
                          : ""}
                      </option>
                    ))}

                  </select>
                )}

              </div>

              {/* POST TYPE */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Post Type
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setPostType("normal")
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      postType === "normal"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >

                    <p className="text-xs font-black">
                      Normal Post
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Share a pet moment
                    </p>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPostType("adoption")
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      postType === "adoption"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >

                    <p className="text-xs font-black">
                      Adoption
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Find a home for your pet
                    </p>

                  </button>

                </div>

              </div>

              {/* CAPTION */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Caption
                </label>

                <textarea
                  value={caption}
                  onChange={(event) =>
                    setCaption(
                      event.target.value,
                    )
                  }
                  rows={5}
                  maxLength={1000}
                  placeholder="Share something about your pet..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-[#111923]"
                />

                <div className="mt-1 text-right text-[10px] text-slate-400">
                  {caption.length}/1000
                </div>

              </div>

              {/* PHOTOS */}

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Photos (up to {MAX_COMMUNITY_IMAGES})
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-500 transition hover:border-orange-400 hover:text-orange-500 dark:border-slate-700">
                  <ImageIcon size={17} /> Add photos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelection}
                    disabled={creating || selectedImages.length >= MAX_COMMUNITY_IMAGES}
                    className="sr-only"
                  />
                </label>
                {uploadError && <p role="alert" className="mt-2 text-xs text-red-500">{uploadError}</p>}
                {selectedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {selectedImages.map(({ file, preview }, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="relative">
                        <img src={preview} alt={`Selected photo ${index + 1}`} className="h-24 w-full rounded-lg bg-slate-100 object-contain dark:bg-slate-800" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(preview);
                            setSelectedImages((previous) => previous.filter((image) => image.preview !== preview));
                          }}
                          aria-label={`Remove ${file.name}`}
                          className="absolute right-1 top-1 rounded-full bg-slate-900/75 p-1 text-white"
                        ><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIONS */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePost(false);
                    setCaption("");
                    clearSelectedImages();
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    creating ||
                    !caption.trim() ||
                    !selectedPetId ||
                    pets.length === 0
                  }
                  onClick={createPost}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Publishing..."
                    : "Publish Post"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Community;
