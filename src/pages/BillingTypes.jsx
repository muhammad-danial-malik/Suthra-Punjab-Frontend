import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Topbar from "../components/topbar";
import {
  useGetBillingTypesQuery,
  useDeleteBillingTypeMutation,
  useCreateBillingTypeMutation,
  useUpdateBillingTypeMutation,
} from "@/api/apiSlice";
import {
  Store,
  Plus,
  Download,
  Settings,
  FileText,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  X,
  ChevronRight,
} from "lucide-react";

function Billing() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedRefNo, setSelectedRefNo] = useState("");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef(null);
  const [selectedBillingType, setSelectedBillingType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

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

  // Form state for creating billing type
  const [formData, setFormData] = useState({
    refNo: "",
    shopName: "",
    owner: "",
    cellPhone: "",
    area: "",
    address: "",
  });

  // Form state for editing billing type
  const [editFormData, setEditFormData] = useState({
    refNo: "",
    shopName: "",
    owner: "",
    cellPhone: "",
    area: "",
    address: "",
  });

  const [columnVisibility, setColumnVisibility] = useState({
    refNo: true,
    shopName: true,
    owner: true,
    cellPhone: true,
    area: true,
    address: true,
    createdAt: true,
    action: true,
  });

  const [deleteBillingType] = useDeleteBillingTypeMutation();
  const [createBillingType, { isLoading: isCreating }] =
    useCreateBillingTypeMutation();
  const [updateBillingType, { isLoading: isUpdating }] =
    useUpdateBillingTypeMutation();

  // Fetch billing types data
  const {
    data: billingTypesApiData,
    isLoading,
    error,
  } = useGetBillingTypesQuery({
    page: 1,
    limit: 100,
  });

  // Handle different possible response structures
  // API returns: {statusCode: 200, success: true, data: {billingTypes: [...], pagination: {...}}, message: 'Billing types fetched successfully'}
  const billingTypesData = Array.isArray(
    billingTypesApiData?.data?.billingTypes
  )
    ? billingTypesApiData.data.billingTypes
    : Array.isArray(billingTypesApiData?.data)
    ? billingTypesApiData.data
    : [];

  console.log("Fetched billing types:", billingTypesData);
  console.log("Full API response:", billingTypesApiData);

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

  // Get unique areas for filter
  const areaOptions = Array.from(
    new Set((billingTypesData || []).map((bt) => bt.area).filter(Boolean))
  );

  // Get unique ref numbers for filter
  const refNoOptions = Array.from(
    new Set((billingTypesData || []).map((bt) => bt.refNo).filter(Boolean))
  );

  // Apply filters to table
  const filteredBillingTypes = (billingTypesData || []).filter((bt) => {
    const lowerSearch = searchTerm.toLowerCase();

    const searchMatch =
      (bt.refNo ?? "").toLowerCase().includes(lowerSearch) ||
      (bt.shopName ?? "").toLowerCase().includes(lowerSearch) ||
      (bt.owner ?? "").toLowerCase().includes(lowerSearch) ||
      (bt.cellPhone ?? "").toLowerCase().includes(lowerSearch) ||
      (bt.area ?? "").toLowerCase().includes(lowerSearch) ||
      (bt.address ?? "").toLowerCase().includes(lowerSearch);

    return (
      (!selectedArea || bt.area === selectedArea) &&
      (!selectedRefNo || bt.refNo === selectedRefNo) &&
      searchMatch
    );
  });

  const handleReset = () => {
    setSelectedArea("");
    setSelectedRefNo("");
    setSearchTerm("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this billing type?"
    );
    if (!confirmDelete) return;

    try {
      await deleteBillingType(id).unwrap();
      alert("Billing type deleted successfully");
    } catch (error) {
      alert(
        "Failed to delete billing type: " +
          (error?.data?.message || error.message)
      );
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create billing type submission
  const handleCreateBillingType = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.refNo ||
      !formData.shopName ||
      !formData.owner ||
      !formData.cellPhone ||
      !formData.area ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createBillingType(formData).unwrap();
      alert("Billing type created successfully");
      setShowCreatePopup(false);
      // Reset form
      setFormData({
        refNo: "",
        shopName: "",
        owner: "",
        cellPhone: "",
        area: "",
        address: "",
      });
    } catch (error) {
      alert(
        "Failed to create billing type: " +
          (error?.data?.message || error.message)
      );
    }
  };

  // Show detail popup
  const handleRowClick = (billingType) => {
    setSelectedBillingType(billingType);
    setShowPopup(true);
  };

  const handleUpdate = (billingType) => {
    setEditFormData({
      refNo: billingType.refNo || "",
      shopName: billingType.shopName || "",
      owner: billingType.owner || "",
      cellPhone: billingType.cellPhone || "",
      area: billingType.area || "",
      address: billingType.address || "",
    });
    setSelectedBillingType(billingType);
    setShowEditPopup(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update billing type submission
  const handleUpdateBillingType = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !editFormData.refNo ||
      !editFormData.shopName ||
      !editFormData.owner ||
      !editFormData.cellPhone ||
      !editFormData.area ||
      !editFormData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateBillingType({
        id: selectedBillingType._id,
        billingTypeData: editFormData,
      }).unwrap();

      alert("Billing type updated successfully");
      setShowEditPopup(false);
      setSelectedBillingType(null);
    } catch (error) {
      alert(
        "Failed to update billing type: " +
          (error?.data?.message || error.message)
      );
    }
  };

  const handleDownloadExcel = () => {
    // Prepare worksheet data
    const worksheet = XLSX.utils.json_to_sheet(
      filteredBillingTypes.map((bt) => ({
        "Ref No": bt.refNo,
        "Shop Name": bt.shopName,
        Owner: bt.owner,
        "Cell Phone": bt.cellPhone,
        Area: bt.area,
        Address: bt.address,
        "Created At": formatDateForDisplay(bt.createdAt),
      }))
    );

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Billing Types");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create blob and trigger download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "billing_types_data.xlsx");
  };

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading billing types...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-red-600">
            Error loading billing types: {error?.data?.message || error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-7 h-7 text-indigo-600" />
                Billing Types Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage shop and billing information
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/billing-reports")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                View Billing
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreatePopup(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Billing Type
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Search */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search billing types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Filters and Action buttons */}
            <div className="flex items-center gap-4">
              {/* Area Filter */}
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Areas</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              {/* Ref No Filter */}
              <select
                value={selectedRefNo}
                onChange={(e) => setSelectedRefNo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Ref Numbers</option>
                {refNoOptions.map((refNo) => (
                  <option key={refNo} value={refNo}>
                    {refNo}
                  </option>
                ))}
              </select>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>

              <div className="relative" ref={columnSettingsRef}>
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                          onChange={() => toggleColumnVisibility(column)}
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
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBillingTypes.length} of {billingTypesData.length}{" "}
          billing types
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  {columnVisibility.refNo && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Ref No
                    </th>
                  )}
                  {columnVisibility.shopName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Shop Name
                    </th>
                  )}
                  {columnVisibility.owner && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Owner
                    </th>
                  )}
                  {columnVisibility.cellPhone && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Cell Phone
                    </th>
                  )}
                  {columnVisibility.area && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Area
                    </th>
                  )}
                  {columnVisibility.address && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Address
                    </th>
                  )}
                  {columnVisibility.createdAt && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Created At
                    </th>
                  )}
                  {columnVisibility.action && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBillingTypes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        Object.values(columnVisibility).filter(Boolean).length
                      }
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No billing types found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBillingTypes.map((bt) => (
                    <tr
                      key={bt._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(bt)}
                    >
                      {columnVisibility.refNo && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                          {bt.refNo}
                        </td>
                      )}
                      {columnVisibility.shopName && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {bt.shopName}
                        </td>
                      )}
                      {columnVisibility.owner && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                          {bt.owner}
                        </td>
                      )}
                      {columnVisibility.cellPhone && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                          {bt.cellPhone}
                        </td>
                      )}
                      {columnVisibility.area && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                          {bt.area}
                        </td>
                      )}
                      {columnVisibility.address && (
                        <td className="px-3 py-2.5 text-sm text-gray-700">
                          {bt.address}
                        </td>
                      )}
                      {columnVisibility.createdAt && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                          {formatDateForDisplay(bt.createdAt)}
                        </td>
                      )}
                      {columnVisibility.action && (
                        <td
                          className="px-3 py-2.5 whitespace-nowrap text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdate(bt)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(bt._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Popup */}
      {showPopup && selectedBillingType && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Billing Type Details
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Ref No:</p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.refNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Shop Name:
                  </p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.shopName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Owner:</p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.owner}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Cell Phone:
                  </p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.cellPhone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Area:</p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.area}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Created At:
                  </p>
                  <p className="text-base text-gray-800">
                    {formatDateForDisplay(selectedBillingType.createdAt)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-600">
                    Address:
                  </p>
                  <p className="text-base text-gray-800">
                    {selectedBillingType.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPopup(false);
                  handleUpdate(selectedBillingType);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Edit Billing Type
              </button>
              <button
                onClick={() => {
                  setShowPopup(false);
                  handleDelete(selectedBillingType._id);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
              >
                Delete Billing Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Billing Type Popup */}
      {showCreatePopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreatePopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Billing Type
              </h2>
              <button
                onClick={() => setShowCreatePopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateBillingType} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ref No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNo"
                    value={formData.refNo}
                    onChange={handleInputChange}
                    placeholder="e.g., REF-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC Store"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cell Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cellPhone"
                    value={formData.cellPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., 1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main Street, Downtown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Billing Type"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePopup(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Billing Type Popup */}
      {showEditPopup && selectedBillingType && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditPopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Billing Type
              </h2>
              <button
                onClick={() => setShowEditPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateBillingType} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ref No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="refNo"
                    value={editFormData.refNo}
                    onChange={handleEditInputChange}
                    placeholder="e.g., REF-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={editFormData.shopName}
                    onChange={handleEditInputChange}
                    placeholder="e.g., ABC Store"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="owner"
                    value={editFormData.owner}
                    onChange={handleEditInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cell Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cellPhone"
                    value={editFormData.cellPhone}
                    onChange={handleEditInputChange}
                    placeholder="e.g., 1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={editFormData.area}
                    onChange={handleEditInputChange}
                    placeholder="e.g., Downtown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    placeholder="e.g., 123 Main Street, Downtown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Billing Type"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
