import React from 'react';
import { useStore } from '../store';
import { Activity } from 'lucide-react';

const RealTimeCalcBox: React.FC = () => {
  const { lossHistory, learningRate, phase, epoch } = useStore();

  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : 0;
  // Simulate a gradient norm for visual effect
  const gradNorm = phase === 'BACKWARD' ? (currentLoss * 0.1 * (1 + Math.random())).toFixed(4) : '0.0000';
  
  return (
    <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-2xl w-48 font-mono">
       <div className="flex items-center gap-2 mb-3 border-b border-gray-700 pb-2">
         <Activity size={14} className="text-cyan-400" />
         <span className="text-xs font-bold text-gray-300">LIVE METRICS</span>
       </div>
       
       <div className="space-y-3">
         <div className="flex justify-between items-center">
           <span className="text-[10px] text-gray-500">LOSS FUNC</span>
           <span className="text-cyan-400 font-bold text-xs">{currentLoss.toFixed(5)}</span>
         </div>
         
         <div className="flex justify-between items-center">
           <span className="text-[10px] text-gray-500">GRAD NORM</span>
           <span className="text-red-400 font-bold text-xs">{gradNorm}</span>
         </div>
         
         <div className="flex justify-between items-center">
           <span className="text-[10px] text-gray-500">LEARN RATE</span>
           <span className="text-yellow-400 font-bold text-xs">{learningRate}</span>
         </div>

         <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] text-gray-500">STATUS</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              phase === 'BACKWARD' ? 'bg-red-900/30 text-red-400' : 
              phase === 'FORWARD' ? 'bg-green-900/30 text-green-400' : 
              'bg-gray-800 text-gray-400'
            }`}>
              {phase}
            </span>
         </div>
       </div>
    </div>
  );
};

export default RealTimeCalcBox;