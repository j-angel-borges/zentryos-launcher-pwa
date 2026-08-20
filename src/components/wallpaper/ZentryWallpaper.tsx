import React, { useEffect, useRef } from 'react';
import type { WallpaperConfig, CircadianPhase } from '../../types/zentry';

interface Props {
  wallpaper: WallpaperConfig;
  phase: CircadianPhase;
  focusActive: boolean;
}

export const ZentryWallpaper: React.FC<Props> = ({ wallpaper, phase, focusActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const t = (now - startTime) / 1000 * 0.12; // slow drift cycle ~52s
      const width = canvas.width;
      const height = canvas.height;
      const maxDim = Math.max(width, height);

      // 1. Draw base solid color
      ctx.fillStyle = focusActive ? '#15202B' : wallpaper.base;
      ctx.fillRect(0, 0, width, height);

      const orbs = focusActive 
        ? ['#1F4E5F', '#2E3A6B', '#14545A'] 
        : wallpaper.orbs;

      // 2. Draw drifting radial orbs exactly matching Kotlin ZentryWallpaper.kt math
      orbs.forEach((color, i) => {
        const ang = t + i * 2.094;
        const cx = width * (0.5 + 0.42 * Math.sin(ang + i));
        const cy = height * (0.5 + 0.38 * Math.cos(ang * 0.8 + i * 1.7));
        const radius = maxDim * (0.55 + 0.08 * Math.sin(ang * 0.6 + i));

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, color + 'D9'); // alpha 0.85
        grad.addColorStop(1, color + '00'); // alpha 0

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Circadian phase vertical veil
      const phaseGrad = ctx.createLinearGradient(0, 0, 0, height);
      phaseGrad.addColorStop(0, phase.startColor + '29'); // alpha 0.16
      phaseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = phaseGrad;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [wallpaper, phase, focusActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
};
