import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

export interface FisheyeItemData {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  screen: ScreenId;
  gradient: string;
}

interface Props {
  items: FisheyeItemData[];
  onSelectApp: (item: FisheyeItemData) => void;
  isDark: boolean;
}

export const FisheyeBubbleGrid: React.FC<Props> = ({
  items,
  onSelectApp,
  isDark
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado del pan 2D y arrastre
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  offsetRef.current = offset;

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef<number | null>(null);

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 600
  });

  // Espaciado óptimo y holgado (160px) para separación clara y aireada
  const itemSpacing = 160;
  const maxRadius = Math.min(containerDimensions.width, containerDimensions.height) * 0.58 || 350;
  const minScale = 0.58;

  // Distribución en anillo simétrico con centro libre
  const itemPositions = useMemo(() => {
    if (items.length <= 1) {
      return [{ item: items[0], xBase: 0, yBase: 0 }];
    }

    // Anillo simétrico alrededor del centro vacío (distribución armónica a 160px)
    return items.map((item, idx) => {
      const angle = (idx * 2 * Math.PI) / items.length - Math.PI / 2;
      const xBase = Math.cos(angle) * itemSpacing;
      const yBase = Math.sin(angle) * itemSpacing;
      return { item, xBase, yBase };
    });
  }, [items, itemSpacing]);

  // Límites elásticos amplios para navegación libre
  const panLimits = useMemo(() => {
    const maxX = Math.max(180, containerDimensions.width * 0.38);
    const maxY = Math.max(180, containerDimensions.height * 0.38);
    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    };
  }, [containerDimensions]);

  // Actualizar dimensiones
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width || 600,
          height: rect.height || 600
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animación suave de resorte
  const smoothAnimateTo = useCallback((targetX: number, targetY: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let currentX = offsetRef.current.x;
    let currentY = offsetRef.current.y;
    let vx = 0;
    let vy = 0;
    const stiffness = 0.12;
    const damping = 0.8;

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      vx = (vx + dx * stiffness) * damping;
      vy = (vy + dy * stiffness) * damping;

      currentX += vx;
      currentY += vy;

      setOffset({ x: currentX, y: currentY });

      if (Math.hypot(dx, dy) > 0.4 || Math.hypot(vx, vy) > 0.4) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setOffset({ x: targetX, y: targetY });
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Inercia libre: el mapa se queda donde se deslice
  const releaseWithPhysics = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let currentX = offsetRef.current.x;
    let currentY = offsetRef.current.y;
    let vx = velocityRef.current.vx * 14;
    let vy = velocityRef.current.vy * 14;

    const { minX, maxX, minY, maxY } = panLimits;
    const friction = 0.94;
    const springK = 0.08;

    const step = () => {
      currentX += vx;
      currentY += vy;
      vx *= friction;
      vy *= friction;

      let outOfBounds = false;
      if (currentX < minX) {
        vx += (minX - currentX) * springK;
        outOfBounds = true;
      } else if (currentX > maxX) {
        vx += (maxX - currentX) * springK;
        outOfBounds = true;
      }

      if (currentY < minY) {
        vy += (minY - currentY) * springK;
        outOfBounds = true;
      } else if (currentY > maxY) {
        vy += (maxY - currentY) * springK;
        outOfBounds = true;
      }

      setOffset({ x: currentX, y: currentY });

      const speed = Math.hypot(vx, vy);
      if (speed > 0.18 || (outOfBounds && speed > 0.04)) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        const clampedX = Math.min(Math.max(currentX, minX), maxX);
        const clampedY = Math.min(Math.max(currentY, minY), maxY);
        if (Math.abs(clampedX - currentX) > 1 || Math.abs(clampedY - currentY) > 1) {
          smoothAnimateTo(clampedX, clampedY);
        } else {
          animFrameRef.current = null;
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [panLimits, smoothAnimateTo]);

  // Gestos de puntero
  const handlePointerDown = (e: React.PointerEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetStartRef.current = { ...offsetRef.current };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    velocityRef.current = { vx: 0, vy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerRef.current.time);
    const vx = (e.clientX - lastPointerRef.current.x) / dt;
    const vy = (e.clientY - lastPointerRef.current.y) / dt;

    velocityRef.current = { vx, vy };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };

    setOffset({
      x: dragOffsetStartRef.current.x + dx,
      y: dragOffsetStartRef.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si el puntero ya se liberó
    }
    releaseWithPhysics();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const newX = offsetRef.current.x - e.deltaX * 0.7;
    const newY = offsetRef.current.y - e.deltaY * 0.7;
    setOffset({ x: newX, y: newY });
    releaseWithPhysics();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ perspective: '1000px' }}
    >
      {/* Halo de fondo sutil */}
      <div
        className="absolute rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          width: `${maxRadius * 2}px`,
          height: `${maxRadius * 2}px`,
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.04) 50%, transparent 75%)'
        }}
      />

      {/* Burbujas estilo Apple Watch con espaciado amplio y aireado */}
      {itemPositions.map(({ item, xBase, yBase }) => {
        const virtualX = xBase + offset.x;
        const virtualY = yBase + offset.y;

        // Distancia euclidiana al centro
        const dist = Math.hypot(virtualX, virtualY);
        const r = Math.min(Math.max(dist / maxRadius, 0), 1);

        // Escala Coseno suave
        const scale = minScale + (1 - minScale) * Math.cos((r * Math.PI) / 2);

        // Compresión esférica moderada
        const compression = 1 - r * 0.22;
        const transX = virtualX * compression;
        const transY = virtualY * compression;

        // Opacidad y 3D tilt sutil
        const opacity = Math.min(1, Math.max(0.5, 1 - r * 0.5));
        const zIndex = Math.round((1 - r) * 100);
        const rotateX = (-virtualY / maxRadius) * 14 * r;
        const rotateY = (virtualX / maxRadius) * 14 * r;

        const Icon = item.icon;

        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) > 0.5) return;
              if (navigator.vibrate) navigator.vibrate(12);
              sounds.playAppOpen();
              onSelectApp(item);
            }}
            className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 group"
            style={{
              transform: `translate3d(${transX}px, ${transY}px, 0px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              opacity,
              zIndex,
              width: '110px',
              height: '130px',
              transformOrigin: 'center center',
              willChange: 'transform, opacity'
            }}
          >
            {/* Burbuja Squircle de Vidrio Líquido (Tamaño 84px para proporción perfecta) */}
            <div
              className={`relative w-21 h-21 rounded-[28px] p-1 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-92 shadow-2xl ${
                isDark ? 'zentry-veil-dark' : 'zentry-veil-light'
              }`}
              style={{
                boxShadow: isDark
                  ? `0 ${Math.round((1 - r) * 16)}px ${Math.round((1 - r) * 32)}px -6px rgba(0,0,0,0.6), 0 0 ${Math.round((1 - r) * 20)}px rgba(236,72,153,0.25)`
                  : `0 ${Math.round((1 - r) * 14)}px ${Math.round((1 - r) * 28)}px -6px rgba(236,72,153,0.3), 0 0 ${Math.round((1 - r) * 18)}px rgba(255,255,255,0.85)`
              }}
            >
              {/* Contenedor del ícono con degradado vibrante */}
              <div
                className={`w-full h-full rounded-[24px] bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white relative overflow-hidden`}
              >
                {/* Reflejo de luz superior */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[24px]" />

                {/* Ícono de gran visibilidad */}
                <Icon className="w-10 h-10 drop-shadow-lg transition-transform duration-200 group-hover:scale-110" />
              </div>
            </div>

            {/* Título claro y directo */}
            <div
              className="mt-2 text-center pointer-events-none px-1"
              style={{
                opacity: Math.max(0.5, 1 - r * 0.6)
              }}
            >
              <span
                className={`text-xs font-black tracking-tight leading-tight whitespace-nowrap drop-shadow-sm ${
                  isDark ? 'text-white' : 'text-[#1E293B]'
                }`}
              >
                {item.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Botón flotante para recentrar la esfera */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (navigator.vibrate) navigator.vibrate(8);
          sounds.playTap();
          smoothAnimateTo(0, 0);
        }}
        className={`absolute bottom-3 right-3 px-4 py-2 rounded-[20px] backdrop-blur-xl border flex items-center gap-2 text-xs font-black shadow-lg transition-all zentry-press z-30 ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            : 'bg-white/70 hover:bg-white/90 border-black/10 text-[#1E293B]'
        }`}
        title="Centrar esfera de aplicaciones"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
        <span>Centrar</span>
      </button>
    </div>
  );
};
