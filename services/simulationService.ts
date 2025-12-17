import { TelemetryData, FishObject, ShipEntity } from '../types';
import { SIMULATION_POINTS, FLEET_CONFIG } from '../constants';

// Safe sea route coordinates (North of Ishigaki Island)
const SAFE_WAYPOINTS = [
  { lat: 24.6000, lng: 124.1500 }, // Start point (Sea)
  { lat: 24.6200, lng: 124.2500 }, // Mid point
  { lat: 24.6100, lng: 124.3500 }, // End point
];

// State for simulation continuity (per ship)
interface SimState {
    lastSchoolType: 'none' | 'school' | 'medium' | 'large';
    schoolCounter: number;
    currentSeabedDepth: number;
}

const createSimState = (): SimState => ({
    lastSchoolType: 'none',
    schoolCounter: 0,
    currentSeabedDepth: 85 + (Math.random() * 10 - 5)
});

// Helper to generate fish
const generateFish = (state: SimState): FishObject[] => {
  const objects: FishObject[] = [];
  
  // State machine
  if (state.schoolCounter <= 0) {
    const rand = Math.random();
    if (rand < 0.4) state.lastSchoolType = 'none';
    else if (rand < 0.7) state.lastSchoolType = 'school'; 
    else if (rand < 0.9) state.lastSchoolType = 'medium'; 
    else state.lastSchoolType = 'large'; 
    
    state.schoolCounter = Math.floor(Math.random() * 6) + 2; 
  }

  state.schoolCounter--;

  if (state.lastSchoolType === 'none') return [];

  const count = state.lastSchoolType === 'large' ? 1 : Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < count; i++) {
    let dp = 0;
    let dw = 0;

    let lw = 0;

    if (state.lastSchoolType === 'school') {
       dp = Math.floor(Math.random() * 40) + 10; 
       dw = Math.floor(Math.random() * 20) + 15;
       lw = Math.floor(Math.random() * 40) + 40; // 40-80% width for schools
    } else if (state.lastSchoolType === 'medium') {
       dp = Math.floor(Math.random() * 30) + 40; 
       dw = Math.floor(Math.random() * 10) + 5;
       lw = Math.floor(Math.random() * 30) + 30; // 30-60% width for medium
    } else {
       dp = Math.floor(Math.random() * 20) + 50; 
       dw = Math.floor(Math.random() * 3) + 2;
       lw = Math.floor(Math.random() * 15) + 10; // 10-25% width for large (single fish)
    }

    if (dp + dw > state.currentSeabedDepth) {
        dp = state.currentSeabedDepth - dw - 2;
    }
    
    objects.push({
      dp,
      dw,
      lw,
      type: state.lastSchoolType
    });
  }
  return objects;
};

// Interpolate position with offset for different ships
const getPosition = (progress: number, offsetLat: number, offsetLng: number) => {
    const totalSegments = SAFE_WAYPOINTS.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.floor(segmentProgress);
    const segmentPercent = segmentProgress - segmentIndex;

    const start = SAFE_WAYPOINTS[Math.min(segmentIndex, totalSegments - 1)];
    const end = SAFE_WAYPOINTS[Math.min(segmentIndex + 1, totalSegments - 1)];

    // Base position
    const baseLat = start.lat + (end.lat - start.lat) * segmentPercent;
    const baseLng = start.lng + (end.lng - start.lng) * segmentPercent;

    return {
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng
    };
};

export const generateFleetData = (): ShipEntity[] => {
  const now = Date.now();
  
  return FLEET_CONFIG.map((shipConfig, idx) => {
      const history: TelemetryData[] = [];
      const simState = createSimState();
      
      // Calculate offset based on index to separate ships
      // Ship 0: Center, Ship 1: North-East, Ship 2: South-West
      const offsetLat = idx === 0 ? 0 : (idx === 1 ? 0.008 : -0.008);
      const offsetLng = idx === 0 ? 0 : (idx === 1 ? 0.005 : -0.005);

      for (let i = 0; i < SIMULATION_POINTS; i++) {
        const progress = i / (SIMULATION_POINTS - 1);
        const pos = getPosition(progress, offsetLat, offsetLng);

        // Simulate Seabed
        const change = (Math.random() - 0.5) * 3;
        simState.currentSeabedDepth += change;
        if (simState.currentSeabedDepth < 70) simState.currentSeabedDepth = 70;
        if (simState.currentSeabedDepth > 95) simState.currentSeabedDepth = 95;

        history.push({
          ts: now - (SIMULATION_POINTS - i) * 10000,
          lt: pos.lat,
          ln: pos.lng,
          sb: simState.currentSeabedDepth,
          f: generateFish(simState)
        });
      }

      return {
          ...shipConfig,
          history
      };
  });
};