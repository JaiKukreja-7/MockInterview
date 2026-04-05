"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingShape({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x += (mouse.y * 0.5 - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (mouse.x * 0.5 - meshRef.current.rotation.y) * 0.05;
  });
  return (
    <mesh ref={meshRef} position={[2.5, 1, 0]}>
      <icosahedronGeometry args={[3, 1]} />
      <meshBasicMaterial color="#7C3AED" wireframe opacity={0.15} transparent />
    </mesh>
  );
}

export default function DashboardCanvas({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '60%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      className="hidden md:block"
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <RotatingShape mouse={mouse} />
      </Canvas>
    </div>
  );
}
