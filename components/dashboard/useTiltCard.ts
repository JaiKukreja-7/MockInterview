"use client";

import { useRef, useCallback } from 'react';

interface UseTiltCardOptions {
  maxTilt?: number;
  scale?: number;
  shinePrimary?: string;
  resetBg?: string;
}

export function useTiltCard({
  maxTilt = 15,
  scale = 1.05,
  shinePrimary = 'rgba(124,58,237,0.15)',
  resetBg = '',
}: UseTiltCardOptions = {}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    // Shine overlay
    const shine = `radial-gradient(circle at ${x}px ${y}px, ${shinePrimary} 0%, transparent 60%)`;
    cardRef.current.style.backgroundImage = shine;
  }, [maxTilt, scale, shinePrimary]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    cardRef.current.style.backgroundImage = 'none';
    if (resetBg) {
      cardRef.current.style.backgroundColor = resetBg;
    }
  }, [resetBg]);

  return { cardRef, handleMouseMove, handleMouseLeave };
}
