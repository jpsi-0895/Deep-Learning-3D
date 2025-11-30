import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ActivationType } from '../types';

const ActivationPanel: React.FC = () => {
  const { activationType, setActivationType, isPlaying, phase } = useStore();
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });
  
  // Animation loop for the "active" dot
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      
      // Input value oscillates between -3 and 3
      const inputX = Math.sin(elapsed * 2) * 3;
      
      // Calculate output based on selected function
      let outputY = 0;
      switch (activationType) {
        case 'SIGMOID': outputY = 1 / (1 + Math.exp(-inputX)); break;
        case 'TANH': outputY = Math.tanh(inputX); break;
        case 'RELU': outputY = Math.max(0, inputX); break;
        case 'LEAKY_RELU': outputY = inputX > 0 ? inputX : 0.01 * inputX; break;
        case 'SWISH': outputY = inputX * (1 / (1 + Math.exp(-inputX))); break;
        case 'ELU': outputY = inputX > 0 ? inputX : 1.0 * (Math.exp(inputX) - 1); break;
      }
      
      setDotPos({ x: inputX, y: outputY });
      
      if (isPlaying || phase === 'FORWARD') {
         animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying || phase === 'FORWARD') {
      animate();
    } else {
        setDotPos({ x: 0, y: activationType === 'RELU' ? 0 : 0.5 });
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [activationType, isPlaying, phase]);

  // Generate path data
  const generatePath = (type: ActivationType) => {
    const points = [];
    // Graph viewbox: 0-100 x 0-100
    // X range: -4 to 4 -> Map to 10 to 90
    // Y range: -1 to 2 -> Map to 90 to 10 (inverted SVG Y)
    
    for (let i = -4; i <= 4; i += 0.2) {
      const xMap = ((i + 4) / 8) * 80 + 10;
      let val = 0;
      
      if (type === 'SIGMOID') val = 1 / (1 + Math.exp(-i));
      else if (type === 'TANH') val = Math.tanh(i);
      else if (type === 'RELU') val = Math.max(0, i);
      else if (type === 'LEAKY_RELU') val = i > 0 ? i : 0.01 * i;
      else if (type === 'SWISH') val = i * (1 / (1 + Math.exp(-i)));
      else if (type === 'ELU') val = i > 0 ? i : 1.0 * (Math.exp(i) - 1);
      
      // Scaling Y carefully to fit box
      // Target display range [-1, 2] roughly covers most
      const yNorm = (val + 1) / 3; // normalize roughly 0-1
      const yMap = 90 - (yNorm * 80);
      
      points.push(`${xMap},${yMap}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const getDotSvgCoords = () => {
    const xMap = ((dotPos.x + 4) / 8) * 80 + 10;
    const yNorm = (dotPos.y + 1) / 3;
    const yMap = 90 - (yNorm * 80);
    return { x: xMap, y: yMap };
  };

  const svgDot = getDotSvgCoords();

  return (
    <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-gray-800 w-64 shadow-2xl">
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-sm font-bold text-cyan-400">ACTIVATION</h3>
         <select 
           value={activationType}
           onChange={(e) => setActivationType(e.target.value as ActivationType)}
           className="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300 outline-none focus:border-cyan-500"
         >
           <option value="SIGMOID">Sigmoid</option>
           <option value="RELU">ReLU</option>
           <option value="LEAKY_RELU">Leaky ReLU</option>
           <option value="TANH">Tanh</option>
           <option value="SWISH">Swish</option>
           <option value="ELU">ELU</option>
         </select>
       </div>

       <div className="relative border border-gray-700 bg-gray-900 rounded h-40 w-full overflow-hidden">
         <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid lines */}
            <line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#333" strokeWidth="0.5" />
            
            <path 
              d={generatePath(activationType)} 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            <circle 
               cx={svgDot.x} 
               cy={svgDot.y} 
               r="3" 
               fill="#facc15" 
            />
         </svg>
       </div>
    </div>
  );
};

export default ActivationPanel;