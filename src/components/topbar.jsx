import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";

const Topbar = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/home");
  };

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = userData?.fullName || "SB Engineering JV";

  return (
    <div className="bg-green-600 shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span className="font-semibold text-base">Monitoring System</span>
          </button>
          <span className="text-white/60 font-light">|</span>
          <span className="font-medium text-sm">Suthra Punjab</span>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center gap-6">
          <div className="text-white text-sm flex items-center gap-2">
            <span className="text-white/80">Office:</span>
            <span className="font-semibold">Tehsil Office, Sadiqabad</span>
          </div>
          <div className="h-6 w-px bg-white/30"></div>
          <div className="text-white text-sm flex items-center gap-2">
            <span className="text-white/80">User:</span>
            <span className="font-semibold">{userName}</span>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all hover:shadow-md cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
