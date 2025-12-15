import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetpenaltiesQuery, useReviewPenaltyMutation } from "@/api/apiSlice";

function Action() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState("");
  const [actionStatus, setActionStatus] = useState(null);

  const { data } = useGetpenaltiesQuery();
  const penalties = data?.data || [];
  console.log("data", data);

  const penaltyData = penalties.find((p) => p._id === id);

  const [reviewPenalty] = useReviewPenaltyMutation();

  const handleYes = async () => {
    await reviewPenalty({
      id,
      reviewData: {
        status: "approved",
        adminNotes: remarks,
      },
    });

    setActionStatus("submitted");
    setTimeout(() => navigate("/Penalties"), 1500);
  };

  const handleNo = async () => {
    await reviewPenalty({
      id,
      reviewData: {
        status: "rejected",
        adminNotes: remarks,
      },
    });

    setActionStatus("not-submitted");
    setTimeout(() => navigate("/Penalties"), 1500);
  };

  if (!penaltyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-xl">Penalty not found</p>
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
                <strong>Contractor:</strong> {penaltyData.contractor.name}
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
                <strong>Imposed By:</strong> {penaltyData.createdBy.fullName}
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
                actionStatus === "submitted"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {actionStatus === "submitted"
                ? " Submitted Successfully"
                : " Not Submitted"}
            </div>
          )}

          {/* Action Buttons */}
          {!actionStatus && (
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={handleYes}
                className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition"
              >
                Yes (Submitted)
              </button>
              <button
                onClick={handleNo}
                className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition"
              >
                No (Not Submitted)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Action;
