"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
//latlngexpression are the types for coordinates (can be array, object, etc.)
//latlngtuple are type for coordinate arrays like [lat, lng]
import { LatLngExpression, LatLngTuple } from "leaflet";
import L from 'leaflet';
import {physicalToGeographic} from "@/utils/geoCoordinateConverter";

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

// Create custom icon based on icon_path from database with rotation support
function createCustomIcon(iconPath: string | null, rotation: number = 0): L.DivIcon {
  // Default icon path if none provided
  const iconUrl = iconPath || '/asset-images/playground.svg';
  
  return L.divIcon({
    html: `<img src="${iconUrl}" style="width: 32px; height: 32px; transform: rotate(${rotation}deg); transform-origin: center center; transition: all 0.3s ease-in-out; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;" onmouseover="this.style.transform='rotate(${rotation}deg) scale(1.2)'; this.style.filter='drop-shadow(0 4px 8px rgba(0,0,0,0.5))';" onmouseout="this.style.transform='rotate(${rotation}deg) scale(1)'; this.style.filter='drop-shadow(0 2px 4px rgba(0,0,0,0.3))';" />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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
        rotation: asset.rotation
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
      // Set initial view first, then use flyTo for updates
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
}

const Map = ({ zoom = defaults.zoom, backendAssets, parkCenter, parkBounds }: MapProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Render dynamic markers for each asset */}
      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={[asset.lat, asset.lng]}
          icon={createCustomIcon(asset.icon_path, asset.rotation)}
          draggable={false}
        >
          <Popup>
            <div>
              <strong>{asset.name}</strong>
              <br />
              Type: {asset.type || 'Unknown'}
              <br />
              Rotation: {asset.rotation.toFixed(1)}°
            </div>
          </Popup>
        </Marker>
      ))}
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

