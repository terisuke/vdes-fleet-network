import { DepthLayer } from './types';

export const APP_NAME = "VDES Fleet Monitor";
export const SHIP_MMSI = "431000000"; // Example MMSI from PDF
export const SHIP_NAME = "Host Maru";

export const FLEET_CONFIG = [
  { mmsi: "431000000", name: "Host Maru (自船)", isSelf: true, color: "blue" },
  { mmsi: "431000001", name: "Ryojin Maru (僚船1)", isSelf: false, color: "green" },
  { mmsi: "431000002", name: "Kaito Maru (僚船2)", isSelf: false, color: "orange" },
];

export const LAYER_CONFIG = {
  [DepthLayer.Surface]: { label: '表層 (0-30%)', min: 0, max: 30, color: 'text-cyan-500' },
  [DepthLayer.Middle]: { label: '中層 (30-60%)', min: 30, max: 60, color: 'text-blue-500' },
  [DepthLayer.Bottom]: { label: '底層 (60-100%)', min: 60, max: 100, color: 'text-indigo-600' },
};

export const COLORS = {
  fishDetected: '#ef4444', // Red-500
  noFish: '#94a3b8',       // Slate-400
  activePath: '#fbbf24',   // Amber-400 (Head of trail)
};

// Simulation Settings
export const SIMULATION_POINTS = 60; // 5 mins of data
export const INITIAL_CENTER: [number, number] = [24.34, 124.15]; // Ishigaki area