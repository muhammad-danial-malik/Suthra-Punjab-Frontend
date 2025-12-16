import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetpenaltiesQuery, useReviewPenaltyMutation } from "@/api/apiSlice";

function Action() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState("");
  const [actionStatus, setActionStatus] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data } = useGetpenaltiesQuery();
  const penalties = data?.data || [];
  console.log("data", data);

  const penaltyData = penalties.find((p) => p._id === id);

  const [reviewPenalty] = useReviewPenaltyMutation();

  const handleApprove = async () => {
    setIsNavigating(true);
    await reviewPenalty({
      id,
      reviewData: {
        action: "approve",
        adminNotes: remarks,
      },
    });

    setActionStatus("approved");
    setTimeout(() => navigate("/Penalties"), 1500);
  };

  const handleReject = async () => {
    setIsNavigating(true);
    await reviewPenalty({
      id,
      reviewData: {
        action: "reject",
        adminNotes: remarks,
      },
    });

    setActionStatus("rejected");
    setTimeout(() => navigate("/Penalties"), 1500);
  };

  if (!penaltyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Penalty not found</p>
          <button
            onClick={() => navigate("/Penalties")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Penalties
          </button>
        </div>
      </div>
    );
  }

  // Only allow review for resolved penalties
  if (penaltyData.status !== "resolved" && !isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Action Not Available
          </h2>
          <p className="text-gray-600 mb-2">
            Only penalties with{" "}
            <span className="font-semibold text-yellow-600">Resolved</span>{" "}
            status can be reviewed for approval or rejection.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current Status:{" "}
            <span className="font-semibold capitalize">
              {penaltyData.status}
            </span>
          </p>
          <button
            onClick={() => navigate("/Penalties")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Penalties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white py-4 px-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/Penalties")}
          className="hover:text-gray-200"
        >
          ← Back to Penalties
        </button>
        <h1 className="text-xl font-semibold">Penalty Action Details</h1>
        <div className="flex gap-4">
          <span>🔔</span>
          <span>⚙️</span>
          <span>👤</span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Penalty Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Penalty Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Penalty ID:</strong> {penaltyData.penaltyId}
              </p>
              {/* <p><strong>Type:</strong> {penaltyData.penaltyType}</p> */}
              <p>
                <strong>Supervisor:</strong>{" "}
                {penaltyData.contractor?.name || "-"}
              </p>
              <p>
                <strong>Office:</strong> {penaltyData.departmentName}
              </p>
              <p>
                <strong>Score:</strong>{" "}
                <span className="font-semibold text-green-700">
                  {penaltyData.penaltyType?.amount ?? "-"}
                </span>
              </p>
              <p>
                <strong>Status:</strong> {penaltyData.status}
              </p>
              <p>
                <strong>Date:</strong> {penaltyData.createdAt}
              </p>
              <p>
                <strong>Imposed By:</strong>{" "}
                {penaltyData.createdBy?.fullName || "-"}
              </p>
            </div>
          </div>

          {/* Before / After Images */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Before / After Images
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Before */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-red-100 text-red-700 font-semibold text-center py-2">
                  Before
                </div>
                <div className="aspect-video flex items-center justify-center bg-gray-200">
                  {penaltyData.inspectionImages ? (
                    <img
                      src={penaltyData.inspectionImages[0]?.url}
                      alt="image"
                      className="object-contain  max-w-36 h-32 "
                    />
                  ) : (
                    <p className="text-gray-500">No image available</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-100 text-green-700 font-semibold text-center py-2">
                  After
                </div>
                <div className="aspect-video flex items-center justify-center bg-gray-200">
                  {penaltyData.resolutionImages ? (
                    <img
                      src={penaltyData.resolutionImages[0]?.url}
                      alt="After"
                      className="object-contain  max-w-36 h-32"
                    />
                  ) : (
                    <p className="text-gray-500">No image available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Remarks
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm">
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add remarks..."
                  className="border-none outline-none w-full"
                />
              </p>
            </div>
          </div>

          {/* Action Status */}
          {actionStatus && (
            <div
              className={`p-4 mb-4 text-center rounded-lg font-semibold ${
                actionStatus === "approved"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {actionStatus === "approved"
                ? "Penalty Approved Successfully"
                : "Penalty Rejected"}
            </div>
          )}

          {/* Action Buttons */}
          {!actionStatus && (
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Action;
