import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { registerUser } from "../services/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login");
    } catch (error) {
      setError(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <main className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111820] dark:shadow-black/20 lg:grid-cols-2">
          {/* Branding panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-black/5" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <PawPrint size={28} />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
                Smart Paw AI
              </p>

              <h2 className="mt-3 max-w-sm text-4xl font-bold leading-tight">
                Start your smarter pet care journey.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-orange-50">
                Create your account and keep your pet's care, health records,
                and daily routines organized.
              </p>
            </div>

            <div className="relative space-y-3">
              {[
                "Create and manage pet profiles",
                "Track important health records",
                "Get smarter care guidance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                    <CheckCircle2 size={15} />
                  </div>

                  <span className="text-sm font-medium text-orange-50">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Register panel */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              {/* Mobile branding */}
              <div className="mb-7 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <PawPrint size={21} />
                </div>

                <div>
                  <p className="font-bold">Smart Paw AI</p>
                  <p className="text-xs text-slate-400">
                    Smart pet care
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
                  <Sparkles size={13} />
                  JOIN SMART PAW AI
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Set up your account to start managing your pet's care.
                </p>
              </div>

              <form
                onSubmit={handleRegister}
                className="mt-8 space-y-4"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold"
                  >
                    Full name
                  </label>

                  <div className="relative mt-2">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setError("");
                      }}
                      placeholder="Your name"
                      disabled={isLoading}
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold"
                  >
                    Email address
                  </label>

                  <div className="relative mt-2">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Create a password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold"
                  >
                    Confirm password
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-orange-500 transition hover:text-orange-600"
                  >
                    Login
                  </Link>
                </p>
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <ShieldCheck size={14} />
                Your account helps keep your pet care organized
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;