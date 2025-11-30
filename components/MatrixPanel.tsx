import React from 'react';
import { useStore } from '../store';

const InputMatrixPanel: React.FC = () => {
  const inputMatrix = useStore(state => state.inputMatrix);
  const kernelPos = useStore(state => state.kernelPos);
  
  const kernelRow = kernelPos.r;
  const kernelCol = kernelPos.c;

  return (
    <div className="bg-black/90 backdrop-blur-xl p-4 rounded-xl border border-gray-800 w-auto shadow-2xl flex flex-col gap-2">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
         <h3 className="text-sm font-bold text-cyan-400">INPUT LAYER</h3>
         <div className="text-[10px] text-gray-400 font-mono">10x10 • KERNEL 3x3</div>
      </div>

      <div className="flex justify-center">
          <div className="relative border border-gray-700 p-0.5 bg-gray-900 rounded w-40 h-40">
            <div className="grid grid-cols-10 h-full w-full gap-[1px]">
              {inputMatrix.map((row, rIdx) => (
                row.map((val, cIdx) => {
                  const inKernel = 
                    rIdx >= kernelRow && rIdx < kernelRow + 3 &&
                    cIdx >= kernelCol && cIdx < kernelCol + 3;

                  return (
                    <div 
                      key={`in-${rIdx}-${cIdx}`}
                      className={`w-full h-full transition-colors duration-75 ${inKernel ? 'bg-cyan-900/50' : ''}`}
                      style={{
                        backgroundColor: inKernel ? undefined : `rgba(255, 255, 255, ${val * 0.9})`
                      }}
                    />
                  );
                })
              ))}
            </div>
            {/* Sliding Kernel Overlay */}
            <div 
              className="absolute border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-100 ease-linear pointer-events-none"
              style={{
                top: `${(kernelRow / 10) * 100}%`,
                left: `${(kernelCol / 10) * 100}%`,
                width: `${(3/10) * 100}%`,
                height: `${(3/10) * 100}%`
              }}
            />
          </div>
      </div>
      <div className="text-[10px] text-gray-500 text-center font-mono">
        Sliding kernel extracting features
      </div>
    </div>
  );
};

export default InputMatrixPanel;