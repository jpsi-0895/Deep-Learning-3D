import { Vector3 } from 'three';

export enum LayerType {
  INPUT = 'INPUT',
  HIDDEN = 'HIDDEN',
  OUTPUT = 'OUTPUT'
}

export type ActivationType = 'SIGMOID' | 'RELU' | 'TANH' | 'LEAKY_RELU' | 'SWISH' | 'ELU';
export type ViewType = 'SCENE' | 'CALC' | 'METRICS' | 'WEIGHTS' | 'KERNEL' | 'POOLING' | 'FEATURE_MAP';

export interface NeuronData {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  position: Vector3;
  activation: number;
  bias: number;
  type: LayerType;
}

export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  gradient: number; // For visualization of backprop
}

export interface SimulationState {
  epoch: number;
  targetEpoch: number;
  autoStop: boolean;
  learningRate: number;
  isPlaying: boolean;
  phase: 'IDLE' | 'FORWARD' | 'BACKWARD';
  
  currentView: ViewType;
  lossHistory: number[];

  // UI State
  uiVisible: boolean;
  uiPosition: 'LEFT' | 'RIGHT';

  // Visibility State
  showInputMatrix: boolean;
  showFeatureMap: boolean;
  showPooling: boolean;
  
  // Activation State
  activationType: ActivationType;
  showActivation: boolean;

  // Convolution State
  kernelPos: { r: number, c: number };
  isKernelManual: boolean;

  layers: number[]; // Number of neurons per layer
  neurons: NeuronData[];
  connections: ConnectionData[];
  
  inputMatrix: number[][]; // The "Visual Input" (e.g. 10x10)
  matrixData: number[][]; // The "Feature Map" (e.g. 8x8)
  
  // Actions
  setView: (view: ViewType) => void;
  togglePlay: () => void;
  stepEpoch: () => void;
  stepMultiEpoch: (count: number) => void;
  setLearningRate: (rate: number) => void;
  setTargetEpoch: (target: number) => void;
  toggleAutoStop: () => void;
  
  toggleUIVisibility: () => void;
  toggleUIPosition: () => void;

  toggleInputMatrix: () => void;
  toggleFeatureMap: () => void;
  togglePooling: () => void;
  setActivationType: (type: ActivationType) => void;
  toggleActivation: () => void;
  updateSimulation: (delta: number) => void;
  
  // Convolution Actions
  setKernelManual: (manual: boolean) => void;
  moveKernel: (direction: 'NEXT' | 'PREV') => void;
}