import { NextResponse } from 'next/server';
import { getOverallStats, getCameraStats, getRecentEvents, getCameraLocations } from '@/utils/db';

export async function GET(request) {
  try {
    // Initialize default values for stats
    const defaultStats = {
      total_detections: 0,
      vehicle_detections: 0,
      human_detections: 0,
      animal_detections: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0,
      active_cameras: 0
    };

    // Get data with error handling for each function
    let overall = defaultStats;
    let cameras = [];
    let cameraStats = [];
    let recentEvents = [];

    try {
      overall = getOverallStats() || defaultStats;
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }

    try {
      cameras = getCameraLocations() || [];
    } catch (error) {
      console.error('Error fetching camera locations:', error);
    }

    try {
      cameraStats = getCameraStats() || [];
    } catch (error) {
      console.error('Error fetching camera stats:', error);
    }

    try {
      recentEvents = getRecentEvents(50) || [];
    } catch (error) {
      console.error('Error fetching recent events:', error);
    }

    // Ensure all required properties exist in overall stats
    const safeOverall = {
      ...defaultStats,
      ...overall
    };

    const data = {
      overall: safeOverall,
      cameras,
      cameraStats,
      recentEvents
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    // Return a structured error response with default values
    return NextResponse.json({
      overall: {
        total_detections: 0,
        vehicle_detections: 0,
        human_detections: 0,
        animal_detections: 0,
        high_alerts: 0,
        medium_alerts: 0,
        low_alerts: 0,
        active_cameras: 0
      },
      cameras: [],
      cameraStats: [],
      recentEvents: []
    });
  }
} 