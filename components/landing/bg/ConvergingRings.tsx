"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, remap } from "./helpers";

const RING_DATA = [
  { radius: 8, tube: 0.015, startZ: -25, color: "#7C3AED", opacity: 0.3, rotAxis: [0.001, 0.002, 0] },
  { radius: 6, tube: 0.012, startZ: -18, color: "#06b6d4", opacity: 0.4, rotAxis: [0, 0.0015, 0.001] },
  { radius: 4.5, tube: 0.01, startZ: -12, color: "#7C3AED", opacity: 0.45, rotAxis: [0.002, 0, 0.001] },
  { radius: 3, tube: 0.008, startZ: -7, color: "#06b6d4", opacity: 0.5, rotAxis: [0, 0.002, 0.002] },
  { radius: 2, tube: 0.006, startZ: -3, color: "#7C3AED", opacity: 0.6, rotAxis: [0.001, 0.001, 0] },
];

export default function ConvergingRings({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const scroll = scrollRef.current;
    const progress = remap(scroll, 0.8, 1.0);

    RING_DATA.forEach((ring, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      mesh.position.z = lerp(ring.startZ, 2, progress);
      mesh.rotation.x += ring.rotAxis[0];
      mesh.rotation.y += ring.rotAxis[1];
      mesh.rotation.z += ring.rotAxis[2];
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = progress > 0.9 ? lerp(ring.opacity, 0, (progress - 0.9) * 10) : ring.opacity;
    });
  });

  return (
    <group>
      {RING_DATA.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[0, 0, ring.startZ]}
        >
          <torusGeometry args={[ring.radius, ring.tube, 16, 80]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
