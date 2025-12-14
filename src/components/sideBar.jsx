import React from "react";
// import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/api/apiSlice";
import { Building2, User, CheckCircle2, CreditCard, Phone, Mail, MapPin, Briefcase, LogOut, Settings, Inbox, Bell } from "lucide-react";

const SideBar = () => {
  const [logout] = useLogoutMutation();
  // const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Calling logout API...");
      const res = await logout().unwrap();
      console.log("Logout response:", res);

      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } catch (e) {
        console.warn("Failed to clear localStorage:", e);
      }

      alert("Logout successful!");
      console.log(res);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // const handleNotificationClick = () => {
  //   navigate('/notifications');
  // };

  return (
    <div
      className="bg-white shadow-xl transition-all duration-300 flex flex-col items-center relative w-80 m-4 rounded-lg border border-gray-100"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      {/* Government Logo/Header */}
      <div className="w-full bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-t-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <Building2 className="text-green-600" size={24} strokeWidth={2.5} />
          </div>
          <div className="text-white text-center">
            <h3 className="font-bold text-sm">Suthra Punjab</h3>
            <p className="text-xs opacity-90">Management System</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex flex-col items-center text-center p-6 w-full">
        <div className="relative mb-4">
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-28 h-28 flex items-center justify-center shadow-lg border-4 border-white">
            <User className="text-green-700" size={60} strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <CheckCircle2 className="text-white" size={16} strokeWidth={3} />
          </div>
        </div>

        <div className="mb-4 px-4 py-2 bg-green-50 rounded-full border border-green-200">
          <h2 className="text-base font-bold text-gray-800">SB Engineering JV</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 px-3 py-1 bg-gray-100 rounded-full">Others / Fixed</p>

        {/* User Details */}
        <div className="text-sm text-gray-700 space-y-3 w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="text-green-600" size={16} strokeWidth={2} />
            <span className="text-gray-800">31304-4036510-9</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-green-600" size={16} strokeWidth={2} />
            <span className="text-gray-800">03008627837</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-green-600" size={16} strokeWidth={2} />
            <span className="text-gray-800 break-all text-xs">masters.pk70@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-green-600" size={16} strokeWidth={2} />
            <span className="text-gray-800 text-xs">Tehsil Office, Sadiqabad</span>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="text-green-600" size={16} strokeWidth={2} />
            <span className="text-gray-800 font-medium">Contractor</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full px-6 pb-6 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>

        {/* Bottom Icon Buttons */}
        <div className="flex justify-center pt-2 mx-auto">
    
          {/* <button
            onClick={handleNotificationClick}
            className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-green-100 hover:to-green-200 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md relative cursor-pointer"
          >
            <Bell className="text-gray-600" size={20} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">3</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};
export default SideBar;
