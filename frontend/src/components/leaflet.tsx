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

// Create custom icon based on asset type with rotation support
function createCustomIcon(assetType: string | null, rotation: number = 0): L.DivIcon {
  // Default icon path
  let iconUrl = '/asset-images/playground.svg';
  
  // Debug: Log the asset type to help identify the issue
  console.log('Asset type received:', assetType);
  
  // Map asset types to specific SVG icons
  if (assetType) {
    const typeMap: { [key: string]: string } = {
      'playground': '/asset-images/playground.svg',
      'dogpark': '/asset-images/dog_park.svg',
      'dog park': '/asset-images/dog_park.svg',
      'restroom': '/asset-images/restroom.svg',
      'baseball': '/asset-images/baseball.svg',
      'baseball field': '/asset-images/baseball.svg',
      'soccer': '/asset-images/soccer_field.svg',
      'soccer field': '/asset-images/soccer_field.svg',
      'tennis': '/asset-images/tennis.svg',
      'tennis court': '/asset-images/tennis.svg',
      'tennis courts': '/asset-images/tennis.svg',
      'Tennis': '/asset-images/tennis.svg',
      'Tennis Court': '/asset-images/tennis.svg',
      'Tennis Courts': '/asset-images/tennis.svg',
      'pickleball': '/asset-images/pickleball.svg',
      'picnic': '/asset-images/picnic_shelter.svg',
      'picnic shelter': '/asset-images/picnic_shelter.svg',
      'amphitheater': '/asset-images/ampitheater.svg',
      'nature play': '/asset-images/nature play.svg',
      'public art': '/asset-images/public_art.svg',
      'sculpture': '/asset-images/sculpture.svg',
    };
    
    const normalizedType = assetType.toLowerCase().trim();
    iconUrl = typeMap[normalizedType] || typeMap[assetType] || '/asset-images/playground.svg';
    
    // Debug: Log the mapping result
    console.log(`Mapped "${assetType}" to icon: ${iconUrl}`);
  }
  
  return L.divIcon({
    html: `<img src="${iconUrl}" style="width: 80px; height: 80px; transform: rotate(${rotation}deg); transform-origin: center center; transition: all 0.3s ease-in-out; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4)); cursor: pointer;" onmouseover="this.style.transform='rotate(${rotation}deg) scale(1.25)'; this.style.filter='drop-shadow(0 6px 12px rgba(0,0,0,0.6))';" onmouseout="this.style.transform='rotate(${rotation}deg) scale(1)'; this.style.filter='drop-shadow(0 3px 6px rgba(0,0,0,0.4))';" />`,
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40],
    className: `asset-marker-${assetType?.toLowerCase().replace(/\s+/g, '-') || 'default'}`,
  });
}

interface BackendAsset {
  id: number;
  x: number;
  y: number;
  rotation: number;
  asset_name: string;
  asset_type: string | null;
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
          icon={createCustomIcon(asset.type, asset.rotation)}
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

