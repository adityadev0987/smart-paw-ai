import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

export default function Login() {
  const navigate = useNavigate();

  const { login, theme } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(
        formData.email.trim(),
        formData.password,
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err?.message ||
          "Unable to login. Please check your credentials and try again.",
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
        {/* Login Card */}
        <section
          className={`w-full max-w-[520px] rounded-[2rem] border p-[clamp(1rem,2.2vh,1.75rem)] shadow-2xl transition-colors duration-300 ${
            isDark
              ? "border-slate-800 bg-[#111820] shadow-black/30"
              : "border-slate-200 bg-white shadow-slate-200/70"
          }`}
        >
          {/* Icon */}
          <div className="mb-[clamp(0.75rem,1.8vh,1.25rem)] flex justify-center">
            <div
              className={`flex h-[clamp(2.75rem,6vh,3.5rem)] w-[clamp(2.75rem,6vh,3.5rem)] items-center justify-center rounded-2xl ${
                isDark
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <PawPrint
                size={26}
                className="h-[clamp(1.35rem,3vh,1.7rem)] w-[clamp(1.35rem,3vh,1.7rem)]"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-[clamp(1rem,2.5vh,1.75rem)] text-center">
            <div
              className={`mx-auto mb-[clamp(0.5rem,1.2vh,1rem)] inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isDark
                  ? "border-orange-500/20 bg-orange-500/[0.07] text-orange-400"
                  : "border-orange-200 bg-orange-50 text-orange-600"
              }`}
            >
              <Sparkles size={13} />
              Welcome back
            </div>

            <h1
              className={`text-[clamp(1.7rem,4vh,2.25rem)] font-bold leading-tight tracking-tight ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              Welcome back,
              <br />
              <span className="text-orange-500">
                pet parent.
              </span>
            </h1>

            <p
              className={`mt-2 text-sm leading-5 ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Continue managing your pet's care and
              health information.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-[clamp(0.75rem,1.8vh,1.25rem)]"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`mb-1.5 block text-sm font-semibold ${
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
                  className={`h-[clamp(2.75rem,6vh,3.25rem)] w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDark
                      ? "border-slate-700 bg-[#18212b] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className={`text-sm font-semibold ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-800"
                  }`}
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-orange-500 transition hover:text-orange-400"
                >
                  Forgot password?
                </button>
              </div>

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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`h-[clamp(2.75rem,6vh,3.25rem)] w-full rounded-xl border px-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-[clamp(2.75rem,6vh,3.25rem)] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-[clamp(1rem,2.2vh,1.5rem)] flex items-center gap-3">
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

          {/* Register */}
          <div className="text-center">
            <p
              className={`text-sm ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-orange-500 transition hover:text-orange-400"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Security */}
          <div
            className={`mt-[clamp(0.75rem,1.8vh,1.25rem)] flex items-center justify-center gap-2 text-[11px] ${
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