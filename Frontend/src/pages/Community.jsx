import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  PawPrint,
  Search,
  Home,
  Users,
  HeartHandshake,
  MapPin,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Bookmark,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

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
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  }

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  }

  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }

  return created.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function Community() {
  const [activeSection, setActiveSection] =
    useState("feed");

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showCreatePost, setShowCreatePost] =
    useState(false);

  const [caption, setCaption] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [likedPosts, setLikedPosts] =
    useState({});

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
      id: "lost",
      label: "Lost & Found",
      icon: Search,
    },
    {
      id: "explore",
      label: "Explore",
      icon: Sparkles,
    },
  ];

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      let url =
        `${API_BASE_URL}/community/posts`;

      if (activeSection === "adoption") {
        url += "?type=adoption";
      }

      if (activeSection === "lost") {
        url += "?type=lost";
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load community posts.",
        );
      }

      setPosts(
        Array.isArray(data.posts)
          ? data.posts
          : [],
      );
    } catch (err) {
      console.error(
        "Community feed error:",
        err,
      );

      setError(
        err.message ||
          "Unable to load community.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [activeSection]);

  function toggleLike(postId) {
    setLikedPosts((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }));
  }

  async function createPost() {
    if (!caption.trim()) return;

    try {
      setCreating(true);

      const token =
        localStorage.getItem("smartPawToken");

      const response = await fetch(
        `${API_BASE_URL}/community/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            petId: "6aaee5e4a17458290f96f5b0",
            type: "normal",
            caption: caption.trim(),
            media: [],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create post.",
        );
      }

      setCaption("");
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

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900 dark:bg-[#080d12] dark:text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0d131a]/95">

        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center gap-5 px-4 sm:px-6">

          {/* Logo */}

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

          {/* Search */}

          <div className="mx-auto hidden max-w-md flex-1 md:block">

            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5 dark:bg-[#151d26]">

              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                type="text"
                placeholder="Search pets, people or posts..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

          {/* Right */}

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

      {/* ================= MAIN ================= */}

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_280px]">

        {/* ================= LEFT SIDEBAR ================= */}

        <aside className="hidden lg:block">

          <div className="sticky top-[94px]">

            {/* Profile */}

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

            {/* Navigation */}

            <div className="space-y-1">

              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(item.id)
                    }
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

            <div className="my-5 h-px bg-slate-200 dark:bg-slate-800" />

            {/* Community links */}

            <p className="px-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Your Community
            </p>

            <div className="mt-3 space-y-1">

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-[#111923]"
              >
                <Users size={18} />
                Friends
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-[#111923]"
              >
                <Bookmark size={18} />
                Saved Posts
              </button>

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

        {/* ================= CENTER FEED ================= */}

        <section className="min-w-0">

          {/* Mobile tabs */}

          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.id)
                  }
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

          {/* Feed title */}

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

                {activeSection === "lost" &&
                  "Lost & Found"}

                {activeSection === "explore" &&
                  "Explore Smart Paw"}
              </h1>

            </div>

          </div>

          {/* Create post box */}

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

          {/* Loading */}

          {loading && (
            <div className="space-y-4">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-white dark:bg-[#0d131a]"
                />
              ))}

            </div>
          )}

          {/* Error */}

          {!loading && error && (
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

          {/* Empty */}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0d131a]">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                  <PawPrint size={30} />
                </div>

                <h2 className="mt-5 text-lg font-black">
                  No posts yet
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Be the first pet parent to
                  share something with the
                  community.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(true)
                  }
                  className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
                >
                  Create First Post
                </button>

              </div>
            )}

          {/* Posts */}

          {!loading &&
            !error &&
            posts.length > 0 && (
              <div className="space-y-5">

                {posts.map((post) => {
                  const isLiked =
                    likedPosts[post._id];

                  return (
                    <article
                      key={post._id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0d131a]"
                    >

                      {/* Post header */}

                      <div className="flex items-center justify-between p-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                            <PawPrint size={20} />
                          </div>

                          <div>

                            <p className="text-sm font-bold">
                              {post.userId?.name ||
                                "Pet Parent"}
                            </p>

                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">

                              <span>
                                with{" "}
                                <span className="font-semibold text-slate-500 dark:text-slate-300">
                                  {post.petId?.name ||
                                    "their pet"}
                                </span>
                              </span>

                              <span>•</span>

                              <span>
                                {formatDate(
                                  post.createdAt,
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                        <button
                          type="button"
                          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal
                            size={19}
                          />
                        </button>

                      </div>

                      {/* Pet identity */}

                      {post.petId && (
                        <div className="mx-5 mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-[#111923]">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-500 dark:bg-[#0d131a]">
                              <PawPrint
                                size={17}
                              />
                            </div>

                            <div>

                              <p className="text-sm font-bold">
                                {post.petId.name}
                              </p>

                              <p className="text-[11px] text-slate-400">
                                {post.petId.breed ||
                                  post.petId.species}

                                {post.petId.age
                                  ? ` • ${post.petId.age} years`
                                  : ""}

                                {post.petId.gender
                                  ? ` • ${post.petId.gender}`
                                  : ""}
                              </p>

                            </div>

                          </div>

                          <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                            Pet Profile
                          </span>

                        </div>
                      )}

                      {/* Caption */}

                      {post.caption && (
                        <div className="px-5 pb-4">

                          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {post.caption}
                          </p>

                        </div>
                      )}

                      {/* Media */}

                      {Array.isArray(
                        post.media,
                      ) &&
                        post.media.length > 0 && (
                          <div className="grid grid-cols-1 overflow-hidden">
                            {post.media.map(
                              (media, index) => (
                                <img
                                  key={index}
                                  src={
                                    typeof media ===
                                    "string"
                                      ? media
                                      : media.url
                                  }
                                  alt={
                                    post.petId
                                      ?.name ||
                                    "Pet post"
                                  }
                                  className="max-h-[500px] w-full object-cover"
                                />
                              ),
                            )}
                          </div>
                        )}

                      {/* Adoption card */}

                      {post.type ===
                        "adoption" && (
                        <div className="mx-5 mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                Adoption
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                Looking for a loving
                                home
                              </p>

                            </div>

                            <HeartHandshake
                              size={24}
                              className="text-orange-500"
                            />

                          </div>

                          {post.adoption
                            ?.location && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <MapPin
                                size={14}
                              />
                              {
                                post.adoption
                                  .location
                              }
                            </div>
                          )}

                        </div>
                      )}

                      {/* Engagement */}

                      <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-400">

                        <span>
                          {post.likesCount || 0} likes
                        </span>

                        <span>
                          {post.commentsCount ||
                            0} comments
                        </span>

                      </div>

                      {/* Actions */}

                      <div className="mx-5 flex border-t border-slate-100 dark:border-slate-800">

                        <button
                          type="button"
                          onClick={() =>
                            toggleLike(
                              post._id,
                            )
                          }
                          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
                            isLiked
                              ? "text-red-500"
                              : "text-slate-500 hover:text-red-500 dark:text-slate-400"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={
                              isLiked
                                ? "currentColor"
                                : "none"
                            }
                          />

                          {isLiked
                            ? "Liked"
                            : "Like"}
                        </button>

                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-500 hover:text-orange-500 dark:text-slate-400"
                        >
                          <MessageCircle
                            size={18}
                          />
                          Comment
                        </button>

                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-500 hover:text-orange-500 dark:text-slate-400"
                        >
                          <Share2 size={18} />
                          Share
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

        </section>

        {/* ================= RIGHT SIDEBAR ================= */}

        <aside className="hidden xl:block">

          <div className="sticky top-[94px] space-y-5">

            {/* Stories */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0d131a]">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-sm font-black">
                  Pet Stories
                </h2>

                <button
                  type="button"
                  className="text-xs font-bold text-orange-500"
                >
                  See all
                </button>

              </div>

              <div className="flex gap-3 overflow-hidden">

                {[
                  "🐶",
                  "🐱",
                  "🐰",
                  "🐹",
                ].map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex min-w-[52px] flex-col items-center gap-2"
                  >

                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-400 bg-orange-50 text-xl dark:bg-orange-500/10">
                      {emoji}
                    </div>

                    <span className="max-w-[55px] truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {[
                        "Leo",
                        "Milo",
                        "Luna",
                        "Rocky",
                      ][index]}
                    </span>

                  </button>
                ))}

              </div>

            </div>

            {/* Suggested Pet Parents */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0d131a]">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-sm font-black">
                  Pet Parents
                </h2>

                <button
                  type="button"
                  className="text-xs font-bold text-orange-500"
                >
                  See all
                </button>

              </div>

              <div className="space-y-4">

                {[
                  {
                    name: "Pet Lover",
                    pet: "Golden Retriever",
                    emoji: "🐕",
                  },
                  {
                    name: "Cat Mom",
                    pet: "Persian Cat",
                    emoji: "🐈",
                  },
                  {
                    name: "Happy Paws",
                    pet: "Beagle",
                    emoji: "🐶",
                  },
                ].map((person) => (
                  <div
                    key={person.name}
                    className="flex items-center gap-3"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg dark:bg-orange-500/10">
                      {person.emoji}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-bold">
                        {person.name}
                      </p>

                      <p className="truncate text-[10px] text-slate-400">
                        {person.pet}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="rounded-full border border-orange-200 px-3 py-1 text-[10px] font-bold text-orange-500 hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10"
                    >
                      Follow
                    </button>

                  </div>
                ))}

              </div>

            </div>

            {/* Adoption highlight */}

            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">

              <HeartHandshake size={26} />

              <p className="mt-4 text-lg font-black">
                Give a pet a home.
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-100">
                Discover pets waiting for
                their forever family.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveSection("adoption")
                }
                className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-orange-600"
              >
                Explore Adoption
                <ChevronRight size={14} />
              </button>

            </div>

          </div>

        </aside>

      </div>

      {/* ================= CREATE POST MODAL ================= */}

      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0d131a]">

            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">

              <div>

                <h2 className="text-xl font-black">
                  Create a Post
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Share a moment with the
                  Smart Paw community.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreatePost(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                ×
              </button>

            </div>

            {/* Modal body */}

            <div className="p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/10">
                  <PawPrint size={20} />
                </div>

                <div>

                  <p className="text-sm font-bold">
                    Pet Parent
                  </p>

                  <p className="text-xs text-slate-400">
                    Posting with Leo
                  </p>

                </div>

              </div>

              <textarea
                value={caption}
                onChange={(event) =>
                  setCaption(
                    event.target.value,
                  )
                }
                placeholder="What is your pet up to today?"
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-slate-800 dark:bg-[#111923]"
              />

              <div className="mt-4 flex items-center gap-3">

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ImageIcon size={16} />
                  Add Photo
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Smile size={16} />
                  Feeling
                </button>

              </div>

            </div>

            {/* Modal footer */}

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">

              <button
                type="button"
                onClick={() =>
                  setShowCreatePost(false)
                }
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  creating ||
                  !caption.trim()
                }
                onClick={createPost}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Posting..."
                  : "Publish Post"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Community;