import React, { useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import InputMatrixPanel from './components/MatrixPanel';
import FeatureMapPanel from './components/FeatureMapPanel';
import ActivationPanel from './components/ActivationPanel';
import MetricsView from './components/MetricsView';
import CalculationView from './components/CalculationView';
import WeightMatrixView from './components/WeightMatrixView';
import KernelView from './components/KernelView';
import PoolingView from './components/PoolingView';
import FeatureMapView from './components/FeatureMapView';
import { useStore } from './store';

const App: React.FC = () => {
  const { 
    showInputMatrix, showFeatureMap, showActivation, isPlaying, stepEpoch, currentView 
  } = useStore();

  // Animation Loop for simulation logic
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        stepEpoch();
      }, 2000); // Step every 2 seconds when playing
    }
    return () => clearInterval(interval);
  }, [isPlaying, stepEpoch]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-cyan-500/30">
      
      {/* 3D Scene Layer - Always rendered but dimmed for other views */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${currentView !== 'SCENE' ? 'opacity-10 blur-md' : 'opacity-100'}`}>
        <Scene />
      </div>

      {/* Full Page Views (Overlay) */}
      {currentView === 'METRICS' && <MetricsView />}
      {currentView === 'CALC' && <CalculationView />}
      {currentView === 'WEIGHTS' && <WeightMatrixView />}
      {currentView === 'KERNEL' && <KernelView />}
      {currentView === 'POOLING' && <PoolingView />}
      {currentView === 'FEATURE_MAP' && <FeatureMapView />}

      {/* Scene Specific Panels (Only visible in SCENE view) */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${currentView !== 'SCENE' ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Input Matrix Panel (Top Right) */}
        <div className={`
          absolute top-20 right-6 transition-transform duration-500 ease-out pointer-events-auto
          ${showInputMatrix ? 'translate-x-0' : 'translate-x-[120%]'}
        `}>
          <InputMatrixPanel />
        </div>

        {/* Feature Map Panel (Right side, below input) */}
        <div className={`
          absolute top-[20rem] right-6 transition-transform duration-500 ease-out pointer-events-auto
          ${showFeatureMap ? 'translate-x-0' : 'translate-x-[120%]'}
        `}>
          <FeatureMapPanel />
        </div>

        {/* Activation Panel (Top Left) */}
        <div className={`
          absolute top-20 left-6 transition-transform duration-500 ease-out pointer-events-auto
          ${showActivation ? 'translate-x-0' : '-translate-x-[120%]'}
        `}>
          <ActivationPanel />
        </div>
      </div>

      {/* Global UI Controls (Navigation + Bottom Bar) */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <UI />
      </div>

      {/* Decorative overlay lines for "tech" feel */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default App;