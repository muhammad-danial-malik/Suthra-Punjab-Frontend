import React from "react";
import PenaltyMap from "../components/PenaltyMap";
import { useGetpenaltiesQuery } from "@/api/apiSlice";

function HeapHistory() {
  const { data: penaltiesApiData } = useGetpenaltiesQuery();
  const penaltiesData = penaltiesApiData?.data || [];

  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        <PenaltyMap data={penaltiesData} />
      </div>
    </div>
  );
}

export default HeapHistory;
