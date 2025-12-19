import React from "react";
import Card from "../components/card";
import { cardsData } from "../data/data";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/sideBar";
import { Building2, Bell, RefreshCw, Trophy } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleClick = (index) => {
    if (index == 0) {
      navigate("/stats");
    } else if (index == 1) {
      navigate("/penalties");
    } else if (index == 6) {
      navigate("/maps");
    } else if (index == 2) {
      navigate("/users");
    } else if (index == 3) {
      navigate("/circles");
    } else if (index == 4) {
      navigate("/department");
    } else if (index == 5) {
      navigate("/heap-history");
    } else if (index == 7) {
      navigate("/penalty-types");
    } else if (index == 8) {
      navigate("/billing-types");
    } else if (index == 9) {
      navigate("/billing-reports");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <SideBar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md">
                <Building2 className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                  Suthra Punjab Monitoring System
                </h1>
                <p className="text-xs text-gray-500">SB Engineering JV</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/scoreboard")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow"
              >
                <Trophy size={16} />
                Scoreboard
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h2>
            <p className="text-gray-600">
              Select a module to get started with the management system
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cardsData.map((card, index) => (
              <Card
                key={index}
                title={card.title}
                icon={card.icon}
                color={card.color}
                onClick={() => handleClick(index)}
              />
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold">
                Developed by NUEX SOLUTIONS.
              </span>{" "}
              All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
