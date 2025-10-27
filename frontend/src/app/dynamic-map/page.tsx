"use client"

import React, { useState, useEffect } from 'react'
import { useMarkerPositions } from '@/hooks/useMarkerPositions'
import Map from '@/components/leaflet'
import { LatLngTuple } from 'leaflet'

// Default park bounds (you can move this to backend config later)
const defaultParkBounds = {
  topLeft: { lat: 32.561065, lng: -117.083997 },
  bottomRight: { lat: 32.558361, lng: -117.075475 },
}

// Calculate park center
function calculateParkCenter(): LatLngTuple {
  const centerLat = (defaultParkBounds.topLeft.lat + defaultParkBounds.bottomRight.lat) / 2;
  const centerLng = (defaultParkBounds.topLeft.lng + defaultParkBounds.bottomRight.lng) / 2;
  return [centerLat, centerLng];
}

export default function DynamicMapPage() {
  const { markerPositions, loading, error } = useMarkerPositions();
  const [parkCenter] = useState<LatLngTuple>(calculateParkCenter());

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Header with status */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        background: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1000 
      }}>
        {loading && <div>🔄 Loading...</div>}
        {error && <div style={{ color: 'red' }}>❌ {error}</div>}
        
      </div>

      {/* Map Component */}
      <Map
        backendAssets={markerPositions}
        parkCenter={parkCenter}
        parkBounds={defaultParkBounds}
        zoom={17}
      />
    </div>
  );
}
