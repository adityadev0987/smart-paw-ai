import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    alert("Account created successfully!");
  };

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Join Smart Paw AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create an account to manage your pet's care.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Your name"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Create a password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              placeholder="Confirm your password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {error && (
            <p className="mt-3 text-xs font-medium text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Create Account
          </button>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Register;