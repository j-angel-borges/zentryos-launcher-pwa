import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

export interface FisheyeItemData {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon: LucideIcon;
  screen: ScreenId;
  gradient: string;
  badge?: string;
}

interface Props {
  items: FisheyeItemData[];
  selectedCategory: string;
  onSelectApp: (item: FisheyeItemData) => void;
  isDark: boolean;
}

// Genera coordenadas axiales hexagonales concéntricas (q, r)
function generateHexCoordinates(count: number): Array<{ q: number; r: number }> {
  const coords: Array<{ q: number; r: number }> = [{ q: 0, r: 0 }];
  if (count <= 1) return coords;

  const hexDirections = [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 }
  ];

  let currentRing = 1;
  while (coords.length < count) {
    let q = hexDirections[4].q * currentRing;
    let r = hexDirections[4].r * currentRing;

    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < currentRing; step++) {
        coords.push({ q, r });
        if (coords.length >= count) return coords;
        q += hexDirections[side].q;
        r += hexDirections[side].r;
      }
    }
    currentRing++;
  }
  return coords;
}

export const FisheyeBubbleGrid: React.FC<Props> = ({
  items,
  selectedCategory,
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

  const itemSpacing = 118;
  const maxRadius = Math.min(containerDimensions.width, containerDimensions.height) * 0.48 || 320;
  const minScale = 0.38;

  // Cálculo de posiciones base en panal hexagonal
  const itemPositions = useMemo(() => {
    const coords = generateHexCoordinates(items.length);
    return items.map((item, idx) => {
      const { q, r } = coords[idx] || { q: 0, r: 0 };
      const xBase = itemSpacing * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
      const yBase = itemSpacing * (1.5 * r);
      return {
        item,
        xBase,
        yBase
      };
    });
  }, [items, itemSpacing]);

  // Actualizar dimensiones del contenedor
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

  // Centrar en categoría seleccionada
  useEffect(() => {
    if (selectedCategory === 'todos') {
      smoothAnimateTo(0, 0);
      return;
    }
    const target = itemPositions.find(({ item }) => item.category === selectedCategory);
    if (target) {
      smoothAnimateTo(-target.xBase, -target.yBase);
    }
  }, [selectedCategory, itemPositions]);

  // Animación suave con física de resorte subamortiguado
  const smoothAnimateTo = useCallback((targetX: number, targetY: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let currentX = offsetRef.current.x;
    let currentY = offsetRef.current.y;
    let vx = 0;
    let vy = 0;
    const stiffness = 0.14;
    const damping = 0.72;

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      vx = (vx + dx * stiffness) * damping;
      vy = (vy + dy * stiffness) * damping;

      currentX += vx;
      currentY += vy;

      setOffset({ x: currentX, y: currentY });

      if (Math.hypot(dx, dy) > 0.3 || Math.hypot(vx, vy) > 0.3) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setOffset({ x: targetX, y: targetY });
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Soltar con física de inercia y rebote en límites elásticos
  const releaseWithPhysics = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let currentX = offsetRef.current.x;
    let currentY = offsetRef.current.y;
    let vx = velocityRef.current.vx * 12;
    let vy = velocityRef.current.vy * 12;

    const maxElasticLimit = itemSpacing * 2.2;
    const friction = 0.92;
    const springK = 0.12;

    const step = () => {
      currentX += vx;
      currentY += vy;
      vx *= friction;
      vy *= friction;

      const dist = Math.hypot(currentX, currentY);
      if (dist > maxElasticLimit) {
        const pull = (dist - maxElasticLimit) * springK;
        const angle = Math.atan2(currentY, currentX);
        vx -= Math.cos(angle) * pull;
        vy -= Math.sin(angle) * pull;
      }

      setOffset({ x: currentX, y: currentY });

      if (Math.hypot(vx, vy) > 0.25 || (dist > maxElasticLimit && Math.hypot(vx, vy) > 0.05)) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        if (dist > maxElasticLimit) {
          const targetX = (currentX / dist) * maxElasticLimit;
          const targetY = (currentY / dist) * maxElasticLimit;
          smoothAnimateTo(targetX, targetY);
        } else {
          animFrameRef.current = null;
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [itemSpacing, smoothAnimateTo]);

  // Gestos de puntero (Touch / Mouse)
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

  // Soporte para rueda de mouse y trackpads
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
      {/* Halo de fondo sutil que delimita la esfera */}
      <div
        className="absolute rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          width: `${maxRadius * 2}px`,
          height: `${maxRadius * 2}px`,
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, rgba(99, 102, 241, 0.03) 50%, transparent 75%)',
          border: isDark ? '1px dashed rgba(255, 255, 255, 0.06)' : '1px dashed rgba(0, 0, 0, 0.06)'
        }}
      />

      {/* Burbujas estilo Apple Watch con distorsión ojo de pez */}
      {itemPositions.map(({ item, xBase, yBase }) => {
        const virtualX = xBase + offset.x;
        const virtualY = yBase + offset.y;

        // Distancia euclidiana al centro del viewport
        const dist = Math.hypot(virtualX, virtualY);
        const r = Math.min(Math.max(dist / maxRadius, 0), 1);

        // Función de escala Fisheye (Coseno para suavizado)
        const scale = minScale + (1 - minScale) * Math.cos((r * Math.PI) / 2);

        // Compresión esférica: pliega los elementos periféricos hacia el centro
        const compression = 1 - r * 0.38;
        const transX = virtualX * compression;
        const transY = virtualY * compression;

        // Opacidad, profundidad e inclinación 3D
        const opacity = Math.min(1, Math.max(0.15, 1 - r * 0.78));
        const zIndex = Math.round((1 - r) * 100);
        const rotateX = (-virtualY / maxRadius) * 22 * r;
        const rotateY = (virtualX / maxRadius) * 22 * r;

        const isHighlighted = selectedCategory === 'todos' || item.category === selectedCategory;
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) > 0.5) return;
              if (navigator.vibrate) navigator.vibrate(10);
              sounds.playAppOpen();
              onSelectApp(item);
            }}
            className="absolute flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 group"
            style={{
              transform: `translate3d(${transX}px, ${transY}px, 0px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              opacity: isHighlighted ? opacity : opacity * 0.35,
              zIndex,
              width: '100px',
              height: '120px',
              transformOrigin: 'center center',
              willChange: 'transform, opacity'
            }}
          >
            {/* Burbuja Squircle de Vidrio Líquido */}
            <div
              className={`relative w-20 h-20 rounded-[28px] p-0.5 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95 shadow-xl ${
                isDark ? 'zentry-veil-dark' : 'zentry-veil-light'
              }`}
              style={{
                boxShadow: isDark
                  ? `0 ${Math.round((1 - r) * 16)}px ${Math.round((1 - r) * 32)}px -6px rgba(0,0,0,0.5), 0 0 ${Math.round((1 - r) * 20)}px rgba(168,85,247,0.25)`
                  : `0 ${Math.round((1 - r) * 14)}px ${Math.round((1 - r) * 28)}px -6px rgba(99,102,241,0.25), 0 0 ${Math.round((1 - r) * 16)}px rgba(255,255,255,0.8)`
              }}
            >
              {/* Contenedor del ícono con degradado vibrante */}
              <div
                className={`w-full h-full rounded-[26px] bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white relative overflow-hidden`}
              >
                {/* Reflejo superior estilo vidrio */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-[26px]" />

                <Icon className="w-9 h-9 drop-shadow-md transition-transform duration-200 group-hover:scale-110" />

                {item.badge && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-amber-300">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Etiqueta inferior con auto-escalado según la curvatura de la esfera */}
            <div
              className="mt-2 text-center pointer-events-none flex flex-col items-center px-1"
              style={{
                opacity: Math.max(0, 1 - r * 1.2),
                transform: `scale(${Math.max(0.7, 1 - r * 0.3)})`
              }}
            >
              <span
                className={`text-[12px] font-black tracking-tight leading-tight whitespace-nowrap drop-shadow-sm ${
                  isDark ? 'text-white' : 'text-[#1E293B]'
                }`}
              >
                {item.name}
              </span>
              <span
                className={`text-[9px] font-semibold opacity-70 whitespace-nowrap ${
                  isDark ? 'text-slate-300' : 'text-[#64748B]'
                }`}
              >
                {item.desc}
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
        className={`absolute bottom-3 right-3 px-3.5 py-2 rounded-[18px] backdrop-blur-xl border flex items-center gap-2 text-xs font-bold shadow-lg transition-all zentry-press z-30 ${
          isDark
            ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            : 'bg-white/70 hover:bg-white/90 border-black/10 text-[#1E293B]'
        }`}
        title="Centrar esfera de aplicaciones"
      >
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
        <span>Centrar Esfera</span>
      </button>
    </div>
  );
};
