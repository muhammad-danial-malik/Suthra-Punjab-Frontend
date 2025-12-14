import { React, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetUsersQuery,
  useRegisterUserMutation,
  useDeleteUserMutation,
  useGetcirclesQuery,
  useUpdateUserMutation,
  useSetUserActiveMutation,
} from "@/api/apiSlice";
import {
  Eye,
  Edit,
  Trash2,
  Users,
  Building2,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import Topbar from "../components/Topbar";

function User() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const { data, refetch } = useGetUsersQuery();
  const [showPw, setShowPw] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewPopup, setShowViewPopup] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");

  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [setUserActive] = useSetUserActiveMutation();
  const { data: circlesData } = useGetcirclesQuery();

  const users = useMemo(() => data?.data || [], [data]);
  console.log("Fetched users:", users);
  const circles = circlesData?.data || [];

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.cellPhone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "" || user.role === selectedRole;

      const matchesStatus =
        selectedStatus === "" ||
        (selectedStatus === "active" && user.isActive) ||
        (selectedStatus === "inactive" && !user.isActive);

      const matchesCircle =
        selectedCircle === "" ||
        (user.role === "circle_owner" &&
          user.assignedCircle?._id === selectedCircle) ||
        (user.role === "inspection" &&
          Array.isArray(user.assignedCircles) &&
          user.assignedCircles.some((c) => c._id === selectedCircle));

      return matchesSearch && matchesRole && matchesStatus && matchesCircle;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedCircle]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
    setSelectedCircle("");
  };

  const navigateToCircles = () => {
    navigate("/circles");
  };

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    cellPhone: "",
    role: "inspection", // Changed to a valid role
    isActive: true,
    assignedCircle: "", // For circle_owner
    assignedCircles: [], // For inspection role
    showCirclesDropdown: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role is required";

    if (
      formData.role === "inspection" &&
      formData.assignedCircles.length === 0
    ) {
      newErrors.assignedCircles = "Select at least one circle";
    }
    if (formData.role === "circle_owner" && !formData.assignedCircle) {
      newErrors.assignedCircle = "Select a circle";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await registerUser(formData).unwrap();
      console.log("User registered:", response);
      alert("User added successfully!");
      setShowPopup(false);
      refetch();
      setFormData({
        username: "",
        fullName: "",
        email: "",
        password: "",
        cellPhone: "",
        role: "inspection",
        isActive: true,
        assignedCircle: "",
        assignedCircles: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding user:", error);
      alert(error?.data?.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id).unwrap();
      refetch();
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user!");
    }
  };

  const openView = (user) => {
    setViewingUser(user);
    setShowViewPopup(true);
  };

  const closeView = () => {
    setViewingUser(null);
    setShowViewPopup(false);
  };

  const openEdit = (user) => {
    setEditingUser({
      id: user._id,
      username: user.username || "",
      fullName: user.fullName || "",
      email: user.email || "", // not editable but keep for display
      cellPhone: user.cellPhone || "",
      cnic: user.cnic || "",
      address: user.address || "",
      profilePic: user.profilePic || "",
      role: user.role,
      isActive: user.isActive,
      assignedCircle: user.assignedCircle?._id || "",
      assignedCircles: Array.isArray(user.assignedCircles)
        ? user.assignedCircles.map((c) => c._id)
        : [],
      showCirclesDropdown: false,
    });
    setEditErrors({});
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setShowEditPopup(true);
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const errs = {};
    if (!editingUser.username.trim()) errs.username = "Username required";
    if (!editingUser.fullName.trim()) errs.fullName = "Full name required";
    if (
      editingUser.role === "inspection" &&
      editingUser.assignedCircles.length === 0
    )
      errs.assignedCircles = "Select at least one circle";
    if (editingUser.role === "circle_owner" && !editingUser.assignedCircle)
      errs.assignedCircle = "Select a circle";
    if (Object.keys(errs).length) {
      setEditErrors(errs);
      return;
    }
    const payload = new FormData();
    payload.append("username", editingUser.username);
    payload.append("fullName", editingUser.fullName);
    payload.append("cellPhone", editingUser.cellPhone);
    payload.append("cnic", editingUser.cnic);
    payload.append("address", editingUser.address);
    payload.append("role", editingUser.role);
    payload.append("isActive", editingUser.isActive);

    if (editingUser.role === "circle_owner" && editingUser.assignedCircle) {
      payload.append("assignedCircle", editingUser.assignedCircle);
    }
    if (
      editingUser.role === "inspection" &&
      editingUser.assignedCircles.length > 0
    ) {
      editingUser.assignedCircles.forEach((circleId) => {
        payload.append("assignedCircles[]", circleId);
      });
    }
    if (profilePicFile) {
      payload.append("profilePic", profilePicFile);
    }

    try {
      await updateUser({ id: editingUser.id, payload }).unwrap();
      alert("User updated successfully");
      setShowEditPopup(false);
      setEditingUser(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to update user");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await setUserActive({ id: user._id, isActive: !user.isActive }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-blue-600" />
                User Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage users, roles, and circle assignments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={navigateToCircles}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Manage Circles
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, username, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="inspection">Inspector</option>
              <option value="circle_owner">Circle Owner</option>
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

            {/* Circle Filter */}
            <select
              value={selectedCircle}
              onChange={(e) => setSelectedCircle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Circles</option>
              {circles.map((circle) => (
                <option key={circle._id} value={circle._id}>
                  {circle.name}
                </option>
              ))}
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
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Sr#
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    CNIC
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Circle(s)
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-medium text-sm text-gray-900">
                          {user.username}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.fullName}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {user.cellPhone || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {user.cnic || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-sm text-gray-600 block truncate max-w-[200px]"
                          title={user.address || "—"}
                        >
                          {user.address || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "inspection"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {user.role === "inspection"
                            ? "Inspector"
                            : user.role === "circle_owner"
                            ? "Circle Owner"
                            : "Admin"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {user.role === "circle_owner" ? (
                          <span className="text-sm text-gray-600">
                            {user?.assignedCircle?.name || "—"}
                          </span>
                        ) : user.role === "inspection" &&
                          Array.isArray(user.assignedCircles) &&
                          user.assignedCircles.length ? (
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {user.assignedCircles.map((circle, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800"
                              >
                                {circle.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          title={
                            user.isActive ? "Deactivate user" : "Activate user"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openView(user)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="View User"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete User"
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

        {/* Add User Popup */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center  z-50">
            <div className="bg-white w-[600px]  rounded-2xl shadow-2xl p-8 relative animate-fadeIn">
              {/* Close Button */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
              >
                ✕
              </button>

              {/* Title */}
              <h2 className="text-xl font-semibold mb-5 border-b pb-2 text-gray-700">
                Add New User
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Username + Full Name */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    />
                    {errors.username && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.username}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    />
                    {errors.fullName && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.fullName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                      required
                    />
                    {errors.email && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="cellPhone"
                      value={formData.cellPhone}
                      onChange={handleChange}
                      placeholder="+92-300-1234567"
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                    />
                    {errors.cellPhone && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.cellPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-xs text-red-600 mt-1">
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* Role + Status */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="inspection">Inspector</option>
                      <option value="circle_owner">Circle Owner</option>
                    </select>
                    {errors.role && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.role}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "true",
                        })
                      }
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Circle Selection */}
                {formData.role === "inspection" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Inspection Circles *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            showCirclesDropdown: !prev.showCirclesDropdown,
                          }))
                        }
                        className="border w-full text-left p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none flex justify-between items-center"
                      >
                        <span>
                          {formData.assignedCircles.length
                            ? circles
                                .filter((c) =>
                                  formData.assignedCircles.includes(c._id)
                                )
                                .map((c) => c.name)
                                .join(", ")
                            : "Select circles"}
                        </span>
                        <span className="text-xs text-gray-500">▼</span>
                      </button>
                      {formData.showCirclesDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-56 overflow-auto">
                          {circles.map((c) => {
                            const checked = formData.assignedCircles.includes(
                              c._id
                            );
                            return (
                              <label
                                key={c._id}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setFormData((prev) => {
                                      const next = checked
                                        ? prev.assignedCircles.filter(
                                            (id) => id !== c._id
                                          )
                                        : [...prev.assignedCircles, c._id];
                                      return { ...prev, assignedCircles: next };
                                    });
                                  }}
                                  className="accent-green-600"
                                />
                                <span>{c.name}</span>
                              </label>
                            );
                          })}
                          <div className="px-3 py-2 border-t flex justify-between text-xs bg-gray-50">
                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  assignedCircles: circles.map((ci) => ci._id),
                                }))
                              }
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  assignedCircles: [],
                                }))
                              }
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.assignedCircles && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.assignedCircles}
                      </span>
                    )}
                  </div>
                )}
                {formData.role === "circle_owner" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Managed Circle *
                    </label>
                    <select
                      name="assignedCircle"
                      value={formData.assignedCircle}
                      onChange={handleChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    >
                      <option value="">Select Circle</option>
                      {circles.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.assignedCircle && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.assignedCircle}
                      </span>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600  text-white py-2 px-6 rounded-lg hover:bg-green-700  transition-colors disabled:opacity-70"
                  >
                    {isLoading ? "Saving..." : "Save User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showEditPopup && editingUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white w-[650px] rounded-2xl shadow-2xl p-8 relative animate-fadeIn">
              <button
                onClick={() => setShowEditPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-5 border-b pb-2 text-gray-700">
                Update User
              </h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-2">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6 mb-4 pb-4 border-b">
                  <div className="flex-shrink-0">
                    <img
                      src={profilePicPreview || editingUser.profilePic}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-green-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                      id="profilePicInput"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                    >
                      Change Picture
                    </label>
                    {profilePicFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {profilePicFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editingUser.username}
                      onChange={handleEditFieldChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    />
                    {editErrors.username && (
                      <span className="text-xs text-red-600 mt-1">
                        {editErrors.username}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={editingUser.fullName}
                      onChange={handleEditFieldChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    />
                    {editErrors.fullName && (
                      <span className="text-xs text-red-600 mt-1">
                        {editErrors.fullName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      value={editingUser.email}
                      disabled
                      className="border p-2 rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="cellPhone"
                      value={editingUser.cellPhone || ""}
                      onChange={handleEditFieldChange}
                      placeholder="+92-300-1234567"
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                    {editErrors.cellPhone && (
                      <span className="text-xs text-red-600 mt-1">
                        {editErrors.cellPhone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      CNIC
                    </label>
                    <input
                      type="text"
                      name="cnic"
                      value={editingUser.cnic || ""}
                      onChange={handleEditFieldChange}
                      placeholder="12345-6789012-3"
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editingUser.address || ""}
                      onChange={handleEditFieldChange}
                      placeholder="Street, City, Country"
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={editingUser.role}
                      onChange={handleEditFieldChange}
                      disabled={editingUser.role === "admin"}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none disabled:bg-gray-100"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="inspection">Inspector</option>
                      <option value="circle_owner">Circle Owner</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Status *
                    </label>
                    <select
                      name="isActive"
                      value={editingUser.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setEditingUser((prev) => ({
                          ...prev,
                          isActive: e.target.value === "true",
                        }))
                      }
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                {editingUser.role !== "admin" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={editingUser.role}
                      onChange={handleEditFieldChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600  focus:outline-none"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="inspection">Inspector</option>
                      <option value="circle_owner">Circle Owner</option>
                    </select>
                  </div>
                )}
                {editingUser.role === "inspection" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Inspection Circles *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingUser((prev) => ({
                            ...prev,
                            showCirclesDropdown: !prev.showCirclesDropdown,
                          }))
                        }
                        className="border w-full text-left p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none flex justify-between items-center"
                      >
                        <span className="truncate">
                          {editingUser.assignedCircles.length
                            ? circles
                                .filter((c) =>
                                  editingUser.assignedCircles.includes(c._id)
                                )
                                .map((c) => c.name)
                                .join(", ")
                            : "Select circles"}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">▼</span>
                      </button>
                      {editingUser.showCirclesDropdown && (
                        <div className="absolute z-50 mt-1 left-0 right-0 bg-white border rounded-md shadow-lg max-h-56 overflow-auto">
                          {circles.map((c) => {
                            const checked =
                              editingUser.assignedCircles.includes(c._id);
                            return (
                              <label
                                key={c._id}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setEditingUser((prev) => {
                                      const next = checked
                                        ? prev.assignedCircles.filter(
                                            (id) => id !== c._id
                                          )
                                        : [...prev.assignedCircles, c._id];
                                      return { ...prev, assignedCircles: next };
                                    });
                                  }}
                                  className="accent-green-600"
                                />
                                <span>{c.name}</span>
                              </label>
                            );
                          })}
                          <div className="px-3 py-2 border-t flex justify-between text-xs bg-gray-50">
                            <button
                              type="button"
                              className="text-blue-600 hover:underline"
                              onClick={() =>
                                setEditingUser((prev) => ({
                                  ...prev,
                                  assignedCircles: circles.map((ci) => ci._id),
                                }))
                              }
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() =>
                                setEditingUser((prev) => ({
                                  ...prev,
                                  assignedCircles: [],
                                }))
                              }
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {editErrors.assignedCircles && (
                      <span className="text-xs text-red-600 mt-1">
                        {editErrors.assignedCircles}
                      </span>
                    )}
                  </div>
                )}
                {editingUser.role === "circle_owner" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1">
                      Managed Circle *
                    </label>
                    <select
                      name="assignedCircle"
                      value={editingUser.assignedCircle}
                      onChange={handleEditFieldChange}
                      className="border p-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
                      required
                    >
                      <option value="">Select Circle</option>
                      {circles.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {editErrors.assignedCircle && (
                      <span className="text-xs text-red-600 mt-1">
                        {editErrors.assignedCircle}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    {isUpdating ? "Updating..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewPopup && viewingUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 relative">
              <button
                onClick={closeView}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                User Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-100 shadow-lg mb-3">
                    <img
                      src={
                        viewingUser.profilePic ||
                        "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration-eps10_268834-1920.jpg"
                      }
                      alt={viewingUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      viewingUser.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewingUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* User Information */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Username
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {viewingUser.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Full Name
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {viewingUser.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Email
                      </p>
                      <p className="text-sm text-gray-900">
                        {viewingUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-gray-900">
                        {viewingUser.cellPhone || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        CNIC
                      </p>
                      <p className="text-sm text-gray-900">
                        {viewingUser.cnic || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Role
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          viewingUser.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : viewingUser.role === "inspection"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {viewingUser.role === "inspection"
                          ? "Inspector"
                          : viewingUser.role === "circle_owner"
                          ? "Circle Owner"
                          : "Admin"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Address
                    </p>
                    <p className="text-sm text-gray-900">
                      {viewingUser.address || "—"}
                    </p>
                  </div>

                  {viewingUser.role === "circle_owner" &&
                    viewingUser.assignedCircle && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">
                          Assigned Circle
                        </p>
                        <p className="text-sm text-gray-900">
                          {viewingUser.assignedCircle.name}
                        </p>
                      </div>
                    )}

                  {viewingUser.role === "inspection" &&
                    viewingUser.assignedCircles &&
                    viewingUser.assignedCircles.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">
                          Assigned Circles
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {viewingUser.assignedCircles.map((circle) => (
                            <span
                              key={circle._id}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {circle.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Created At
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date(viewingUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Updated At
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date(viewingUser.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default User;
