'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import AlertSidebar from '@/components/AlertSidebar';

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-xl bg-[#1E293B]"></div>
  ),
});

// Updated color scheme
const COLORS = {
  primary: '#10b981',    // Primary green
  secondary: '#059669',  // Secondary green
  dark: '#047857',      // Darker green
  red: '#ef4444',       // Red for high alerts
  yellow: '#f59e0b',    // Yellow for medium alerts
  blue: '#3b82f6',      // Blue for additional data
  purple: '#8b5cf6',    // Purple for variety
  indigo: '#6366f1',    // Indigo for variety
};

const ACCENT_COLOR = '#10b981';  // Primary green for accents
const BG_COLOR = '#1a1a1a';      // Dark background
const CARD_BG = '#242424';       // Slightly lighter background for cards

export default function Home() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [data, setData] = useState({
    cameraStats: [],
    cameras: [],
    recentEvents: [],
    overall: {
      total_detections: 0,
      human_detections: 0,
      vehicle_detections: 0,
      animal_detections: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0,
      active_cameras: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      // Ensure all required properties exist
      setData({
        cameraStats: result.cameraStats || [],
        cameras: result.cameras || [],
        recentEvents: result.recentEvents || [],
        overall: {
          total_detections: result.overall?.total_detections || 0,
          human_detections: result.overall?.human_detections || 0,
          vehicle_detections: result.overall?.vehicle_detections || 0,
          animal_detections: result.overall?.animal_detections || 0,
          high_alerts: result.overall?.high_alerts || 0,
          medium_alerts: result.overall?.medium_alerts || 0,
          low_alerts: result.overall?.low_alerts || 0,
          active_cameras: result.overall?.active_cameras || 0
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  // Get stats based on selected camera or all cameras
  const getStats = () => {
    if (selectedCamera) {
      const cameraStats = data.cameraStats.find(c => c.camera_id === selectedCamera);
      if (!cameraStats) return {
        detections: 0,
        byType: { human: 0, vehicle: 0, animal: 0 },
        activeAlerts: 0,
        alertRate: 0,
        alerts: { high: 0, medium: 0, low: 0 }
      };

      return {
        detections: cameraStats.total_detections || 0,
        byType: {
          human: cameraStats.human_detections || 0,
          vehicle: cameraStats.vehicle_detections || 0,
          animal: cameraStats.animal_detections || 0,
        },
        activeAlerts: (cameraStats.high_alerts || 0) + (cameraStats.medium_alerts || 0),
        alertRate: cameraStats.total_detections ? 
          Math.round(((cameraStats.high_alerts || 0) + (cameraStats.medium_alerts || 0)) / cameraStats.total_detections * 100) : 0,
        alerts: {
          high: cameraStats.high_alerts || 0,
          medium: cameraStats.medium_alerts || 0,
          low: cameraStats.low_alerts || 0
        }
      };
    }

    // When no camera is selected (all cameras view)
    // Sum up all camera stats
    const totalStats = data.cameraStats.reduce((acc, camera) => {
      acc.total_detections += camera.total_detections || 0;
      acc.human_detections += camera.human_detections || 0;
      acc.vehicle_detections += camera.vehicle_detections || 0;
      acc.animal_detections += camera.animal_detections || 0;
      acc.high_alerts += camera.high_alerts || 0;
      acc.medium_alerts += camera.medium_alerts || 0;
      acc.low_alerts += camera.low_alerts || 0;
      return acc;
    }, {
      total_detections: 0,
      human_detections: 0,
      vehicle_detections: 0,
      animal_detections: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0
    });

    return {
      detections: totalStats.total_detections,
      byType: {
        human: totalStats.human_detections,
        vehicle: totalStats.vehicle_detections,
        animal: totalStats.animal_detections,
      },
      activeAlerts: totalStats.high_alerts + totalStats.medium_alerts,
      alertRate: totalStats.total_detections ? 
        Math.round((totalStats.high_alerts + totalStats.medium_alerts) / totalStats.total_detections * 100) : 0,
      alerts: {
        high: totalStats.high_alerts,
        medium: totalStats.medium_alerts,
        low: totalStats.low_alerts
      }
    };
  };

  const currentStats = getStats();
  
  // Filter out zero values for pie chart to prevent overlapping
  const detectionData = Object.entries(currentStats.byType)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: (value / currentStats.detections * 100).toFixed(1)
    }));

  const alertData = [
    { name: 'High', value: currentStats.alerts.high, color: COLORS.red },
    { name: 'Medium', value: currentStats.alerts.medium, color: COLORS.yellow },
    { name: 'Low', value: currentStats.alerts.low, color: COLORS.primary }
  ];

  // Prepare camera-wise detection data
  const cameraDetectionData = data.cameraStats.map(camera => {
    const cameraName = data.cameras.find(c => c.camera_id === camera.camera_id)?.name || camera.camera_id;
    return {
      name: cameraName,
      human: camera.human_detections || 0,
      vehicle: camera.vehicle_detections || 0,
      animal: camera.animal_detections || 0,
      total: camera.total_detections || 0
    };
  }).sort((a, b) => b.total - a.total); // Sort by total detections

  const filteredEvents = selectedCamera 
    ? data.recentEvents.filter(event => event.camera_id === selectedCamera)
    : data.recentEvents;

  return (
    <>
      <div className="min-h-screen bg-[#1a1a1a] p-8 pb-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            {selectedCamera && (
              <button
                onClick={() => setSelectedCamera(null)}
                className="rounded-lg bg-[#242424] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#2d2d2d]"
              >
                View All Cameras
              </button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-400">Total Detections</h3>
              <p className="mt-2 text-3xl font-bold text-white">{currentStats.detections}</p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <span>Last 24 hours</span>
              </div>
            </div>
            <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-400">Active Alerts</h3>
              <p className="mt-2 text-3xl font-bold text-white">{currentStats.activeAlerts}</p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <span>High & Medium Priority</span>
              </div>
            </div>
            <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-400">Active Cameras</h3>
              <p className="mt-2 text-3xl font-bold text-white">
                {selectedCamera ? 1 : data.overall.active_cameras}
              </p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <span>Operational Status</span>
              </div>
            </div>
            <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-400">Alert Rate</h3>
              <p className="mt-2 text-3xl font-bold text-white">
                {currentStats.alertRate}%
              </p>
              <div className="mt-2 flex items-center text-sm text-emerald-400">
                <span>Of Total Detections</span>
              </div>
            </div>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Detection Types Pie Chart */}
              <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-medium text-white">Detections by Type</h3>
                <div className="h-80">
                  {detectionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                        <Pie
                          data={detectionData}
                          cx="50%"
                          cy="50%"
                          labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                          label={({ name, value, percentage }) => 
                            `${name}: ${value} (${percentage}%)`
                          }
                          outerRadius={90}
                          innerRadius={60}
                          fill={COLORS.primary}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {detectionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={Object.values(COLORS)[index % Object.keys(COLORS).length]}
                              stroke="#242424"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#242424', 
                            borderColor: '#2d2d2d',
                            borderRadius: '0.5rem',
                            padding: '0.75rem'
                          }}
                          formatter={(value, name) => [
                            `${value} detections (${(value / currentStats.detections * 100).toFixed(1)}%)`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No detection data available
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Levels Area Chart */}
              <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-medium text-white">Alerts by Level</h3>
                <div className="h-80">
                  {alertData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={alertData}>
                        <defs>
                          {alertData.map((entry, index) => (
                            <linearGradient 
                              key={`gradient-${index}`} 
                              id={`gradient-${entry.name.toLowerCase()}`} 
                              x1="0" 
                              y1="0" 
                              x2="0" 
                              y2="1"
                            >
                              <stop offset="5%" stopColor={entry.color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={entry.color} stopOpacity={0}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#242424', borderColor: '#2d2d2d' }}
                          formatter={(value, name) => [`${value} alerts`, name]}
                        />
                        {alertData.map((entry, index) => (
                          <Area 
                            key={`area-${index}`}
                            type="monotone" 
                            dataKey="value" 
                            stroke={entry.color}
                            fill={`url(#gradient-${entry.name.toLowerCase()})`}
                            fillOpacity={1}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No alert data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* New Bar Chart: Camera-wise Detections */}
            <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white">Detections by Camera</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={cameraDetectionData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    barGap={0}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#333333" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tickLine={false}
                      axisLine={{ stroke: '#333333' }}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tickLine={false}
                      axisLine={{ stroke: '#333333' }}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#242424', 
                        borderColor: '#2d2d2d',
                        borderRadius: '0.5rem',
                        padding: '0.75rem'
                      }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      formatter={(value, name) => [
                        `${value} detections`,
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{
                        paddingBottom: '20px'
                      }}
                    />
                    <Bar 
                      dataKey="human" 
                      name="Human" 
                      fill={COLORS.primary} 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    >
                      {cameraDetectionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={COLORS.primary}
                          fillOpacity={0.9}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="vehicle" 
                      name="Vehicle" 
                      fill={COLORS.blue} 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    >
                      {cameraDetectionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={COLORS.blue}
                          fillOpacity={0.9}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="animal" 
                      name="Animal" 
                      fill={COLORS.purple} 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    >
                      {cameraDetectionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={COLORS.purple}
                          fillOpacity={0.9}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Camera Locations</h3>
            <div className="h-[400px]">
              <Map
                cameras={data.cameras}
                selectedCamera={selectedCamera}
                onCameraSelect={setSelectedCamera}
              />
            </div>
          </div>

          {/* Recent Events */}
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">
              Recent Events {selectedCamera && `- ${data.cameras.find(c => c.camera_id === selectedCamera)?.name}`}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Camera
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Alert Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-[#2d2d2d] transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {data.cameras.find(c => c.camera_id === event.camera_id)?.name || event.camera_id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                        {event.event_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {event.details}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            event.alert_level === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : event.alert_level === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {event.alert_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <AlertSidebar />
    </>
  );
}
