import React, { useMemo, useState } from "react";
import Topbar from "../components/topbar";
import {
  useGetAllCirclesQuery,
  useGetUserScoreboardQuery,
} from "../api/apiSlice";
import {
  Trophy,
  Filter,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  Building2,
  ClipboardCheck,
  BadgeCheck,
  Clock3,
  Layers,
} from "lucide-react";

const Scoreboard = () => {
  const [role, setRole] = useState("all");
  const [circleId, setCircleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: circleRes, isLoading: loadingCircles } =
    useGetAllCirclesQuery();
  const query = useMemo(
    () => ({
      role,
      circleId: circleId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit,
    }),
    [role, circleId, startDate, endDate, page, limit]
  );
  const {
    data: sbRes,
    isLoading,
    isFetching,
    error,
  } = useGetUserScoreboardQuery(query);

  const circles = circleRes?.data || circleRes || [];
  const payload = sbRes?.data || sbRes || {};
  const scoreboard = payload?.scoreboard || [];
  const pagination = payload?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit,
  };

  const resetFilters = () => {
    setRole("all");
    setCircleId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Topbar />
      <main className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="text-purple-600" size={20} />
                <h1 className="text-xl font-bold text-gray-800">
                  User Scoreboard
                </h1>
              </div>
              <p className="text-xs text-gray-500">
                Performance of inspectors and circle owners
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {isFetching ? "Refreshing..." : null}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-gray-700" size={18} />
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All</option>
                    <option value="inspection">Inspectors</option>
                    <option value="circle_owner">Circle Owners</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Circle
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={circleId}
                    onChange={(e) => {
                      setCircleId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    disabled={loadingCircles}
                  >
                    <option value="">All Circles</option>
                    {Array.isArray(circles) &&
                      circles.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <CalendarIcon
                    size={16}
                    className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <CalendarIcon
                    size={16}
                    className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Reset
              </button>
              <div className="ml-auto">
                <label className="text-sm text-gray-600 mr-2">Per Page</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="border-gray-300 rounded-lg py-2"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Total Users (page)
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {scoreboard.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Layers className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Pages</p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {pagination.currentPage}/{pagination.totalPages || 1}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <p className="text-2xl font-semibold text-amber-600 capitalize">
                    {role.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sr#
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Key Metrics
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading scoreboard...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-red-600"
                      >
                        Failed to load. Try refreshing.
                      </td>
                    </tr>
                  ) : scoreboard.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No results for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    scoreboard.map((u, idx) => (
                      <tr key={u.userId} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {(pagination.currentPage - 1) *
                              (pagination.limit || 10) +
                              idx +
                              1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.profilePic}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {u.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === "circle_owner" ? (
                            <div className="text-sm text-gray-700">
                              {u.assignedCircle?.name || "-"}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1 text-xs text-gray-700">
                              {(u.assignedCircles || []).map((c) => (
                                <span
                                  key={c._id}
                                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {c.name}
                                </span>
                              ))}
                              {(!u.assignedCircles ||
                                u.assignedCircles.length === 0) && (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {u.role === "inspection" ? (
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Inspections
                                </div>
                                <div className="text-base font-bold text-gray-900">
                                  {u.metrics?.totalInspections || 0}
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Resolution %
                                </div>
                                <div className="text-base font-bold text-green-600">
                                  {u.metrics?.resolutionRate ?? 0}%
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mb-1">
                                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Approval %
                                </div>
                                <div className="text-base font-bold text-emerald-600">
                                  {u.metrics?.approvalRate ?? 0}%
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center mb-1">
                                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Avg Score
                                </div>
                                <div className="text-base font-bold text-amber-600">
                                  {u.metrics?.averageScore ?? 0}
                                </div>
                              </div>
                            </div>
                          ) : u.role === "circle_owner" ? (
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center mb-1">
                                  <ClipboardCheck className="w-3.5 h-3.5 text-sky-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Assigned
                                </div>
                                <div className="text-base font-bold text-sky-600">
                                  {u.metrics?.totalAssigned || 0}
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mb-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Resolved
                                </div>
                                <div className="text-base font-bold text-green-600">
                                  {u.metrics?.totalResolved || 0}
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                                  <BadgeCheck className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  Resolution %
                                </div>
                                <div className="text-base font-bold text-purple-600">
                                  {u.metrics?.resolutionRate ?? 0}%
                                </div>
                              </div>
                              <div className="p-1.5 bg-white rounded border border-gray-200 flex flex-col items-center text-center">
                                <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                                  <Clock3 className="w-3.5 h-3.5 text-yellow-600" />
                                </div>
                                <div className="text-gray-600 font-medium mb-1 text-xs leading-tight">
                                  On-Time %
                                </div>
                                <div className="text-base font-bold text-yellow-600">
                                  {u.metrics?.onTimeRate ?? 0}%
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">-</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.currentPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={
                    pagination.currentPage >= (pagination.totalPages || 1)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scoreboard;
