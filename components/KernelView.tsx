import React, { useState, useMemo } from 'react';

const KernelView: React.FC = () => {
  const [gridData] = useState<number[][]>([
     [0, 0, 0, 1, 1],
     [0, 1, 1, 1, 0],
     [1, 1, 1, 0, 0],
     [1, 1, 0, 0, 0],
     [1, 0, 0, 0, 0],
  ]);

  const kernel = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
  ];

  const [hoverPos, setHoverPos] = useState<{r: number, c: number} | null>(null);

  // Pre-calculate full output matrix
  const outputMatrix = useMemo(() => {
    const rows = gridData.length - 2;
    const cols = gridData[0].length - 2;
    const result = [];
    for(let r=0; r<rows; r++) {
      const rowArr = [];
      for(let c=0; c<cols; c++) {
        let sum = 0;
        for(let kr=0; kr<3; kr++) {
          for(let kc=0; kc<3; kc++) {
             sum += gridData[r+kr][c+kc] * kernel[kr][kc];
          }
        }
        rowArr.push(sum);
      }
      result.push(rowArr);
    }
    return result;
  }, [gridData, kernel]);

  // Calculate live hover values
  let calcResult = null;
  let calcSteps: string[] = [];
  
  if (hoverPos) {
    let sum = 0;
    for (let kr = 0; kr < 3; kr++) {
      for (let kc = 0; kc < 3; kc++) {
        const pixelVal = gridData[hoverPos.r + kr][hoverPos.c + kc];
        const kVal = kernel[kr][kc];
        sum += pixelVal * kVal;
        if (pixelVal * kVal !== 0) {
            calcSteps.push(`(${pixelVal}×${kVal})`);
        }
      }
    }
    calcResult = sum;
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 animate-fadeIn p-4 overflow-y-auto">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
        
        {/* Left Column: Visual Explorer */}
        <div className="flex flex-col items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Convolution Explorer</h2>
          <p className="text-gray-400 mb-6 text-sm">Hover over input to see kernel operation</p>
          
          <div className="flex items-center gap-8">
            {/* Input Grid */}
            <div className="relative border-2 border-gray-700 bg-gray-900 p-1 rounded-lg">
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">INPUT (5x5)</div>
               {gridData.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((val, c) => {
                       const isKernelHover = hoverPos && r >= hoverPos.r && r < hoverPos.r + 3 && c >= hoverPos.c && c < hoverPos.c + 3;
                       const kernelR = hoverPos ? r - hoverPos.r : -1;
                       const kernelC = hoverPos ? c - hoverPos.c : -1;
                       const kVal = (isKernelHover && kernelR >= 0) ? kernel[kernelR][kernelC] : null;

                       return (
                         <div 
                           key={c}
                           onMouseEnter={() => { if(r < 3 && c < 3) setHoverPos({r, c}); }}
                           className={`
                             w-12 h-12 md:w-14 md:h-14 border border-gray-800 flex items-center justify-center text-lg font-bold transition-all relative cursor-crosshair
                             ${isKernelHover ? 'bg-cyan-900/40 ring-1 ring-cyan-500' : 'bg-transparent'}
                           `}
                         >
                           <span className="text-gray-300">{val}</span>
                           {isKernelHover && (
                             <span className="absolute bottom-0.5 right-0.5 text-[8px] text-yellow-400">×{kVal}</span>
                           )}
                         </div>
                       );
                    })}
                  </div>
               ))}
               
               {/* Highlight Box */}
               {hoverPos && (
                 <div 
                   className="absolute border-2 border-yellow-400 pointer-events-none transition-all duration-75 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                   style={{
                     top: hoverPos.r * (window.innerWidth < 768 ? 48 : 56) + 4,
                     left: hoverPos.c * (window.innerWidth < 768 ? 48 : 56) + 4,
                     width: (window.innerWidth < 768 ? 144 : 168),
                     height: (window.innerWidth < 768 ? 144 : 168)
                   }}
                 />
               )}
            </div>

            <div className="text-2xl text-gray-600">→</div>

            {/* Output Grid */}
            <div className="relative border-2 border-gray-700 bg-gray-900 p-1 rounded-lg">
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">FEATURE MAP (3x3)</div>
              {outputMatrix.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((val, c) => {
                    const isTarget = hoverPos && hoverPos.r === r && hoverPos.c === c;
                    return (
                      <div 
                        key={c}
                        className={`
                          w-12 h-12 md:w-14 md:h-14 border border-gray-800 flex items-center justify-center text-lg font-bold transition-all
                          ${isTarget ? 'bg-green-600 text-white scale-110 shadow-lg z-10' : 'text-gray-400'}
                        `}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Math & explanation */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 h-full flex flex-col">
           <h3 className="text-xl text-yellow-400 font-bold mb-4 flex items-center gap-2">
             <span className="bg-yellow-400/20 p-1 rounded text-yellow-200 text-sm">KERNEL (3x3)</span>
             <span>Calculation</span>
           </h3>
           
           <div className="flex gap-4 mb-6">
               <div className="grid grid-cols-3 gap-1 border border-gray-600 p-1 bg-gray-900 rounded mx-auto">
                    {kernel.map((row, i) => row.map((v, j) => (
                        <div key={`${i}-${j}`} className="w-10 h-10 flex items-center justify-center bg-gray-800 text-yellow-400 font-bold border border-gray-700">{v}</div>
                    )))}
               </div>
           </div>

           {hoverPos ? (
             <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-gray-700 flex-grow">
               <div className="text-sm text-gray-300">
                 Scanning position <span className="font-mono text-cyan-400">({hoverPos.r}, {hoverPos.c})</span>
               </div>
               
               <div className="font-mono text-sm">
                 <div className="text-gray-500 mb-2 text-xs uppercase">Dot Product Formula</div>
                 <div className="text-white break-words leading-relaxed text-xs bg-gray-900 p-2 rounded border border-gray-800">
                   ∑ (Input × Kernel) = <br/>
                   <span className="text-cyan-300">{calcSteps.length > 0 ? calcSteps.join(' + ') : '0'}</span>
                 </div>
               </div>

               <div className="flex items-center gap-4 mt-4 border-t border-gray-700 pt-4">
                 <span className="text-sm text-gray-400">Resulting Pixel:</span>
                 <div className="text-3xl font-bold text-green-400 bg-green-900/20 px-4 py-1 rounded border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                    {calcResult}
                 </div>
               </div>
             </div>
           ) : (
             <div className="flex items-center justify-center flex-grow text-gray-500 italic bg-black/20 rounded-xl">
               Hover over the grid to calculate...
             </div>
           )}
        </div>
      </div>

      {/* Educational Footer */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h4 className="text-cyan-400 font-bold mb-2">What is Convolution?</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            A mathematical operation where a small matrix (the <strong>kernel</strong>) slides over the input to extract features. It preserves spatial relationships between pixels.
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h4 className="text-yellow-400 font-bold mb-2">The Kernel (Filter)</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            The kernel's weights determine what it looks for. This 'X' pattern kernel activates strongly when it sees an X shape in the input, and ignores other patterns.
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <h4 className="text-green-400 font-bold mb-2">Uses in AI</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong>Edge Detection:</strong> Finding boundaries of objects.<br/>
            <strong>Blurring/Sharpening:</strong> Image preprocessing.<br/>
            <strong>Feature Extraction:</strong> Identifying eyes, text, or textures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KernelView;