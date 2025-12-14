import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Building2, AlertTriangle } from "lucide-react";
import { useLoginFormMutation } from "@/api/apiSlice";

export default function Login() {
  const navigate = useNavigate();
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setusername] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginForm] = useLoginFormMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await loginForm({ username, password }).unwrap();
      console.log("Login successful:", response);

      // Check if user role is admin
      const userRole = response.data.user?.role;
      if (userRole !== "admin") {
        setError("Only admin can login. Access denied.");
        return;
      }

      // Store tokens only for admin users
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/home", { replace: true });
      alert("Login successful!");
    } catch (err) {
      // --- 4. Handle Error ---
      console.error("Login failed:", err);
      const errorMessage =
        err.data?.message ||
        err.error ||
        "An unexpected error occurred during login.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header / Logo */}
        <div className="px-6 py-6 bg-gradient-to-r from-green-600 to-green-700 flex items-center gap-3">
          {/* Government Logo */}
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Building2 className="text-green-600" size={36} strokeWidth={2} />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-wide">
              Suthra Punjab
            </div>
            <div className="text-xs text-green-100 mt-1">
              Penalty Management System
            </div>
            <div className="text-xs text-green-100">Government of Punjab</div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="px-8 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Login to Your Account
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your credentials to access the portal
            </p>
          </div>

          {/* Error area */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={20}
                  strokeWidth={2}
                  className="text-red-600"
                />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Email */}
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email / Username
          </label>
          <input
            type="text"
            placeholder="Enter your email or username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            className="mb-4 block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
          />

          {/* Password */}
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative mb-6">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12 transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <Eye size={22} />
            </button>
          </div>

          {/* Login button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg text-white font-semibold cursor-pointer bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                loading ? "opacity-70" : ""
              }`}
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-500 underline">
              Forgot Password?
            </Link>
          </div> */}
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">Government of Punjab</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Suthra Punjab - Penalty Management System
          </p>
        </div>
      </div>
    </div>
  );
}
