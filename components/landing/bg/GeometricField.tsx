"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, remap } from "./helpers";

export default function GeometricField({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const shapes = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      type: i % 3,
      targetY: (Math.random() - 0.5) * 6,
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 8 - 5,
      rotSpeed: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02],
      color: i % 2 === 0 ? "#7C3AED" : "#06b6d4",
      size: 0.3 + Math.random() * 0.5,
    })),
  []);

  useFrame(() => {
    const scroll = scrollRef.current;
    const rise = remap(scroll, 0.2, 0.35);
    const sink = remap(scroll, 0.35, 0.5);

    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const s = shapes[i];
      if (!s) return;
      const mesh = child as THREE.Mesh;
      const yProgress = sink > 0 ? 1 - sink : rise;
      mesh.position.y = lerp(-10, s.targetY, yProgress);
      mesh.rotation.x += s.rotSpeed[0];
      mesh.rotation.y += s.rotSpeed[1];
      mesh.rotation.z += s.rotSpeed[2];
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <mesh key={i} position={[s.x, -10, s.z]}>
          {s.type === 0 && <icosahedronGeometry args={[s.size, 0]} />}
          {s.type === 1 && <octahedronGeometry args={[s.size, 0]} />}
          {s.type === 2 && <tetrahedronGeometry args={[s.size, 0]} />}
          <meshBasicMaterial color={s.color} wireframe transparent opacity={0.3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
