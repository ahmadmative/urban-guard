'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const COLORS = {
  primary: '#10b981',    // Primary green
  secondary: '#059669',  // Secondary green
  dark: '#047857',      // Darker green
  red: '#ef4444',       // Red for high alerts
  yellow: '#f59e0b',    // Yellow for medium alerts
  blue: '#3b82f6',      // Blue for additional data
};

export default function Events() {
  const [data, setData] = useState({
    events: [],
    cameras: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    camera: 'all',
    eventType: 'all',
    alertLevel: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      setData({
        events: result.recentEvents || [],
        cameras: result.cameras || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getUniqueEventTypes = () => {
    const types = new Set(data.events.map(event => event.event_type));
    return ['all', ...Array.from(types)];
  };

  const filterEvents = () => {
    return data.events.filter(event => {
      if (filters.camera !== 'all' && event.camera_id !== filters.camera) return false;
      if (filters.eventType !== 'all' && event.event_type !== filters.eventType) return false;
      if (filters.alertLevel !== 'all' && event.alert_level !== filters.alertLevel) return false;
      
      if (filters.dateRange !== 'all') {
        const eventDate = new Date(event.timestamp);
        const now = new Date();
        const hours = parseInt(filters.dateRange);
        if (now - eventDate > hours * 60 * 60 * 1000) return false;
      }

      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        return (
          event.event_type.toLowerCase().includes(searchLower) ||
          event.details.toLowerCase().includes(searchLower) ||
          event.camera_id.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-8">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  const filteredEvents = filterEvents();

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Event History</h1>
          <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400">
            {filteredEvents.length} events found
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Total Events</h3>
            <p className="mt-2 text-3xl font-bold text-white">{data.events.length}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>All time</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">High Priority</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {data.events.filter(e => e.alert_level === 'high').length}
            </p>
            <div className="mt-2 flex items-center text-sm text-red-400">
              <span>Critical events</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Medium Priority</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {data.events.filter(e => e.alert_level === 'medium').length}
            </p>
            <div className="mt-2 flex items-center text-sm text-yellow-400">
              <span>Warning events</span>
            </div>
          </div>
          <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
            <h3 className="text-sm font-medium text-gray-400">Active Cameras</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {data.cameras.length}
            </p>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <span>Monitoring</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-medium text-white">Filter Events</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Camera Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400">Camera</label>
              <select
                value={filters.camera}
                onChange={(e) => setFilters(prev => ({ ...prev, camera: e.target.value }))}
                className="mt-2 block w-full rounded-lg bg-[#1a1a1a] border-gray-700 px-3 py-2 text-white focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="all">All Cameras</option>
                {data.cameras.map(camera => (
                  <option key={camera.camera_id} value={camera.camera_id}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                className="mt-2 block w-full rounded-lg bg-[#1a1a1a] border-gray-700 px-3 py-2 text-white focus:border-emerald-500 focus:ring-emerald-500"
              >
                {getUniqueEventTypes().map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Alert Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400">Alert Level</label>
              <select
                value={filters.alertLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, alertLevel: e.target.value }))}
                className="mt-2 block w-full rounded-lg bg-[#1a1a1a] border-gray-700 px-3 py-2 text-white focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="all">All Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400">Time Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="mt-2 block w-full rounded-lg bg-[#1a1a1a] border-gray-700 px-3 py-2 text-white focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="all">All Time</option>
                <option value="1">Last Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24">Last 24 Hours</option>
                <option value="72">Last 3 Days</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-400">Search</label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search events..."
                className="mt-2 block w-full rounded-lg bg-[#1a1a1a] border-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-xl bg-[#242424] p-6 shadow-lg">
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
                    Alert Level
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
  );
} 