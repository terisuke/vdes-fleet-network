import React, { useMemo } from 'react';
import { TelemetryData } from '../types';

interface FishFinderProps {
  data: TelemetryData | null;
  historyData: TelemetryData[];
  shipName: string;
  isLive: boolean;
}

export const FishFinder: React.FC<FishFinderProps> = ({ data, historyData, shipName, isLive }) => {
  
  const displayWindow = useMemo(() => {
    if (!data) return [];
    const endIndex = historyData.findIndex(d => d.ts === data.ts);
    if (endIndex === -1) return [];
    // Show last 20 slices
    const startIndex = Math.max(0, endIndex - 19); 
    return historyData.slice(startIndex, endIndex + 1);
  }, [data, historyData]);

  if (!data) return <div className="h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono">NO SIGNAL</div>;

  return (
    <div className={`h-full flex flex-col rounded-lg overflow-hidden border-4 shadow-inner transition-colors duration-300 ${isLive ? 'border-slate-700' : 'border-amber-500'}`}>
      <div className={`text-xs px-2 py-1 flex justify-between font-mono items-center ${isLive ? 'bg-slate-800 text-slate-300' : 'bg-amber-900 text-amber-100'}`}>
        <span className="flex items-center gap-2">
            {isLive ? (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
            {isLive ? "REAL-TIME SONAR" : "HISTORY INSPECTION"}
        </span>
        <span className="font-bold truncate max-w-[120px]">{shipName}</span>
        <span>{new Date(data.ts).toLocaleTimeString()}</span>
      </div>
      
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-blue-900 via-blue-900 to-indigo-950">
        
        {/* Depth Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
             <div className="border-t border-white h-full"></div>
             <div className="border-t border-white h-full"></div>
             <div className="border-t border-white h-full"></div>
             <div className="border-t border-white h-full"></div>
        </div>

        {/* Depth Markers */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 flex flex-col justify-between text-[10px] text-white bg-black/30 p-1 font-mono pointer-events-none">
          <span>0m</span>
          <span>25m</span>
          <span>50m</span>
          <span>75m</span>
          <span>100m</span>
        </div>

        {/* Sonar Content Container */}
        <div className="flex h-full w-full items-end">
          {displayWindow.map((point, idx) => {
            const seabedHeight = 100 - point.sb;
            // Highlight current frame in inspection mode
            const isCurrent = point.ts === data.ts;
            const opacity = isCurrent || isLive ? 1 : 0.6;

            return (
              <div key={point.ts} className="flex-1 relative h-full border-r border-blue-900/10 min-w-[2px]" style={{ opacity }}>
                
                {/* Fish Rendering */}
                {point.f.map((fish, fIdx) => {
                  let colorClass = '';
                  let blurClass = '';
                  
                  if (fish.type === 'school') {
                      colorClass = 'bg-pink-500 shadow-[0_0_10px_rgba(255,100,150,0.8)]';
                      blurClass = 'blur-[2px] opacity-70';
                  } else if (fish.type === 'medium') {
                      colorClass = 'bg-orange-400 shadow-[0_0_5px_rgba(255,165,0,0.8)]';
                      blurClass = 'blur-[1px] opacity-90';
                  } else {
                      colorClass = 'bg-cyan-300 shadow-[0_0_8px_rgba(0,255,255,1)] border border-white/50';
                      blurClass = 'blur-[0px] opacity-100';
                  }

                  return (
                    <div
                      key={fIdx}
                      className={`absolute rounded-full ${colorClass} ${blurClass}`}
                      style={{
                        top: `${fish.dp}%`,
                        height: `${fish.dw}%`,
                        left: '5%',
                        width: '90%',
                      }}
                    />
                  );
                })}

                {/* Seabed */}
                <div 
                  className="absolute bottom-0 w-full bg-amber-800/90 border-t-2 border-amber-600" 
                  style={{ height: `${seabedHeight}%` }} 
                />
              </div>
            );
          })}
        </div>

        {/* Layer Limits Overlay */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-full border-t border-dashed border-cyan-400/30" style={{ top: '30%' }}><span className="text-[10px] text-cyan-200/50 pl-10">表層</span></div>
            <div className="absolute w-full border-t border-dashed border-blue-400/30" style={{ top: '60%' }}><span className="text-[10px] text-blue-200/50 pl-10">中層</span></div>
        </div>
      </div>
    </div>
  );
};