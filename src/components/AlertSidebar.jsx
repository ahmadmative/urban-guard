'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Updated event type weights to favor vehicle and human detections
const eventTypes = [
  'Vehicle', 'Vehicle', 'Vehicle', 'Vehicle',  // 40% chance for vehicles
  'Human', 'Human', 'Human',                   // 30% chance for humans
  'Animal', 'Animal'                           // 20% chance for animals
];

const locations = [
  'Main Gate', 'Main Gate', 'Main Gate',       // Higher frequency at main gate
  'Parking Area', 'Parking Area', 'Parking Area', // Higher frequency in parking
  'Back Gate', 'Back Gate',
  'Side Entrance'
];

// Weighted alert levels (more medium and low than high)
const alertLevels = [
  'high',                     // 10% chance for high
  'medium', 'medium',         // 20% chance for medium
  'low', 'low', 'low', 'low'  // 70% chance for low
];

// More realistic event descriptions
function getEventDescription(eventType, location) {
  const timeOfDay = new Date().getHours();
  const isNight = timeOfDay >= 20 || timeOfDay <= 5;

  const descriptions = {
    Vehicle: [
      `Unauthorized vehicle detected at ${location}`,
      `Vehicle movement detected at ${location}`,
      `Parked vehicle detected at ${location}`,
      isNight ? `Suspicious vehicle activity at ${location}` : `Vehicle entering ${location}`,
      `Vehicle stopped at ${location}`
    ],
    Human: [
      `Person detected at ${location}`,
      isNight ? `Suspicious person at ${location}` : `Individual approaching ${location}`,
      `Movement detected at ${location}`,
      `Person walking at ${location}`,
      isNight ? `Unknown individual at ${location}` : `Visitor at ${location}`
    ],
    Animal: [
      `Stray animal detected at ${location}`,
      `Animal movement at ${location}`,
      `Animal crossing at ${location}`
    ]
  };

  const options = descriptions[eventType];
  return options[Math.floor(Math.random() * options.length)];
}

function generateRandomEvent() {
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const alertLevel = alertLevels[Math.floor(Math.random() * alertLevels.length)];
  
  // Adjust alert level based on event type and time
  const timeOfDay = new Date().getHours();
  const isNight = timeOfDay >= 20 || timeOfDay <= 5;
  
  // Higher alert levels at night
  let finalAlertLevel = alertLevel;
  if (isNight && (eventType === 'Human' || eventType === 'Vehicle')) {
    const nightAlertChance = Math.random();
    if (nightAlertChance > 0.7) {
      finalAlertLevel = 'high';
    } else if (nightAlertChance > 0.4) {
      finalAlertLevel = 'medium';
    }
  }
  
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    camera_id: `Camera ${Math.floor(Math.random() * 4) + 1}`,
    event_type: eventType,
    details: getEventDescription(eventType, location),
    alert_level: finalAlertLevel
  };
}

export default function AlertSidebar() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add new alert every 30 seconds
    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();
      setAlerts(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 alerts
    }, 30000); // Changed to 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initial fetch of recent alerts
  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        setAlerts(data.recentEvents?.slice(0, 50) || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching initial alerts:', error);
        setError('Failed to load alerts');
        // Initialize with some demo data if API fails
        setAlerts([generateRandomEvent()]);
      }
    };

    fetchInitialAlerts();
  }, []);

  return (
    <div className={`fixed right-0 top-0 h-screen transition-all duration-300 ${isOpen ? 'w-96' : 'w-12'}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-12 top-6 flex h-12 w-12 items-center justify-center rounded-l-xl bg-[#242424] text-white hover:bg-[#2d2d2d]"
      >
        {isOpen ? '→' : '←'}
      </button>

      {/* Main Sidebar Content */}
      <div className="h-full bg-[#242424] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Live Alerts</h2>
          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
            {alerts.length} alerts
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Alerts List */}
        <div className="mt-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative rounded-lg bg-[#1a1a1a] p-4 transition-all hover:bg-[#2d2d2d] ${
                alert.alert_level === 'high'
                  ? 'border-l-4 border-red-500'
                  : alert.alert_level === 'medium'
                  ? 'border-l-4 border-yellow-500'
                  : 'border-l-4 border-emerald-500'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  {alert.camera_id}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    alert.alert_level === 'high'
                      ? 'bg-red-500/20 text-red-300'
                      : alert.alert_level === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {alert.alert_level}
                </span>
              </div>

              {/* Alert Content */}
              <div className="mt-2">
                <p className="text-sm text-white">{alert.details}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {format(new Date(alert.timestamp), 'MMM d, HH:mm:ss')}
                </p>
              </div>

              {/* Event Type Badge */}
              <div className="mt-2">
                <span className="rounded-full bg-[#242424] px-2 py-1 text-xs text-gray-300">
                  {alert.event_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 