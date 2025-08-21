"use client"

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Button } from "@mui/material";

type Asset = { 
  id: number;
  name: string;
  type: string;
  marker_id: number;
  x_pos: number; 
  y_pos: number; 
  in_map: boolean;
  info: any;
};

// Asset type to image/color mapping
const ASSET_TYPE_CONFIG = {
  playground: { 
    image: '/asset-images/playground.png',
    color: '#FFD700',
    size: { width: 60, height: 40 }
  },
  dogpark: { 
    image: '/asset-images/dogpark.png',
    color: 'green',
    size: { width: 80, height: 60 }
  },
  restroom: { 
    image: '/asset-images/restroom.png',
    color: '#ADD8E6',
    size: { width: 40, height: 30 }
  },
  baseball: { 
    image: '/asset-images/baseball.png',
    color: '#8B4513',
    size: { width: 100, height: 70 }
  },
  default: {
    image: null,
    color: '#999999',
    size: { width: 50, height: 50 }
  }
};

/**
 * ArUco coordinate system: 35cm x 23cm (from OpenCV main.py)
 * We'll use this as our base coordinate system and scale to the display size
 */
const ARUCO_MAP_WIDTH = 35;  // cm
const ARUCO_MAP_HEIGHT = 23; // cm

// Real image pixels (map background image)
const IMG_W = 2800;
const IMG_H = 1054;
const IMG_RATIO = IMG_W / IMG_H; // ≈ 2.6578

export default function Mapping() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: Math.round(900 / IMG_RATIO) });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assets from backend
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/assets/');
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        // Only show assets that are marked as in_map
        setAssets(data.filter((asset: Asset) => asset.in_map));
        setError(null);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
    
    // Refresh assets every 5 seconds to get updated positions
    const interval = setInterval(fetchAssets, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Scale from ArUco coordinate system to display coordinates
  const scaleX = size.w / ARUCO_MAP_WIDTH;
  const scaleY = size.h / ARUCO_MAP_HEIGHT;

  const getAssetConfig = (type: string) => {
    const lowerType = type.toLowerCase();
    return ASSET_TYPE_CONFIG[lowerType as keyof typeof ASSET_TYPE_CONFIG] || ASSET_TYPE_CONFIG.default;
  };

  if (loading) {
    return (
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "20px", textAlign: "center" }}>
        Loading assets...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: size.h,                  // height derived from ratio
          border: "2px solid #000",
          backgroundImage: 'url("/map.png")',
          backgroundSize: "cover",         // keeps fill without letterboxing
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#dceac2",      // optional tint
        }}
      >
        {assets.map((asset) => {
          const config = getAssetConfig(asset.type);
          const displayWidth = config.size.width * Math.min(scaleX, scaleY); // Keep aspect ratio
          const displayHeight = config.size.height * Math.min(scaleX, scaleY);
          
          return (
            <div
              key={asset.id}
              style={{
                position: "absolute",
                top: asset.y_pos * scaleY - displayHeight / 2, // Center the asset on its position
                left: asset.x_pos * scaleX - displayWidth / 2,
                width: displayWidth,
                height: displayHeight,
                backgroundColor: config.color,
                border: "2px solid black",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: Math.max(10, Math.min(14, displayWidth / 8)),
                color: "white",
                textShadow: "1px 1px 1px black",
                fontWeight: "bold",
                boxSizing: "border-box",
                backgroundImage: config.image ? `url(${config.image})` : 'none',
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
              title={`${asset.name} (${asset.type}) - Marker ID: ${asset.marker_id}`}
            >
              {!config.image && (
                <span style={{ textAlign: "center", padding: "2px" }}>
                  {asset.name}
                </span>
              )}
            </div>
          );
        })}
        
        {/* Debug info */}
        <div style={{ 
          position: "absolute", 
          top: 10, 
          right: 10, 
          background: "rgba(0,0,0,0.7)", 
          color: "white", 
          padding: "5px",
          borderRadius: "3px",
          fontSize: "12px"
        }}>
          Assets: {assets.length} | Scale: {scaleX.toFixed(2)}x, {scaleY.toFixed(2)}x
        </div>
      </div>
    </div>
  );
}


//export default Mapping;
