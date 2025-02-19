'use client';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function Map({ cameras = [], selectedCamera = null, onCameraSelect }) {
  // Filter out any cameras without valid coordinates
  const validCameras = useMemo(() => 
    cameras.filter(camera => 
      camera && 
      typeof camera.latitude === 'number' && 
      !isNaN(camera.latitude) &&
      typeof camera.longitude === 'number' &&
      !isNaN(camera.longitude)
    ),
    [cameras]
  );

  // Calculate center point from all camera locations or use default
  const center = useMemo(() => {
    if (validCameras.length === 0) return DEFAULT_CENTER;
    
    const selectedCam = validCameras.find(cam => cam.camera_id === selectedCamera);
    if (selectedCamera && selectedCam) {
      return { lat: selectedCam.latitude, lng: selectedCam.longitude };
    }

    const sumCoords = validCameras.reduce(
      (acc, camera) => {
        acc.lat += camera.latitude;
        acc.lng += camera.longitude;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: sumCoords.lat / validCameras.length,
      lng: sumCoords.lng / validCameras.length
    };
  }, [validCameras, selectedCamera]);

  // Fix for marker icons in Next.js
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        key={`map-${selectedCamera || 'all'}-${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={13}
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
              click: () => onCameraSelect?.(camera.camera_id)
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
    </div>
  );
} 