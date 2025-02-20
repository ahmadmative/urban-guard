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

// Default center coordinates (Main coordinate)
const DEFAULT_CENTER = {
  lat: 33.54249963363487,
  lng: 73.09658109653496
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

  // Calculate center point from selected camera or use default
  const center = useMemo(() => {
    if (validCameras.length === 0) return DEFAULT_CENTER;
    
    const selectedCam = validCameras.find(cam => cam.camera_id === selectedCamera);
    if (selectedCamera && selectedCam) {
      return { 
        lat: selectedCam.latitude, 
        lng: selectedCam.longitude 
      };
    }

    return DEFAULT_CENTER;
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
        zoom={17} // Increased zoom level for better visibility
        className="h-full w-full rounded-lg"
        style={{ background: '#1E293B' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validCameras.map((camera) => {
          const isSelected = camera.camera_id === selectedCamera;
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="marker-pin ${isSelected ? 'selected' : ''}">
                <div class="pin-content">${camera.name.split(' ')[0]}</div>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          });

          return (
            <Marker
              key={camera.camera_id}
              position={[camera.latitude, camera.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => onCameraSelect?.(camera.camera_id)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <h3 className="font-medium text-gray-900">{camera.name}</h3>
                  <p className="text-sm text-gray-600">{camera.address}</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className="text-emerald-600">{camera.status}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Last Update: {new Date(camera.last_ping).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #10b981;
          position: relative;
          transform: rotate(-45deg);
          top: -15px;
          left: -15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .marker-pin.selected {
          background: #3b82f6;
          transform: rotate(-45deg) scale(1.2);
          z-index: 1000;
        }

        .pin-content {
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
} 