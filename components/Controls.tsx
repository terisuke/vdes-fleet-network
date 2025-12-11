import React from 'react';
import { DepthLayer } from '../types';
import { LAYER_CONFIG } from '../constants';
import { Layers, Clock, Settings } from 'lucide-react';

interface ControlsProps {
  selectedLayer: DepthLayer;
  onLayerChange: (layer: DepthLayer) => void;
  updateInterval: 10 | 30;
  onIntervalChange: (val: 10 | 30) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedLayer,
  onLayerChange,
  updateInterval,
  onIntervalChange,
}) => {
  return (
    <div className="bg-white p-2 lg:p-4 rounded-lg shadow-md border border-slate-200 lg:space-y-6 flex flex-col gap-2 shrink-0">
      
      {/* Layer Selection */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold border-b pb-1">
          <Layers size={16} className="lg:w-[18px] lg:h-[18px]" />
          <h3 className="text-xs lg:text-base">表示レイヤー</h3>
        </div>
        
        {/* Grid on Mobile, Column on Desktop */}
        <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2">
          {(Object.keys(LAYER_CONFIG) as DepthLayer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => onLayerChange(layer)}
              className={`
                px-2 py-2 lg:px-4 lg:py-3 rounded-md text-xs lg:text-sm font-medium transition-all flex justify-center lg:justify-between items-center
                ${selectedLayer === layer 
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              <span className="truncate">{LAYER_CONFIG[layer].label.split(' ')[0]}</span>
              {selectedLayer === layer && <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white animate-pulse hidden lg:block" />}
            </button>
          ))}
        </div>
      </div>

      {/* Update Frequency - Hide text on very small screens if needed, but horizontal stack is fine */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold border-b pb-1 hidden lg:flex">
          <Settings size={18} />
          <h3>更新頻度設定</h3>
        </div>
        <div className="flex gap-2 lg:gap-4 bg-slate-50 p-1 rounded-md">
          <label className={`flex-1 flex items-center justify-center gap-1 lg:gap-2 cursor-pointer py-1.5 lg:py-2 rounded text-xs lg:text-sm ${updateInterval === 10 ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500'}`}>
            <input 
              type="radio" 
              name="interval" 
              className="hidden" 
              checked={updateInterval === 10} 
              onChange={() => onIntervalChange(10)} 
            />
            <Clock size={12} className="lg:w-[14px] lg:h-[14px]" /> 10秒
          </label>
          <label className={`flex-1 flex items-center justify-center gap-1 lg:gap-2 cursor-pointer py-1.5 lg:py-2 rounded text-xs lg:text-sm ${updateInterval === 30 ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500'}`}>
            <input 
              type="radio" 
              name="interval" 
              className="hidden" 
              checked={updateInterval === 30} 
              onChange={() => onIntervalChange(30)} 
            />
            <Clock size={12} className="lg:w-[14px] lg:h-[14px]" /> 30秒
          </label>
        </div>
      </div>

    </div>
  );
};