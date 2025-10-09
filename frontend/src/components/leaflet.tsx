"use client"

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
//latlngexpression are the types for coordinates (can be array, object, etc.)
//latlngtuple are type for coordinate arrays like [lat, lng]
import { LatLngExpression, LatLngTuple } from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface MapProps {
    //the props the component accepts (posix: center coordinates required, zoom: optional)
  posix: LatLngExpression | LatLngTuple;
  zoom?: number;
}

const defaults = {
  zoom: 17,
};

// Component to handle zoom updates
function ChangeMapView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && map.getContainer()) {
      // Use flyTo for smoother transitions and better DOM handling
      map.flyTo(center, zoom, {
        duration: 0.5
      });
    }
  }, [map, center, zoom]);
  
  return null;
}

const Map = ({ zoom = defaults.zoom, posix }: MapProps) => {
  return (
    <MapContainer
      attributionControl={false}
      center={posix}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeMapView center={posix} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={posix} draggable={false}>
        <Popup>Hey, I'm a popup!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;

