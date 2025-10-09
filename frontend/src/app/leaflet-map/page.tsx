"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Map = dynamic(() => import("@/components/leaflet"), { ssr: false });

export default function Home() {
  const [zoom, setZoom] = useState(17);

  const toggleZoom = () => {
    setZoom(zoom === 17 ? 16 : 17);
  };

  return (
    <div className="mx-auto my-5 w-[98%]">
      <div className="h-[480px]">
        <Map posix={[32.559697, -117.079759]} zoom={zoom} />
      </div>
      <button
        onClick={toggleZoom}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Toggle Zoom (Current: {zoom})
      </button>
    </div>
  );
}