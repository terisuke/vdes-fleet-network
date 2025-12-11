import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { TelemetryData, DepthLayer, FishType, ShipEntity } from '../types';
import { COLORS, LAYER_CONFIG } from '../constants';

// Custom icons based on color
const createBoatIcon = (color: string, isSelected: boolean) => L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 drop-shadow-md transform -rotate-45 stroke-white stroke-2 ${isSelected ? 'scale-125 z-50' : 'opacity-90'}" style="color: ${color};"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>`,
  className: "bg-transparent",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapDisplayProps {
  fleetData: ShipEntity[];
  currentSimIndex: number;
  selectedLayer: DepthLayer;
  inspectionState: { mmsi: string; dataIndex: number; locked: boolean } | null;
  onPointSelect: (mmsi: string, index: number) => void;
}

const MapController: React.FC<{ center: [number, number] | undefined }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center) map.panTo(center);
  }, [center, map]);
  return null;
};

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  fleetData, 
  currentSimIndex, 
  selectedLayer,
  inspectionState,
  onPointSelect
}) => {
  // Determine center based on self ship or inspected point
  const centerData = useMemo(() => {
    if (inspectionState?.locked) {
        const ship = fleetData.find(s => s.mmsi === inspectionState.mmsi);
        const pt = ship?.history[inspectionState.dataIndex];
        if (pt) return [pt.lt, pt.ln] as [number, number];
    }
    // Default to self ship current pos
    const selfShip = fleetData.find(s => s.isSelf);
    const pt = selfShip?.history[currentSimIndex];
    if (pt) return [pt.lt, pt.ln] as [number, number];
    return undefined;
  }, [fleetData, currentSimIndex, inspectionState]);

  // Marker Style Helper
  const getMarkerStyle = (type: FishType) => {
      if (type === 'school') return { color: '#ec4899', radius: 10 };
      if (type === 'medium') return { color: '#f97316', radius: 6 };
      return { color: '#06b6d4', radius: 3 };
  };

  return (
    <MapContainer center={centerData || [24.60, 124.15]} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-lg shadow-inner z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={centerData} />

      {/* Render each ship in the fleet */}
      {fleetData.map((ship) => {
        const currentPos = ship.history[currentSimIndex];
        if (!currentPos) return null;

        // Calculate visual segments up to current time
        const segments: any[] = [];
        const { min, max } = LAYER_CONFIG[selectedLayer];

        for (let i = 0; i < currentSimIndex; i++) {
            const p1 = ship.history[i];
            const p2 = ship.history[i+1];
            
            // Check fish presence
            const relevantFish = p2.f.filter(f => (Math.max(f.dp, min) < Math.min(f.dp + f.dw, max)));
            const hasFish = relevantFish.length > 0;
            const dominantType = hasFish ? relevantFish[0].type : null;

            segments.push({
                positions: [[p1.lt, p1.ln], [p2.lt, p2.ln]],
                color: hasFish ? COLORS.fishDetected : COLORS.noFish,
                weight: hasFish ? 6 : 4,
                opacity: hasFish ? 0.9 : 0.4,
                hasFish,
                dominantType,
                dataIndex: i + 1
            });
        }

        const isInspectingThisShip = inspectionState?.mmsi === ship.mmsi;

        return (
            <React.Fragment key={ship.mmsi}>
                {/* Segments */}
                {segments.map((seg, idx) => (
                    <React.Fragment key={idx}>
                        <Polyline 
                            positions={seg.positions}
                            eventHandlers={{ click: () => onPointSelect(ship.mmsi, seg.dataIndex) }}
                            pathOptions={{ 
                                color: seg.color, 
                                weight: seg.weight, 
                                opacity: seg.opacity,
                                className: 'cursor-pointer hover:stroke-[8px] transition-all'
                            }}
                        />
                        {/* Fish Markers */}
                        {seg.hasFish && (
                            <CircleMarker 
                                center={seg.positions[1]}
                                radius={getMarkerStyle(seg.dominantType).radius}
                                eventHandlers={{ click: () => onPointSelect(ship.mmsi, seg.dataIndex) }}
                                pathOptions={{
                                    color: getMarkerStyle(seg.dominantType).color,
                                    fillColor: getMarkerStyle(seg.dominantType).color,
                                    fillOpacity: 0.6,
                                    className: 'cursor-pointer hover:fill-opacity-100'
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* Current Ship Position Marker */}
                <Marker 
                    position={[currentPos.lt, currentPos.ln]} 
                    icon={createBoatIcon(ship.color, isInspectingThisShip)}
                    eventHandlers={{ click: () => onPointSelect(ship.mmsi, currentSimIndex) }}
                >
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                        <span className="font-bold text-xs">{ship.name}</span>
                    </Tooltip>
                </Marker>

                {/* Inspection Highlight Ring */}
                {inspectionState?.locked && isInspectingThisShip && (
                    <CircleMarker 
                        center={[ship.history[inspectionState.dataIndex].lt, ship.history[inspectionState.dataIndex].ln]}
                        radius={20}
                        pathOptions={{ color: 'white', fillColor: 'transparent', weight: 4, dashArray: '5, 5' }}
                        className="animate-pulse"
                    />
                )}
            </React.Fragment>
        );
      })}
    </MapContainer>
  );
};