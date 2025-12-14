import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams(); // token is mock; not verified
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = newPw && confirmPw && newPw === confirmPw;
  const meetsMinLength = newPw.length >= 8;
  const canReset = passwordsMatch && meetsMinLength;

  useEffect(() => {
    // If token missing, send user back to login (or show a message)
    if (!token) {
      // keep them on page but maybe show a warning — for now don't redirect
    }
  }, [token]);

  const handleReset = (e) => {
    e.preventDefault();
    setError("");
    if (!meetsMinLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    // mock server call then success
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Password reset successful! Redirecting to login...");
      // auto redirect after 3s
      setTimeout(() => navigate("/login"), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-6">
          <h2 className="text-2xl font-bold text-[#23245d]">Reset Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleReset} className="px-6 py-4">
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
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="mt-1 mb-2 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3b3] focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {/* {showNew ? "🙈" : "👁️"} */}
            </button>
          </div>

          {/* strength indicator */}
          <div className="flex items-center justify-between text-sm mb-2">
            <div>
              <span className={`px-2 py-1 rounded `}></span>
            </div>
            <div className="text-xs text-gray-400">Minimum 8 characters</div>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="mt-1 mb-3 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3b3] focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {/* {showConfirm ? "🙈" : "👁️"} */}
            </button>
          </div>

          <button
            type="submit"
            disabled={!canReset || loading}
            className={`w-full py-2 rounded-lg text-white font-medium bg-gradient-to-r from-[#16a34a] to-[#22c55e]`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Reset Password"
            )}
          </button>

          <div className="mt-4 text-center text-sm">
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
