import React from 'react';
import { APP_NAME, SHIP_MMSI, SHIP_NAME } from '../constants';
import { Ship, Wifi } from 'lucide-react';

export const Header: React.FC = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 text-white p-2 lg:p-4 shadow-lg flex justify-between items-center z-50 relative shrink-0">
      
      {/* Left: App Title */}
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="bg-blue-600 p-1.5 lg:p-2 rounded-lg">
           <Wifi className="animate-pulse w-4 h-4 lg:w-6 lg:h-6" />
        </div>
        <div>
            <h1 className="text-sm lg:text-xl font-bold tracking-wider leading-none">{APP_NAME}</h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">VDES ライブ接続中</p>
        </div>
      </div>

      {/* Right: Info & Time */}
      <div className="flex gap-2 lg:gap-6 items-center">
        {/* Ship Info Pill */}
        <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 lg:px-4 lg:py-2 rounded-full border border-slate-700 max-w-[150px] lg:max-w-none">
            <Ship className="text-blue-400 w-3 h-3 lg:w-[18px] lg:h-[18px] shrink-0" />
            <div className="flex flex-col leading-none overflow-hidden">
                <span className="text-[9px] text-slate-400 hidden lg:inline">MMSI: {SHIP_MMSI}</span>
                <span className="font-mono font-bold text-xs lg:text-sm truncate">{SHIP_NAME}</span>
            </div>
        </div>

        {/* Clock */}
        <div className="text-right leading-none">
            <div className="text-sm lg:text-2xl font-mono font-light">
                {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                <span className="text-[10px] lg:text-base hidden sm:inline">:{time.getSeconds().toString().padStart(2,'0')}</span>
            </div>
        </div>
      </div>
    </header>
  );
};