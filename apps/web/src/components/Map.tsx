"use client";

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RequestMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  urgency: string;
}

export default function Map({ markers }: { markers: RequestMarker[] }) {
  // Center on Nagpur for prototype
  const position: [number, number] = [21.1458, 79.0882];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full relative z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="p-1">
                <p className="font-bold">{marker.title}</p>
                <p className={`text-xs ${marker.urgency === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {marker.urgency} Urgency
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
