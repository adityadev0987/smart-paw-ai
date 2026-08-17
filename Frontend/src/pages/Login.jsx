import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    alert("Login successful!");
  };

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Welcome Back
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Sign in to continue managing your pet's care.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
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
              placeholder="Enter your password"
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
            Login
          </button>

          <p className="mt-5 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;