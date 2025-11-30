import React, { useState } from 'react';
import { useStore } from '../store';
import { Play, Pause, StepForward, Layers, Grid3x3, Activity, Scan, FastForward, Calculator, BarChart3, Box, ArrowRight, ArrowLeft, Grid, Sigma, Image, Eye, EyeOff, MoveHorizontal, Maximize2 } from 'lucide-react';
import { ViewType } from '../types';

// Helper component for Learning Rate Visualization
const GradientDescentVisualizer: React.FC<{ rate: number }> = ({ rate }) => {
  const maxPixels = 60;
  const arrowLength = (rate / 0.1) * maxPixels;
  
  let status = 'STABLE';
  let color = '#22d3ee'; // Cyan
  
  if (rate > 0.03) { status = 'AGGRESSIVE'; color = '#facc15'; }
  if (rate > 0.07) { status = 'UNSTABLE'; color = '#f87171'; }

  return (
    <div className="mt-3 bg-black/40 rounded p-3 border border-gray-800">
      <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-mono">
        <span>GRADIENT STEP SIZE</span>
        <span style={{ color }}>{status}</span>
      </div>
      <svg width="100%" height="40" viewBox="0 0 200 50" className="overflow-visible">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={color} />
          </marker>
        </defs>
        <path d="M 10 10 Q 100 80 190 10" fill="none" stroke="#333" strokeWidth="2" />
        <circle cx="50" cy="35" r="3" fill="white" />
        <line x1="50" y1="35" x2={50 + Math.max(5, arrowLength * 1.5)} y2={35 + Math.max(2, arrowLength * 0.8)} stroke={color} strokeWidth="2" markerEnd="url(#arrowhead)" className="transition-all duration-300 ease-out"/>
        <text x={60 + arrowLength} y={45 + arrowLength * 0.5} fill={color} fontSize="10" fontFamily="monospace" className="opacity-80">Δw</text>
      </svg>
    </div>
  );
};

const UI: React.FC = () => {
  const { 
    epoch, isPlaying, learningRate, phase, currentView,
    showInputMatrix, showFeatureMap, showPooling, showActivation,
    togglePlay, stepEpoch, stepMultiEpoch, setLearningRate, setView,
    toggleInputMatrix, toggleFeatureMap, togglePooling, toggleActivation,
    moveKernel, setKernelManual, isKernelManual,
    targetEpoch, setTargetEpoch, autoStop, toggleAutoStop,
    uiVisible, toggleUIVisibility, uiPosition, toggleUIPosition
  } = useStore();

  const [runBatchSize, setRunBatchSize] = useState("10");

  const handleRunBatch = () => {
    const val = parseInt(runBatchSize);
    if (!isNaN(val) && val > 0) {
      stepMultiEpoch(val);
    }
  };

  const navItems = [
    { id: 'SCENE', label: '3D Scene', icon: Box },
    { id: 'CALC', label: 'Math', icon: Calculator },
    { id: 'METRICS', label: 'Metrics', icon: BarChart3 },
    { id: 'WEIGHTS', label: 'Weights', icon: Grid },
    { id: 'KERNEL', label: 'Kernel', icon: Grid3x3 },
    { id: 'POOLING', label: 'Pooling', icon: Layers },
    { id: 'FEATURE_MAP', label: 'Feat. Maps', icon: Image },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* TOP NAVIGATION BAR */}
      <div className={`flex justify-center pointer-events-auto transition-opacity duration-300 ${!uiVisible ? 'opacity-0' : 'opacity-100'}`}>
         <div className="flex bg-black/80 backdrop-blur-md rounded-full border border-gray-800 p-1 gap-1 overflow-x-auto max-w-[90vw]">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                  ${currentView === item.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}
                `}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
         </div>
      </div>

      {/* BOTTOM AREA */}
      <div className={`flex items-end w-full relative ${uiPosition === 'RIGHT' ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Main Control Panel */}
        {uiVisible ? (
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 pointer-events-auto shadow-2xl min-w-[320px] relative transition-all duration-300">
            {/* Header / Branding / Minimize / Move */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    NeuroVis 3D
                  </h1>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={toggleUIPosition} 
                     className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                     title={uiPosition === 'LEFT' ? "Move Right" : "Move Left"}
                   >
                     <MoveHorizontal size={16} />
                   </button>
                   <button 
                     onClick={toggleUIVisibility} 
                     className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                     title="Hide Controls"
                   >
                     <EyeOff size={16} />
                   </button>
                </div>
            </div>

            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm font-mono text-gray-400">
                <div className="bg-gray-900/50 p-2 rounded">
                  <span className="block text-xs text-gray-500 mb-1">EPOCH</span>
                  <span className="text-white text-lg">{epoch.toString().padStart(4, '0')}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded">
                  <span className="block text-xs text-gray-500 mb-1">PHASE</span>
                  <span className={`text-lg ${phase === 'BACKWARD' ? 'text-red-400' : 'text-blue-400'}`}>
                    {phase}
                  </span>
                </div>
              </div>

              {/* Target Epoch Control */}
              <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs text-gray-400 font-mono">STOP AT EPOCH</span>
                   <button 
                     onClick={toggleAutoStop}
                     className={`w-8 h-4 rounded-full transition-colors relative ${autoStop ? 'bg-green-500' : 'bg-gray-600'}`}
                   >
                     <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoStop ? 'left-4.5' : 'left-0.5'}`} style={{left: autoStop ? '18px' : '2px'}}/>
                   </button>
                 </div>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number"
                     value={targetEpoch}
                     onChange={(e) => setTargetEpoch(parseInt(e.target.value))}
                     disabled={!autoStop}
                     className={`w-full bg-black border border-gray-700 rounded px-2 py-1 text-sm font-mono focus:border-cyan-500 outline-none transition-opacity ${!autoStop ? 'opacity-50' : ''}`}
                   />
                 </div>
              </div>

              {/* Learning Rate & Gradient Vis */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Learning Rate (η)</span>
                  <span className="text-cyan-400 font-mono">{learningRate.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.1"
                  step="0.0001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-2"
                />
                <GradientDescentVisualizer rate={learningRate} />
              </div>

              {/* Playback Controls */}
              <div className="space-y-2">
                 <div className="flex gap-2">
                  <button
                    onClick={togglePlay}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-colors ${
                      isPlaying 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'PAUSE' : 'TRAIN'}
                  </button>
                  
                  <button
                    onClick={stepEpoch}
                    className="px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 flex items-center justify-center"
                    title="Step Forward (1 Epoch)"
                  >
                    <StepForward size={18} />
                  </button>
                </div>

                {/* Custom Epoch Run */}
                <div className="flex gap-2 mt-2">
                    <input 
                      type="number" 
                      value={runBatchSize}
                      onChange={(e) => setRunBatchSize(e.target.value)}
                      className="w-16 bg-gray-900 border border-gray-700 rounded px-2 text-xs text-center text-white focus:border-cyan-500 outline-none"
                    />
                    <button
                      onClick={handleRunBatch}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 flex items-center justify-center gap-1 font-mono text-xs py-2"
                    >
                      <FastForward size={14} />
                      <span>RUN {runBatchSize} EPOCHS</span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button 
             onClick={toggleUIVisibility} 
             className="bg-black/80 backdrop-blur-md p-4 rounded-full border border-gray-800 pointer-events-auto shadow-2xl text-cyan-400 hover:text-white transition-colors"
             title="Show Controls"
          >
             <Eye size={24} />
          </button>
        )}

        {/* Center Toggles (Only visible in Scene View) */}
        {currentView === 'SCENE' && uiVisible && (
          <div className="flex gap-4 pointer-events-auto mb-6 mx-auto">
            <button onClick={toggleInputMatrix} className={`p-3 rounded-full border transition-all duration-300 ${showInputMatrix ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/60 border-gray-700 text-gray-500 hover:text-white'}`}><Grid3x3 size={24} /></button>
            <button onClick={toggleFeatureMap} className={`p-3 rounded-full border transition-all duration-300 ${showFeatureMap ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/60 border-gray-700 text-gray-500 hover:text-white'}`}><Scan size={24} /></button>
            <button onClick={togglePooling} className={`p-3 rounded-full border transition-all duration-300 ${showPooling ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-black/60 border-gray-700 text-gray-500 hover:text-white'}`}><Layers size={24} /></button>
            <button onClick={toggleActivation} className={`p-3 rounded-full border transition-all duration-300 ${showActivation ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-black/60 border-gray-700 text-gray-500 hover:text-white'}`}><Activity size={24} /></button>
          </div>
        )}

        {/* Right Panel: Kernel Control & Legend */}
        {currentView === 'SCENE' && uiVisible && (
          <div className="flex flex-col gap-4 pointer-events-auto min-w-[200px]">
             {/* Kernel Control Box */}
             <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                 <h3 className="text-xs font-bold text-gray-400 mb-2 font-mono">KERNEL CONTROL</h3>
                 <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => moveKernel('PREV')}
                      className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-cyan-400"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {isKernelManual ? 'MANUAL' : 'AUTO'}
                    </span>
                    <button 
                      onClick={() => moveKernel('NEXT')}
                      className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-cyan-400"
                    >
                      <ArrowRight size={16} />
                    </button>
                 </div>
                 {isKernelManual && (
                   <button 
                     onClick={() => setKernelManual(false)} 
                     className="w-full mt-2 text-[10px] bg-cyan-900/30 text-cyan-400 py-1 rounded hover:bg-cyan-900/50"
                   >
                     RESUME AUTO
                   </button>
                 )}
             </div>

             <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-gray-800 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div><span>Input</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div><span>Hidden</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div><span>Output</span></div>
             </div>
          </div>
        )}
        
        {/* Spacer for when hidden/right aligned to keep layout balance if needed, 
            though flex-row-reverse handles alignment. 
            Just need empty div if we want center alignment of middle items to be perfect 
        */}
         {!uiVisible && <div className="min-w-[40px]"></div>}

      </div>
    </div>
  );
};

export default UI;