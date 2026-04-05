"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Types ─── */
interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  opacity: number;
  isLarge: boolean;
  pulseSpeed: number;
  pulseOffset: number;
}

interface ShootingStarData {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  active: boolean;
  delay: number;
  timer: number;
  progress: number;
}

/* ─── Layer 1 + 2: Instanced Particle Galaxy + Connection Web ─── */
function ParticleSystem({ count, showLines }: { count: number; showLines: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const smallMeshRef = useRef<THREE.InstancedMesh>(null);
  const largeMeshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: count }, () => {
      const rColor = Math.random();
      const color = rColor < 0.5
        ? new THREE.Color('#7C3AED')
        : rColor < 0.8
          ? new THREE.Color('#06b6d4')
          : new THREE.Color('#ec4899');
      const isLarge = Math.random() > 0.8;
      return {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.006
        ),
        color,
        opacity: 0.4 + Math.random() * 0.6,
        isLarge,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  const { smallParticles, largeParticles } = useMemo(() => {
    const small: number[] = [];
    const large: number[] = [];
    particles.forEach((p, i) => {
      if (p.isLarge) large.push(i);
      else small.push(i);
    });
    return { smallParticles: small, largeParticles: large };
  }, [particles]);

  // Set initial colors on instanced meshes
  useEffect(() => {
    if (smallMeshRef.current) {
      smallParticles.forEach((idx, i) => {
        smallMeshRef.current!.setColorAt(i, particles[idx].color);
      });
      smallMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (largeMeshRef.current) {
      largeParticles.forEach((idx, i) => {
        largeMeshRef.current!.setColorAt(i, particles[idx].color);
      });
      largeMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [particles, smallParticles, largeParticles]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Animate particles
    for (const p of particles) {
      p.position.add(p.velocity);
      // Wrap around
      ['x', 'y', 'z'].forEach(axis => {
        const a = axis as 'x' | 'y' | 'z';
        if (p.position[a] > 20) p.position[a] = -20;
        if (p.position[a] < -20) p.position[a] = 20;
      });
    }

    // Update small instanced mesh
    if (smallMeshRef.current) {
      smallParticles.forEach((idx, i) => {
        dummy.position.copy(particles[idx].position);
        dummy.updateMatrix();
        smallMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      smallMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update large instanced mesh + pulse
    if (largeMeshRef.current) {
      largeParticles.forEach((idx, i) => {
        const p = particles[idx];
        const scale = Math.sin(t * p.pulseSpeed + p.pulseOffset) * 0.3 + 1.0;
        dummy.position.copy(p.position);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        largeMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      largeMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update connections
    if (showLines && lineRef.current) {
      const positions: number[] = [];
      let connections = 0;
      for (let i = 0; i < particles.length && connections < 400; i++) {
        for (let j = i + 1; j < particles.length && connections < 400; j++) {
          const dist = particles[i].position.distanceTo(particles[j].position);
          if (dist < 4) {
            positions.push(
              particles[i].position.x, particles[i].position.y, particles[i].position.z,
              particles[j].position.x, particles[j].position.y, particles[j].position.z
            );
            connections++;
          }
        }
      }
      const geo = lineRef.current.geometry;
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      geo.attributes.position.needsUpdate = true;
      geo.setDrawRange(0, positions.length / 3);
    }

    // Counter-parallax rotation on particle group
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Small particles */}
      <instancedMesh ref={smallMeshRef} args={[undefined, undefined, smallParticles.length]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.7} toneMapped={false} />
      </instancedMesh>

      {/* Large glowing particles */}
      <instancedMesh ref={largeMeshRef} args={[undefined, undefined, largeParticles.length]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.9} toneMapped={false} />
      </instancedMesh>

      {/* Connection lines */}
      {showLines && (
        <lineSegments ref={lineRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#7C3AED" transparent opacity={0.12} toneMapped={false} />
        </lineSegments>
      )}
    </group>
  );
}

/* ─── Layer 3: Glowing energy rings ─── */
function EnergyRings({ isMobile }: { isMobile: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const rings = useMemo(() => [
    { pos: [5, 2, -8] as [number, number, number], args: [2.5, 0.008, 8, 80] as [number, number, number, number], color: '#7C3AED', opacity: 0.5, rot: [Math.PI / 4, 0, 0], speed: [0.001, 0.002, 0], show: true },
    { pos: [-6, -3, -10] as [number, number, number], args: [3, 0.006, 8, 80] as [number, number, number, number], color: '#06b6d4', opacity: 0.35, rot: [0, Math.PI / 3, 0], speed: [0, -0.0015, 0.002], show: true },
    { pos: [0, 5, -12] as [number, number, number], args: [4, 0.005, 8, 100] as [number, number, number, number], color: '#ec4899', opacity: 0.2, rot: [0, 0, 0], speed: [0.001, 0.001, 0], show: !isMobile },
    { pos: [2, -1, -15] as [number, number, number], args: [7, 0.004, 8, 120] as [number, number, number, number], color: '#7C3AED', opacity: 0.12, rot: [0, 0, 0], speed: [0.0005, 0.0008, 0], show: !isMobile },
    { pos: [-3, 3, -5] as [number, number, number], args: [1.2, 0.01, 8, 60] as [number, number, number, number], color: '#06b6d4', opacity: 0.6, rot: [0, 0, 0], speed: [0, 0.002, 0.003], show: true },
  ], [isMobile]);

  useFrame(() => {
    rings.forEach((ring, i) => {
      const mesh = refs.current[i];
      if (!mesh || !ring.show) return;
      mesh.rotation.x += ring.speed[0];
      mesh.rotation.y += ring.speed[1];
      mesh.rotation.z += ring.speed[2];
    });
  });

  return (
    <>
      {rings.map((ring, i) =>
        ring.show ? (
          <mesh
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            position={ring.pos}
            rotation={ring.rot as [number, number, number]}
          >
            <torusGeometry args={ring.args} />
            <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} toneMapped={false} />
          </mesh>
        ) : null
      )}
    </>
  );
}

/* ─── Layer 4: Wireframe geometric shapes ─── */
function WireframeShapes() {
  const icosaRef = useRef<THREE.Mesh>(null);
  const octaRef = useRef<THREE.Mesh>(null);
  const tetraRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (icosaRef.current) {
      icosaRef.current.rotation.x += 0.0015;
      icosaRef.current.rotation.y += 0.002;
      icosaRef.current.rotation.z += 0.0008;
    }
    if (octaRef.current) {
      octaRef.current.rotation.x += 0.002;
      octaRef.current.rotation.y -= 0.0015;
      octaRef.current.rotation.z += 0.0025;
    }
    if (tetraRef.current) {
      tetraRef.current.rotation.x += 0.003;
      tetraRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      <mesh ref={icosaRef} position={[7, 4, -10]}>
        <icosahedronGeometry args={[3.5, 0]} />
        <meshBasicMaterial color="#7C3AED" wireframe transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <mesh ref={octaRef} position={[-8, -5, -9]}>
        <octahedronGeometry args={[2.8, 0]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} toneMapped={false} />
      </mesh>
      <mesh ref={tetraRef} position={[3, -6, -7]}>
        <tetrahedronGeometry args={[2, 0]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </>
  );
}

/* ─── Layer 5: Shooting Stars ─── */
function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Line[]>([]);

  const starData = useMemo<ShootingStarData[]>(() => {
    return Array.from({ length: 5 }, () => ({
      position: new THREE.Vector3(-25 + Math.random() * 10, 5 + Math.random() * 15, -5 - Math.random() * 10),
      direction: new THREE.Vector3(1, -0.3 - Math.random() * 0.4, 0).normalize().multiplyScalar(0.4),
      active: false,
      delay: 2 + Math.random() * 6,
      timer: Math.random() * 4,
      progress: 0,
    }));
  }, []);

  // Create line objects imperatively
  useEffect(() => {
    if (!groupRef.current) return;
    const mat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 });
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      linesRef.current[i] = line;
      groupRef.current.add(line);
    }
    return () => {
      linesRef.current.forEach(l => {
        l.geometry.dispose();
        groupRef.current?.remove(l);
      });
      mat.dispose();
      linesRef.current = [];
    };
  }, []);

  useFrame((_, delta) => {
    let activeCount = 0;
    starData.forEach(s => { if (s.active) activeCount++; });

    starData.forEach((star, i) => {
      const line = linesRef.current[i];
      if (!line) return;

      if (!star.active) {
        star.timer += delta;
        if (star.timer >= star.delay && activeCount < 2) {
          star.active = true;
          star.timer = 0;
          star.progress = 0;
          star.position.set(-25 + Math.random() * 10, 5 + Math.random() * 15, -5 - Math.random() * 10);
          star.direction.set(1, -0.3 - Math.random() * 0.4, 0).normalize().multiplyScalar(0.4);
          activeCount++;
        }
        line.visible = false;
        return;
      }

      star.progress += delta;
      const head = star.position.clone().add(star.direction.clone().multiplyScalar(star.progress * 30));
      const tail = head.clone().sub(star.direction.clone().normalize().multiplyScalar(3));

      const positions = new Float32Array([tail.x, tail.y, tail.z, head.x, head.y, head.z]);
      line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      line.geometry.attributes.position.needsUpdate = true;
      line.visible = true;

      // Fade out as it progresses
      (line.material as THREE.LineBasicMaterial).opacity = Math.max(0, 0.6 * (1 - star.progress / 1.5));

      if (star.progress > 1.5) {
        star.active = false;
        star.delay = 2 + Math.random() * 6;
        line.visible = false;
      }
    });
  });

  return <group ref={groupRef} />;
}

/* ─── Camera controller with enhanced parallax ─── */
function CameraController({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (mouse.current.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Main export ─── */
export default function DashboardBackground() {
  const mouse = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);

  // Force pointer-events: none on any runtime-generated canvas elements
  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      (canvas as HTMLCanvasElement).style.pointerEvents = 'none';
    });
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setDpr(Math.min(window.devicePixelRatio, 2));
    };
    check();
    window.addEventListener('resize', check);

    const onMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse);

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true }}
        dpr={dpr}
        frameloop="always"
        performance={{ min: 0.5 }}
        style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}
      >
        <fog attach="fog" args={['#0A0A0F', 8, 30]} />
        <CameraController mouse={mouse} />
        <ParticleSystem count={isMobile ? 60 : 300} showLines={!isMobile} />
        <EnergyRings isMobile={isMobile} />
        {!isMobile && <WireframeShapes />}
        {!isMobile && <ShootingStars />}
      </Canvas>
    </div>
  );
}
