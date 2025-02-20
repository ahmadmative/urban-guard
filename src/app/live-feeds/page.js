'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

// Updated color scheme to match dashboard
const COLORS = {
  primary: '#10b981',    // Primary green
  secondary: '#059669',  // Secondary green
  dark: '#047857',      // Darker green
  red: '#ef4444',       // Red for high alerts
  yellow: '#f59e0b',    // Yellow for medium alerts
  blue: '#3b82f6',      // Blue for additional data
};

export default function LiveFeeds() {
  const [data, setData] = useState({
    cameras: [],
    stats: {
      total_cameras: 0,
      active_cameras: 0,
      total_detections: 0,
      recent_alerts: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenCamera(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = async (cameraId, e) => {
    e.stopPropagation();
    
    if (fullscreenCamera === cameraId) {
      try {
        await document.exitFullscreen();
        setFullscreenCamera(null);
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
      }
    } else {
      const element = fullscreenRef.current;
      if (element) {
        try {
          await element.requestFullscreen();
          setFullscreenCamera(cameraId);
        } catch (err) {
          console.error('Error entering fullscreen:', err);
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      setData({
        cameras: result.cameras || [],
        stats: {
          total_cameras: result.cameras?.length || 0,
          active_cameras: result.overall?.active_cameras || 0,
          total_detections: result.overall?.total_detections || 0,
          recent_alerts: (result.recentEvents || [])
            .filter(e => e.alert_level === 'high' || e.alert_level === 'medium').length
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-8">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8 pb-16">
      {/* Fullscreen Container */}
      {fullscreenCamera && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 z-50 bg-black"
          style={{ height: '100vh', width: '100vw' }}
        >
          {/* Fullscreen Camera Feed */}
          <iframe
            src="http://61.211.241.239/nphMotionJpeg?Resolution=1920x1080&Quality=Standard"
            className="w-full h-full"
            style={{ 
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%'
            }}
          />

          {/* Close Button - Top Right */}
          <button
            onClick={(e) => handleFullscreen(fullscreenCamera, e)}
            className="absolute top-6 right-6 z-50 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 transition-all duration-200 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Camera Info - Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {data.cameras.find(c => c.camera_id === fullscreenCamera)?.name}
                </h3>
                <p className="text-sm text-gray-300">
                  {data.cameras.find(c => c.camera_id === fullscreenCamera)?.address}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="animate-pulse text-emerald-400 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Live Camera Feeds</h1>
          <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400">
            {data.stats.active_cameras} active cameras
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Total Cameras</h3>
            <p className="mt-2 text-3xl font-bold text-white">{data.stats.total_cameras}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>System Overview</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Active Cameras</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{data.stats.active_cameras}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>Currently Online</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Total Detections</h3>
            <p className="mt-2 text-3xl font-bold text-white">{data.stats.total_detections}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>Last 24 hours</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Active Alerts</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">{data.stats.recent_alerts}</p>
            <div className="mt-2 flex items-center text-sm text-red-400">
              <span>High & Medium Priority</span>
            </div>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.cameras.map((camera) => (
            <div 
              key={camera.camera_id} 
              className={`rounded-xl bg-[#242424] p-6 shadow-lg transition-all duration-200 hover:bg-[#2d2d2d] ${
                selectedCamera === camera.camera_id ? 'ring-2 ring-emerald-500' : ''
              }`}
              onClick={() => setSelectedCamera(camera.camera_id === selectedCamera ? null : camera.camera_id)}
            >
              {/* Camera Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{camera.name}</h3>
                <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                  {camera.status}
                </span>
              </div>
              
              {/* Camera Feed */}
              <div 
                className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#1a1a1a]"
                ref={camera.camera_id === 'Camera 1' ? fullscreenRef : null}
              >
                {camera.camera_id === 'Camera 1' ? (
                  // Live MJPEG stream for Camera 1
                  <iframe
                    src="http://61.211.241.239/nphMotionJpeg?Resolution=320x240&Quality=Standard"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Placeholder for other cameras
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-4xl">📹</span>
                      <span className="text-sm text-gray-400">Live Feed</span>
                    </div>
                  </div>
                )}
                
                {/* Camera Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span>{camera.camera_id}</span>
                    <span className="animate-pulse text-emerald-400">● LIVE</span>
                  </div>
                </div>
              </div>
              
              {/* Camera Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Last Update</p>
                  <p className="text-sm font-medium text-gray-200">
                    {format(new Date(camera.last_ping), 'HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-200">{camera.address}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2">
                <button 
                  className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700"
                  onClick={(e) => handleFullscreen(camera.camera_id, e)}
                >
                  {fullscreenCamera === camera.camera_id ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <button 
                  className="flex-1 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-[#2d2d2d]"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle settings
                  }}
                >
                  Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 