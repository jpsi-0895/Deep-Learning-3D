import { create } from 'zustand';
import { Vector3 } from 'three';
import { SimulationState, LayerType, NeuronData, ConnectionData, ActivationType } from './types';

const LAYERS_CONFIG = [4, 6, 6, 3]; // Input, Hidden 1, Hidden 2, Output
const X_SPACING = 4;
const Y_SPACING = 1.5;

// Activation functions
const applyActivation = (val: number, type: ActivationType): number => {
  switch (type) {
    case 'SIGMOID': return 1 / (1 + Math.exp(-val));
    case 'TANH': return Math.tanh(val);
    case 'RELU': return Math.max(0, val);
    case 'LEAKY_RELU': return val > 0 ? val : 0.01 * val;
    case 'SWISH': return val * (1 / (1 + Math.exp(-val)));
    case 'ELU': return val > 0 ? val : 1.0 * (Math.exp(val) - 1);
    default: return val;
  }
};

// Helper to initialize neurons
const generateNeurons = (): NeuronData[] => {
  const neurons: NeuronData[] = [];
  LAYERS_CONFIG.forEach((count, layerIdx) => {
    const layerType = layerIdx === 0 
      ? LayerType.INPUT 
      : layerIdx === LAYERS_CONFIG.length - 1 
        ? LayerType.OUTPUT 
        : LayerType.HIDDEN;

    for (let i = 0; i < count; i++) {
      // Center the layer vertically
      const yOffset = ((count - 1) * Y_SPACING) / 2;
      const xOffset = ((LAYERS_CONFIG.length - 1) * X_SPACING) / 2;

      neurons.push({
        id: `l${layerIdx}-n${i}`,
        layerIndex: layerIdx,
        neuronIndex: i,
        position: new Vector3(
          (layerIdx * X_SPACING) - xOffset, 
          (i * Y_SPACING) - yOffset, 
          0
        ),
        activation: Math.random(), // Initial random activation
        bias: Math.random() * 0.5 - 0.25,
        type: layerType
      });
    }
  });
  return neurons;
};

// Helper to initialize weights
const generateConnections = (neurons: NeuronData[]): ConnectionData[] => {
  const connections: ConnectionData[] = [];
  
  // Connect adjacent layers
  for (let l = 0; l < LAYERS_CONFIG.length - 1; l++) {
    const sourceNeurons = neurons.filter(n => n.layerIndex === l);
    const targetNeurons = neurons.filter(n => n.layerIndex === l + 1);

    sourceNeurons.forEach(source => {
      targetNeurons.forEach(target => {
        connections.push({
          id: `${source.id}-${target.id}`,
          sourceId: source.id,
          targetId: target.id,
          weight: Math.random() * 2 - 1, // Random weight between -1 and 1
          gradient: 0
        });
      });
    });
  }
  return connections;
};

// Generate a specific pattern (like a digit '7') for the input matrix
const generateInputPattern = (size: number) => {
  const grid = Array(size).fill(0).map(() => Array(size).fill(0));
  
  // Draw a '7' roughly
  for(let c = 2; c < size - 2; c++) grid[2][c] = 1; // Top bar
  for(let r = 2; r < size - 2; r++) grid[r][size - 1 - r] = 1; // Diagonal
  
  // Add some noise
  return grid.map(row => row.map(val => val > 0 ? val * (0.8 + Math.random() * 0.2) : Math.random() * 0.1));
};

// Generate Feature Map (Output of convolution)
const generateMatrix = (rows: number, cols: number) => 
  Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => Math.random()));

// Internal state for simulation timing
let convolutionTimer = 0;

export const useStore = create<SimulationState>((set, get) => {
  const initialNeurons = generateNeurons();
  const inputSize = 10;
  const featureMapSize = 8; // 10 - 3 + 1
  
  return {
    epoch: 0,
    targetEpoch: 100,
    autoStop: true,
    learningRate: 0.01,
    isPlaying: false,
    phase: 'IDLE',
    
    currentView: 'SCENE',
    lossHistory: [],

    uiVisible: true,
    uiPosition: 'LEFT',

    showInputMatrix: true,
    showFeatureMap: true,
    showPooling: false,
    
    // Activation defaults
    activationType: 'SIGMOID',
    showActivation: true,

    // Convolution state
    kernelPos: { r: 0, c: 0 },
    isKernelManual: false,

    layers: LAYERS_CONFIG,
    neurons: initialNeurons,
    connections: generateConnections(initialNeurons),
    
    inputMatrix: generateInputPattern(inputSize),
    matrixData: generateMatrix(featureMapSize, featureMapSize),

    setView: (view) => set({ currentView: view }),
    
    togglePlay: () => {
      const state = get();
      set({ isPlaying: !state.isPlaying });
    },
    
    setLearningRate: (rate) => set({ learningRate: rate }),
    
    setTargetEpoch: (target) => set({ targetEpoch: target }),
    toggleAutoStop: () => set(state => ({ autoStop: !state.autoStop })),

    toggleUIVisibility: () => set(state => ({ uiVisible: !state.uiVisible })),
    toggleUIPosition: () => set(state => ({ uiPosition: state.uiPosition === 'LEFT' ? 'RIGHT' : 'LEFT' })),

    toggleInputMatrix: () => set(state => ({ showInputMatrix: !state.showInputMatrix })),
    toggleFeatureMap: () => set(state => ({ showFeatureMap: !state.showFeatureMap })),
    
    togglePooling: () => set(state => ({ showPooling: !state.showPooling })),
    
    setActivationType: (type) => set({ activationType: type }),
    
    toggleActivation: () => set(state => ({ showActivation: !state.showActivation })),

    setKernelManual: (manual) => set({ isKernelManual: manual }),
    
    moveKernel: (direction) => {
      set(state => {
        let { r, c } = state.kernelPos;
        const outputSize = 8;
        
        if (direction === 'NEXT') {
          c++;
          if (c >= outputSize) { c = 0; r++; }
          if (r >= outputSize) { r = 0; }
        } else {
          c--;
          if (c < 0) { c = outputSize - 1; r--; }
          if (r < 0) { r = outputSize - 1; }
        }
        return { kernelPos: { r, c }, isKernelManual: true };
      });
    },

    stepEpoch: () => {
      const { epoch, targetEpoch, autoStop, isPlaying } = get();
      
      if (isPlaying && autoStop && epoch >= targetEpoch) {
        set({ isPlaying: false });
        return;
      }

      get().stepMultiEpoch(1);
    },

    stepMultiEpoch: (count: number) => {
      const { learningRate, activationType, lossHistory, epoch, targetEpoch, autoStop } = get();
      
      let effectiveCount = count;
      if (autoStop && epoch + count > targetEpoch) {
        effectiveCount = Math.max(0, targetEpoch - epoch);
      }
      
      if (effectiveCount === 0 && autoStop && epoch >= targetEpoch) {
         set({ isPlaying: false });
         return;
      }

      let { connections, neurons, inputMatrix } = get();
      let currentConnections = connections;
      let currentNeurons = neurons;
      let currentInput = inputMatrix;
      let currentLossHistory = [...lossHistory];
      let currentEpoch = epoch;

      for (let i = 0; i < effectiveCount; i++) {
        currentEpoch++;
        
        currentConnections = currentConnections.map(conn => {
          const grad = (Math.random() - 0.5) * 0.1;
          const newWeight = conn.weight - (grad * learningRate * 10);
          return { ...conn, weight: newWeight, gradient: grad };
        });

        currentNeurons = currentNeurons.map(n => {
          const rawInput = (Math.random() * 4) - 2; 
          const activatedValue = applyActivation(rawInput + n.bias, activationType);
          return {
            ...n,
            activation: activatedValue,
            bias: n.bias - ((Math.random() - 0.5) * 0.01 * learningRate)
          };
        });

        currentInput = currentInput.map(row => 
          row.map(val => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.1)))
        );
        
        const decay = Math.exp(-(currentEpoch * 0.01));
        const noise = Math.random() * 0.1 * decay;
        const loss = decay + noise;
        currentLossHistory.push(loss);
      }
      
      const newMatrix = generateMatrix(8, 8);

      set({
        epoch: currentEpoch,
        connections: currentConnections,
        neurons: currentNeurons,
        inputMatrix: currentInput,
        matrixData: newMatrix,
        lossHistory: currentLossHistory,
        phase: 'FORWARD',
        isPlaying: (autoStop && currentEpoch >= targetEpoch) ? false : get().isPlaying
      });

      if (effectiveCount > 0) {
        setTimeout(() => set({ phase: 'BACKWARD' }), 1000);
        setTimeout(() => set({ phase: 'IDLE' }), 2000);
      }
    },

    updateSimulation: (delta: number) => {
      const { isPlaying, kernelPos, isKernelManual, epoch, targetEpoch, autoStop } = get();
      
      if (isPlaying && autoStop && epoch >= targetEpoch) {
        set({ isPlaying: false });
        return;
      }

      if (isPlaying && !isKernelManual) {
        convolutionTimer += delta;
        const UPDATE_THRESHOLD = 0.15; 

        if (convolutionTimer > UPDATE_THRESHOLD) {
          convolutionTimer = 0;
          
          let { r, c } = kernelPos;
          const outputSize = 8; 
          
          c++;
          if (c >= outputSize) {
            c = 0;
            r++;
            if (r >= outputSize) {
              r = 0;
            }
          }
          
          set({ kernelPos: { r, c } });
        }
      }
    }
  };
});