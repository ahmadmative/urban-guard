import Database from 'better-sqlite3';
import path from 'path';

let db;

export function getDb() {
  if (!db) {
    try {
      db = new Database(path.join(process.cwd(), 'data.db'), { readonly: true });
      db.pragma('journal_mode = WAL');
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error('Failed to connect to database');
    }
  }
  return db;
}

export function closeDb() {
  if (db) {
    try {
      db.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
    db = null;
  }
}

// Fetch all camera statistics
export function getCameraStats() {
  const db = getDb();
  try {
    const stats = db.prepare(`
      SELECT 
        camera_id,
        COUNT(*) as total_detections,
        SUM(CASE WHEN event_type = 'Vehicle' THEN 1 ELSE 0 END) as vehicle_detections,
        SUM(CASE WHEN event_type = 'Human' THEN 1 ELSE 0 END) as human_detections,
        SUM(CASE WHEN event_type = 'Animal' THEN 1 ELSE 0 END) as animal_detections,
        SUM(CASE WHEN alert_level = 'High' THEN 1 ELSE 0 END) as high_alerts,
        SUM(CASE WHEN alert_level = 'Medium' THEN 1 ELSE 0 END) as medium_alerts,
        SUM(CASE WHEN alert_level = 'Low' THEN 1 ELSE 0 END) as low_alerts
      FROM events
      GROUP BY camera_id
    `).all();
    
    // Ensure we return an array even if no results
    return stats || [];
  } catch (error) {
    console.error('Error fetching camera stats:', error);
    return [];
  }
}

// Fetch recent events
export function getRecentEvents(limit = 100) {
  const db = getDb();
  try {
    const events = db.prepare(`
      SELECT 
        uuid as id,
        camera_id,
        time as timestamp,
        event_type,
        event as details,
        alert,
        alert_level
      FROM events
      ORDER BY time DESC
      LIMIT ?
    `).all(limit);
    
    return events || [];
  } catch (error) {
    console.error('Error fetching recent events:', error);
    return [];
  }
}

// Fetch events for a specific camera
export function getCameraEvents(cameraId) {
  const db = getDb();
  try {
    const events = db.prepare(`
      SELECT 
        uuid as id,
        camera_id,
        time as timestamp,
        event_type,
        event as details,
        alert,
        alert_level
      FROM events
      WHERE camera_id = ?
      ORDER BY time DESC
    `).all(cameraId);
    
    return events || [];
  } catch (error) {
    console.error('Error fetching camera events:', error);
    return [];
  }
}

// Get overall statistics
export function getOverallStats() {
  const db = getDb();
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_detections,
        SUM(CASE WHEN event_type = 'Vehicle' THEN 1 ELSE 0 END) as vehicle_detections,
        SUM(CASE WHEN event_type = 'Human' THEN 1 ELSE 0 END) as human_detections,
        SUM(CASE WHEN event_type = 'Animal' THEN 1 ELSE 0 END) as animal_detections,
        SUM(CASE WHEN alert_level = 'High' THEN 1 ELSE 0 END) as high_alerts,
        SUM(CASE WHEN alert_level = 'Medium' THEN 1 ELSE 0 END) as medium_alerts,
        SUM(CASE WHEN alert_level = 'Low' THEN 1 ELSE 0 END) as low_alerts,
        COUNT(DISTINCT camera_id) as active_cameras
      FROM events
      WHERE time >= datetime('now', '-24 hours')
    `).get();

    // Ensure we return an object with all required properties
    return stats || {
      total_detections: 0,
      vehicle_detections: 0,
      human_detections: 0,
      animal_detections: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0,
      active_cameras: 0
    };
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    return {
      total_detections: 0,
      vehicle_detections: 0,
      human_detections: 0,
      animal_detections: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0,
      active_cameras: 0
    };
  }
}

// Get camera locations and status
export function getCameraLocations() {
  const db = getDb();
  try {
    // Since we don't have a cameras table, we'll create a virtual one from events
    const cameras = db.prepare(`
      SELECT DISTINCT camera_id
      FROM events
    `).all();

    // Map the results to include default coordinates and information
    const mappedCameras = cameras.map(camera => {
      let latitude = 31.4826;  // Default latitude
      let longitude = 74.0796; // Default longitude
      let address = 'DHA Phase 6';

      // Assign specific coordinates based on camera ID
      switch(camera.camera_id) {
        case 'Camera 1':
          latitude = 31.4826;
          longitude = 74.0796;
          address = 'DHA Phase 6 - Main Gate';
          break;
        case 'Camera 2':
          latitude = 31.4796;
          longitude = 74.0776;
          address = 'DHA Phase 6 - Parking Area';
          break;
        case 'Camera 3':
          latitude = 31.4816;
          longitude = 74.0756;
          address = 'DHA Phase 6 - Back Gate';
          break;
        case 'Camera 4':
          latitude = 31.4836;
          longitude = 74.0736;
          address = 'DHA Phase 6 - Side Entrance';
          break;
      }

      return {
        camera_id: camera.camera_id,
        name: camera.camera_id,
        status: 'active',
        latitude,
        longitude,
        address,
        last_ping: new Date().toISOString() // Current time as default last ping
      };
    });

    return mappedCameras;
  } catch (error) {
    console.error('Error fetching camera locations:', error);
    // Return default camera data if there's an error
    return [
      {
        camera_id: 'Camera 1',
        name: 'Camera 1',
        status: 'active',
        latitude: 31.4826,
        longitude: 74.0796,
        address: 'DHA Phase 6 - Main Gate',
        last_ping: new Date().toISOString()
      },
      {
        camera_id: 'Camera 2',
        name: 'Camera 2',
        status: 'active',
        latitude: 31.4796,
        longitude: 74.0776,
        address: 'DHA Phase 6 - Parking Area',
        last_ping: new Date().toISOString()
      },
      {
        camera_id: 'Camera 3',
        name: 'Camera 3',
        status: 'active',
        latitude: 31.4816,
        longitude: 74.0756,
        address: 'DHA Phase 6 - Back Gate',
        last_ping: new Date().toISOString()
      },
      {
        camera_id: 'Camera 4',
        name: 'Camera 4',
        status: 'active',
        latitude: 31.4836,
        longitude: 74.0736,
        address: 'DHA Phase 6 - Side Entrance',
        last_ping: new Date().toISOString()
      }
    ];
  }
} 