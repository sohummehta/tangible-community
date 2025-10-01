"use client"

import React, { useLayoutEffect, useRef, useState } from "react";
import { CircularProgress, Alert, Box } from "@mui/material";
import { useMarkerPositions } from "@/hooks/useMarkerPositions";
import { 
  convertBackendToFrontend, 
  getAssetColor, 
  getDefaultAssetSize,
  FRONTEND_BASE_WIDTH,
  FRONTEND_BASE_HEIGHT
} from "@/utils/coordinateConverter";

/**
 * Base coordinate system dimensions
 * This is the coordinate space we convert backend data into
 * Imported from coordinateConverter to maintain consistency
 */
const BASE_W = FRONTEND_BASE_WIDTH;
const BASE_H = FRONTEND_BASE_HEIGHT; 


// Real image pixels
const IMG_W = 2800;
const IMG_H = 1054;
const IMG_RATIO = IMG_W / IMG_H; // ≈ 2.6578

export default function Mapping() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: Math.round(900 / IMG_RATIO) });
  
  // Fetch real-time marker positions from backend
  const { markerPositions, loading, error } = useMarkerPositions();

  // Track container width and compute height from the true image ratio
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      const h = w / IMG_RATIO;
      setSize({ w, h });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const scaleX = size.w / BASE_W;
  const scaleY = size.h / BASE_H;

  // Convert backend marker positions to frontend display format
  const displayAssets = markerPositions.map((marker) => {
    // Convert backend coordinates (cm) to frontend coordinates (pixels)
    const { x, y } = convertBackendToFrontend(marker.x, marker.y);
    
    // Get size and color based on asset type
    const { width, height } = getDefaultAssetSize(marker.asset_type);
    const color = getAssetColor(marker.asset_type);
    
    return {
      id: marker.id,
      name: marker.asset_name,
      x: x - width / 2, // Center the asset on the marker position
      y: y - height / 2,
      width,
      height,
      color,
      rotation: marker.rotation
    };
  });

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={30} />
          <Box ml={2}>Loading marker positions...</Box>
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error} - Make sure your backend is running on http://localhost:8000
        </Alert>
      )}
      
      {/* Map display */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: size.h,
          border: "2px solid #000",
          backgroundImage: 'url("/map.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#dceac2",
        }}
      >
        {/* Display real-time marker positions */}
        {displayAssets.map((asset) => (
          <div
            key={asset.id}
            style={{
              position: "absolute",
              top: asset.y * scaleY,
              left: asset.x * scaleX,
              width: asset.width * scaleX,
              height: asset.height * scaleY,
              backgroundColor: asset.color,
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "black",
              boxSizing: "border-box",
              transform: `rotate(${asset.rotation}deg)`,
              transition: "all 0.5s ease-in-out", // Smooth animation for position changes
              transformOrigin: "center center",
            }}
          >
            {asset.name}
          </div>
        ))}
        
        {/* Show message if no markers detected */}
        {!loading && displayAssets.length === 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            color="#666"
            fontSize={14}
          >
            No markers detected. Place markers on the physical map.
          </Box>
        )}
      </div>
    </div>
  );
}
