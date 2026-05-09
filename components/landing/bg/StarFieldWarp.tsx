"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remap } from "./helpers";

const STAR_COUNT = 200;

export default function StarFieldWarp({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stars = useMemo(() =>
    Array.from({ length: STAR_COUNT }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        -5 - Math.random() * 45
      ),
    })),
  []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < STAR_COUNT; i++) {
      meshRef.current.setColorAt(i, new THREE.Color(Math.random() > 0.5 ? "#ffffff" : "#c0c0c0"));
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame(() => {
    const scroll = scrollRef.current;
    const warpProgress = remap(scroll, 0.6, 0.8);
    const warpIntensity = Math.sin(warpProgress * Math.PI);

    if (!meshRef.current) return;
    stars.forEach((star, i) => {
      dummy.position.copy(star.position);
      // Push stars toward camera during warp
      dummy.position.z += warpIntensity * 30;
      dummy.scale.set(1, 1, 1 + warpIntensity * 3);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial transparent opacity={0.6} toneMapped={false} />
    </instancedMesh>
  );
}
