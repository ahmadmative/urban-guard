'use client';
import { cameraStatus } from '@/data/dummyData';

export default function LiveFeeds() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Live Camera Feeds</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cameraStatus.map((camera) => (
          <div key={camera.id} className="rounded-xl bg-[#1E293B] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">{camera.name}</h3>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                camera.status === 'active' 
                  ? 'bg-emerald-900 text-emerald-200' 
                  : 'bg-red-900 text-red-200'
              }`}>
                {camera.status}
              </span>
            </div>
            
            {/* Placeholder for camera feed */}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#0F172A]">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
                <span className="text-sm text-gray-400">Camera Feed {camera.id}</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Last Update</p>
                <p className="text-sm font-medium text-gray-200">
                  {new Date(camera.lastPing).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Detections Today</p>
                <p className="text-sm font-medium text-gray-200">{camera.detections}</p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-violet-600 hover:to-fuchsia-600">
                Full Screen
              </button>
              <button className="flex-1 rounded-md bg-[#2D3B4F] px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-[#374151]">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 