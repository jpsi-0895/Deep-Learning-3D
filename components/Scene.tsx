import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Network from './Network';
import { useStore } from '../store';
import RealTimeCalcBox from './RealTimeCalcBox';

// Component to handle simulation updates synchronized with the frame rate
const SimulationLoop: React.FC = () => {
  const updateSimulation = useStore(state => state.updateSimulation);
  
  useFrame((state, delta) => {
    updateSimulation(delta);
  });

  return null;
};

const Scene: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Real-time Calculation HUD Layer - Positioned Top Left */}
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <RealTimeCalcBox />
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Simulation Logic Loop */}
        <SimulationLoop />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="purple" />

        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0} />
        
        {/* Main Content */}
        <Network />

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={5}
          maxDistance={30}
        />

        {/* Post Processing for Neon Effect (Sharp) */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={0.8} 
            radius={0.4}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;