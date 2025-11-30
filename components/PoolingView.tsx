import React, { useState } from 'react';

const PoolingView: React.FC = () => {
  const [mode, setMode] = useState<'MAX' | 'AVG'>('MAX');
  
  const data = [
    [12, 20, 30, 0],
    [8, 12, 2, 0],
    [34, 70, 37, 4],
    [112, 100, 25, 12]
  ];

  // 4x4 input -> 2x2 output (stride 2)
  const output = [];
  for(let r=0; r<4; r+=2) {
      const row = [];
      for(let c=0; c<4; c+=2) {
          const vals = [
              data[r][c], data[r][c+1],
              data[r+1][c], data[r+1][c+1]
          ];
          if (mode === 'MAX') row.push(Math.max(...vals));
          else row.push(Math.round(vals.reduce((a,b)=>a+b,0)/4));
      }
      output.push(row);
  }

  const [hoverRegion, setHoverRegion] = useState<{r:number, c:number} | null>(null);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 animate-fadeIn overflow-y-auto p-4">
       <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                    Pooling Layer
                </h2>
                <p className="text-gray-400 text-xs mt-1">Downsampling the feature map</p>
              </div>
              <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setMode('MAX')}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${mode === 'MAX' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                      Max Pooling
                  </button>
                  <button 
                    onClick={() => setMode('AVG')}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${mode === 'AVG' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                      Avg Pooling
                  </button>
              </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10">
              
              {/* Input Grid */}
              <div className="flex flex-col items-center gap-3">
                  <h3 className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">INPUT (4x4)</h3>
                  <div className="grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl">
                      {data.map((row, r) => row.map((val, c) => {
                          const regionR = Math.floor(r/2);
                          const regionC = Math.floor(c/2);
                          const isHovered = hoverRegion && hoverRegion.r === regionR && hoverRegion.c === regionC;
                          
                          // Checkerboard region coloring
                          const regionColor = (regionR + regionC) % 2 === 0 ? 'bg-gray-700/50' : 'bg-gray-600/50';
                          
                          return (
                              <div 
                                key={`${r}-${c}`}
                                onMouseEnter={() => setHoverRegion({r: regionR, c: regionC})}
                                onMouseLeave={() => setHoverRegion(null)}
                                className={`
                                    w-14 h-14 flex items-center justify-center font-bold text-lg rounded transition-all cursor-default
                                    ${isHovered ? 'bg-orange-500/80 ring-2 ring-orange-300 text-white scale-105 z-10' : `${regionColor} text-gray-300`}
                                `}
                              >
                                  {val}
                              </div>
                          );
                      }))}
                  </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-gray-500 gap-2">
                  <div className="text-xs font-mono bg-gray-900 px-2 py-1 rounded border border-gray-800">Stride 2</div>
                  <svg width="40" height="20" viewBox="0 0 40 20" className="text-orange-500">
                      <path d="M0,10 L30,10" stroke="currentColor" strokeWidth="2" />
                      <path d="M30,5 L40,10 L30,15" fill="currentColor" />
                  </svg>
              </div>

              {/* Output Grid */}
              <div className="flex flex-col items-center gap-3">
                  <h3 className="text-orange-400 font-mono text-xs font-bold bg-orange-900/20 border border-orange-500/30 px-2 py-1 rounded">OUTPUT (2x2)</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded-xl border-2 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                      {output.map((row, r) => row.map((val, c) => {
                          const isHovered = hoverRegion && hoverRegion.r === r && hoverRegion.c === c;
                          return (
                              <div 
                                key={`${r}-${c}`}
                                className={`
                                    w-24 h-24 flex flex-col items-center justify-center font-bold text-3xl rounded-lg border-2 transition-all
                                    ${isHovered ? 'border-orange-400 bg-orange-600 text-white shadow-[0_0_20px_rgba(251,146,60,0.6)] scale-110' : 'border-gray-600 bg-gray-900 text-gray-400'}
                                `}
                              >
                                  {val}
                                  <span className="text-[10px] font-normal opacity-50 mt-1">Pixel ({r},{c})</span>
                              </div>
                          );
                      }))}
                  </div>
              </div>
          </div>

          {/* Definitions & Uses Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
               <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                 <span className="text-lg">📉</span> Dimensionality Reduction
               </h4>
               <p className="text-gray-400 text-sm leading-relaxed">
                 Pooling reduces the size of the input (e.g., 4x4 → 2x2). This cuts down the amount of parameters and computation needed in later layers, preventing overfitting.
               </p>
             </div>

             <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
               <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                 <span className="text-lg">🔄</span> Translation Invariance
               </h4>
               <p className="text-gray-400 text-sm leading-relaxed">
                 It makes the network robust to small shifts. If a feature (like a nose) moves slightly to the left, max pooling will likely still capture it in the same output region.
               </p>
             </div>

             <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
               <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                 <span className="text-lg">🚀</span> Max vs Average
               </h4>
               <ul className="text-gray-400 text-sm space-y-2">
                 <li><strong className="text-white">Max Pooling:</strong> Keeps sharpest features (edges/textures). Most common.</li>
                 <li><strong className="text-white">Avg Pooling:</strong> Smoothes the image. Used less often now, but good for background.</li>
               </ul>
             </div>
          </div>

       </div>
    </div>
  );
};

export default PoolingView;