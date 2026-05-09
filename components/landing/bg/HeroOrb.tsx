"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, remap } from "./helpers";

export default function HeroOrb({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const moon1 = useRef<THREE.Mesh>(null);
  const moon2 = useRef<THREE.Mesh>(null);
  const moon3 = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const progress = remap(scrollRef.current, 0, 0.2);
    const scale = lerp(1, 0, progress);

    if (groupRef.current) groupRef.current.visible = progress < 1;

    if (sphereRef.current) {
      sphereRef.current.scale.setScalar(scale);
      sphereRef.current.position.y = Math.sin(t * 0.5) * 0.1;
      sphereRef.current.rotation.y = t * 0.2;
      const mat = sphereRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = lerp(1, 0, progress);
    }

    if (lightRef.current) lightRef.current.intensity = lerp(2, 0, progress);

    if (moon1.current) {
      moon1.current.position.set(Math.cos(t * 0.8) * 2.5, 0, Math.sin(t * 0.8) * 2.5);
      moon1.current.scale.setScalar(scale);
    }
    if (moon2.current) {
      moon2.current.position.set(Math.cos(t * 0.5 + 2) * 3.5, Math.sin(t * 0.3) * 1, 0);
      moon2.current.scale.setScalar(scale);
    }
    if (moon3.current) {
      moon3.current.position.set(Math.cos(t * 1.2 + 4) * 2, 0, Math.sin(t * 1.2 + 4) * 2);
      moon3.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          emissive="#7C3AED"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
          color="#1a1a2e"
          transparent
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 3]} color="#7C3AED" intensity={2} />
      <mesh ref={moon1}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#06b6d4" toneMapped={false} />
      </mesh>
      <mesh ref={moon2}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#7C3AED" toneMapped={false} />
      </mesh>
      <mesh ref={moon3}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ec4899" toneMapped={false} />
      </mesh>
    </group>
  );
}
