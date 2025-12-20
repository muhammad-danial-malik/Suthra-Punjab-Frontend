import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="text-center px-6">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle
                className="text-green-600"
                size={64}
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-extrabold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist or has been moved.
          Please check the URL or return to the homepage.
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          <Home size={20} />
          <span>Back to Home</span>
        </button>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            © 2025 Local Government & Community Development Department, Punjab
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
