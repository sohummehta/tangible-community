"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
//latlngexpression are the types for coordinates (can be array, object, etc.)
//latlngtuple are type for coordinate arrays like [lat, lng]
import { LatLngExpression, LatLngTuple } from "leaflet";
import L from 'leaflet';
import {physicalToGeographic, getCurrentMapConfig} from "@/utils/geoCoordinateConverter";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface Asset {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string | null;
  icon_path: string | null;
  rotation: number;
  physical_width: number;
  physical_height: number;
}

interface MapProps {
  backendAssets: BackendAsset[];
  parkCenter: LatLngExpression | LatLngTuple;
  parkBounds?: {
    topLeft: { lat: number; lng: number };
    bottomRight: { lat: number; lng: number };
  };
  zoom?: number;
}

const defaults = {
  zoom: 17,
};

/**
 * Calculate the pixel dimensions of the park at the current zoom level
 */
function calculateParkPixelDimensions(
  map: L.Map,
  parkBounds: { topLeft: { lat: number; lng: number }; bottomRight: { lat: number; lng: number } }
): { width: number; height: number } {
  if (!map || !parkBounds) return { width: 0, height: 0 };
  
  // Convert geographic bounds to pixel coordinates
  const topLeft = map.latLngToContainerPoint([parkBounds.topLeft.lat, parkBounds.topLeft.lng]);
  const topRight = map.latLngToContainerPoint([parkBounds.topLeft.lat, parkBounds.bottomRight.lng]);
  const bottomLeft = map.latLngToContainerPoint([parkBounds.bottomRight.lat, parkBounds.topLeft.lng]);
  
  // Calculate pixel width (horizontal distance)
  const pixelWidth = Math.abs(topRight.x - topLeft.x);
  
  // Calculate pixel height (vertical distance)
  const pixelHeight = Math.abs(bottomLeft.y - topLeft.y);
  
  return { width: pixelWidth, height: pixelHeight };
}

/**
 * Calculate scaled asset size based on physical dimensions and current zoom
 */
function calculateAssetPixelSize(
  assetPhysicalWidth: number,  // cm
  assetPhysicalHeight: number, // cm
  parkPhysicalWidth: number,   // cm
  parkPhysicalHeight: number,  // cm
  parkPixelWidth: number,      // pixels at current zoom
  parkPixelHeight: number      // pixels at current zoom
): { width: number; height: number } {
  // Calculate pixels per cm for the park
  const pixelsPerCmX = parkPixelWidth / parkPhysicalWidth;
  const pixelsPerCmY = parkPixelHeight / parkPhysicalHeight;
  
  // Scale the asset
  const width = assetPhysicalWidth * pixelsPerCmX;
  const height = assetPhysicalHeight * pixelsPerCmY;
  
  const minSize = 16;  // Minimum 16px for visibility
  const maxSize = 500; // Maximum 500px to prevent overwhelming
  
  return {
    width: Math.max(minSize, Math.min(maxSize, width)),
    height: Math.max(minSize, Math.min(maxSize, height))
  };
}

// Create custom icon based on icon_path from database with rotation and dynamic scaling support
function createCustomIcon(
  iconPath: string | null, 
  rotation: number = 0,
  pixelWidth: number = 32,
  pixelHeight: number = 32
): L.DivIcon {
  // Default icon path if none provided
  const iconUrl = iconPath || '/asset-images/playground.svg';
  
  // Calculate anchor point (center of icon)
  const anchorX = pixelWidth / 2;
  const anchorY = pixelHeight / 2;
  
  return L.divIcon({
    html: `<img src="${iconUrl}" style="width: ${pixelWidth}px; height: ${pixelHeight}px; transform: rotate(${rotation}deg); transform-origin: center center; transition: all 0.3s ease-in-out; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;" onmouseover="this.style.transform='rotate(${rotation}deg) scale(1.2)'; this.style.filter='drop-shadow(0 4px 8px rgba(0,0,0,0.5))';" onmouseout="this.style.transform='rotate(${rotation}deg) scale(1)'; this.style.filter='drop-shadow(0 2px 4px rgba(0,0,0,0.3))';" />`,
    iconSize: [pixelWidth, pixelHeight],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY],
    className: `asset-marker-${iconPath?.replace(/[^a-zA-Z0-9-]/g, '-') || 'default'}`,
  });
}

interface BackendAsset {
  id: number;
  x: number;
  y: number;
  rotation: number;
  asset_name: string;
  asset_type: string | null;
  icon_path: string | null;
  physical_width: number;
  physical_height: number;
}

async function transformBackendAssets(backendAssets: BackendAsset[]): Promise<Asset[]> {
  const transformedAssets: Asset[] = [];
  
  for (const asset of backendAssets) {
    try {
      // Transform physical coordinates to geographic coordinates
      const { lat, lng } = await physicalToGeographic(asset.x, asset.y);
      
      transformedAssets.push({
        id: asset.id,
        lat: lat,
        lng: lng,
        name: asset.asset_name,
        type: asset.asset_type,
        icon_path: asset.icon_path,
        rotation: asset.rotation,
        physical_width: asset.physical_width,
        physical_height: asset.physical_height
      });
    } catch (error) {
      console.error(`Failed to transform asset ${asset.id}:`, error);
      // Skip this asset if transformation fails
    }
  }
  
  return transformedAssets;
}
// Component to handle zoom updates
function ChangeMapView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && map.getContainer() && center) {
      // Set initial view first, then use setView for updates
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
}

// Component to calculate park pixel dimensions and track zoom changes
// Must be used inside MapContainer to access map instance
function ParkPixelDimensionsTracker({
  parkBounds,
  onDimensionsChange
}: {
  parkBounds?: { topLeft: { lat: number; lng: number }; bottomRight: { lat: number; lng: number } };
  onDimensionsChange: (dims: { width: number; height: number }) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !parkBounds) {
      onDimensionsChange({ width: 0, height: 0 });
      return;
    }
    
    // Wait for map to be ready and recalculate on zoom/move
    const updateDimensions = () => {
      const dims = calculateParkPixelDimensions(map, parkBounds);
      onDimensionsChange(dims);
    };
    
    // Initial calculation
    map.whenReady(updateDimensions);
    
    // Recalculate on zoom and move events
    map.on('zoomend', updateDimensions);
    map.on('moveend', updateDimensions);
    map.on('resize', updateDimensions);
    
    return () => {
      map.off('zoomend', updateDimensions);
      map.off('moveend', updateDimensions);
      map.off('resize', updateDimensions);
    };
  }, [map, parkBounds, onDimensionsChange]);
  
  return null;
}

const Map = ({ zoom = defaults.zoom, backendAssets, parkCenter, parkBounds }: MapProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapConfig, setMapConfig] = useState<{ width: number; height: number } | null>(null);
  const [parkPixelDims, setParkPixelDims] = useState({ width: 0, height: 0 });
  
  // Load map physical dimensions from backend
  useEffect(() => {
    getCurrentMapConfig()
      .then(config => {
        setMapConfig({ width: config.width, height: config.height });
      })
      .catch(error => {
        console.error('Failed to load map config:', error);
        // Use fallback dimensions
        setMapConfig({ width: 35, height: 23 });
      });
  }, []);

  useEffect(() => {
    if (backendAssets && backendAssets.length > 0) {
      setLoading(true);
      transformBackendAssets(backendAssets)
        .then(transformed => {
          setAssets(transformed);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to transform assets:', error);
          setLoading(false);
        });
    } else {
      setAssets([]);
    }
  }, [backendAssets]);

  // Calculate bounds from parkBounds
  const bounds: LatLngTuple[] | undefined = parkBounds ? [
    [parkBounds.topLeft.lat, parkBounds.topLeft.lng],
    [parkBounds.bottomRight.lat, parkBounds.bottomRight.lng]
  ] : undefined;

  // Don't render map if parkCenter is not available
  if (!parkCenter) {
    return <div style={{ height: "100%", width: "100%", background: "gray" }}>Loading map...</div>;
  }

  return (
    <MapContainer
      attributionControl={false}
      center={parkCenter}
      zoom={zoom}
      scrollWheelZoom={true}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeMapView center={parkCenter} zoom={zoom} />
      <ParkPixelDimensionsTracker 
        parkBounds={parkBounds}
        onDimensionsChange={setParkPixelDims}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Render dynamic markers for each asset */}
      {assets.map((asset) => {
        // Calculate scaled pixel size for this asset
        let assetPixelSize = { width: 32, height: 32 }; // Default fallback
        
        // Only calculate if we have valid physical dimensions and park dimensions
        if (
          mapConfig && 
          parkPixelDims.width > 0 && 
          parkPixelDims.height > 0 &&
          asset.physical_width > 0 && 
          asset.physical_height > 0
        ) {
          assetPixelSize = calculateAssetPixelSize(
            asset.physical_width,
            asset.physical_height,
            mapConfig.width,
            mapConfig.height,
            parkPixelDims.width,
            parkPixelDims.height
          );
          
          // Debug logging
          console.log(`Asset ${asset.name}:`, {
            physical: `${asset.physical_width}cm × ${asset.physical_height}cm`,
            pixel: `${assetPixelSize.width.toFixed(0)}px × ${assetPixelSize.height.toFixed(0)}px`,
            parkPixelDims: `${parkPixelDims.width.toFixed(0)}px × ${parkPixelDims.height.toFixed(0)}px`,
            parkPhysicalDims: `${mapConfig.width}cm × ${mapConfig.height}cm`
          });
        } else {
          // Debug logging for assets that aren't scaling
          console.log(`Asset ${asset.name} using default size:`, {
            physical_width: asset.physical_width,
            physical_height: asset.physical_height,
            parkPixelDims: parkPixelDims,
            mapConfig: mapConfig
          });
        }
        
        return (
          <Marker
            key={asset.id}
            position={[asset.lat, asset.lng]}
            icon={createCustomIcon(
              asset.icon_path,
              asset.rotation,
              assetPixelSize.width,
              assetPixelSize.height
            )}
            draggable={false}
          >
            <Popup>
              <div>
                <strong>{asset.name}</strong>
                <br />
                Type: {asset.type || 'Unknown'}
                <br />
                Rotation: {asset.rotation.toFixed(1)}°
                <br />
                Physical Size: {asset.physical_width.toFixed(1)}cm × {asset.physical_height.toFixed(1)}cm
                <br />
                Display Size: {assetPixelSize.width.toFixed(0)}px × {assetPixelSize.height.toFixed(0)}px
              </div>
            </Popup>
          </Marker>
        );
      })}
      {/* Loading indicator */}
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          background: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          zIndex: 1000 
        }}>
          Transforming coordinates...
        </div>
      )}
      
      {/* No assets message */}
      {!loading && assets.length === 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          zIndex: 1000 
        }}>
          No assets detected. Place markers on the physical map.
        </div>
      )}
    </MapContainer>
  );
};

export default Map;

