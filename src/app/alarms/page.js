'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
  Legend
} from 'recharts';

const COLORS = {
  primary: '#10b981',    // Primary green
  secondary: '#059669',  // Secondary green
  dark: '#047857',      // Darker green
  red: '#ef4444',       // Red for high alerts
  yellow: '#f59e0b',    // Yellow for medium alerts
  blue: '#3b82f6',      // Blue for additional data
};

export default function Alarms() {
  const [data, setData] = useState({
    events: [],
    cameras: [],
    stats: {
      total: 0,
      high: 0,
      medium: 0,
      byCameraHigh: {},
      byCameraMedium: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('high');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      // Process alerts data
      const alerts = (result.recentEvents || []).filter(
        event => event.alert_level === 'high' || event.alert_level === 'medium'
      );

      // Calculate statistics
      const stats = alerts.reduce((acc, event) => {
        acc.total++;
        acc[event.alert_level]++;
        
        if (event.alert_level === 'high') {
          acc.byCameraHigh[event.camera_id] = (acc.byCameraHigh[event.camera_id] || 0) + 1;
        } else {
          acc.byCameraMedium[event.camera_id] = (acc.byCameraMedium[event.camera_id] || 0) + 1;
        }
        
        return acc;
      }, {
        total: 0,
        high: 0,
        medium: 0,
        byCameraHigh: {},
        byCameraMedium: {}
      });

      setData({
        events: alerts,
        cameras: result.cameras || [],
        stats
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

  const filteredEvents = data.events.filter(
    event => activeTab === 'all' || event.alert_level === activeTab
  );

  // Prepare chart data
  const alertsByType = [
    { name: 'High Priority', value: data.stats.high, color: COLORS.red },
    { name: 'Medium Priority', value: data.stats.medium, color: COLORS.yellow }
  ];

  const alertsByCamera = Object.entries(
    activeTab === 'high' ? data.stats.byCameraHigh : data.stats.byCameraMedium
  ).map(([cameraId, count]) => ({
    name: data.cameras.find(c => c.camera_id === cameraId)?.name || cameraId,
    value: count
  }));

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Active Alarms</h1>
          <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400">
            {data.stats.total} active alarms
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Total Alerts</h3>
            <p className="mt-2 text-3xl font-bold text-white">{data.stats.total}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>Active alerts</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">High Priority</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">{data.stats.high}</p>
            <div className="mt-2 flex items-center text-sm text-red-400">
              <span>Critical alerts</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Medium Priority</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-400">{data.stats.medium}</p>
            <div className="mt-2 flex items-center text-sm text-yellow-400">
              <span>Warning alerts</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Alert Rate</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {Math.round((data.stats.total / (data.events.length || 1)) * 100)}%
            </p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>Of total events</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Alerts Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                  <Pie
                    data={alertsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                    label={({ name, value, percent }) => 
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {alertsByType.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
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
                    formatter={(value, name) => [`${value} alerts`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Alerts by Camera</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={alertsByCamera}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  barSize={40}
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
                    formatter={(value) => [`${value} alerts`, '']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={activeTab === 'high' ? COLORS.red : COLORS.yellow}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alert Tabs and Table */}
        <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
          <div className="mb-6 flex space-x-4">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Alerts
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
              }`}
              onClick={() => setActiveTab('high')}
            >
              High Priority
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
              }`}
              onClick={() => setActiveTab('medium')}
            >
              Medium Priority
            </button>
          </div>

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
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-[#2d2d2d] transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {format(new Date(event.timestamp), 'MMM d, HH:mm:ss')}
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
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          event.alert_level === 'high'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
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
  );
} 