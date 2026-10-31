import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nevigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await handleLogin({ email, password });
      nevigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-gray-600 bg-gray-800 p-8 shadow-2xl sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg">
            L
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-400">
            Welcome Back
          </h1>

          <p className="mt-2 text-md text-gray-500">
            Please enter your details to sign in.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-300 p-3 text-lg text-red-700"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-md font-semibold text-gray-400"
            >
              Email Address
            </label>

            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-500 bg-gray-900 px-4 py-3 text-gray-400 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-800"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-md font-semibold text-gray-400"
              >
                Password
              </label>

              <a
                href="/forgot-password"
                className="text-md font-medium text-indigo-600 transition hover:text-indigo-800"
              >
                Forgot password?
              </a>
            </div>

            <div className="relative">
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-gray-500 bg-gray-900 px-4 py-3 pr-20 text-gray-400 outline-none transition placeholder:text-gray-400 focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-md font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
            />

            <label
              htmlFor="remember"
              className="cursor-pointer text-md text-gray-500"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className=" cursor-pointer w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 active:translate-y-0"
          >
            {submitting ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-lg text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
