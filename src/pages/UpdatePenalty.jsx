import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetpenaltiesQuery, useUpdatePenaltyMutation } from "@/api/apiSlice";

function UpdatePenalty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: penaltiesData, isLoading } = useGetpenaltiesQuery();
  const [reviewPenalty] = useUpdatePenaltyMutation();

  const [formData, setFormData] = useState({
    description: "",
    area: "",
    address: "",
  });

  // Load penalty data when ready
  useEffect(() => {
    if (penaltiesData?.data) {
      const found = penaltiesData.data.find((p) => p._id === id);
      if (found) {
        setFormData({
          description: found.description || "",
          area: found.area || "",
          address: found.location?.address || "",
        });
      }
    }
  }, [penaltiesData, id]);
  console.log("data", penaltiesData.data);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await reviewPenalty({ id, payload: formData }).unwrap();

      alert("✅ Penalty updated successfully!");
      navigate("/Penalties");
    } catch (err) {
      console.error(err);
      alert("❌ Update failed");
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-green-600 py-4 px-8 text-white flex justify-between items-center">
        <button
          onClick={() => navigate("/Penalties")}
          className="hover:text-gray-200 cursor-pointer"
        >
          ← Back to Penalties
        </button>
      </div>

      <div className="flex-1 p-6 bg-gray-100">
        <div className="bg-white p-6 rounded-md shadow max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-700">
            Update Penalty
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                  placeholder="Enter penalty description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Area</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate("/Penalties")}
                className="px-6 py-2 border rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Update Penalty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePenalty;
