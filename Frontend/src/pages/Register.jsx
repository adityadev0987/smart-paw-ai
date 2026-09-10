import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PawPrint,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

export default function Register() {
  const navigate = useNavigate();

  const { register, theme } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters long.",
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-[100dvh] w-full transition-colors duration-300 ${
        isDark
          ? "bg-[#0b0f14] text-slate-100"
          : "bg-[#faf9f7] text-slate-900"
      }`}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-96 w-96 rounded-full blur-3xl ${
            isDark
              ? "bg-orange-500/[0.06]"
              : "bg-orange-400/[0.08]"
          }`}
        />

        <div
          className={`absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl ${
            isDark
              ? "bg-orange-500/[0.04]"
              : "bg-orange-300/[0.07]"
          }`}
        />
      </div>

      {/* Main */}
      <main className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-3 sm:px-5 sm:py-4">
        {/* Register Card */}
        <section
          className={`w-full max-w-[520px] rounded-[2rem] border p-[clamp(1rem,2vh,1.5rem)] shadow-2xl transition-colors duration-300 ${
            isDark
              ? "border-slate-800 bg-[#111820] shadow-black/30"
              : "border-slate-200 bg-white shadow-slate-200/70"
          }`}
        >
          {/* Icon */}
          <div className="mb-[clamp(0.6rem,1.5vh,1rem)] flex justify-center">
            <div
              className={`flex h-[clamp(2.5rem,5.5vh,3.25rem)] w-[clamp(2.5rem,5.5vh,3.25rem)] items-center justify-center rounded-2xl ${
                isDark
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <PawPrint
                size={25}
                className="h-[clamp(1.25rem,2.8vh,1.6rem)] w-[clamp(1.25rem,2.8vh,1.6rem)]"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-[clamp(0.75rem,1.8vh,1.25rem)] text-center">
            <div
              className={`mx-auto mb-[clamp(0.4rem,1vh,0.75rem)] inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isDark
                  ? "border-orange-500/20 bg-orange-500/[0.07] text-orange-400"
                  : "border-orange-200 bg-orange-50 text-orange-600"
              }`}
            >
              <PawPrint size={13} />
              Create your account
            </div>

            <h1
              className={`text-[clamp(1.6rem,3.6vh,2.15rem)] font-bold leading-tight tracking-tight ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Start your
              <br />
              <span className="text-orange-500">
                Smart Paw journey.
              </span>
            </h1>

            <p
              className={`mt-2 text-sm leading-5 ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Create your account to manage your pet's
              care and health information.
            </p>
          </div>

          {/* Register Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-[clamp(0.55rem,1.35vh,0.85rem)]"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className={`mb-1 block text-sm font-semibold ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={loading}
                  className={`h-[clamp(2.5rem,5.5vh,3rem)] w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDark
                      ? "border-slate-700 bg-[#18212b] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`mb-1 block text-sm font-semibold ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className={`h-[clamp(2.5rem,5.5vh,3rem)] w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDark
                      ? "border-slate-700 bg-[#18212b] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className={`mb-1 block text-sm font-semibold ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={`h-[clamp(2.5rem,5.5vh,3rem)] w-full rounded-xl border px-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDark
                      ? "border-slate-700 bg-[#18212b] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${
                    isDark
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`mb-1 block text-sm font-semibold ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={`h-[clamp(2.5rem,5.5vh,3rem)] w-full rounded-xl border px-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDark
                      ? "border-slate-700 bg-[#18212b] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value,
                    )
                  }
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${
                    isDark
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className={`rounded-xl border px-4 py-2.5 text-sm leading-5 ${
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {error}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-1 flex h-[clamp(2.5rem,5.5vh,3rem)] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-[clamp(0.8rem,1.8vh,1.25rem)] flex items-center gap-3">
            <div
              className={`h-px flex-1 ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }`}
            />

            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Smart Paw AI
            </span>

            <div
              className={`h-px flex-1 ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }`}
            />
          </div>

          {/* Login */}
          <div className="text-center">
            <p
              className={`text-sm ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-orange-500 transition hover:text-orange-400"
              >
                Login
              </Link>
            </p>
          </div>

          {/* Security */}
          <div
            className={`mt-[clamp(0.6rem,1.5vh,1rem)] flex items-center justify-center gap-2 text-[11px] ${
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <ShieldCheck
              size={14}
              className="text-orange-500"
            />

            <span>
              Secure pet care dashboard access
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}