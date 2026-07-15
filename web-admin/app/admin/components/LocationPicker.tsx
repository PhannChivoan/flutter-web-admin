"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#e50914;border:2px solid #fff;box-shadow:0 0 10px rgba(229,9,20,0.6);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const center = useMemo<[number, number]>(
    () => [latitude ?? 11.5564, longitude ?? 104.9282], // default: Phnom Penh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #5e3f3b", height: 260 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {latitude != null && longitude != null && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}
        <ClickHandler onPick={onChange} />
      </MapContainer>
    </div>
  );
}
