import React, { useState } from 'react';
import { useStore } from '../store';

const CalculationView: React.FC = () => {
  const activationType = useStore(state => state.activationType);
  const [mode, setMode] = useState<'FORWARD' | 'BACKWARD'>('FORWARD');
  
  // Dummy values for visualization
  const inputs = [0.2, -0.5, 0.8];
  const weights = [1.5, 0.4, -0.9];
  const bias = 0.15;
  const target = 1.0; // For loss calc
  
  // Forward Calc
  const z = inputs.reduce((acc, curr, idx) => acc + (curr * weights[idx]), 0) + bias;
  
  let a = 0;
  let formula = "";
  let derivFormula = "";
  let derivValue = 0; // f'(z)
  
  switch(activationType) {
      case 'SIGMOID': 
        a = 1/(1+Math.exp(-z)); 
        formula = "1 / (1 + e⁻ᶻ)"; 
        derivFormula = "a * (1 - a)";
        derivValue = a * (1 - a);
        break;
      case 'RELU': 
        a = Math.max(0, z); 
        formula = "max(0, z)"; 
        derivFormula = "z > 0 ? 1 : 0";
        derivValue = z > 0 ? 1 : 0;
        break;
      case 'TANH': 
        a = Math.tanh(z); 
        formula = "tanh(z)"; 
        derivFormula = "1 - a²";
        derivValue = 1 - (a * a);
        break;
      case 'LEAKY_RELU': 
        a = z > 0 ? z : 0.01 * z; 
        formula = "z > 0 ? z : 0.01z";
        derivFormula = "z > 0 ? 1 : 0.01";
        derivValue = z > 0 ? 1 : 0.01;
        break;
      case 'SWISH': 
        a = z * (1/(1+Math.exp(-z))); 
        formula = "z · σ(z)"; 
        derivFormula = "a + σ(z)(1-a)"; // Approx
        derivValue = 0.5; // Simplification for display
        break;
      case 'ELU': 
        a = z > 0 ? z : 1.0 * (Math.exp(z)-1); 
        formula = "z > 0 ? z : α(eᶻ-1)"; 
        derivFormula = "z > 0 ? 1 : a + α";
        derivValue = z > 0 ? 1 : a + 1.0;
        break;
  }

  // Backward Calc (Chain Rule)
  // dL/da (assuming MSE: L = 0.5(a-y)^2 -> dL/da = a - y)
  const dL_da = a - target;
  
  // dL/dz = dL/da * da/dz
  const dL_dz = dL_da * derivValue;
  
  // dL/dw = dL/dz * dz/dw (= x)
  const dL_dw = inputs.map(x => dL_dz * x);

  const learningRate = 0.1;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-10 animate-fadeIn">
       <div className="w-full max-w-6xl bg-gray-900/90 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 relative">
          
          {/* Mode Toggle */}
          <div className="absolute top-8 right-8 flex bg-gray-800 rounded-lg p-1 border border-gray-700">
             <button 
               onClick={() => setMode('FORWARD')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'FORWARD' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
             >
               Forward Propagation
             </button>
             <button 
               onClick={() => setMode('BACKWARD')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'BACKWARD' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
             >
               Backpropagation
             </button>
          </div>

          <div className="text-center mb-4">
             <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
               Single Neuron Math
             </h2>
             <p className="text-gray-400 text-sm font-mono">
               {mode === 'FORWARD' ? 'Calculating Output from Inputs' : 'Calculating Gradients & Updating Weights'}
             </p>
          </div>

          {mode === 'FORWARD' ? (
            /* FORWARD PASS VIEW */
            <div className="flex items-center justify-center gap-8 animate-fadeIn">
               
               {/* Inputs Column */}
               <div className="flex flex-col gap-4">
                  <h3 className="text-center text-xs text-green-400 font-bold mb-2">INPUTS (x)</h3>
                  {inputs.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center text-xs bg-green-900/20 font-mono text-white">
                              {val}
                          </div>
                          <div className="h-px w-12 bg-gray-600 relative">
                              <span className="absolute -top-4 left-2 text-[10px] text-gray-400 font-mono">w={weights[i]}</span>
                          </div>
                      </div>
                  ))}
               </div>

               {/* Summation Node */}
               <div className="flex flex-col items-center">
                   <div className="w-28 h-28 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center bg-blue-900/20 relative z-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <span className="text-2xl font-serif text-white">Σ</span>
                      <span className="text-xs text-blue-300 mt-1 font-mono">z = {z.toFixed(2)}</span>
                   </div>
                   <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 font-mono text-xs w-48">
                      <div className="text-gray-400 mb-1 border-b border-gray-700 pb-1">Linear Combination</div>
                      <div className="text-blue-200">z = ∑(xᵢ · wᵢ) + b</div>
                   </div>
               </div>

               {/* Arrow */}
               <div className="text-gray-500 text-3xl">→</div>

               {/* Activation Function */}
               <div className="flex flex-col items-center">
                   <div className="w-28 h-28 rounded-xl border-4 border-purple-500 flex flex-col items-center justify-center bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                      <span className="text-lg font-bold text-white">ƒ(z)</span>
                      <span className="text-[10px] text-purple-300 mt-1 uppercase">{activationType}</span>
                   </div>
                   <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 font-mono text-xs w-48">
                      <div className="text-gray-400 mb-1 border-b border-gray-700 pb-1">Non-Linearity</div>
                      <div className="text-purple-200">a = {formula}</div>
                   </div>
               </div>

               {/* Arrow */}
               <div className="text-gray-500 text-3xl">→</div>

               {/* Output */}
               <div className="flex flex-col items-center">
                   <h3 className="text-center text-xs text-red-400 font-bold mb-2">OUTPUT (a)</h3>
                   <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center text-lg font-bold bg-red-900/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white">
                      {a.toFixed(2)}
                   </div>
               </div>
            </div>
          ) : (
            /* BACKWARD PASS VIEW */
            <div className="flex flex-col gap-8 animate-fadeIn">
               
               {/* Chain Rule Visualization */}
               <div className="flex items-start justify-center gap-4">
                  
                  {/* Step 1: Loss Gradient */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-red-500/30 w-1/4">
                     <h3 className="text-red-400 font-bold text-sm mb-2">1. Loss Gradient</h3>
                     <div className="text-xs font-mono text-gray-400 mb-1">How much did we miss?</div>
                     <div className="font-mono text-white text-lg mb-2">∂L/∂a = (a - y)</div>
                     <div className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                        {a.toFixed(2)} - {target.toFixed(1)} = <span className="font-bold">{dL_da.toFixed(4)}</span>
                     </div>
                  </div>

                  <div className="text-gray-500 text-2xl mt-8">×</div>

                  {/* Step 2: Local Gradient */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-purple-500/30 w-1/4">
                     <h3 className="text-purple-400 font-bold text-sm mb-2">2. Activation Deriv.</h3>
                     <div className="text-xs font-mono text-gray-400 mb-1">Slope of {activationType}</div>
                     <div className="font-mono text-white text-lg mb-2">∂a/∂z = ƒ'(z)</div>
                     <div className="text-sm text-purple-300 bg-purple-900/20 p-2 rounded">
                        Value at z={z.toFixed(2)} is <span className="font-bold">{derivValue.toFixed(4)}</span>
                     </div>
                  </div>

                  <div className="text-gray-500 text-2xl mt-8">×</div>

                  {/* Step 3: Input */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-green-500/30 w-1/4">
                     <h3 className="text-green-400 font-bold text-sm mb-2">3. Input Value</h3>
                     <div className="text-xs font-mono text-gray-400 mb-1">Input signal strength</div>
                     <div className="font-mono text-white text-lg mb-2">∂z/∂w = x</div>
                     <div className="text-sm text-green-300 bg-green-900/20 p-2 rounded">
                        e.g. x₀ = <span className="font-bold">{inputs[0]}</span>
                     </div>
                  </div>

                  <div className="text-gray-500 text-2xl mt-8">=</div>

                  {/* Result: Weight Gradient */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-cyan-500/30 w-1/4">
                     <h3 className="text-cyan-400 font-bold text-sm mb-2">Weight Gradient</h3>
                     <div className="text-xs font-mono text-gray-400 mb-1">∂L/∂w (Chain Rule)</div>
                     <div className="font-mono text-white text-lg mb-2">∇w</div>
                     <div className="text-sm text-cyan-300 bg-cyan-900/20 p-2 rounded">
                        {(dL_da * derivValue * inputs[0]).toFixed(4)}
                     </div>
                  </div>
               </div>

               {/* Weight Update Visual */}
               <div className="mt-4 bg-black/40 border border-gray-700 rounded-xl p-6 flex flex-col items-center">
                  <h3 className="text-white font-bold mb-4">Parameter Update Step</h3>
                  <div className="flex items-center gap-6 font-mono text-sm">
                      <div className="bg-gray-800 p-3 rounded">
                         <div className="text-gray-500 text-xs">Old Weight</div>
                         <div className="text-white text-lg">{weights[0]}</div>
                      </div>
                      <div className="text-xl text-gray-500">-</div>
                      <div className="bg-gray-800 p-3 rounded">
                         <div className="text-gray-500 text-xs">Learning Rate (η)</div>
                         <div className="text-yellow-400 text-lg">{learningRate}</div>
                      </div>
                      <div className="text-xl text-gray-500">×</div>
                      <div className="bg-gray-800 p-3 rounded">
                         <div className="text-gray-500 text-xs">Gradient (∇w)</div>
                         <div className="text-cyan-400 text-lg">{dL_dw[0].toFixed(4)}</div>
                      </div>
                      <div className="text-xl text-gray-500">=</div>
                      <div className="bg-cyan-900/30 border border-cyan-500/50 p-3 rounded shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                         <div className="text-cyan-200 text-xs">New Weight</div>
                         <div className="text-white text-lg font-bold">
                           {(weights[0] - (learningRate * dL_dw[0])).toFixed(4)}
                         </div>
                      </div>
                  </div>
               </div>

            </div>
          )}
       </div>
    </div>
  );
};

export default CalculationView;