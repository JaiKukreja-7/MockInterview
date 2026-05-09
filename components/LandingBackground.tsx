"use client";

import { useRef, useEffect, useState, memo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import ParticleGalaxy from "./landing/bg/ParticleGalaxy";
import HeroOrb from "./landing/bg/HeroOrb";
import GeometricField from "./landing/bg/GeometricField";
import DNAHelix from "./landing/bg/DNAHelix";
import StarFieldWarp from "./landing/bg/StarFieldWarp";
import ConvergingRings from "./landing/bg/ConvergingRings";
import { lerp, remap } from "./landing/bg/helpers";

/* ─── Camera controller: mouse parallax + scroll-driven z ─── */
function CameraController({
  scrollRef,
  mouseRef,
}: {
  scrollRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const scroll = scrollRef.current;
    const mouse = mouseRef.current;

    // Scroll-driven camera z for warp effect (scroll 0.6-0.8)
    const warpProgress = remap(scroll, 0.6, 0.8);
    const returnProgress = remap(scroll, 0.8, 0.9);
    let targetZ = 5;
    if (warpProgress > 0 && returnProgress === 0) {
      targetZ = lerp(5, -10, warpProgress);
    } else if (returnProgress > 0) {
      targetZ = lerp(-10, 5, returnProgress);
    }
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // Mouse parallax
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Orbiting lights ─── */
function AnimatedLights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (light1.current) {
      light1.current.position.set(-5 + Math.sin(t * 0.2) * 2, 5 + Math.cos(t * 0.15) * 2, 5);
    }
    if (light2.current) {
      light2.current.position.set(5 + Math.cos(t * 0.25) * 2, -5 + Math.sin(t * 0.2) * 2, -5);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight ref={light1} color="#7C3AED" intensity={1} />
      <pointLight ref={light2} color="#06b6d4" intensity={0.8} />
    </>
  );
}

/* ─── Full scene (desktop) ─── */
function FullScene({
  scrollRef,
  mouseRef,
}: {
  scrollRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <fog attach="fog" args={["#0A0A0F", 15, 50]} />
      <CameraController scrollRef={scrollRef} mouseRef={mouseRef} />
      <AnimatedLights />
      <ParticleGalaxy scrollRef={scrollRef} />
      <HeroOrb scrollRef={scrollRef} />
      <GeometricField scrollRef={scrollRef} />
      <DNAHelix scrollRef={scrollRef} />
      <StarFieldWarp scrollRef={scrollRef} />
      <ConvergingRings scrollRef={scrollRef} />
    </>
  );
}

/* ─── Simple scene (mobile) — particles only ─── */
function MobileScene({
  scrollRef,
  mouseRef,
}: {
  scrollRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <fog attach="fog" args={["#0A0A0F", 8, 30]} />
      <CameraController scrollRef={scrollRef} mouseRef={mouseRef} />
      <ambientLight intensity={0.3} />
      <ParticleGalaxy scrollRef={scrollRef} />
    </>
  );
}

/* ─── Main export ─── */
const LandingBackground = memo(function LandingBackground() {
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    // Responsive check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setDpr(Math.min(window.devicePixelRatio, 1.5));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Scroll tracking
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Mouse tracking
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouse);

    // Page visibility API — pause when tab hidden
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, powerPreference: "default", antialias: false }}
        dpr={dpr}
        frameloop="always"
        performance={{ min: 0.5 }}
        style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0 }}
      >
        {isMobile ? (
          <MobileScene scrollRef={scrollRef} mouseRef={mouseRef} />
        ) : (
          <FullScene scrollRef={scrollRef} mouseRef={mouseRef} />
        )}
      </Canvas>
    </div>
  );
});

export default LandingBackground;
