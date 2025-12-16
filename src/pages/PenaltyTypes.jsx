import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/topbar";
import {
  Tags,
  Plus,
  X,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
  Eye,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  useGetAllPenaltyTypesQuery,
  useGetPenaltyTypeByIdQuery,
  useCreatePenaltyTypeMutation,
  useUpdatePenaltyTypeMutation,
  useDeletePenaltyTypeMutation,
} from "@/api/apiSlice";

function PenaltyTypes() {
  const navigate = useNavigate();

  // API hooks
  const { data, refetch } = useGetAllPenaltyTypesQuery();
  const [createPenaltyType] = useCreatePenaltyTypeMutation();
  const [updatePenaltyType] = useUpdatePenaltyTypeMutation();
  const [deletePenaltyType] = useDeletePenaltyTypeMutation();

  const penaltyTypes = useMemo(() => {
    return data?.data || [];
  }, [data]);

  // Filter and search states
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    subtype: true,
    score: true,
    status: true,
    resolutionTime: true,
    createdAt: true,
    actions: true,
  });

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

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };
  const [formData, setFormData] = useState({
    name: "",
    subtype: "",
    amount: "",
    defaultTAT: 24,
    isActive: true,
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: penaltyTypeDetailsResponse } = useGetPenaltyTypeByIdQuery(
    selectedTypeId,
    { skip: !selectedTypeId }
  );
  const penaltyTypeDetails = penaltyTypeDetailsResponse?.data;

  // Filter penalty types based on search term, subtype, and status
  const filteredPenaltyTypes = useMemo(() => {
    return penaltyTypes.filter((type) => {
      const matchesSearch =
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSubtype =
        selectedSubtype === "" || type.subtype === selectedSubtype;

      const matchesStatus =
        selectedStatus === "" ||
        (selectedStatus === "active" && type.isActive) ||
        (selectedStatus === "inactive" && !type.isActive);

      return matchesSearch && matchesSubtype && matchesStatus;
    });
  }, [penaltyTypes, searchTerm, selectedSubtype, selectedStatus]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSubtype("");
    setSelectedStatus("");
  };

  const navigateToPenalties = () => {
    navigate("/penalties");
  };

  // Helper function to format priority
  const formatPriority = (subtype) => {
    const priorityStyles = {
      small: { label: "Small", class: "bg-green-100 text-green-800" },
      medium: { label: "Medium", class: "bg-yellow-100 text-yellow-800" },
      large: { label: "Large", class: "bg-red-100 text-red-800" },
      none: { label: "None", class: "bg-gray-100 text-gray-800" },
    };
    return priorityStyles[subtype] || priorityStyles.none;
  };

  // Helper function to format resolution time
  const formatResolutionTime = (hours) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (hours % 24 === 0) {
      const days = hours / 24;
      return `${days} day${days !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Penalty type name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Penalty type name must be at least 2 characters";
    }

    if (!formData.amount || formData.amount < 0) {
      newErrors.amount = "Penalty amount must be 0 or greater";
    }

    if (
      !formData.defaultTAT ||
      formData.defaultTAT < 1 ||
      formData.defaultTAT > 720
    ) {
      newErrors.defaultTAT =
        "Default TAT must be between 1 hour and 30 days (720 hours)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const penaltyTypeData = {
        name: formData.name.trim(),
        subtype: formData.subtype || undefined,
        amount: parseInt(formData.amount) || 0,
        defaultTAT: parseInt(formData.defaultTAT),
        description: formData.description?.trim() || undefined,
        isActive: formData.isActive,
      };

      if (editingType) {
        // Update existing penalty type
        await updatePenaltyType({
          id: editingType._id,
          ...penaltyTypeData,
        }).unwrap();
        alert("Penalty type updated successfully!");
      } else {
        // Add new penalty type
        await createPenaltyType(penaltyTypeData).unwrap();
        alert("Penalty type created successfully!");
      }

      refetch();
      handleModalClose();
    } catch (error) {
      console.error("Failed to save penalty type:", error);
      alert(
        "Failed to save penalty type: " +
          (error.data?.message || "Unknown error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({
      name: "",
      subtype: "",
      amount: "",
      defaultTAT: 24,
      isActive: true,
      description: "",
    });
    setErrors({});
  };

  const handleEdit = (penaltyType) => {
    setEditingType(penaltyType);
    setFormData({
      name: penaltyType.name,
      subtype: penaltyType.subtype || "",
      amount: penaltyType.amount,
      defaultTAT: penaltyType.defaultTAT,
      isActive: penaltyType.isActive,
      description: penaltyType.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePenaltyType(id).unwrap();
      refetch();
      setShowDeleteConfirm(null);
      alert("Penalty type deleted successfully!");
    } catch (error) {
      console.error("Failed to delete penalty type:", error);
      alert(
        "Failed to delete penalty type: " +
          (error.data?.message || "Unknown error")
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getStats = () => {
    const total = penaltyTypes.length;
    const active = penaltyTypes.filter((type) => type.isActive).length;
    const inactive = total - active;
    const averageAmount =
      penaltyTypes.reduce((sum, type) => sum + type.amount, 0) / total || 0;
    const highestAmount = Math.max(
      ...penaltyTypes.map((type) => type.amount),
      0
    );
    return { total, active, inactive, averageAmount, highestAmount };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Tags className="w-7 h-7 text-pink-600" />
                Penalty Types Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and organize different types of penalties
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={navigateToPenalties}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Penalties
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Penalty Type
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Tags className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Total Types</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Active Types
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Inactive Types
                </p>
                <p className="text-2xl font-semibold text-red-600">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xs">AVG</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Average Score
                </p>
                <p className="text-lg font-semibold text-purple-600">
                  {stats.averageAmount.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">MAX</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Highest Score
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  {stats.highestAmount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search penalty types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Subtype Filter */}
              <select
                value={selectedSubtype}
                onChange={(e) => setSelectedSubtype(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Sub-Types</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>

              {/* Column Settings */}
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
          Showing {filteredPenaltyTypes.length} of {penaltyTypes.length} penalty
          types
        </div>

        {/* Penalty Types Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredPenaltyTypes.length === 0 ? (
              <div className="p-8 text-center">
                <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No penalty types found</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-pink-600 hover:text-pink-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    {columnVisibility.name && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Penalty Type
                      </th>
                    )}
                    {columnVisibility.subtype && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Sub-Types
                      </th>
                    )}
                    {columnVisibility.score && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Score
                      </th>
                    )}
                    {columnVisibility.status && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    {columnVisibility.resolutionTime && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Resolution Time
                      </th>
                    )}
                    {columnVisibility.createdAt && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Created Date
                      </th>
                    )}
                    {columnVisibility.actions && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPenaltyTypes.map((penaltyType) => (
                    <tr
                      key={penaltyType._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columnVisibility.name && (
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                              <Tags className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {penaltyType.name}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {columnVisibility.subtype && (
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              formatPriority(penaltyType.subtype).class
                            }`}
                          >
                            {formatPriority(penaltyType.subtype).label}
                          </span>
                        </td>
                      )}
                      {columnVisibility.score && (
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {penaltyType.amount}
                          </div>
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              penaltyType.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {penaltyType.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.resolutionTime && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatResolutionTime(penaltyType.defaultTAT)}
                          </span>
                        </td>
                      )}
                      {columnVisibility.createdAt && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(penaltyType.createdAt)}
                        </td>
                      )}
                      {columnVisibility.actions && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTypeId(penaltyType._id);
                                setShowViewModal(true);
                              }}
                              className="text-cyan-600 hover:text-cyan-900 p-1 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(penaltyType)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setShowDeleteConfirm(penaltyType._id)
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingType ? "Edit Penalty Type" : "Add New Penalty Type"}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      {errors.submit}
                    </span>
                  </div>
                )}

                {/* Penalty Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penalty Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Garbage Collection"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Sub-Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Type
                  </label>
                  <select
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Amount and TAT in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Penalty Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Penalty Score <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="100"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.amount
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Default TAT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default TAT <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="defaultTAT"
                      value={formData.defaultTAT}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.defaultTAT
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value={1}>1 Hour</option>
                      <option value={2}>2 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={6}>6 Hours</option>
                      <option value={8}>8 Hours</option>
                      <option value={12}>12 Hours</option>
                      <option value={24}>1 Day</option>
                      <option value={48}>2 Days</option>
                      <option value={72}>3 Days</option>
                      <option value={168}>1 Week</option>
                      <option value={336}>2 Weeks</option>
                      <option value={720}>30 Days</option>
                    </select>
                    {errors.defaultTAT && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.defaultTAT}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description for this penalty type"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active Penalty Type
                    </span>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingType ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {editingType ? (
                          <Edit className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {editingType ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Penalty Type
                    </h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this penalty type? Any
                  associated penalties may be affected.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Penalty Type Modal */}
        {showViewModal && penaltyTypeDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Penalty Type Details
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTypeId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {penaltyTypeDetails.name}
                      </h4>
                      {penaltyTypeDetails.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {penaltyTypeDetails.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        penaltyTypeDetails.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {penaltyTypeDetails.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Sub-Type</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        formatPriority(penaltyTypeDetails.subtype).class
                      }`}
                    >
                      {formatPriority(penaltyTypeDetails.subtype).label}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {penaltyTypeDetails.amount || 0}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Default TAT</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {formatResolutionTime(penaltyTypeDetails.defaultTAT)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {formatDate(penaltyTypeDetails.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Timestamps
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Created At</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(penaltyTypeDetails.createdAt).toLocaleString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Updated At</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(penaltyTypeDetails.updatedAt).toLocaleString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTypeId(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PenaltyTypes;
