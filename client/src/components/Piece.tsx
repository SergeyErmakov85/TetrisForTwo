import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PieceProps {
  position: [number, number, number];
  color: string;
  scale?: number;
}

const Piece = ({ position, color, scale = 1 }: PieceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Add a subtle animation to make the game feel more dynamic
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Very subtle breathing effect
      meshRef.current.scale.x = scale * (1 + Math.sin(Date.now() * 0.003) * 0.01);
      meshRef.current.scale.y = scale * (1 + Math.sin(Date.now() * 0.003) * 0.01);
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.95 * scale, 0.95 * scale, 0.2 * scale]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.1}
        roughness={0.5}
      />
      {/* Add an outline/edge to make pieces more distinct */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(0.95 * scale, 0.95 * scale, 0.2 * scale)]} />
        <lineBasicMaterial attach="material" color="#000000" linewidth={1} />
      </lineSegments>
    </mesh>
  );
};

export default Piece;
