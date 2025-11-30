import React, { useMemo } from 'react';
import { useStore } from '../store';

const MetricsView: React.FC = () => {
  const { lossHistory, epoch } = useStore();

  const svgPath = useMemo(() => {
    if (lossHistory.length < 2) return "";
    
    // Normalize logic
    const width = 600;
    const height = 200;
    const maxLoss = Math.max(...lossHistory, 1.5); // Add buffer
    
    const points = lossHistory.map((loss, index) => {
      const x = (index / (lossHistory.length - 1)) * width;
      const y = height - (loss / maxLoss) * height;
      return `${x},${y}`;
    }).join(" ");
    
    return points;
  }, [lossHistory]);

  const avgLoss = lossHistory.length > 0 
    ? (lossHistory.reduce((a, b) => a + b, 0) / lossHistory.length).toFixed(4) 
    : "0.0000";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-10 animate-fadeIn">
      <div className="w-full max-w-4xl bg-gray-900/90 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Training Metrics
        </h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-xs font-mono mb-1">CURRENT EPOCH</h3>
            <p className="text-2xl text-white font-bold">{epoch}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-xs font-mono mb-1">CURRENT LOSS</h3>
            <p className="text-2xl text-cyan-400 font-bold">
              {lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].toFixed(5) : "N/A"}
            </p>
          </div>
           <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-xs font-mono mb-1">AVG LOSS</h3>
            <p className="text-2xl text-purple-400 font-bold">{avgLoss}</p>
          </div>
        </div>

        {/* Graph Container */}
        <div className="relative border border-gray-700 bg-black/50 rounded-xl h-64 w-full overflow-hidden p-4">
           {lossHistory.length > 1 ? (
             <svg viewBox="0 0 600 200" className="w-full h-full preserve-3d">
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#333" strokeDasharray="4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#333" strokeDasharray="4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#333" strokeDasharray="4" />
                
                {/* Area under curve */}
                <polygon 
                  points={`0,200 ${svgPath} 600,200`} 
                  fill="url(#grad1)" 
                  opacity="0.2"
                />
                
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'rgb(34,211,238)', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'rgb(34,211,238)', stopOpacity:0}} />
                  </linearGradient>
                </defs>

                {/* Line */}
                <polyline 
                  points={svgPath} 
                  fill="none" 
                  stroke="#22d3ee" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
             </svg>
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono">
               No training data yet. Run epochs to see metrics.
             </div>
           )}
           <div className="absolute bottom-2 left-4 text-xs text-gray-500 font-mono">Epoch 0</div>
           <div className="absolute bottom-2 right-4 text-xs text-gray-500 font-mono">Epoch {epoch}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsView;