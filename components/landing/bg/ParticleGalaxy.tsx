"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp } from "./helpers";

export default function ParticleGalaxy({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const COUNT = 400;

  const particles = useMemo(() =>
    Array.from({ length: COUNT }, () => {
      const r = Math.random();
      return {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        ),
        color: new THREE.Color(r < 0.5 ? "#7C3AED" : r < 0.8 ? "#06b6d4" : "#ec4899"),
      };
    }),
  []);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => meshRef.current!.setColorAt(i, p.color));
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles]);

  useFrame(() => {
    const scroll = scrollRef.current;
    for (const p of particles) {
      p.position.add(p.velocity);
      (["x", "y", "z"] as const).forEach((a) => {
        if (p.position[a] > 25) p.position[a] = -25;
        if (p.position[a] < -25) p.position[a] = 25;
      });
    }
    if (meshRef.current) {
      particles.forEach((p, i) => {
        dummy.position.copy(p.position);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = scroll * Math.PI;
    }
    if (lineRef.current) {
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = lerp(0.2, 0.05, scroll);
      const pos: number[] = [];
      let c = 0;
      for (let i = 0; i < particles.length && c < 300; i++) {
        for (let j = i + 1; j < particles.length && c < 300; j++) {
          if (particles[i].position.distanceTo(particles[j].position) < 4) {
            pos.push(
              particles[i].position.x, particles[i].position.y, particles[i].position.z,
              particles[j].position.x, particles[j].position.y, particles[j].position.z
            );
            c++;
          }
        }
      }
      const geo = lineRef.current.geometry;
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
      geo.setDrawRange(0, pos.length / 3);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial transparent opacity={0.7} toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#7C3AED" transparent opacity={0.15} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
