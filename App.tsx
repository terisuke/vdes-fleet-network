import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MapDisplay } from './components/MapDisplay';
import { Controls } from './components/Controls';
import { FishFinder } from './components/FishFinder';
import { generateFleetData } from './services/simulationService';
import { ShipEntity, DepthLayer, InspectionState } from './types';
import { Loader2, Navigation, Anchor } from 'lucide-react';

const App: React.FC = () => {
  // Data State
  const [fleetData, setFleetData] = useState<ShipEntity[]>([]);
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  
  // UI State
  const [selectedLayer, setSelectedLayer] = useState<DepthLayer>(DepthLayer.Surface);
  const [updateInterval, setUpdateInterval] = useState<10 | 30>(10);
  
  // Inspection State (null = Live View of Self)
  const [inspectionState, setInspectionState] = useState<InspectionState | null>(null);

  // Initialize Simulation
  useEffect(() => {
    const data = generateFleetData();
    setFleetData(data);
    setCurrentSimIndex(1); 
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (fleetData.length === 0) return;

    // Only auto-advance if NOT inspecting/locked
    if (inspectionState?.locked) return;

    const timer = setInterval(() => {
      setCurrentSimIndex(prev => {
        if (prev >= fleetData[0].history.length - 1) return 0; // Loop
        return prev + 1;
      });
    }, updateInterval * 1000);

    return () => clearInterval(timer);
  }, [fleetData, updateInterval, inspectionState?.locked]);

  // Derived Data for Views
  const activeData = useMemo(() => {
    if (fleetData.length === 0) return null;

    // Determine which ship and which time point to show in FishFinder
    let targetMmsi = fleetData.find(s => s.isSelf)?.mmsi;
    let targetIndex = currentSimIndex;

    // Override if inspecting
    if (inspectionState?.locked) {
        targetMmsi = inspectionState.mmsi;
        targetIndex = inspectionState.dataIndex;
    }

    const ship = fleetData.find(s => s.mmsi === targetMmsi);
    if (!ship) return null;

    const point = ship.history[targetIndex];
    const history = ship.history.slice(0, targetIndex + 1);

    return { ship, point, history };
  }, [fleetData, currentSimIndex, inspectionState]);


  // Handlers
  const handlePointSelect = (mmsi: string, index: number) => {
      setInspectionState({
          mmsi,
          dataIndex: index,
          locked: true
      });
  };

  const handleReturnToLive = () => {
      setInspectionState(null);
  };

  if (fleetData.length === 0) {
    return (
        <div className="h-[100dvh] w-screen flex items-center justify-center bg-slate-100 flex-col gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-600 font-medium">VDES システム接続中...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden font-sans bg-slate-200">
      <Header />
      
      {/* Main Layout: Flex Col on Mobile, Grid on Desktop */}
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-4 p-2 lg:p-4 min-h-0">
        
        {/* Map Area: Takes ~50% height on mobile, full height col-span-8 on desktop */}
        <div className="relative basis-1/2 lg:basis-auto lg:h-full lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden group order-1">
          
          {/* Map Overlay Info */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end pointer-events-none">
             <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow border border-slate-200 text-xs font-mono text-slate-600 pointer-events-auto">
                Lat: {activeData?.point.lt.toFixed(5)} | Lng: {activeData?.point.ln.toFixed(5)}
             </div>
             {/* Return to Live Button */}
             {inspectionState?.locked && (
                <button 
                    onClick={handleReturnToLive}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all font-bold text-xs lg:text-sm animate-bounce pointer-events-auto"
                >
                    <Navigation size={14} />
                    現在地へ (LIVE)
                </button>
             )}
          </div>
          
          <MapDisplay 
            fleetData={fleetData}
            currentSimIndex={currentSimIndex}
            selectedLayer={selectedLayer}
            inspectionState={inspectionState}
            onPointSelect={handlePointSelect}
          />

          <div className="absolute bottom-2 left-2 lg:bottom-4 lg:left-4 z-[400] text-[10px] lg:text-xs text-slate-500 bg-white/80 p-1.5 rounded pointer-events-none hidden sm:block">
             マーカーをタップして詳細確認
          </div>
        </div>

        {/* Info Area: Takes ~50% height on mobile, full height col-span-4 on desktop */}
        <div className="basis-1/2 lg:basis-auto lg:h-full lg:col-span-4 flex flex-col gap-2 lg:gap-4 min-h-0 overflow-y-auto order-2 pb-safe">
            
            {/* Controls */}
            <Controls 
              selectedLayer={selectedLayer}
              onLayerChange={setSelectedLayer}
              updateInterval={updateInterval}
              onIntervalChange={setUpdateInterval}
            />

            {/* Fish Finder Display */}
            <div className="flex-1 min-h-[200px] lg:min-h-[300px] bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col shrink-0">
                <div className="p-2 lg:p-3 bg-slate-900 border-b border-slate-700 flex justify-between items-center text-white">
                    <h3 className="font-bold text-sm lg:text-base flex items-center gap-2">
                        {inspectionState?.locked ? <Anchor size={16} className="text-amber-500"/> : <Navigation size={16} className="text-green-500"/>}
                        魚探モニター
                    </h3>
                    <span className={`text-[10px] lg:text-xs px-2 py-0.5 rounded ${inspectionState?.locked ? 'bg-amber-900 text-amber-200' : 'bg-slate-700 text-slate-300'}`}>
                        {inspectionState?.locked ? 'HISTORY' : 'LIVE'}
                    </span>
                </div>
                <div className="flex-1 p-0 relative">
                    <FishFinder 
                        data={activeData?.point || null} 
                        historyData={activeData?.history || []}
                        shipName={activeData?.ship.name || 'Unknown'}
                        isLive={!inspectionState?.locked}
                    />
                </div>
            </div>
            
            {/* Stats (Hide on very small screens if needed, or keep compact) */}
            <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-slate-200 shrink-0">
                 <h4 className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase mb-1 lg:mb-2">船団状況</h4>
                 <div className="grid grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm">
                    <div>
                        <span className="text-slate-400">接続船舶:</span>
                        <div className="font-mono">{fleetData.length} 隻</div>
                    </div>
                    <div>
                        <span className="text-slate-400">表示対象:</span>
                        <div className={`font-mono font-bold truncate ${inspectionState?.locked ? 'text-amber-600' : 'text-green-600'}`}>
                            {activeData?.ship.name}
                        </div>
                    </div>
                 </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;