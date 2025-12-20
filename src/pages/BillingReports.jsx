import Topbar from "@/components/topbar";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  useGetAllBillsQuery,
  useDeleteBillMutation,
  useUpdateBillAdminMutation,
  useGetBillByIdQuery,
} from "@/api/apiSlice";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  Search,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Image,
  X,
  Edit,
  Trash2,
  Settings,
  RotateCcw,
  Store,
  ChevronRight,
} from "lucide-react";

const BillingReports = () => {
  const [page] = useState(1);
  const { data: billsResponse, refetch } = useGetAllBillsQuery({
    page,
    limit: 100,
  });
  const [deleteBill] = useDeleteBillMutation();
  const [updateBillAdmin] = useUpdateBillAdminMutation();

  const billingData = useMemo(() => {
    return billsResponse?.data?.bills || [];
  }, [billsResponse]);

  const navigate = useNavigate();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef(null);

  const [columnVisibility, setColumnVisibility] = useState({
    refNo: true,
    shopName: true,
    owner: true,
    cellPhone: true,
    amount: true,
    area: true,
    month: true,
    dateTime: true,
    status: true,
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

  const { data: billDetailsResponse } = useGetBillByIdQuery(selectedBillId, {
    skip: !selectedBillId,
  });
  const billDetails = billDetailsResponse?.data;

  console.log("Billing Data", billingData);

  // Filter billing data based on search and filters
  const filteredBillingData = useMemo(() => {
    return billingData.filter((bill) => {
      const billType = bill.billingType || {};
      const matchesSearch =
        (billType.shopName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (billType.refNo?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (billType.owner?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (billType.area?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      // Month filter - match month name in bill.month string (e.g., "November 2024")
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const matchesMonth = selectedMonth
        ? (bill.month || "").includes(monthNames[parseInt(selectedMonth)])
        : true;

      // Area filter - case-insensitive partial match
      const matchesArea = selectedArea
        ? (billType.area?.toLowerCase() || "").includes(
            selectedArea.toLowerCase()
          )
        : true;

      const matchesStatus = selectedStatus
        ? bill.status === selectedStatus
        : true;

      return matchesSearch && matchesMonth && matchesArea && matchesStatus;
    });
  }, [billingData, searchTerm, selectedMonth, selectedArea, selectedStatus]); // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredBillingData.reduce(
      (sum, bill) => sum + (bill.amount || 0),
      0
    );
    const paid = filteredBillingData
      .filter((bill) => bill.status === "paid")
      .reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const unpaid = total - paid;

    return {
      totalBills: filteredBillingData.length,
      totalAmount: total,
      paidAmount: paid,
      unpaidAmount: unpaid,
      paidCount: filteredBillingData.filter((bill) => bill.status === "paid")
        .length,
      unpaidCount: filteredBillingData.filter(
        (bill) => bill.status === "unpaid"
      ).length,
    };
  }, [filteredBillingData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleImageClick = (imageUrl, shopName) => {
    setSelectedImage({ url: imageUrl, shopName });
    setShowImageModal(true);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await deleteBill(billId).unwrap();
        refetch();
        alert("Bill deleted successfully");
      } catch (error) {
        console.error("Failed to delete bill:", error);
        alert("Failed to delete bill");
      }
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleExportReport = () => {
    // Simple CSV export functionality
    const headers = [
      "Bill No",
      "Shop Name",
      "Owner",
      "Cell Phone",
      "Amount (PKR)",
      "Area",
      "Month",
      "Date",
      "Time",
      "Due Date",
      "Status",
      "Image URL",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredBillingData.map((bill) =>
        [
          bill.billNo,
          bill.shopName,
          bill.owner,
          bill.cellPhone,
          bill.amount,
          bill.area,
          bill.month,
          formatDate(bill.issueDate),
          bill.issueTime,
          formatDate(bill.dueDate),
          bill.status,
          bill.image,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                <FileText className="w-7 h-7 text-cyan-600" />
                Billing Reports
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive billing reports for penalty management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/billing-types")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4" />
                Billing Types
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Total Bills</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {summaryStats.totalBills}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Paid Amount</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrency(summaryStats.paidAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Unpaid Amount
                </p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {formatCurrency(summaryStats.unpaidAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Search */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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

            {/* Right side - Filters and Column Settings */}
            <div className="flex items-center gap-4">
              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>

              {/* Area Filter */}
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Areas</option>
                <option value="Market">Market</option>
                <option value="Bazaar">Bazaar</option>
                <option value="Industrial">Industrial</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMonth("");
                  setSelectedArea("");
                  setSelectedStatus("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
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
          Showing {filteredBillingData.length} of {billingData.length} billing
          records
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  {columnVisibility.refNo && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Bill Ref No
                    </th>
                  )}
                  {columnVisibility.shopName && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Shop Name
                    </th>
                  )}
                  {columnVisibility.owner && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Owner
                    </th>
                  )}
                  {columnVisibility.cellPhone && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Cell Phone
                    </th>
                  )}
                  {columnVisibility.amount && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Amount
                    </th>
                  )}
                  {columnVisibility.area && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Area
                    </th>
                  )}
                  {columnVisibility.month && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Month
                    </th>
                  )}
                  {columnVisibility.dateTime && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date & Time
                    </th>
                  )}
                  {columnVisibility.status && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  {columnVisibility.actions && (
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBillingData.map((bill) => {
                  const billType = bill.billingType || {};
                  return (
                    <tr
                      key={bill._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columnVisibility.refNo && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="font-medium text-cyan-600">
                            {billType.refNo || "N/A"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.shopName && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="font-medium text-gray-900">
                            {billType.shopName || "N/A"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.owner && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                          {billType.owner || "N/A"}
                        </td>
                      )}
                      {columnVisibility.cellPhone && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="text-blue-600">
                            {billType.cellPhone || "N/A"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.amount && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(bill.amount || 0)}
                          </span>
                        </td>
                      )}
                      {columnVisibility.area && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {billType.area || "N/A"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.month && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {bill.month || "N/A"}
                          </span>
                        </td>
                      )}
                      {columnVisibility.dateTime && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">
                              {formatDate(bill.submittedDate || bill.createdAt)}
                            </span>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                bill.submittedDate || bill.createdAt
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </td>
                      )}
                      {columnVisibility.status && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              bill.status
                            )}`}
                          >
                            {bill.status}
                          </span>
                        </td>
                      )}
                      {columnVisibility.actions && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBillId(bill._id);
                                setShowViewModal(true);
                              }}
                              className="text-cyan-600 hover:text-cyan-900 p-1 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingBill(bill);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Edit Bill"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete Bill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredBillingData.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No billing data found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredBillingData.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Paid Bills</p>
                <p className="text-lg font-semibold text-green-600">
                  {summaryStats.paidCount} (
                  {formatCurrency(summaryStats.paidAmount)})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unpaid Bills</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {summaryStats.unpaidCount} (
                  {formatCurrency(summaryStats.unpaidAmount)})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedImage.shopName} - Shop Image
                </h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={selectedImage.url}
                  alt={`${selectedImage.shopName} image`}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300/6B7280/ffffff?text=Image+Not+Found";
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={closeImageModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Bill Modal */}
        {showEditModal && editingBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Bill - {editingBill.billingType?.refNo}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBill(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);

                  try {
                    await updateBillAdmin({
                      id: editingBill._id,
                      formData,
                    }).unwrap();
                    refetch();
                    setShowEditModal(false);
                    setEditingBill(null);
                    alert("Bill updated successfully");
                  } catch (error) {
                    console.error("Failed to update bill:", error);
                    alert(
                      "Failed to update bill: " +
                        (error.data?.message || "Unknown error")
                    );
                  }
                }}
                className="p-6 space-y-4"
              >
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue={editingBill.amount}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="month"
                    defaultValue={editingBill.month}
                    placeholder="e.g., January 2025"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    defaultValue={editingBill.status}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                {/* Evidence Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidence Picture
                  </label>
                  {editingBill.evidencePicture?.url && (
                    <div className="mb-2">
                      <img
                        src={editingBill.evidencePicture.url}
                        alt="Current Evidence"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="evidencePicture"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Bill Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Picture
                  </label>
                  {editingBill.billPicture?.url && (
                    <div className="mb-2">
                      <img
                        src={editingBill.billPicture.url}
                        alt="Current Bill"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="billPicture"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Proof Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof Image
                  </label>
                  {editingBill.proofImage?.url && (
                    <div className="mb-2">
                      <img
                        src={editingBill.proofImage.url}
                        alt="Current Proof"
                        className="h-20 w-20 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="proofImage"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingBill(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                  >
                    Update Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Bill Details Modal */}
        {showViewModal && billDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bill Details - {billDetails.billingType?.refNo}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBillId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Shop Information */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Shop Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Reference No</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.billingType?.refNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shop Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.billingType?.shopName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.billingType?.owner || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cell Phone</p>
                      <p className="text-base font-medium text-blue-600">
                        {billDetails.billingType?.cellPhone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Area</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.billingType?.area || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.billingType?.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Bill Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(billDetails.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Month</p>
                      <p className="text-base font-medium text-purple-700">
                        {billDetails.month || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          billDetails.status
                        )}`}
                      >
                        {billDetails.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {billDetails.submittedDate
                          ? formatDate(billDetails.submittedDate)
                          : "Not submitted"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Attached Images
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {billDetails.evidencePicture?.url && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Evidence Picture
                        </p>
                        <img
                          src={billDetails.evidencePicture.url}
                          alt="Evidence"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() =>
                            handleImageClick(
                              billDetails.evidencePicture.url,
                              "Evidence Picture"
                            )
                          }
                        />
                      </div>
                    )}
                    {billDetails.billPicture?.url && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Bill Picture
                        </p>
                        <img
                          src={billDetails.billPicture.url}
                          alt="Bill"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() =>
                            handleImageClick(
                              billDetails.billPicture.url,
                              "Bill Picture"
                            )
                          }
                        />
                      </div>
                    )}
                    {billDetails.proofImage?.url && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Proof Image
                        </p>
                        <img
                          src={billDetails.proofImage.url}
                          alt="Proof"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() =>
                            handleImageClick(
                              billDetails.proofImage.url,
                              "Proof Image"
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                  {!billDetails.evidencePicture?.url &&
                    !billDetails.billPicture?.url &&
                    !billDetails.proofImage?.url && (
                      <p className="text-gray-500 text-center py-4">
                        No images attached
                      </p>
                    )}
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Timestamps
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Created At</p>
                      <p className="text-gray-900 font-medium">
                        {formatDate(billDetails.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Updated At</p>
                      <p className="text-gray-900 font-medium">
                        {formatDate(billDetails.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBillId(null);
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
};

export default BillingReports;
