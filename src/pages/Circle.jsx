import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/topbar";
import {
  Building2,
  Plus,
  X,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Eye,
  Users,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import {
  useGetAllCirclesQuery,
  useGetCircleByIdQuery,
  useCreateCircleMutation,
  useUpdateCircleMutation,
  useDeleteCircleMutation,
  useGetDepartmentsQuery,
} from "@/api/apiSlice";

function Circle() {
  const navigate = useNavigate();

  // API hooks
  const { data, refetch } = useGetAllCirclesQuery();
  const { data: departmentsData } = useGetDepartmentsQuery();
  const [createCircle] = useCreateCircleMutation();
  const [updateCircle] = useUpdateCircleMutation();
  const [deleteCircle] = useDeleteCircleMutation();

  const circles = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const departments = useMemo(() => {
    return departmentsData?.data || [];
  }, [departmentsData]);

  // State management
  const [showModal, setShowModal] = useState(false);
  const [editingCircle, setEditingCircle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    type: "Urban",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get circle details for view modal
  const { data: circleDetailsResponse } = useGetCircleByIdQuery(
    selectedCircleId,
    { skip: !selectedCircleId }
  );
  const circleDetails = circleDetailsResponse?.data;

  // Filter circles based on search and filters
  const filteredCircles = useMemo(() => {
    return circles.filter((circle) => {
      const matchesSearch =
        circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (circle.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesDepartment =
        !selectedDepartment || circle.department?._id === selectedDepartment;

      const matchesType = !selectedType || circle.type === selectedType;

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "active" ? circle.isActive : !circle.isActive);

      return matchesSearch && matchesDepartment && matchesType && matchesStatus;
    });
  }, [circles, searchTerm, selectedDepartment, selectedType, selectedStatus]);

  // Handle modal open for create
  const handleOpenModal = () => {
    setEditingCircle(null);
    setFormData({
      name: "",
      department: "",
      type: "Urban",
      description: "",
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle modal open for edit
  const handleEdit = (circle) => {
    setEditingCircle(circle);
    setFormData({
      name: circle.name,
      department: circle.department?._id || "",
      type: circle.type || "Urban",
      description: circle.description || "",
      isActive: circle.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle view circle
  const handleView = (circleId) => {
    setSelectedCircleId(circleId);
    setShowViewModal(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Circle name is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (editingCircle) {
        await updateCircle({
          id: editingCircle._id,
          payload: formData,
        }).unwrap();
        alert("Circle updated successfully!");
      } else {
        await createCircle(formData).unwrap();
        alert("Circle created successfully!");
      }

      setShowModal(false);
      setFormData({
        name: "",
        department: "",
        type: "Urban",
        description: "",
        isActive: true,
      });
      refetch();
    } catch (error) {
      console.error("Error saving circle:", error);
      setErrors({
        submit:
          error?.data?.message ||
          `Failed to ${editingCircle ? "update" : "create"} circle`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteCircle(id).unwrap();
      alert("Circle deleted successfully!");
      setShowDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error("Error deleting circle:", error);
      alert(error?.data?.message || "Failed to delete circle");
    }
  };

  // Reset filters
  const handleReset = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedType("");
    setSelectedStatus("");
  };

  // Navigate to users page
  const navigateToUsers = () => {
    navigate("/user");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Topbar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Circle Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage administrative circles and assignments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/users")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5" />
              View Users
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Circle
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search circles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Urban">Urban</option>
              <option value="Rural">Rural</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCircles.length} of {circles.length} circles
        </div>

        {/* Circles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Circle Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Circle Owner
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Inspectors
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Penalties
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCircles.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No circles found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCircles.map((circle) => (
                    <tr
                      key={circle._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">
                          {circle.name}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {circle.department?.name || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            circle.type === "Urban"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {circle.type || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {circle.circleOwner ? (
                          <div className="text-sm text-gray-900">
                            {circle.circleOwner.fullName}
                          </div>
                        ) : (
                          <button
                            onClick={navigateToUsers}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium border border-blue-200"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Assign Owner
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {circle.circleOwner?.email || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {circle.circleOwner?.cellPhone || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {circle.inspectors && circle.inspectors.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {circle.inspectors.length}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={navigateToUsers}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium border border-green-200"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Assign Inspectors
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {circle.totalPenalties || 0}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            circle.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {circle.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(circle._id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(circle)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(circle)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCircle ? "Edit Circle" : "Add New Circle"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">{errors.submit}</span>
                </div>
              )}

              {/* Circle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Circle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Circle A - North Zone"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Department and Type in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.type
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.type}
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
                  placeholder="Enter circle description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Circle
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingCircle ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingCircle ? (
                        <Edit className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {editingCircle ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && circleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Circle Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCircleId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Circle Name</p>
                    <p className="font-medium text-gray-900">
                      {circleDetails.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">
                      {circleDetails.department?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        circleDetails.type === "Urban"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {circleDetails.type || "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        circleDetails.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {circleDetails.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {circleDetails.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{circleDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Circle Owner */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Circle Owner
                </h3>
                {circleDetails.circleOwner ? (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {circleDetails.circleOwner.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Username</p>
                        <p className="font-medium text-gray-900">
                          {circleDetails.circleOwner.username}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {circleDetails.circleOwner.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {circleDetails.circleOwner.cellPhone || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-3">
                      No owner assigned to this circle
                    </p>
                    <button
                      onClick={navigateToUsers}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign Owner
                    </button>
                  </div>
                )}
              </div>

              {/* Inspectors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assigned Inspectors ({circleDetails.inspectors?.length || 0})
                </h3>
                {circleDetails.inspectors &&
                circleDetails.inspectors.length > 0 ? (
                  <div className="space-y-3">
                    {circleDetails.inspectors.map((inspector) => (
                      <div
                        key={inspector._id}
                        className="bg-green-50 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">
                              {inspector.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Username</p>
                            <p className="font-medium text-gray-900">
                              {inspector.username}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {inspector.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">
                              {inspector.cellPhone || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-3">
                      No inspectors assigned to this circle
                    </p>
                    <button
                      onClick={navigateToUsers}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Users className="w-4 h-4" />
                      Assign Inspectors
                    </button>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Statistics
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Penalties</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {circleDetails.totalPenalties || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Circle
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{showDeleteConfirm.name}</span>?
                This will permanently remove the circle from the system.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Circle;
