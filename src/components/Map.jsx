'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const MarkerIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center coordinates (DHA Phase 6)
const DEFAULT_CENTER = {
  lat: 31.4816,
  lng: 74.0776
};

export default function Map({ cameras = [], selectedCamera, onCameraSelect }) {
  useEffect(() => {
    // Fix for marker icons in Next.js
    const images = [
      '/marker-icon.png',
      '/marker-icon-2x.png',
      '/marker-shadow.png'
    ];
    images.forEach(image => {
      fetch(image).catch(() => {
        const img = new Image();
        img.src = image;
        document.body.appendChild(img);
        img.remove();
      });
    });
  }, []);

  // Filter out any cameras without valid coordinates
  const validCameras = cameras.filter(
    camera => camera && camera.latitude && camera.longitude
  );

  // Calculate center point from all camera locations or use default
  const center = validCameras.length > 0
    ? validCameras.reduce(
        (acc, camera) => {
          acc.lat += camera.latitude / validCameras.length;
          acc.lng += camera.longitude / validCameras.length;
          return acc;
        },
        { lat: 0, lng: 0 }
      )
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      className="h-full w-full rounded-lg"
      style={{ background: '#1E293B' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validCameras.map((camera) => (
        <Marker
          key={camera.camera_id}
          position={[camera.latitude, camera.longitude]}
          icon={MarkerIcon}
          eventHandlers={{
            click: () => onCameraSelect(camera.camera_id)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium text-gray-900">{camera.name}</h3>
              <p className="text-sm text-gray-600">{camera.address}</p>
              <p className="text-sm text-gray-600">
                Status: {camera.status}
              </p>
              <p className="text-sm text-gray-600">
                Last Update: {new Date(camera.last_ping).toLocaleString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 