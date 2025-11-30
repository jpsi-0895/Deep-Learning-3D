import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import Neuron from './Neuron';
import Connection from './Connection';

const Network: React.FC = () => {
  const neurons = useStore(state => state.neurons);
  const connections = useStore(state => state.connections);
  const phase = useStore(state => state.phase);
  const groupRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Slow floaty rotation for the whole network
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {neurons.map(neuron => (
        <Neuron key={neuron.id} data={neuron} />
      ))}
      
      {connections.map(conn => {
        const source = neurons.find(n => n.id === conn.sourceId);
        const target = neurons.find(n => n.id === conn.targetId);
        
        if (!source || !target) return null;

        return (
          <Connection 
            key={conn.id} 
            data={conn} 
            startPos={source.position}
            endPos={target.position}
            phase={phase}
          />
        );
      })}
    </group>
  );
};

export default Network;
