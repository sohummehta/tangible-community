"use client"

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Button } from "@mui/material";

// Backend asset interface
interface BackendAsset {
  id: number;
  name: string;
  type: {
    type_name: string;
    cost: number;
    size: string;
    primary_user: string;
  };
  marker_id: number;
  x_pos: number;
  y_pos: number;
  in_understand: boolean;
  in_map: boolean;
  info: any;
}

// Frontend asset interface
type Asset = { 
  id: string; 
  name: string;
  type_name: string;
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  color: string;
  imageUrl?: string;
};

// Map asset types to images and colors
const assetConfig: Record<string, { imageUrl?: string; color: string; width: number; height: number }> = {
  playground: { imageUrl: "/asset-images/playground.png", color: "#FFD700", width: 80, height: 40 },
  dogpark: { imageUrl: "/asset-images/dogpark.png", color: "green", width: 100, height: 100 },
  restroom: { imageUrl: "/asset-images/restroom.png", color: "#ADD8E6", width: 55, height: 30 },
  baseball: { imageUrl: "/asset-images/baseball.png", color: "#CD853F", width: 120, height: 80 },
  baseballfield: { imageUrl: "/asset-images/baseball.png", color: "#CD853F", width: 120, height: 80 },
  // Default for unknown types
  default: { color: "#808080", width: 60, height: 40 }
};

/**
 * Choose the coordinate system you authored against.
 * If you originally placed objects on a 600×450 canvas, keep these as 600/450.
 * If you want to use the map's native pixels instead, set to 2800/1054
 * and input asset coords/sizes in that space.
 */
const BASE_W = 600;
const BASE_H = 450;

// Real image pixels (what you told me)
const IMG_W = 2800;
const IMG_H = 1054;
const IMG_RATIO = IMG_W / IMG_H; // ≈ 2.6578

// Function to fetch assets from backend
const fetchMapAssets = async (): Promise<BackendAsset[]> => {
  try {
    const response = await fetch('http://localhost:8000/ideas/map-assets/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching map assets:', error);
    // Return empty array on error - we'll show fallback message
    return [];
  }
};

// Fallback mock data when backend is not available
const mockBackendAssets: BackendAsset[] = [
  {
    id: 1,
    name: "playground_1",
    type: {
      type_name: "playground",
      cost: 15000,
      size: "20×10 m",
      primary_user: "Children and families"
    },
    marker_id: 1,
    x_pos: 100,
    y_pos: 150,
    in_understand: false,
    in_map: true,
    info: {}
  },
  {
    id: 2,
    name: "dogpark_1",
    type: {
      type_name: "dogpark", 
      cost: 25000,
      size: "30×30 m",
      primary_user: "Dog owners"
    },
    marker_id: 2,
    x_pos: 300,
    y_pos: 200,
    in_understand: false,
    in_map: true,
    info: {}
  },
  {
    id: 3,
    name: "restroom_1",
    type: {
      type_name: "restroom",
      cost: 8000,
      size: "5×3 m", 
      primary_user: "General public"
    },
    marker_id: 3,
    x_pos: 200,
    y_pos: 80,
    in_understand: false,
    in_map: true,
    info: {}
  },
  {
    id: 4,
    name: "baseballfield_1",
    type: {
      type_name: "baseballfield",
      cost: 75000,
      size: "90×90 m",
      primary_user: "Sports teams"
    },
    marker_id: 4,
    x_pos: 450,
    y_pos: 300,
    in_understand: false,
    in_map: true,
    info: {}
  }
];

// Convert backend asset to frontend asset format
const mapBackendToFrontendAsset = (backendAsset: BackendAsset): Asset => {
  const typeName = backendAsset.type.type_name.toLowerCase();
  const config = assetConfig[typeName] || assetConfig.default;
  
  return {
    id: backendAsset.id.toString(),
    name: backendAsset.name,
    type_name: backendAsset.type.type_name,
    x: backendAsset.x_pos,
    y: backendAsset.y_pos,
    width: config.width,
    height: config.height,
    color: config.color,
    imageUrl: config.imageUrl
  };
};

export default function Mapping() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: Math.round(900 / IMG_RATIO) });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assets from backend
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const backendAssets = await fetchMapAssets();
        
        // Use fallback data if backend returns empty or fails
        const assetsToUse = backendAssets.length > 0 ? backendAssets : mockBackendAssets;
        const frontendAssets = assetsToUse.map(mapBackendToFrontendAsset);
        setAssets(frontendAssets);
        setError(null);
        
        // Log status for debugging
        if (backendAssets.length === 0) {
          console.log('Using fallback mock data - backend may not be available');
        } else {
          console.log(`Loaded ${backendAssets.length} assets from backend`);
        }
        
      } catch (err) {
        console.error('Error loading assets:', err);
        // Use fallback data on error
        const frontendAssets = mockBackendAssets.map(mapBackendToFrontendAsset);
        setAssets(frontendAssets);
        setError(null); // Don't show error to user, just use fallback
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
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

  const scaleX = size.w / BASE_W;
  const scaleY = size.h / BASE_H;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Loading map assets...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
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
        {assets.map((asset) => (
          <div
            key={asset.id}
            title={`${asset.name} (${asset.type_name})`}
            style={{
              position: "absolute",
              top: asset.y * scaleY,
              left: asset.x * scaleX,
              width: asset.width * scaleX,
              height: asset.height * scaleY,
              backgroundColor: asset.imageUrl ? 'transparent' : asset.color,
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "black",
              boxSizing: "border-box",
              backgroundImage: asset.imageUrl ? `url(${asset.imageUrl})` : undefined,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              cursor: "pointer",
            }}
          >
            {!asset.imageUrl && (
              <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 'bold' }}>
                {asset.type_name}
              </div>
            )}
          </div>
        ))}
        
      </div>
      {assets.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
          No assets found in the map
        </div>
      )}
    </div>
  );
}
