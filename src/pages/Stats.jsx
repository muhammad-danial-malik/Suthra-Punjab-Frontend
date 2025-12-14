import Topbar from "@/components/topbar";
import React, { useMemo, useState } from "react";
import { useGetPenaltiesStatsQuery, useGetcirclesQuery, useGetpenaltiesQuery } from "../api/apiSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Check,
  XCircle,
  TrendingUp,
  DollarSign,
  Calculator,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

const Stats = () => {
  const { data: statsData } = useGetPenaltiesStatsQuery();
  const { data: circlesData } = useGetcirclesQuery();
  const { data: penaltiesData } = useGetpenaltiesQuery();

  const data = statsData?.data;
  const CircleData = circlesData?.data || [];
  const PenaltiesData = penaltiesData?.data || [];

  // State for selected circle
  const [selectedCircle, setSelectedCircle] = useState(null);

  console.log("stat", data);
  console.log("CircleData", CircleData);
  console.log("PenaltiesData", PenaltiesData);

  // Generate dynamic circle data with real penalty counts
  const circleData = useMemo(() => {
    return CircleData.map((circle, index) => {
      const totalPenalties = PenaltiesData.filter(penalty =>
        penalty.circle && penalty.circle._id === circle._id
      ).length;

      return {
        name: circle.name,
        zone: circle.name, // Using circle name as zone since zone info might not be separate
        department: circle.department?.name || 'Not Assigned',
        value: totalPenalties || 1, // Use penalty count as value, minimum 1 for chart visibility
        penalties: totalPenalties,
        isActive: circle.isActive,
        circleId: circle._id
      };
    });
  }, [CircleData, PenaltiesData]);

  // Calculate statistics for selected circle or all penalties
  const filteredStats = useMemo(() => {
    let relevantPenalties = PenaltiesData;

    if (selectedCircle) {
      relevantPenalties = PenaltiesData.filter(penalty =>
        penalty.circle && penalty.circle._id === selectedCircle.circleId
      );
    }

    // Calculate stats from filtered penalties
    const total = relevantPenalties.length;
    const newPenalties = relevantPenalties.filter(p => p.status.toLowerCase() === 'new').length;
    const pending = relevantPenalties.filter(p => p.status.toLowerCase() === 'pending').length;
    const overdue = relevantPenalties.filter(p => p.status.toLowerCase() === 'overdue').length;
    const resolved = relevantPenalties.filter(p => p.status.toLowerCase() === 'resolved').length;
    const approved = relevantPenalties.filter(p => p.status.toLowerCase() === 'approved').length;
    const rejected = relevantPenalties.filter(p => p.status.toLowerCase() === 'rejected').length;

    const totalAmount = relevantPenalties.reduce((sum, penalty) => sum + (penalty.penaltyAmount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    const resolutionRate = total > 0 ? ((resolved + approved) / total * 100) : 0;

    return {
      total,
      new: newPenalties,
      pending,
      overdue,
      resolved,
      approved,
      rejected,
      totalPenaltyAmount: totalAmount,
      avgPenaltyAmount: avgAmount,
      resolutionRate
    };
  }, [PenaltiesData, selectedCircle]);

  // Generate dynamic colors for circles
  const CIRCLE_COLORS = useMemo(() => {
    const baseColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"];
    return CircleData.map((_, index) => baseColors[index % baseColors.length]);
  }, [CircleData]);

  // Handle circle selection
  const handleCircleClick = (circle) => {
    setSelectedCircle(selectedCircle?.circleId === circle.circleId ? null : circle);
  };

  // Reset to show all penalties
  const handleShowAll = () => {
    setSelectedCircle(null);
  }; const stats = [
    {
      title: "Total Penalties",
      value: filteredStats.total || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "New Penalties",
      value: filteredStats.new || 0,
      icon: Plus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Pending Penalties",
      value: filteredStats.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Overdue Penalties",
      value: filteredStats.overdue || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Resolved Penalties",
      value: filteredStats.resolved || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Approved Penalties",
      value: filteredStats.approved || 0,
      icon: Check,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      title: "Rejected Penalties",
      value: filteredStats.rejected || 0,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    {
      title: "Resolution Rate",
      value: `${filteredStats.resolutionRate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Total Amount",
      value: `Rs.${filteredStats.totalPenaltyAmount?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      title: "Avg Amount",
      value: `Rs.${filteredStats.avgPenaltyAmount?.toFixed(0) || 0}`,
      icon: Calculator,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
  ];

  const barData = [
    { name: "New", value: filteredStats.new || 0, color: "#10B981" },
    { name: "Pending", value: filteredStats.pending || 0, color: "#F59E0B" },
    { name: "Overdue", value: filteredStats.overdue || 0, color: "#EF4444" },
    { name: "Resolved", value: filteredStats.resolved || 0, color: "#06B6D4" },
    { name: "Approved", value: filteredStats.approved || 0, color: "#8B5CF6" },
    { name: "Rejected", value: filteredStats.rejected || 0, color: "#6B7280" },
  ];

  const pieData = [
    { name: "New", value: filteredStats.new || 0 },
    { name: "Pending", value: filteredStats.pending || 0 },
    { name: "Overdue", value: filteredStats.overdue || 0 },
    { name: "Resolved", value: filteredStats.resolved || 0 },
    { name: "Approved", value: filteredStats.approved || 0 },
    { name: "Rejected", value: filteredStats.rejected || 0 },
  ];

  // Circle data with zones and departments - REMOVED (using dynamic data now)

  const COLORS = [
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#8B5CF6",
    "#6B7280",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CircleTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-gray-800 text-lg">{data.name}</p>
          <p className="text-sm text-gray-600">{data.department}</p>
          <p className="text-sm text-gray-500">Status: {data.isActive ? 'Active' : 'Inactive'}</p>
          <p className="font-semibold text-gray-700">Total Penalties: {data.penalties}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <div>
      <Topbar />
      <main className="flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCircle ? `${selectedCircle.name} - Penalties Statistics` : 'Penalties Statistics Dashboard'}
              </h1>
              <p className="text-gray-600">
                {selectedCircle
                  ? `Detailed overview of penalty metrics for ${selectedCircle.name}`
                  : 'Comprehensive overview of penalty management metrics'
                }
              </p>
            </div>
            {selectedCircle && (
              <button
                onClick={handleShowAll}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Show All Penalties
              </button>
            )}
          </div>
        </div>
        {/* Circle Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <PieChartIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Circle Distribution by Zone
            </h2>
          </div>

          {/* Summary Stats for Circles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-sm">C</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Circles</p>
                  <p className="text-xl font-bold text-blue-700">{circleData.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Active Circles</p>
                  <p className="text-xl font-bold text-green-700">
                    {circleData.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 font-semibold text-sm">P</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Total Circle Penalties</p>
                  <p className="text-xl font-bold text-red-700">
                    {circleData.reduce((sum, circle) => sum + circle.penalties, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart for Circles */}
            <div>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={circleData.filter(circle => circle.value > 0)} // Only show circles with penalties
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 5 ? `${name}` : ""
                    }
                    outerRadius={120}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {circleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CIRCLE_COLORS[index % CIRCLE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CircleTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Circle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Circle Details</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {circleData.map((circle, index) => (
                  <div
                    key={index}
                    onClick={() => handleCircleClick(circle)}
                    className={`flex items-start p-4 rounded-lg border transition-all duration-200 cursor-pointer ${selectedCircle?.circleId === circle.circleId
                        ? 'border-blue-500 bg-blue-50 shadow-lg border-2'
                        : 'border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:border-blue-300 hover:border-2'
                      }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3 mt-1 flex-shrink-0"
                      style={{ backgroundColor: CIRCLE_COLORS[index % CIRCLE_COLORS.length] }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${selectedCircle?.circleId === circle.circleId ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                          {circle.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${circle.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {circle.isActive ? "Active" : "Inactive"}
                        </span>
                        {selectedCircle?.circleId === circle.circleId && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${selectedCircle?.circleId === circle.circleId ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                        {circle.department}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-sm font-medium ${selectedCircle?.circleId === circle.circleId ? 'text-blue-800' : 'text-gray-700'
                          }`}>
                          Penalties:
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${circle.penalties > 10
                            ? 'bg-red-100 text-red-800'
                            : circle.penalties > 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : circle.penalties > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                          {circle.penalties}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} ${stat.bgColor} rounded-full mb-4`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Penalties by Status
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <PieChartIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Status Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


      </main>
    </div>
  );
};

export default Stats;
