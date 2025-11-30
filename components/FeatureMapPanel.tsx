import React from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

const FeatureMapPanel: React.FC = () => {
  const matrixData = useStore(state => state.matrixData);
  const showPooling = useStore(state => state.showPooling);
  const kernelPos = useStore(state => state.kernelPos);
  const toggleFeatureMap = useStore(state => state.toggleFeatureMap);
  
  const outputRow = kernelPos.r;
  const outputCol = kernelPos.c;

  return (
    <div className="bg-black/90 backdrop-blur-xl p-4 rounded-xl border border-gray-800 w-auto shadow-2xl flex flex-col gap-2">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
         <h3 className="text-sm font-bold text-yellow-400">FEATURE MAP</h3>
         <div className="flex items-center gap-2">
           <div className="text-[10px] text-gray-400 font-mono">8x8 • OUTPUT</div>
           <button 
             onClick={toggleFeatureMap}
             className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
             title="Close Panel"
           >
             <X size={12} />
           </button>
         </div>
      </div>

      <div className="flex justify-center">
          <div className="relative border border-gray-700 p-0.5 bg-gray-900 rounded w-40 h-40">
            <div className="grid grid-cols-8 h-full w-full gap-[1px]">
              {matrixData.map((row, rIdx) => (
                row.map((val, cIdx) => {
                  const isActive = rIdx === outputRow && cIdx === outputCol;
                  return (
                    <div 
                      key={`out-${rIdx}-${cIdx}`}
                      className={`
                        w-full h-full transition-all duration-150
                        ${isActive ? 'bg-yellow-400 ring-2 ring-yellow-200 z-10 scale-110' : ''}
                      `}
                      style={{
                        backgroundColor: isActive ? undefined : `rgba(74, 222, 128, ${val * 0.8})`
                      }}
                    />
                  );
                })
              ))}
            </div>
            
            {showPooling && (
               <div 
                 className="absolute border-2 border-yellow-500 transition-all duration-100 ease-linear pointer-events-none opacity-50"
                 style={{
                   top: `${(Math.floor(outputRow/2)*2 / 8) * 100}%`,
                   left: `${(Math.floor(outputCol/2)*2 / 8) * 100}%`,
                   width: `${(2/8) * 100}%`,
                   height: `${(2/8) * 100}%`
                 }}
               />
            )}
          </div>
      </div>
      <div className="text-[10px] text-gray-500 text-center font-mono">
        {showPooling ? 'POOLING (Max/Avg)' : 'Activation Map'}
      </div>
    </div>
  );
};

export default FeatureMapPanel;