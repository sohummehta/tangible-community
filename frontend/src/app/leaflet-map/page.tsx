"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useMarkerPositions } from '@/hooks/useMarkerPositions';
import { LatLngTuple } from "leaflet";

const Map = dynamic(() => import("@/components/leaflet"), { ssr: false });

// Default park bounds
const defaultParkBounds = {
  topLeft: { lat: 32.561065, lng: -117.083997 },
  bottomRight: { lat: 32.558361, lng: -117.075475 },
};

// Calculate park center
function calculateParkCenter(): LatLngTuple {
  const centerLat = (defaultParkBounds.topLeft.lat + defaultParkBounds.bottomRight.lat) / 2;
  const centerLng = (defaultParkBounds.topLeft.lng + defaultParkBounds.bottomRight.lng) / 2;
  return [centerLat, centerLng];
}

export default function Home() {
  const [zoom, setZoom] = useState(17);
  const { markerPositions, loading, error } = useMarkerPositions();
  const parkCenter = calculateParkCenter();

  const toggleZoom = () => {
    setZoom(zoom === 17 ? 16 : 17);
  };

  return (
    <div className="mx-auto my-5 w-[98%]">
      {/* Status indicator */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        {loading && <div>🔄 Loading marker positions...</div>}
        {error && <div className="text-red-600">❌ Error: {error}</div>}
        
      </div>

      <div className="h-[480px]">
        <Map 
          parkCenter={parkCenter} 
          zoom={zoom} 
          backendAssets={markerPositions}
          parkBounds={defaultParkBounds}
        />
      </div>
      
      <div className="mt-4 flex gap-4">
        <button
          onClick={toggleZoom}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Toggle Zoom (Current: {zoom})
        </button>
        
        <div className="px-6 py-2 bg-gray-200 rounded flex items-center">
          Markers: {markerPositions.length}
        </div>
      </div>
    </div>
  );
}