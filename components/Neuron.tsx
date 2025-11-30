import React from 'react';
import { Vector3 } from 'three';
import { NeuronData, LayerType } from '../types';
import { Html } from '@react-three/drei';

interface NeuronProps {
  data: NeuronData;
}

const Neuron: React.FC<NeuronProps> = ({ data }) => {
  // Determine color based on activation and layer type
  const baseColor = data.type === LayerType.INPUT ? '#4ade80' : // Green
                   data.type === LayerType.OUTPUT ? '#f87171' : // Red
                   '#60a5fa'; // Blue (Hidden)

  return (
    <group position={data.position}>
      {/* Neuron Sphere - Static */}
      <mesh scale={0.7}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={data.activation * 1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Bias Ring - Static */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.03, 16, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      
      {/* Light emitted by neuron */}
      <pointLight 
        distance={3} 
        intensity={data.activation * 1.5} 
        color={baseColor} 
      />

      {/* Label on Hover */}
      {(data.type === LayerType.INPUT || data.type === LayerType.OUTPUT) && (
        <Html distanceFactor={10} position={[0, -0.8, 0]}>
          <div className="text-[10px] text-gray-300 font-mono bg-black/50 px-1 rounded backdrop-blur-sm pointer-events-none select-none border border-gray-800">
            {data.activation.toFixed(2)}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Neuron;