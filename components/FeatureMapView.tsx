import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, X } from 'lucide-react';

const FeatureMapView: React.FC = () => {
  const setView = useStore(state => state.setView);
  const [showDefinitions, setShowDefinitions] = useState(true);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 animate-fadeIn p-8 overflow-y-auto">
       
       {/* CONTROLS */}
       <div className="absolute top-6 right-6 flex gap-3 z-50">
          <button 
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700 text-xs font-bold"
          >
            {showDefinitions ? <EyeOff size={14} /> : <Eye size={14} />}
            {showDefinitions ? 'HIDE INFO' : 'SHOW INFO'}
          </button>
          
          <button 
            onClick={() => setView('SCENE')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors border border-red-900/50 text-xs font-bold"
          >
            <X size={14} />
            CLOSE
          </button>
       </div>

       <div className="max-w-6xl w-full mt-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
               Feature Maps & Filters
            </h2>
            <p className="text-gray-400">How Neural Networks "See" the World</p>
          </div>
          
          {/* Main Visualization Row */}
          <div className={`flex flex-col md:flex-row gap-6 items-center justify-center transition-all duration-500 ${showDefinitions ? 'mb-12' : 'scale-110 my-20'}`}>
             
             {/* 1. Original Image */}
             <div className="flex flex-col gap-4 items-center bg-gray-900 p-4 rounded-xl border border-gray-800 relative group">
                <div className="text-xs text-gray-500 font-mono mb-1">RAW INPUT</div>
                <div className="w-48 h-48 bg-gray-800 border-2 border-white/20 rounded-lg overflow-hidden relative shadow-lg">
                    {/* Input Face SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full bg-gray-200">
                        {/* Background */}
                        <rect width="100" height="100" fill="#e5e7eb" />
                        {/* Face Silhouette */}
                        <path d="M30 30 Q30 10 50 10 Q70 10 70 30 V50 Q70 80 50 90 Q30 80 30 50 Z" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
                        {/* Ears */}
                        <path d="M28 40 Q25 40 25 50 Q25 60 28 60" fill="#d1d5db" />
                        <path d="M72 40 Q75 40 75 50 Q75 60 72 60" fill="#d1d5db" />
                        {/* Hair */}
                        <path d="M30 30 Q30 5 50 5 Q70 5 70 30 Q70 20 50 20 Q30 20 30 30" fill="#4b5563" />
                        {/* Eyes */}
                        <ellipse cx="40" cy="45" rx="3" ry="2" fill="#1f2937" />
                        <ellipse cx="60" cy="45" rx="3" ry="2" fill="#1f2937" />
                        {/* Nose */}
                        <path d="M50 45 L48 58 L52 58 Z" fill="#9ca3af" opacity="0.5" />
                        {/* Mouth */}
                        <path d="M42 70 Q50 75 58 70" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                    </svg>
                    
                    {/* Scan effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent w-full h-2 animate-scan pointer-events-none"></div>
                </div>
                <h3 className="font-bold text-white text-sm">Input Image</h3>
             </div>

             {/* Arrow & Operation */}
             <div className="flex flex-col items-center gap-2">
                <div className="bg-black border border-gray-700 px-3 py-1 rounded text-[10px] text-cyan-400 font-mono">CONVOLUTION</div>
                <div className="text-3xl text-gray-600">→</div>
             </div>

             {/* 2. The Filter Bank (Middle) */}
             <div className="flex flex-col gap-3">
                 {/* Filter 1 */}
                 <div className="flex items-center gap-3 bg-black p-2 rounded-lg border border-gray-700 shadow-md">
                     <div className="w-10 h-10 grid grid-cols-3 gap-px border border-gray-600 bg-gray-800">
                         {[1,0,-1, 1,0,-1, 1,0,-1].map((v,i) => <div key={i} className={`flex items-center justify-center text-[6px] ${v===0?'text-gray-600':'text-white'}`}>{v}</div>)}
                     </div>
                     <div>
                         <div className="text-green-400 font-bold text-xs">Vertical Edge</div>
                         <div className="text-[9px] text-gray-500">Filter Kernel</div>
                     </div>
                 </div>

                 {/* Filter 2 */}
                 <div className="flex items-center gap-3 bg-black p-2 rounded-lg border border-gray-700 shadow-md">
                     <div className="w-10 h-10 grid grid-cols-3 gap-px border border-gray-600 bg-gray-800">
                         {[1,1,1, 0,0,0, -1,-1,-1].map((v,i) => <div key={i} className={`flex items-center justify-center text-[6px] ${v===0?'text-gray-600':'text-white'}`}>{v}</div>)}
                     </div>
                     <div>
                         <div className="text-green-400 font-bold text-xs">Horizontal Edge</div>
                         <div className="text-[9px] text-gray-500">Filter Kernel</div>
                     </div>
                 </div>
             </div>

             {/* Arrow */}
             <div className="flex flex-col items-center gap-2">
                <div className="text-3xl text-gray-600">→</div>
             </div>

             {/* 3. Resulting Feature Maps */}
             <div className="flex flex-col gap-4 items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="text-xs text-gray-500 font-mono mb-1">ACTIVATION OUTPUT</div>
                <div className="flex gap-4">
                    
                    {/* Map 1 Result: Vertical Edges */}
                    <div className="flex flex-col items-center gap-1 group">
                        <div className="w-32 h-32 bg-black border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.1)] relative overflow-hidden rounded">
                             <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                                {/* Vertical lines of face */}
                                <path d="M30 30 V50 M70 30 V50" stroke="#4ade80" strokeWidth="2" fill="none" />
                                {/* Nose Vertical */}
                                <path d="M48 45 V60 M52 45 V60" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.8" />
                                {/* Sides of face lower */}
                                <path d="M30 50 Q30 70 40 80 M70 50 Q70 70 60 80" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.6" />
                             </svg>
                             <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay"></div>
                        </div>
                        <span className="text-[10px] text-gray-400 group-hover:text-green-400 transition-colors">Vertical Edges</span>
                    </div>

                    {/* Map 2 Result: Horizontal Edges */}
                     <div className="flex flex-col items-center gap-1 group">
                        <div className="w-32 h-32 bg-black border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.1)] relative overflow-hidden rounded">
                             <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                                {/* Horizontal features: Eyes, Mouth, Hair line, Chin */}
                                <path d="M30 30 Q50 30 70 30" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.5" /> {/* Hairline */}
                                <line x1="37" y1="45" x2="43" y2="45" stroke="#4ade80" strokeWidth="2" /> {/* Eye L */}
                                <line x1="57" y1="45" x2="63" y2="45" stroke="#4ade80" strokeWidth="2" /> {/* Eye R */}
                                <path d="M42 70 Q50 75 58 70" stroke="#4ade80" strokeWidth="2" fill="none" /> {/* Mouth */}
                                <path d="M40 88 Q50 90 60 88" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.7" /> {/* Chin */}
                             </svg>
                             <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay"></div>
                        </div>
                        <span className="text-[10px] text-gray-400 group-hover:text-green-400 transition-colors">Horizontal Edges</span>
                    </div>
                </div>
                <h3 className="font-bold text-white text-sm mt-2">Feature Maps</h3>
             </div>
          </div>

          {/* Definitions & Explanations (Toggleable) */}
          {showDefinitions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-800 pt-8 animate-slideUp">
                
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h4 className="text-emerald-400 font-bold mb-3 text-lg">1. The Filter Bank</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                      A layer isn't just one filter; it's a collection (or "bank") of 32, 64, or more filters. Each filter learns to look for something different—one might find vertical lines, another curves, another color gradients.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h4 className="text-emerald-400 font-bold mb-3 text-lg">2. Feature Hierarchy</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                      <strong>Layer 1:</strong> Finds simple edges (lines).<br/>
                      <strong>Layer 2:</strong> Combines edges into shapes (circles, squares).<br/>
                      <strong>Layer 3:</strong> Combines shapes into objects (faces, cars).<br/>
                      This hierarchy mimics the human visual cortex.
                  </p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h4 className="text-emerald-400 font-bold mb-3 text-lg">3. Activation Maps</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                      The output images are called "Feature Maps" or "Activation Maps". Bright pixels mean "Yes, I found the feature I was looking for here". Dark pixels mean "Feature not found".
                  </p>
                </div>

            </div>
          )}
       </div>
    </div>
  );
};

export default FeatureMapView;