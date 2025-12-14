import React, { useState } from "react";
import { Polygon } from "react-leaflet";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  Tooltip,
} from "react-leaflet";
import { isWithinInterval } from "date-fns";
import "leaflet/dist/leaflet.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FitBounds = ({ markers }) => {
  const map = useMap();

  if (markers.length > 0) {
    const bounds = markers.map((item) => [
      item.location.coordinates[1],
      item.location.coordinates[0],
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return null;
};

const PenaltyMap = ({ data }) => {
  console.log("Map data:", data);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [severity, setSeverity] = useState(""); // Original severity filter
  const [heapSize, setHeapSize] = useState(""); // New heap size filter
  const navigate = useNavigate();

  // Categorize penalties by amount into heap sizes
  const getHeapCategory = (amount) => {
    const num =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^\d.-]/g, ""))
        : Number(amount);

    if (isNaN(num) || num <= 0) return null;

    if (num <= 10000) return "small";
    if (num <= 50000) return "medium";
    return "high";
  };

  const getColor = (amount) => {
    if (amount == null) return "gray";
    const num =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^\d.-]/g, ""))
        : Number(amount);

    if (isNaN(num)) return "gray";

    // Color based on heap size
    if (num <= 10000) return "#22c55e"; // green for small
    if (num <= 50000) return "#f59e0b"; // orange for medium
    return "#ef4444"; // red for high
  };

  const areaOptions = Array.from(new Set(data.map((d) => d?.area))).filter(
    Boolean
  );

  const filteredData = data.filter((item) => {
    const amount =
      Number(item.penaltyAmount?.toString().replace(/,/g, "")) || 0;

    if (fromDate || toDate) {
      const penaltyDate = new Date(item.createdAt);
      const start = fromDate ? new Date(fromDate) : new Date("1900-01-01");
      const end = toDate ? new Date(toDate) : new Date("2999-12-31");
      penaltyDate.setHours(0, 0, 0, 0);
      if (!isWithinInterval(penaltyDate, { start, end })) return false;
    }

    // ✅ APPLY AREA FILTER
    if (selectedArea && item.area?.toLowerCase() !== selectedArea.toLowerCase())
      return false;

    // ✅ SEVERITY FILTER
    if (severity === "small" && amount > 5000) return false;
    if (severity === "medium" && (amount <= 5000 || amount > 12000))
      return false;
    if (severity === "high" && amount <= 12000) return false;

    // ✅ HEAP SIZE FILTER
    if (heapSize) {
      if (getHeapCategory(amount) !== heapSize) return false;
    }

    return true;
  });

  // ---- Sadiqabad City Boundary ----
  // const sadiqabadBoundary = [
  //   [28.33034, 70.10888],
  //   [28.3241, 70.12975],
  //   [28.3128, 70.14712],
  //   [28.2969, 70.1474],
  //   [28.2879, 70.1382],
  //   [28.2804, 70.1229],
  //   [28.279, 70.1044],
  //   [28.2862, 70.0898],
  //   [28.2988, 70.0796],
  //   [28.3152, 70.0822],
  //   [28.3265, 70.0949],
  // ];
  // ---- Sadiqabad Sector Boundaries (Example Zones) ----
  const sectors = [
    {
      name: "Model Town A",
      color: "#4ade80",
      coords: [
        [28.3155, 70.1105],
        [28.3121, 70.1207],
        [28.3074, 70.1189],
        [28.3095, 70.1088],
      ],
    },
    {
      name: "Mazari Chowk",
      color: "#60a5fa",
      coords: [
        [28.3029, 70.1325],
        [28.3002, 70.1402],
        [28.296, 70.137],
        [28.2977, 70.129],
      ],
    },
    {
      name: "Jinnah Town",
      color: "#f472b6",
      coords: [
        [28.3204, 70.1232],
        [28.3169, 70.134],
        [28.312, 70.1302],
        [28.3145, 70.1201],
      ],
    },

    // ✅ New Sectors Below
    {
      name: "City Chowk",
      color: "#fb923c",
      coords: [
        [28.3101, 70.1154],
        [28.3072, 70.1211],
        [28.3038, 70.1187],
        [28.3057, 70.1129],
      ],
    },
    {
      name: "Gulshan Colony",
      color: "#34d399",
      coords: [
        [28.3225, 70.1301],
        [28.319, 70.1374],
        [28.3147, 70.1343],
        [28.3173, 70.1269],
      ],
    },
    {
      name: "Bismillah Town",
      color: "#a78bfa",
      coords: [
        [28.305, 70.145],
        [28.3016, 70.1512],
        [28.2974, 70.1479],
        [28.3003, 70.1407],
      ],
    },
    {
      name: "Katchery Road",
      color: "#facc15",
      coords: [
        [28.3142, 70.1401],
        [28.3098, 70.1474],
        [28.3056, 70.144],
        [28.3091, 70.1368],
      ],
    },
    {
      name: "Sui Gas Road",
      color: "#fca5a5",
      coords: [
        [28.2982, 70.125],
        [28.2951, 70.1317],
        [28.2905, 70.1284],
        [28.2934, 70.1219],
      ],
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header and filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white shadow-sm">
        <div
          onClick={() => navigate("/home")}
          className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 hover:text-black" />
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-600">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600">
              Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">All Areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Original Severity Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">All</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* New Heap Size Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600">
              Heap Size
            </label>
            <select
              value={heapSize}
              onChange={(e) => setHeapSize(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">All Heaps</option>
              <option value="small">Small (≤ 10,000)</option>
              <option value="medium">Medium (10,001 - 50,000)</option>
              <option value="high">High (&gt; 50,000)</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSelectedArea("");
              setSeverity("");
              setHeapSize("");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Legend */}
      {/* <div className="absolute top-24 right-6 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200">
        <h3 className="text-xs font-bold text-gray-700 mb-2">
          Heap Size Legend
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#22c55e" }}
            ></div>
            <span className="text-xs text-gray-600">Small (≤ Rs. 10,000)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#f59e0b" }}
            ></div>
            <span className="text-xs text-gray-600">
              Medium (Rs. 10,001 - 50,000)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            ></div>
            <span className="text-xs text-gray-600">
              High (&gt; Rs. 50,000)
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          Total: {filteredData.length} penalties
        </div>
      </div> */}

      {/* Map */}
      <div className="flex-1 p-6 relative">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No penalties found.
          </div>
        ) : (
          <MapContainer
            center={[28.3062, 70.1302]}
            zoom={13}
            className="h-[85vh] w-full rounded-lg shadow-lg z-0"
            minZoom={12}
            maxZoom={18}
            scrollWheelZoom={true}
            maxBounds={[
              [28.27, 70.07],
              [28.35, 70.2],
            ]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Sadiqabad Boundary */}
            {/* <Polygon
              positions={sadiqabadBoundary}
              pathOptions={{
                color: "red",
                weight: 3,
                fillOpacity: 0.1,
              }}
            /> */}
            {sectors.map((sector, index) => (
              <Polygon
                key={index}
                positions={sector.coords}
                pathOptions={{
                  color: sector.color,
                  weight: 2,
                  fillOpacity: 0.15,
                }}
              >
                <Tooltip sticky>{sector.name}</Tooltip>
              </Polygon>
            ))}

            <FitBounds markers={filteredData} />
            {filteredData.map((item, i) => {
              const coords = item?.location?.coordinates;
              if (!coords || coords.length < 2) return null;

              return (
                <CircleMarker
                  key={i}
                  center={[coords[1], coords[0]]}
                  radius={8}
                  fillColor={getColor(item.penaltyAmount)}
                  color="#fff"
                  weight={2}
                  fillOpacity={0.85}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                    <div className="min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm">{item.area}</p>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{
                            backgroundColor: getColor(item.penaltyAmount),
                          }}
                        >
                          {getHeapCategory(item.penaltyAmount)?.toUpperCase()}
                        </span>
                      </div>
                      {/* <p className="text-xs text-gray-600">
                        Amount:{" "}
                        <span className="font-semibold">
                          Rs. {item.penaltyAmount}
                        </span>
                      </p> */}
                      <p className="text-xs text-gray-500 mt-1">
                        Date: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      {item.location?.address && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.location.address}
                        </p>
                      )}
                      {item.inspectionImages &&
                        item.inspectionImages.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {item.inspectionImages[0] && (
                              <img
                                src={item.inspectionImages[0].url}
                                alt="Before"
                                className="w-20 h-20 object-cover rounded shadow"
                              />
                            )}
                            {item.inspectionImages[1] && (
                              <img
                                src={item.inspectionImages[1].url}
                                alt="After"
                                className="w-20 h-20 object-cover rounded shadow"
                              />
                            )}
                          </div>
                        )}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default PenaltyMap;
