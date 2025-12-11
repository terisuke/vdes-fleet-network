export type FishType = 'school' | 'medium' | 'large';

export interface FishObject {
  /** Depth Start % (0 = Surface, 100 = Bottom) */
  dp: number;
  /** Depth Width % (Height of the response) */
  dw: number;
  /** Horizontal Width relative to time slice (simulation of fish length/speed) */
  lw?: number;
  /** Type of fish detected */
  type: FishType;
}

export interface TelemetryData {
  /** Timestamp (Unix epoch or ISO string) */
  ts: number;
  /** Latitude */
  lt: number;
  /** Longitude */
  ln: number;
  /** Array of detected fish objects */
  f: FishObject[];
  /** Seabed Depth % (0-100) */
  sb: number;
}

export interface ShipEntity {
  mmsi: string;
  name: string;
  isSelf: boolean;
  color: string; // For map marker differentiation
  history: TelemetryData[];
}

export enum DepthLayer {
  Surface = 'surface', // 0-30%
  Middle = 'middle',   // 30-60%
  Bottom = 'bottom'    // 60-100%
}

export interface InspectionState {
  mmsi: string;
  dataIndex: number;
  locked: boolean; // If true, UI shows specific historical point instead of live
}

export interface AppState {
  currentDataIndex: number;
  selectedLayer: DepthLayer;
  updateInterval: 10 | 30;
  isPlaying: boolean;
}