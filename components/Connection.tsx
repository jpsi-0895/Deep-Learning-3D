import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color, CatmullRomCurve3, TubeGeometry } from 'three';
import { ConnectionData, NeuronData } from '../types';

interface ConnectionProps {
  data: ConnectionData;
  startPos: Vector3;
  endPos: Vector3;
  phase: string;
}

const Connection: React.FC<ConnectionProps> = ({ data, startPos, endPos, phase }) => {
  const materialRef = useRef<any>(null);

  // Create a curve for the tube
  const curve = useMemo(() => {
    return new CatmullRomCurve3([
      startPos,
      startPos.clone().lerp(endPos, 0.5), // Linear midpoint, could be curved
      endPos
    ]);
  }, [startPos, endPos]);

  // Visual Properties
  const absWeight = Math.abs(data.weight);
  const thickness = Math.max(0.01, absWeight * 0.05);
  const color = data.weight > 0 ? new Color('#60a5fa') : new Color('#f87171');
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Animate opacity or "flow" based on phase
      if (phase === 'FORWARD') {
         // Simulate signal traveling
         const time = clock.elapsedTime * 3;
         materialRef.current.opacity = 0.3 + Math.sin(time) * 0.2;
      } else if (phase === 'BACKWARD') {
        // Flash white for gradient update
        const flash = Math.abs(Math.sin(clock.elapsedTime * 10));
        materialRef.current.emissiveIntensity = flash;
        materialRef.current.color.lerp(new Color('#ffffff'), flash * 0.2);
      } else {
        materialRef.current.opacity = 0.1 + absWeight * 0.2;
        materialRef.current.emissiveIntensity = 0;
      }
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 8, thickness, 8, false]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={2} // Additive blending for neon look
      />
    </mesh>
  );
};

export default Connection;
