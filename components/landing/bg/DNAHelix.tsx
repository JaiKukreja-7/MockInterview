"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, remap } from "./helpers";

const HELIX_POINTS = 60;

export default function DNAHelix({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const helixData = useMemo(() => {
    const pts: { x1: number; z1: number; x2: number; z2: number; y: number }[] = [];
    for (let i = 0; i < HELIX_POINTS; i++) {
      const t = (i / HELIX_POINTS) * Math.PI * 6;
      pts.push({
        x1: Math.cos(t) * 1.5, z1: Math.sin(t) * 1.5,
        x2: Math.cos(t + Math.PI) * 1.5, z2: Math.sin(t + Math.PI) * 1.5,
        y: (i / HELIX_POINTS) * 12 - 6,
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    if (pointsRef.current) {
      for (let i = 0; i < HELIX_POINTS * 2; i++) {
        pointsRef.current.setColorAt(i, new THREE.Color(i % 2 === 0 ? "#7C3AED" : "#06b6d4"));
      }
      pointsRef.current.instanceColor!.needsUpdate = true;
    }
    if (linesRef.current) {
      const pos: number[] = [];
      helixData.forEach((p) => pos.push(p.x1, p.y, p.z1, p.x2, p.y, p.z2));
      linesRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    }
  }, [helixData]);

  useFrame(({ clock }) => {
    const scroll = scrollRef.current;
    const t = clock.getElapsedTime();
    const progress = remap(scroll, 0.35, 0.6);

    if (!groupRef.current) return;
    groupRef.current.visible = scroll > 0.25 && scroll < 0.7;

    const xPos = progress < 0.5 ? lerp(8, 0, progress * 2) : lerp(0, -8, (progress - 0.5) * 2);
    groupRef.current.position.x = xPos;

    const scale = progress < 0.5 ? lerp(0.5, 1.5, progress * 2) : lerp(1.5, 0.5, (progress - 0.5) * 2);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.rotation.y = t * 0.3;

    if (pointsRef.current) {
      helixData.forEach((p, i) => {
        dummy.position.set(p.x1, p.y, p.z1);
        dummy.updateMatrix();
        pointsRef.current!.setMatrixAt(i * 2, dummy.matrix);
        dummy.position.set(p.x2, p.y, p.z2);
        dummy.updateMatrix();
        pointsRef.current!.setMatrixAt(i * 2 + 1, dummy.matrix);
      });
      pointsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[8, 0, -5]}>
      <instancedMesh ref={pointsRef} args={[undefined, undefined, HELIX_POINTS * 2]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.8} toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#7C3AED" transparent opacity={0.2} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
