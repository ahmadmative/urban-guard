export const events = [
  {
    id: 1,
    timestamp: "2024-02-18T10:30:00",
    camera: "CAM_001",
    eventType: "Detection",
    event: "Human",
    details: "Person detected in restricted area",
    alert: true,
    alertLevel: "high",
  },
  {
    id: 2,
    timestamp: "2024-02-18T10:35:00",
    camera: "CAM_002",
    eventType: "Detection",
    event: "Vehicle",
    details: "Unauthorized vehicle in parking",
    alert: true,
    alertLevel: "medium",
  },
  {
    id: 3,
    timestamp: "2024-02-18T10:40:00",
    camera: "CAM_003",
    eventType: "Detection",
    event: "Animal",
    details: "Stray dog detected",
    alert: false,
    alertLevel: "low",
  },
];

export const statistics = {
  totalDetections: 150,
  byType: {
    human: 70,
    vehicle: 50,
    animal: 30,
  },
  alertsByLevel: {
    high: 15,
    medium: 25,
    low: 110,
  },
  activeAlerts: 5,
  activeCameras: 10,
};

export const recentAlerts = [
  {
    id: 1,
    camera: "CAM_001",
    event: "Human",
    timestamp: "2024-02-18T10:30:00",
    status: "active",
  },
  {
    id: 2,
    camera: "CAM_002",
    event: "Vehicle",
    timestamp: "2024-02-18T10:35:00",
    status: "active",
  },
];

export const cameraStatus = [
  {
    id: "CAM_001",
    name: "Front Gate",
    status: "active",
    lastPing: "2024-02-18T10:45:00",
    detections: 45,
    location: {
      lat: 31.4826,
      lng: 74.0796,
      address: "DHA Phase 6 - Main Gate"
    },
    stats: {
      human: 25,
      vehicle: 15,
      animal: 5
    }
  },
  {
    id: "CAM_002",
    name: "Parking Lot",
    status: "active",
    lastPing: "2024-02-18T10:44:00",
    detections: 32,
    location: {
      lat: 31.4796,
      lng: 74.0776,
      address: "DHA Phase 6 - Parking Area"
    },
    stats: {
      human: 20,
      vehicle: 10,
      animal: 2
    }
  },
  {
    id: "CAM_003",
    name: "Back Entrance",
    status: "active",
    lastPing: "2024-02-18T10:43:00",
    detections: 28,
    location: {
      lat: 31.4816,
      lng: 74.0756,
      address: "DHA Phase 6 - Back Gate"
    },
    stats: {
      human: 15,
      vehicle: 8,
      animal: 5
    }
  },
]; 