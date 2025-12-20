import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSend = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(
        "If an account exists with this email, you will receive a password reset link."
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#23245d]">
            Forgot Password?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSend} className="px-6 py-6">
          {error && (
            <div className="mb-4 bg-red-100 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-100 text-green-800 px-4 py-3 rounded">
              {successMsg}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 mb-4 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3b3] focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            onClick={() => navigate("/reset-password")}
            className={`w-full py-2 rounded-lg text-white font-medium bg-gradient-to-r from-[#16a34a] to-[#22c55e] cursor-pointer`}
          >
            Send Reset Link
          </button>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-500 underline">
              Back to Login
            </Link>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Suthra Punjab
        </div>
      </div>
    </div>
  );
}
