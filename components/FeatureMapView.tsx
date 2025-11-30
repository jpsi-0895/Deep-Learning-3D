
import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, X, Sliders, ArrowRight, Grid3x3, Activity, Layers, Info } from 'lucide-react';

type KernelType = 'VERTICAL' | 'HORIZONTAL' | 'IDENTITY' | 'EDGES' | 'SHARPEN' | 'BOX_BLUR';
type PoolingType = 'NONE' | 'MAX' | 'AVG';
type ActivationSimType = 'RELU' | 'SIGMOID' | 'TANH' | 'LEAKY_RELU' | 'SWISH' | 'ELU' | 'NONE';

const FeatureMapView: React.FC = () => {
  const setView = useStore(state => state.setView);
  const [showDefinitions, setShowDefinitions] = useState(true);
  
  // Local Interactive State
  const [kernel, setKernel] = useState<KernelType>('VERTICAL');
  const [activation, setActivation] = useState<ActivationSimType>('RELU');
  const [pooling, setPooling] = useState<PoolingType>('NONE');

  // Helpers for visual styles based on state
  const getKernelPaths = () => {
    // Defines which parts of the face SVG to show based on the "filter"
    const vertical = (
      <>
        <path d="M30 30 V50 M70 30 V50" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M28 40 V60 M72 40 V60" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M48 45 V60 M52 45 V60" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M30 50 Q30 70 40 80 M70 50 Q70 70 60 80" stroke="currentColor" strokeWidth="2" fill="none" />
      </>
    );

    const horizontal = (
      <>
         <path d="M30 30 Q50 30 70 30" stroke="currentColor" strokeWidth="3" fill="none" />
         <line x1="37" y1="45" x2="43" y2="45" stroke="currentColor" strokeWidth="3" />
         <line x1="57" y1="45" x2="63" y2="45" stroke="currentColor" strokeWidth="3" />
         <path d="M42 70 Q50 75 58 70" stroke="currentColor" strokeWidth="3" fill="none" />
         <path d="M40 88 Q50 90 60 88" stroke="currentColor" strokeWidth="2" fill="none" />
      </>
    );

    const fullFace = (
        <>
            <path d="M30 30 Q30 10 50 10 Q70 10 70 30 V50 Q70 80 50 90 Q30 80 30 50 Z" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M30 30 V50 M70 30 V50" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M30 30 Q50 30 70 30" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M28 40 V60 M72 40 V60" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="37" y1="45" x2="43" y2="45" stroke="currentColor" strokeWidth="2" />
            <line x1="57" y1="45" x2="63" y2="45" stroke="currentColor" strokeWidth="2" />
            <path d="M48 45 V60 M52 45 V60" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M42 70 Q50 75 58 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M40 88 Q50 90 60 88" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M30 50 Q30 70 40 80 M70 50 Q70 70 60 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>
    );

    switch(kernel) {
        case 'VERTICAL': return vertical;
        case 'HORIZONTAL': return horizontal;
        case 'IDENTITY': return fullFace;
        case 'EDGES': return <>{vertical}{horizontal}</>;
        case 'SHARPEN': return <>{fullFace}{vertical}{horizontal}</>; // Doubling up lines to simulate sharpen
        case 'BOX_BLUR': return <g filter="url(#svgBlur)">{fullFace}</g>;
    }
  };

  const getActivationStyle = () => {
      switch(activation) {
          case 'RELU': return 'brightness-150 contrast-125'; // Neon pop, black crush
          case 'SIGMOID': return 'brightness-75 contrast-50 opacity-80 saturate-50'; // Washed out gray
          case 'TANH': return 'brightness-90 contrast-75 saturate-150'; // Richer than sigmoid but still compressed
          case 'LEAKY_RELU': return 'brightness-125 contrast-100'; // Less black crush than ReLU
          case 'SWISH': return 'brightness-110 contrast-110 saturate-110'; // Smooth
          case 'ELU': return 'brightness-110 contrast-100 sepia-[0.2]'; // Slight shift
          case 'NONE': return '';
      }
  };

  const getPoolingStyle = () => {
      // Simulate downsampling via scale or blur
      switch(pooling) {
          case 'MAX': return { transform: 'scale(0.5)', imageRendering: 'pixelated' as const, transformOrigin: 'top left', width: '200%', height: '200%' };
          case 'AVG': return { filter: 'blur(3px)', transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' };
          case 'NONE': return { width: '100%', height: '100%' };
      }
  };

  // Helper definitions for the UI
  const kernelOptions: KernelType[] = ['VERTICAL', 'HORIZONTAL', 'EDGES', 'SHARPEN', 'BOX_BLUR', 'IDENTITY'];
  const activationOptions: ActivationSimType[] = ['RELU', 'LEAKY_RELU', 'SIGMOID', 'TANH', 'SWISH', 'ELU', 'NONE'];
  const poolingOptions: PoolingType[] = ['NONE', 'MAX', 'AVG'];

  // Impact Description Logic
  const getImpactData = () => {
    let kDesc = "";
    let aDesc = "";
    let pDesc = "";

    switch(kernel) {
        case 'VERTICAL': kDesc = "Detects vertical lines (e.g., sides of face, nose). Zeros out horizontal features."; break;
        case 'HORIZONTAL': kDesc = "Detects horizontal lines (e.g., mouth, eyes, eyebrows). Zeros out vertical features."; break;
        case 'EDGES': kDesc = "High-pass filter. Highlights changes in intensity (boundaries) regardless of orientation."; break;
        case 'SHARPEN': kDesc = "Enhances contrast at edges, making the image pop. Center weight is high positive, surround is negative."; break;
        case 'BOX_BLUR': kDesc = "Averages neighboring pixels. Reduces noise but destroys fine detail. Low-pass filter."; break;
        case 'IDENTITY': kDesc = "Pass-through. The output is identical to the input. Useful for residual connections (ResNets)."; break;
    }

    switch(activation) {
        case 'RELU': aDesc = "Rectified Linear Unit. Sets all negative values to zero (black). Creates high contrast and sparsity. Standard for modern CNNs."; break;
        case 'LEAKY_RELU': aDesc = "Allows a small gradient for negative inputs. Prevents 'dying ReLU' problem where neurons stop learning."; break;
        case 'SIGMOID': aDesc = "Squashes values between 0 and 1. Can cause vanishing gradients in deep networks. Washes out features."; break;
        case 'TANH': aDesc = "Squashes values between -1 and 1. Zero-centered, which helps optimization compared to Sigmoid."; break;
        case 'SWISH': aDesc = "x · sigmoid(x). Smooth non-monotonic function. Often outperforms ReLU in very deep networks."; break;
        case 'ELU': aDesc = "Exponential Linear Unit. Smoother than ReLU for negative values. Helps push mean activation closer to zero."; break;
        case 'NONE': aDesc = "Linear activation. The network behaves like a single layer perceptron (no complex mapping)."; break;
    }

    switch(pooling) {
        case 'MAX': pDesc = "Selects the maximum value in a window. Preserves the most prominent features (edges). Sharp, pixelated result."; break;
        case 'AVG': pDesc = "Averages all values in a window. Smoothes out the signal. Good for suppressing noise, but blurs edges."; break;
        case 'NONE': pDesc = "No downsampling. Output feature map maintains the same spatial dimensions as the input."; break;
    }

    return { kDesc, aDesc, pDesc };
  };

  const impact = getImpactData();

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center bg-black/95 animate-fadeIn overflow-y-auto overflow-x-hidden selection:bg-emerald-500/30 pt-28">
       
       {/* HEADER CONTROLS */}
       <div className="w-full max-w-7xl mx-auto bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-xl relative z-40 flex flex-col gap-4 shadow-2xl mb-8">
          <div className="flex justify-between items-center w-full border-b border-gray-800 pb-2">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                <Sliders size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">Pipeline Config</h2>
                    <span className="text-[10px] text-gray-500 font-mono">INTERACTIVE FEATURE MAP EXPLORER</span>
                </div>
            </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => setShowDefinitions(!showDefinitions)}
                    className={`p-2 rounded-full border transition-colors ${showDefinitions ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                    title="Toggle Impact Analysis"
                >
                    <Info size={18} />
                </button>
                <button 
                    onClick={() => setView('SCENE')}
                    className="p-2 rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                    title="Close View"
                >
                    <X size={18} />
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Kernel Select */}
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Grid3x3 size={12} /> Kernel Filter</label>
                <div className="flex flex-wrap gap-1">
                   {kernelOptions.map((k) => (
                       <button 
                         key={k} 
                         onClick={() => setKernel(k)}
                         className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex-grow text-center ${kernel === k ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                       >
                         {k.replace('_', ' ')}
                       </button>
                   ))}
                </div>
             </div>

             {/* Activation Select */}
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Activity size={12} /> Activation</label>
                <div className="flex flex-wrap gap-1">
                   {activationOptions.map((a) => (
                       <button 
                         key={a} 
                         onClick={() => setActivation(a)}
                         className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex-grow text-center ${activation === a ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                       >
                         {a.replace('_', ' ')}
                       </button>
                   ))}
                </div>
             </div>

             {/* Pooling Select */}
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Layers size={12} /> Pooling</label>
                <div className="flex flex-wrap gap-1">
                   {poolingOptions.map((p) => (
                       <button 
                         key={p} 
                         onClick={() => setPooling(p)}
                         className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex-grow text-center ${pooling === p ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                       >
                         {p}
                       </button>
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* MAIN VISUAL CONTENT */}
       <div className="flex-1 w-full max-w-7xl p-8 flex flex-col items-center pt-0">
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
             
             {/* STAGE 1: INPUT */}
             <div className="flex flex-col items-center gap-4 group">
                <div className="relative">
                    <div className="w-48 h-48 bg-gray-200 rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl relative">
                        {/* Static Input SVG */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect width="100" height="100" fill="#e5e7eb" />
                            <path d="M30 30 Q30 10 50 10 Q70 10 70 30 V50 Q70 80 50 90 Q30 80 30 50 Z" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
                            <path d="M28 40 Q25 40 25 50 Q25 60 28 60" fill="#d1d5db" />
                            <path d="M72 40 Q75 40 75 50 Q75 60 72 60" fill="#d1d5db" />
                            <path d="M30 30 Q30 5 50 5 Q70 5 70 30 Q70 20 50 20 Q30 20 30 30" fill="#4b5563" />
                            <ellipse cx="40" cy="45" rx="3" ry="2" fill="#1f2937" />
                            <ellipse cx="60" cy="45" rx="3" ry="2" fill="#1f2937" />
                            <path d="M50 45 L48 58 L52 58 Z" fill="#9ca3af" opacity="0.5" />
                            <path d="M42 70 Q50 75 58 70" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-4 animate-scan pointer-events-none" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 border border-gray-700">INPUT</div>
                </div>
                <div className="h-20 w-px bg-gray-800 lg:hidden"></div>
             </div>

             {/* CONNECTING ARROW */}
             <div className="hidden lg:flex flex-col items-center px-4 text-gray-600">
                <ArrowRight size={32} />
                <span className="text-[10px] font-mono mt-1">CONV</span>
             </div>

             {/* STAGE 2: KERNEL OPERATION */}
             <div className="flex flex-col items-center gap-4 animate-fadeIn">
                 <div className="w-32 h-32 bg-gray-900 rounded-xl border border-gray-700 flex flex-col items-center justify-center p-4 shadow-lg relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-900 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-700/50 uppercase whitespace-nowrap">
                       {kernel.replace('_', ' ')}
                    </div>
                    
                    {/* Visual representation of Kernel Matrix */}
                    <div className="grid grid-cols-3 gap-1 mb-2">
                        {kernel === 'VERTICAL' && [1,0,-1, 1,0,-1, 1,0,-1].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono ${v!==0?'bg-emerald-500/20 text-emerald-400':'text-gray-700 bg-gray-800'}`}>{v}</div>)}
                        {kernel === 'HORIZONTAL' && [1,1,1, 0,0,0, -1,-1,-1].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono ${v!==0?'bg-emerald-500/20 text-emerald-400':'text-gray-700 bg-gray-800'}`}>{v}</div>)}
                        {kernel === 'IDENTITY' && [0,0,0, 0,1,0, 0,0,0].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono ${v!==0?'bg-emerald-500/20 text-emerald-400':'text-gray-700 bg-gray-800'}`}>{v}</div>)}
                        {kernel === 'EDGES' && [-1,-1,-1, -1,8,-1, -1,-1,-1].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono ${v!==0?'bg-emerald-500/20 text-emerald-400':'text-gray-700 bg-gray-800'}`}>{v}</div>)}
                        {kernel === 'SHARPEN' && [0,-1,0, -1,5,-1, 0,-1,0].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono ${v!==0?'bg-emerald-500/20 text-emerald-400':'text-gray-700 bg-gray-800'}`}>{v}</div>)}
                        {kernel === 'BOX_BLUR' && [1,1,1, 1,1,1, 1,1,1].map((v, i) => <div key={i} className={`w-4 h-4 flex items-center justify-center text-[8px] font-mono bg-emerald-500/10 text-emerald-400`}>1</div>)}
                    </div>
                 </div>
                 <div className="h-20 w-px bg-gray-800 lg:hidden"></div>
             </div>

             {/* CONNECTING ARROW */}
             <div className="hidden lg:flex flex-col items-center px-4 text-gray-600">
                <ArrowRight size={32} />
             </div>

             {/* STAGE 3: RESULT */}
             <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                    <div className={`
                        w-64 h-64 bg-black rounded-xl border-2 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300
                        ${activation === 'RELU' ? 'border-emerald-500/50' : 'border-gray-600'}
                    `}>
                        {/* This is the dynamic result layer */}
                        <div 
                          className={`w-full h-full relative overflow-hidden transition-all duration-300 ${getActivationStyle()}`}
                        >
                            <div style={getPoolingStyle()} className="relative transition-transform duration-300 origin-top-left">
                                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                                   <defs>
                                     <filter id="svgBlur">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                                     </filter>
                                   </defs>
                                   <g className={activation.includes('RELU') ? 'text-emerald-400' : 'text-gray-200'}>
                                      {getKernelPaths()}
                                   </g>
                                </svg>
                                
                                {/* Background color overlay for Sigmoid/Tanh/ELU feel */}
                                {['SIGMOID', 'TANH'].includes(activation) && <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"></div>}
                            </div>
                        </div>

                        {/* Scanlines for retro tech feel */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
                    </div>
                    
                    {/* Labels for applied effects */}
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                         {activation !== 'NONE' && (
                             <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                {activation.replace('_', ' ')}
                             </span>
                         )}
                         {pooling !== 'NONE' && (
                             <span className="text-[10px] bg-orange-900/40 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                                {pooling} POOL
                             </span>
                         )}
                    </div>
                    
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-full text-[10px] font-bold text-white border border-gray-700 shadow-xl z-20">
                       FINAL FEATURE MAP
                    </div>
                 </div>
             </div>
          </div>

          {/* DYNAMIC IMPACT ANALYSIS FOOTER */}
          {showDefinitions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-6xl border-t border-gray-800 pt-8 animate-slideUp">
                
                {/* Kernel Impact */}
                <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <Grid3x3 size={80} />
                    </div>
                    <h4 className="text-emerald-400 font-bold mb-3 text-sm flex items-center gap-2 z-10 relative">
                        <span className="bg-emerald-500/20 p-1 rounded"><Grid3x3 size={14}/></span> 
                        Kernel Impact
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed z-10 relative">
                        {impact.kDesc}
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-emerald-600">Filter Applied: {kernel.replace('_', ' ')}</div>
                </div>

                {/* Activation Impact */}
                <div className="bg-purple-900/10 p-5 rounded-xl border border-purple-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
                        <Activity size={80} />
                    </div>
                    <h4 className="text-purple-400 font-bold mb-3 text-sm flex items-center gap-2 z-10 relative">
                        <span className="bg-purple-500/20 p-1 rounded"><Activity size={14}/></span>
                        Activation Impact
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed z-10 relative">
                        {impact.aDesc}
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-purple-600">Function: {activation.replace('_', ' ')}</div>
                </div>

                {/* Pooling Impact */}
                <div className="bg-orange-900/10 p-5 rounded-xl border border-orange-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                        <Layers size={80} />
                    </div>
                    <h4 className="text-orange-400 font-bold mb-3 text-sm flex items-center gap-2 z-10 relative">
                        <span className="bg-orange-500/20 p-1 rounded"><Layers size={14}/></span>
                        Pooling Impact
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed z-10 relative">
                        {impact.pDesc}
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-orange-600">Method: {pooling}</div>
                </div>
            </div>
          )}

       </div>
    </div>
  );
};

export default FeatureMapView;
