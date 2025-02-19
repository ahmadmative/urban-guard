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
  AreaChart
} from 'recharts';

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-xl bg-[#1E293B]"></div>
  ),
});

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6'];

export default function Home() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      setData(result);
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
      return {
        detections: cameraStats.total_detections,
        byType: {
          human: cameraStats.human_detections,
          vehicle: cameraStats.vehicle_detections,
          animal: cameraStats.animal_detections,
        },
        activeAlerts: cameraStats.high_alerts + cameraStats.medium_alerts,
        alertRate: Math.round(
          ((cameraStats.high_alerts + cameraStats.medium_alerts) / cameraStats.total_detections) * 100
        )
      };
    }
    return {
      detections: data.overall.total_detections,
      byType: {
        human: data.overall.human_detections,
        vehicle: data.overall.vehicle_detections,
        animal: data.overall.animal_detections,
      },
      activeAlerts: data.overall.high_alerts + data.overall.medium_alerts,
      alertRate: Math.round(
        ((data.overall.high_alerts + data.overall.medium_alerts) / data.overall.total_detections) * 100
      )
    };
  };

  const currentStats = getStats();
  
  const detectionData = [
    { name: 'Human', value: currentStats.byType.human },
    { name: 'Vehicle', value: currentStats.byType.vehicle },
    { name: 'Animal', value: currentStats.byType.animal },
  ];

  const alertData = [
    { name: 'High', value: data.overall.high_alerts },
    { name: 'Medium', value: data.overall.medium_alerts },
    { name: 'Low', value: data.overall.low_alerts },
  ];

  const filteredEvents = selectedCamera 
    ? data.recentEvents.filter(event => event.camera_id === selectedCamera)
    : data.recentEvents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        {selectedCamera && (
          <button
            onClick={() => setSelectedCamera(null)}
            className="rounded-lg bg-[#2D3B4F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#374151]"
          >
            View All Cameras
          </button>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Detections</h3>
          <p className="mt-2 text-3xl font-bold text-white">{currentStats.detections}</p>
          <div className="mt-2 flex items-center text-sm text-violet-400">
            <span>Last 24 hours</span>
          </div>
        </div>
        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Active Alerts</h3>
          <p className="mt-2 text-3xl font-bold text-white">{currentStats.activeAlerts}</p>
          <div className="mt-2 flex items-center text-sm text-fuchsia-400">
            <span>High & Medium Priority</span>
          </div>
        </div>
        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Active Cameras</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {selectedCamera ? 1 : data.overall.active_cameras}
          </p>
          <div className="mt-2 flex items-center text-sm text-blue-400">
            <span>Operational Status</span>
          </div>
        </div>
        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Alert Rate</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {currentStats.alertRate}%
          </p>
          <div className="mt-2 flex items-center text-sm text-emerald-400">
            <span>Of Total Detections</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-medium text-white">Detections by Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detectionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {detectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-medium text-white">Alerts by Level</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#374151' }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
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
      <div className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-medium text-white">
          Recent Events {selectedCamera && `- ${data.cameras.find(c => c.camera_id === selectedCamera)?.name}`}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Camera
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Alert Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-[#2D3B4F] transition-colors">
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
                          ? 'bg-red-900 text-red-200'
                          : event.alert_level === 'medium'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-green-900 text-green-200'
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
  );
}
