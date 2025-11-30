import React from 'react';
import { useStore } from '../store';
import { ConnectionData } from '../types';

const WeightMatrixView: React.FC = () => {
  const { connections, layers } = useStore();

  // Group connections by layer transition (Input->Hidden1, etc)
  const layerMatrices = [];
  for (let l = 0; l < layers.length - 1; l++) {
    const layerConns = connections.filter(c => c.id.startsWith(`l${l}-`) && c.targetId.includes(`l${l+1}-`));
    
    // Sort logic to arrange in grid
    // connections are ID based, we can parse indexes
    // Assuming sourceId format "lx-ny"
    
    const inputCount = layers[l];
    const outputCount = layers[l+1];
    
    const matrix = Array(inputCount).fill(0).map(() => Array(outputCount).fill(0));
    
    layerConns.forEach(conn => {
       const srcIdx = parseInt(conn.sourceId.split('-n')[1]);
       const tgtIdx = parseInt(conn.targetId.split('-n')[1]);
       if (!isNaN(srcIdx) && !isNaN(tgtIdx)) {
         matrix[srcIdx][tgtIdx] = conn.weight;
       }
    });
    
    layerMatrices.push({
      id: l,
      name: `Layer ${l} → ${l+1}`,
      matrix
    });
  }

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-black/90 p-10 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-8 sticky top-0 bg-black/90 py-4 z-10">
          Weight Matrices Visualization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {layerMatrices.map((lm) => (
            <div key={lm.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-gray-300 font-mono mb-4 text-sm font-bold border-b border-gray-800 pb-2">{lm.name}</h3>
              
              <div className="flex flex-col gap-1">
                {/* Headers (Target Neurons) */}
                <div className="flex gap-1 ml-8">
                  {lm.matrix[0].map((_, i) => (
                    <div key={i} className="w-8 text-[10px] text-center text-gray-500">n{i}</div>
                  ))}
                </div>

                {lm.matrix.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1 items-center">
                    {/* Row Header (Source Neuron) */}
                    <div className="w-8 text-[10px] text-right text-gray-500 mr-1">n{rIdx}</div>
                    
                    {/* Cells */}
                    {row.map((val, cIdx) => {
                      // Color Scale: Red (Negative) ... Black (0) ... Blue (Positive)
                      const intensity = Math.min(1, Math.abs(val));
                      const bg = val > 0 
                        ? `rgba(96, 165, 250, ${intensity})` 
                        : `rgba(248, 113, 113, ${intensity})`;
                      
                      return (
                         <div 
                           key={cIdx} 
                           className="w-8 h-8 rounded-sm flex items-center justify-center text-[8px] font-mono text-white/80 transition-colors"
                           style={{ backgroundColor: bg }}
                           title={`Weight: ${val.toFixed(4)}`}
                         >
                           {val.toFixed(1)}
                         </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center">Rows: Source Neurons • Cols: Target Neurons</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeightMatrixView;