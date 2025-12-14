import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Topbar from "../components/Topbar";
import { useGetpenaltiesQuery, useDeletePenaltyMutation } from "@/api/apiSlice";
import { Tags, Settings, Download, ChevronRight } from "lucide-react";

function Penalties() {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");
  const [selectedPenaltyType, setSelectedPenaltyType] = useState("");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef(null);

  // Close column settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target)
      ) {
        setShowColumnSettings(false);
      }
    };

    if (showColumnSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showColumnSettings]);

  // New state for second dot filters
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedImposedBy, setSelectedImposedBy] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState({
    penaltyId: true,
    area: true,
    department: true,
    circle: true,
    penaltyType: true,
    penaltySubType: true,
    amount: true,
    status: true,
    contractor: true,
    imposedBy: true,
    penaltyDate: true,
    createdDate: true,
    action: true,
  });

  const [deletePenalty] = useDeletePenaltyMutation();

  const { data: penaltiesApiData } = useGetpenaltiesQuery();
  const penaltiesData = penaltiesApiData?.data || [];
  console.log("Fetched penalties:", penaltiesData);

  // Active filter view state
  const [activeFilterView, setActiveFilterView] = useState(1); // 1 or 2

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const circelOptions = Array.from(
    new Set(
      penaltiesData
        .filter(
          (p) =>
            (!selectedArea || p.area === selectedArea) &&
            (!selectedDepartment || p.departmentName === selectedDepartment)
        )
        .map((p) => p.circle?.name)
    )
  );

  const ContractorOptions = Array.from(
    new Set(
      penaltiesData
        .filter(
          (p) =>
            (!selectedArea || p.area === selectedArea) &&
            (!selectedDepartment || p.departmentName === selectedDepartment) &&
            (!selectedCircle || p.circle?.name === selectedCircle)
        )
        .map((p) => p.contractor?.name)
    )
  );

  const penaltyTypeOptions = Array.from(
    new Set(penaltiesData.map((p) => p.penaltyType?.name).filter(Boolean))
  );

  // Options for second dot filters
  const departmentOptions = Array.from(
    new Set(penaltiesData.map((p) => p.departmentName).filter(Boolean))
  );

  const imposedByOptions = Array.from(
    new Set(penaltiesData.map((p) => p.createdBy?.fullName))
  );

  const statusOptions = Array.from(new Set(penaltiesData.map((p) => p.status)));

  // 🔍 Apply filters to table
  const filteredPenalties = penaltiesData.filter((penalty) => {
    const lowerSearch = searchTerm.toLowerCase();

    let penaltyDateObj = penalty.penaltyDate
      ? new Date(penalty.penaltyDate)
      : null;
    const fromDateObj = dateFrom ? new Date(dateFrom) : null;
    const toDateObj = dateTo ? new Date(dateTo) : null;

    const isWithinDateRange =
      (!fromDateObj || !penaltyDateObj || penaltyDateObj >= fromDateObj) &&
      (!toDateObj || !penaltyDateObj || penaltyDateObj <= toDateObj);

    const searchMatch =
      (penalty.penaltyId ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.office ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.area ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.circle?.name ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.contractor?.name ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.penaltyType?.name ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.departmentName ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.createdBy?.fullName ?? "").toLowerCase().includes(lowerSearch) ||
      (penalty.status ?? "").toLowerCase().includes(lowerSearch);

    return (
      (!selectedArea || penalty.area === selectedArea) &&
      (!selectedCircle || penalty.circle?.name === selectedCircle) &&
      (!selectedContractor ||
        penalty.contractor?.name === selectedContractor) &&
      (!selectedPenaltyType ||
        penalty.penaltyType?.name === selectedPenaltyType) &&
      (!selectedDepartment || penalty.departmentName === selectedDepartment) &&
      (!selectedImposedBy ||
        penalty.createdBy?.fullName === selectedImposedBy) &&
      (!selectedStatus || penalty.status === selectedStatus) &&
      isWithinDateRange &&
      searchMatch
    );
  });

  const handleReset = () => {
    setSelectedArea("");
    setSelectedContractor("");
    setSelectedCircle("");
    setSelectedPenaltyType("");
    setSelectedDepartment("");
    setSelectedImposedBy("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      await deletePenalty(id).unwrap();
      alert("Penalty deleted successfully");
      setShowActions(false);
    } catch (error) {
      alert("Failed to delete penalty", error);
    }
  };

  // Show detail popup
  const handleRowClick = (penalty) => {
    setSelectedPenalty(penalty);
    setShowPopup(true);
  };

  // const handleActionbtn = (id) => {
  //   navigate(`/action/${id}`);
  // };

  // Navigate to update page
  // const handleUpdate = (id) => {
  //   navigate(`/update/${id}`);
  // };

  const handleDownloadExcel = () => {
    // Prepare worksheet data
    const worksheet = XLSX.utils.json_to_sheet(filteredPenalties);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penalties");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create blob and trigger download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "penalties_data.xlsx");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100">
        <div className="bg-white p-6 rounded-md shadow">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-700">PENALTIES</h1>
            <button
              onClick={() => navigate("/penalty-types")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Tags className="w-5 h-5" />
              Penalty Types
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter row - Conditional rendering based on activeFilterView */}
          {activeFilterView === 1 ? (
            // First Dot Filters
            <div className="flex justify-between gap-4 mb-8">
              <div className="relative w-60">
                {/* Main button */}
                <div
                  className="border border-gray-300 rounded-md py-2 px-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <button>{selectedArea || "Area"}</button>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showOptions ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>

                {/* Radio options */}
                {showOptions && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 z-10">
                    {["Urban", "Rural"].map((area) => (
                      <label
                        key={area}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="radio"
                          name="area"
                          value={area}
                          checked={selectedArea === area}
                          onChange={(e) => {
                            setSelectedArea(e.target.value);
                            setSelectedContractor("");
                            setSelectedCircle("");
                            setShowOptions(false);
                          }}
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* /// Department Name */}
              <div className="relative w-60">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none"
                >
                  <option value="">Department Name</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* /// Tahsil */}
              <div className="relative w-60">
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10"
                >
                  <option value="">Select Circle</option>
                  {circelOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* /// Penalty Type */}
              <div className="relative w-60">
                <select
                  value={selectedPenaltyType}
                  onChange={(e) => setSelectedPenaltyType(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none "
                >
                  <option value="">Penalty Type</option>
                  {penaltyTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {/* Table search and Reset */}
              <div className="flex gap-2 items-center">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  />
                  <button className="absolute right-0 top-0 h-full bg-indigo-800 text-white px-3 rounded-r-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition"
                  title="Reset filters"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between gap-4 mb-8">
              <div className="relative w-60">
                <select
                  value={selectedContractor}
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10"
                >
                  <option value="">Select Supervisor</option>
                  {ContractorOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {/* Imposed By */}
              <div className="relative w-60">
                <select
                  value={selectedImposedBy}
                  onChange={(e) => setSelectedImposedBy(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none"
                >
                  <option value="">Imposed By</option>
                  {imposedByOptions.map((imposer) => (
                    <option key={imposer} value={imposer}>
                      {imposer}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Status */}
              <div className="relative w-60">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none"
                >
                  <option value="">Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Date Range (From / To) */}
              <div className="relative w-60">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                    className="w-1/2 border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                    className="w-1/2 border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Table search and Reset */}
              <div className="flex gap-2 items-center">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                  />
                  <button className="absolute right-0 top-0 h-full bg-indigo-800 text-white px-3 rounded-r-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition"
                  title="Reset filters"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Pagination dots */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              <div
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  activeFilterView === 1 ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setActiveFilterView(1)}
              ></div>
              <div
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  activeFilterView === 2 ? "bg-green-500" : "bg-gray-300"
                }`}
                onClick={() => setActiveFilterView(2)}
              ></div>
            </div>
          </div>

          {/* Table */}
          <div className="flex justify-end mb-4 gap-2 relative">
            <div ref={columnSettingsRef}>
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Columns
              </button>

              {showColumnSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-10">
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">
                    Toggle Columns
                  </h3>
                  {Object.keys(columnVisibility).map((column) => (
                    <label
                      key={column}
                      className="flex items-center space-x-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={columnVisibility[column]}
                        onChange={() =>
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [column]: !prev[column],
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm capitalize">
                        {column.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const allVisible = {};
                        Object.keys(columnVisibility).forEach((key) => {
                          allVisible[key] = true;
                        });
                        setColumnVisibility(allVisible);
                      }}
                      className="w-full px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Show All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Download Excel"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sr#
                    </th>

                    {columnVisibility.penaltyId && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Penalty ID
                      </th>
                    )}
                    {columnVisibility.area && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Area
                      </th>
                    )}
                    {columnVisibility.department && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Department
                      </th>
                    )}
                    {columnVisibility.circle && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Circle
                      </th>
                    )}
                    {columnVisibility.penaltyType && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Penalty Type
                      </th>
                    )}
                    {columnVisibility.penaltySubType && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Penalty Sub Type
                      </th>
                    )}
                    {columnVisibility.amount && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Amount (Rs)
                      </th>
                    )}
                    {columnVisibility.status && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    {columnVisibility.contractor && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Supervisor
                      </th>
                    )}
                    {columnVisibility.imposedBy && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Imposed By
                      </th>
                    )}
                    {columnVisibility.penaltyDate && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Penalty Date
                      </th>
                    )}
                    {columnVisibility.createdDate && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Created Date
                      </th>
                    )}
                    {columnVisibility.action && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredPenalties.map((penalty, index) => (
                    <tr
                      key={penalty._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>

                      {columnVisibility.penaltyId && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.penaltyId}
                        </td>
                      )}
                      {columnVisibility.area && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.area}
                        </td>
                      )}
                      {columnVisibility.department && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.departmentName}
                        </td>
                      )}
                      {columnVisibility.circle && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.circle.name}
                        </td>
                      )}
                      {columnVisibility.penaltyType && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.penaltyType.name}
                        </td>
                      )}
                      {columnVisibility.penaltySubType && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.penaltyType.subtype}
                        </td>
                      )}
                      {columnVisibility.amount && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.penaltyType.amount}
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              penalty.status === "new"
                                ? "bg-blue-100 text-blue-800"
                                : penalty.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : penalty.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : penalty.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : penalty.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {penalty.status}
                          </span>
                        </td>
                      )}
                      {columnVisibility.contractor && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.contractor.name}
                        </td>
                      )}
                      {columnVisibility.imposedBy && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {penalty.createdBy.fullName}
                        </td>
                      )}
                      {columnVisibility.penaltyDate && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {new Date(penalty.deadline).toLocaleDateString()}
                        </td>
                      )}
                      {columnVisibility.createdDate && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600">
                          {new Date(penalty.createdAt).toLocaleDateString()}
                        </td>
                      )}
                      {columnVisibility.action && (
                        <td
                          className="px-3 py-2.5 whitespace-nowrap text-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPenalty(penalty);
                            setShowActions(true);
                          }}
                        >
                          ⋮
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showPopup && selectedPenalty && (
              <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white w-[600px] rounded-lg shadow-lg p-6 relative">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
                  >
                    ✕
                  </button>

                  <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                    Penalty Details
                  </h2>

                  <div className="flex justify-between">
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Penalty ID:</strong> {selectedPenalty.penaltyId}
                      </p>
                      <p>
                        <strong>District:</strong> {selectedPenalty.area}
                      </p>
                      <p>
                        <strong>Office:</strong>{" "}
                        {selectedPenalty.departmentName}
                      </p>
                      <p>
                        <strong>Type:</strong>{" "}
                        {selectedPenalty.penaltyType.name}
                      </p>
                      <p>
                        <strong>Sub Type:</strong>{" "}
                        {selectedPenalty.penaltyType.subtype}
                      </p>
                      <p>
                        <strong>Amount:</strong> Rs.{" "}
                        {selectedPenalty.penaltyAmount}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {formatDateForDisplay(selectedPenalty.deadline)}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedPenalty.status}
                      </p>

                      <p>
                        <strong>Supervisor:</strong>{" "}
                        {selectedPenalty.contractor.name}
                      </p>
                      <p>
                        <strong>Added By:</strong>{" "}
                        {selectedPenalty.createdBy.fullName}
                      </p>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div>
                        <img
                          src={selectedPenalty.inspectionImages?.[0]?.url}
                          alt=""
                          className="w-32"
                        />
                        <p>Before</p>
                      </div>
                      <div>
                        <img
                          src={selectedPenalty.inspectionImages?.[1]?.url}
                          alt=""
                          className="w-32"
                        />
                        <p>After</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Popup */}
            {showActions && (
              <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">
                  <button
                    onClick={() => setShowActions(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
                  >
                    ✕
                  </button>
                  <div className="p-4 flex gap-2 flex-col">
                    <button
                      onClick={() => navigate(`/action/${selectedPenalty._id}`)}
                      className="block w-full text-center px-2 py-2 text-white  bg-blue-600 rounded-xl to-current"
                    >
                      Action
                    </button>
                    <button
                      onClick={() => navigate(`/update/${selectedPenalty._id}`)}
                      className="block w-full text-center px-2 py-2 hover:text-white hover:bg-blue-600 rounded-xl  text-blue-600 to-current"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPenalty._id)}
                      className="block w-full text-center px-2 py-2 hover:text-white hover:bg-red-600 rounded-xl  text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Penalties;
