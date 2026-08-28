import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Trash2,
  Volume2,
  Sparkles,
  Eraser,
  Download,
  X,
  RefreshCw,
  Paintbrush,
  Shapes,
  Circle,
  Square,
  Star,
  Triangle,
  Heart,
  Diamond,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService } from '../../services/voiceSpeech';
import { askZentryAi } from '../../services/aiService';
import { ZentryLogoIcon } from '../ui/ZentryLogoIcon';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

// ==========================================
// CONFIGURACIÓN DE FORMAS, TAMAÑOS Y COLORES
// ==========================================

export type ShapeType = 'circle' | 'rectangle' | 'star' | 'triangle' | 'heart' | 'diamond' | 'flower' | 'rocket';

const GEOMETRIC_SHAPES: Array<{ id: ShapeType; label: string; icon: string }> = [
  { id: 'circle', label: 'Círculo', icon: '⭕' },
  { id: 'rectangle', label: 'Rectángulo', icon: '⬛' },
  { id: 'star', label: 'Estrella', icon: '⭐' },
  { id: 'triangle', label: 'Triángulo', icon: '🔺' },
  { id: 'heart', label: 'Corazón', icon: '❤️' },
  { id: 'diamond', label: 'Rombo', icon: '💎' },
  { id: 'flower', label: 'Flor', icon: '🌸' },
  { id: 'rocket', label: 'Cohete', icon: '🚀' }
];

const BRUSH_SIZES = [
  { id: 'fine', size: 6, dotSize: 8, label: 'Fino' },
  { id: 'medium', size: 14, dotSize: 14, label: 'Medio' },
  { id: 'thick', size: 26, dotSize: 22, label: 'Grueso' },
  { id: 'jumbo', size: 44, dotSize: 30, label: 'Jumbo' }
];

const COLOR_PALETTE = [
  '#EC4899', // Rosa
  '#A855F7', // Violeta
  '#6366F1', // Indigo
  '#3B82F6', // Azul
  '#06B6D4', // Cyan
  '#10B981', // Verde
  '#EAB308', // Amarillo
  '#F97316', // Naranja
  '#EF4444', // Rojo
  '#FFFFFF', // Blanco
  '#1E293B'  // Carbón
];

type ToolMode = 'brush' | 'rainbow' | 'shape' | 'eraser';

interface AiLifeResult {
  title: string;
  category: string;
  strokesDescription?: string;
  detectedSubject: string;
  compositionMapping?: string;
  enhancedImageUrl: string;
  speechFeedback: string;
}

export const ZentryFreeCanvasScreen: React.FC<Props> = ({ onBack, isDark }) => {
  // Referencias Canvas
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados de Herramientas
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [selectedColor, setSelectedColor] = useState<string>('#EC4899');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);

  // Puntero y Arrastre de Dibujo / Formas
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  // Historial Deshacer
  const [history, setHistory] = useState<ImageData[]>([]);

  // Estado IA Mágica
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiLifeResult | null>(null);

  // --------------------------------------------------
  // INICIALIZACIÓN Y RESIZE DE CANVAS
  // --------------------------------------------------
  const initCanvases = useCallback(() => {
    const container = containerRef.current;
    const drawCanvas = drawCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !drawCanvas || !overlayCanvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    drawCanvas.width = rect.width * dpr;
    drawCanvas.height = rect.height * dpr;
    overlayCanvas.width = rect.width * dpr;
    overlayCanvas.height = rect.height * dpr;

    const drawCtx = drawCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (drawCtx) {
      drawCtx.scale(dpr, dpr);
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.fillStyle = '#FFFFFF';
      drawCtx.fillRect(0, 0, rect.width, rect.height);
      const initialSnapshot = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
      setHistory([initialSnapshot]);
    }

    if (overlayCtx) {
      overlayCtx.scale(dpr, dpr);
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    initCanvases();
    window.addEventListener('resize', initCanvases);
    return () => window.removeEventListener('resize', initCanvases);
  }, [initCanvases]);

  const pushSnapshot = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sounds.playTap();
    sounds.vibrate(8);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = history.slice(0, -1);
    const prev = next[next.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(next);
  };

  const handleClear = () => {
    sounds.playTap();
    sounds.vibrate([15, 30]);

    const canvas = drawCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    pushSnapshot();
  };

  // --------------------------------------------------
  // RENDERIZADO VECTORIAL DE FORMAS GEOMÉTRICAS
  // --------------------------------------------------
  const drawVectorShape = (
    ctx: CanvasRenderingContext2D,
    shape: ShapeType,
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    color: string,
    lineWidth: number
  ) => {
    const minX = Math.min(startX, currentX);
    const minY = Math.min(startY, currentY);
    const width = Math.max(Math.abs(currentX - startX), 20);
    const height = Math.max(Math.abs(currentY - startY), 20);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const radius = Math.max(width, height) / 2;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    switch (shape) {
      case 'circle': {
        ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rectangle': {
        const r = Math.min(16, width / 4, height / 4);
        ctx.roundRect(minX, minY, width, height, r);
        ctx.fill();
        break;
      }
      case 'triangle': {
        ctx.moveTo(centerX, minY);
        ctx.lineTo(minX + width, minY + height);
        ctx.lineTo(minX, minY + height);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'star': {
        const spikes = 5;
        const outer = radius;
        const inner = radius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(centerX, centerY - outer);
        for (let i = 0; i < spikes; i++) {
          let x = centerX + Math.cos(rot) * outer;
          let y = centerY + Math.sin(rot) * outer;
          ctx.lineTo(x, y);
          rot += step;

          x = centerX + Math.cos(rot) * inner;
          y = centerY + Math.sin(rot) * inner;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(centerX, centerY - outer);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'heart': {
        const s = radius / 18;
        ctx.moveTo(centerX, centerY - 6 * s);
        ctx.bezierCurveTo(centerX + 12 * s, centerY - 20 * s, centerX + 26 * s, centerY + 2 * s, centerX, centerY + 22 * s);
        ctx.bezierCurveTo(centerX - 26 * s, centerY + 2 * s, centerX - 12 * s, centerY - 20 * s, centerX, centerY - 6 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'diamond': {
        ctx.moveTo(centerX, minY);
        ctx.lineTo(minX + width, centerY);
        ctx.lineTo(centerX, minY + height);
        ctx.lineTo(minX, centerY);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'flower': {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const angle = (i * 2 * Math.PI) / petals;
          const px = centerX + Math.cos(angle) * (radius * 0.55);
          const py = centerY + Math.sin(angle) * (radius * 0.55);
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = '#FEF08A';
        ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rocket': {
        // Cuerpo del cohete
        ctx.moveTo(centerX, minY);
        ctx.quadraticCurveTo(minX + width, centerY, centerX + width * 0.3, minY + height * 0.85);
        ctx.lineTo(centerX - width * 0.3, minY + height * 0.85);
        ctx.quadraticCurveTo(minX, centerY, centerX, minY);
        ctx.fill();

        // Fuego
        ctx.beginPath();
        ctx.fillStyle = '#F97316';
        ctx.moveTo(centerX - width * 0.2, minY + height * 0.85);
        ctx.lineTo(centerX, minY + height);
        ctx.lineTo(centerX + width * 0.2, minY + height * 0.85);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  };

  // --------------------------------------------------
  // GESTIÓN DE PUNTERO / DIBUJO FLUIDO
  // --------------------------------------------------
  const getCanvasPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsShapeMenuOpen(false);
    const pos = getCanvasPos(e);
    startPosRef.current = pos;
    lastPointRef.current = pos;
    isDrawingRef.current = true;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    if (toolMode === 'shape') {
      // Dibujar preview inicial en overlay
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        if (oCtx) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) oCtx.clearRect(0, 0, rect.width, rect.height);
          drawVectorShape(oCtx, selectedShape, pos.x, pos.y, pos.x + brushSize * 2, pos.y + brushSize * 2, selectedColor, brushSize);
        }
      }
      return;
    }

    // Dibujo normal o arcoíris
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playTap();
    sounds.vibrate(5);

    const drawColor =
      toolMode === 'eraser'
        ? '#FFFFFF'
        : toolMode === 'rainbow'
        ? `hsl(${rainbowHueRef.current}, 95%, 55%)`
        : selectedColor;

    const currentRadius = (toolMode === 'eraser' ? brushSize * 1.8 : brushSize) / 2;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = drawColor;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !startPosRef.current) return;
    const currentPos = getCanvasPos(e);

    // Modo Formas: Preview en Overlay Canvas
    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      const container = containerRef.current;
      if (!overlay || !container) return;
      const oCtx = overlay.getContext('2d');
      if (!oCtx) return;

      const rect = container.getBoundingClientRect();
      oCtx.clearRect(0, 0, rect.width, rect.height);
      drawVectorShape(
        oCtx,
        selectedShape,
        startPosRef.current.x,
        startPosRef.current.y,
        currentPos.x,
        currentPos.y,
        selectedColor,
        brushSize
      );
      return;
    }

    // Modo Trazo Normal / Arcoíris / Borrador
    const canvas = drawCanvasRef.current;
    if (!canvas || !lastPointRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 7) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? '#FFFFFF' : selectedColor;
    }

    ctx.lineWidth = toolMode === 'eraser' ? brushSize * 1.8 : brushSize;

    // Suavizado Bézier cuadrático
    const midX = (lastPointRef.current.x + currentPos.x) / 2;
    const midY = (lastPointRef.current.y + currentPos.y) / 2;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = currentPos;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const endPos = getCanvasPos(e);

    // Si es modo forma, consolidar la forma final en el canvas principal
    if (toolMode === 'shape' && startPosRef.current) {
      const canvas = drawCanvasRef.current;
      const overlay = overlayCanvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawVectorShape(
            ctx,
            selectedShape,
            startPosRef.current.x,
            startPosRef.current.y,
            endPos.x,
            endPos.y,
            selectedColor,
            brushSize
          );
        }
      }
      if (overlay && container) {
        const oCtx = overlay.getContext('2d');
        const rect = container.getBoundingClientRect();
        if (oCtx) oCtx.clearRect(0, 0, rect.width, rect.height);
      }
      sounds.playSuccess();
      sounds.vibrate(10);
    }

    startPosRef.current = null;
    lastPointRef.current = null;
    pushSnapshot();
  };

  // --------------------------------------------------
  // GUARDAR / DESCARGAR PNG
  // --------------------------------------------------
  const handleSave = () => {
    sounds.playSuccess();
    sounds.vibrate([15, 30, 15]);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `zentry-lienzo-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // DAR VIDA MÁGICA CON IA ZENTRY
  // --------------------------------------------------
  const handleAiGiveLife = async () => {
    if (!drawCanvasRef.current || isTransformingAi) return;
    sounds.playTap();
    setIsTransformingAi(true);

    try {
      const canvas = drawCanvasRef.current;
      const base64Img = canvas.toDataURL('image/png');

      const response = await askZentryAi(
        'free_canvas_life',
        'Analiza minuciosamente los trazos, formas, colores y composición espacial de este dibujo infantil y transfórmalo en una ilustración 3D Pixar de alta resolución fiel a los trazos.',
        base64Img
      );

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.trim().replace(/^```json/, '').replace(/```$/, ''));
      } catch {
        parsed = {
          title: 'Tu Obra Mágica',
          category: 'magic',
          strokesDescription: 'Trazos alegres llenos de color y luz',
          detectedSubject: 'Creación mágica',
          enhancedPrompt: '3D cute Pixar style character in a glowing wonderland, magical lighting, colorful, 8k resolution',
          speechFeedback: '¡Mira cómo brilla y cobra vida tu dibujo!'
        };
      }

      const encodedPrompt = encodeURIComponent(`${parsed.enhancedPrompt}, 3D pixar style, masterpiece, cute, vibrant, 8k resolution, ray tracing`);
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

      // Preload image
      const img = new Image();
      img.src = generatedUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      sounds.playSuccess();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });

      const resultData: AiLifeResult = {
        title: parsed.title || 'Tu Creación',
        category: parsed.category || 'magic',
        strokesDescription: parsed.strokesDescription,
        detectedSubject: parsed.detectedSubject || 'Obra Mágica',
        compositionMapping: parsed.compositionMapping,
        enhancedImageUrl: generatedUrl,
        speechFeedback: parsed.speechFeedback || '¡Tu dibujo ha cobrado vida mágica!'
      };

      setAiResult(resultData);
      voiceService.speakFeedback(resultData.speechFeedback);
    } catch (err) {
      console.warn('Free canvas AI life error:', err);
      const fallbackResult: AiLifeResult = {
        title: 'Tu Dibujo Mágico',
        category: 'magic',
        strokesDescription: 'Trazos mágicos de colores brillantes',
        detectedSubject: 'Amigo Mágico',
        enhancedImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        speechFeedback: '¡Tu dibujo se llenó de colores y magia!'
      };
      setAiResult(fallbackResult);
      voiceService.speakFeedback(fallbackResult.speechFeedback);
    } finally {
      setIsTransformingAi(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'landscape':
        return { label: '🏞️ Paisaje', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'character':
        return { label: '🦸 Personaje', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'object':
        return { label: '🚀 Objeto', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: '✨ Magia', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full flex flex-col justify-between overflow-hidden gap-2 select-none relative">
        {/* ========================================================= */}
        {/* BARRA SUPERIOR: PINCELES, 4 TAMAÑOS VISIBLES, FORMAS Y GOMA */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/25 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[30px] border border-white/40 dark:border-white/15 shadow-xl">
          
          {/* GRUPO 1: PINCELES Y FORMAS */}
          <div className="flex items-center gap-1.5">
            {/* Pincel Normal */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setToolMode('brush');
                setIsShapeMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'brush'
                  ? 'bg-pink-500 text-white scale-108 shadow-lg border-white ring-2 ring-pink-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
              }`}
              title="Pincel"
            >
              <Paintbrush className="w-5 h-5" />
            </button>

            {/* Pincel Arcoíris */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setToolMode('rainbow');
                setIsShapeMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] text-xl border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'rainbow'
                  ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white scale-108 shadow-lg border-white ring-2 ring-yellow-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
              }`}
              title="Pincel Arcoíris"
            >
              🌈
            </button>

            {/* Herramienta de Formas Geométricas */}
            <div className="relative">
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('shape');
                  setIsShapeMenuOpen((prev) => !prev);
                }}
                className={`p-2.5 rounded-[20px] border-2 flex items-center justify-center gap-1 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'shape'
                    ? 'bg-amber-400 text-slate-950 scale-108 shadow-lg border-white ring-2 ring-amber-300 font-black'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Formas Geométricas"
              >
                <span className="text-xl">
                  {GEOMETRIC_SHAPES.find((s) => s.id === selectedShape)?.icon || '🔷'}
                </span>
              </button>

              {/* Menú Desplegable de 8 Formas */}
              {isShapeMenuOpen && (
                <div className="absolute top-14 left-0 bg-[#120E24]/95 border-2 border-amber-400/60 p-2.5 rounded-[26px] shadow-2xl backdrop-blur-2xl grid grid-cols-4 gap-2 z-50 animate-spring-unfold min-w-[200px]">
                  {GEOMETRIC_SHAPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        sounds.playTap();
                        sounds.vibrate(6);
                        setSelectedShape(s.id);
                        setToolMode('shape');
                        setIsShapeMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedShape === s.id && toolMode === 'shape'
                          ? 'bg-amber-400 text-slate-950 scale-110 shadow-md font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title={s.label}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-[9px] font-bold mt-0.5">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GRUPO 2: 4 CIRCULITOS VISIBLES DE TAMAÑO DE PINCEL */}
          <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-2.5 py-1.5 rounded-[22px] border border-white/20">
            {BRUSH_SIZES.map((b) => {
              const isSelected = brushSize === b.size;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    sounds.playTap();
                    sounds.vibrate(6);
                    setBrushSize(b.size);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer zentry-spring-press ${
                    isSelected
                      ? 'bg-indigo-600 border-2 border-white ring-2 ring-indigo-300 shadow-md scale-115'
                      : 'bg-white/60 dark:bg-white/20 hover:bg-white/80'
                  }`}
                  title={`Tamaño: ${b.label} (${b.size}px)`}
                >
                  <span
                    style={{
                      width: `${b.dotSize}px`,
                      height: `${b.dotSize}px`
                    }}
                    className={`rounded-full block transition-colors ${
                      isSelected ? 'bg-white' : 'bg-slate-700 dark:bg-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* GRUPO 3: GOMA DE BORRAR, DESHACER Y LIMPIAR */}
          <div className="flex items-center gap-1.5">
            {/* Goma de Borrar */}
            <button
              onClick={() => {
                sounds.playTap();
                sounds.vibrate(6);
                setToolMode('eraser');
                setIsShapeMenuOpen(false);
              }}
              className={`p-2.5 rounded-[20px] border-2 transition-all cursor-pointer zentry-spring-press ${
                toolMode === 'eraser'
                  ? 'bg-purple-600 text-white scale-108 shadow-lg border-white ring-2 ring-purple-300'
                  : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
              }`}
              title="Goma de Borrar"
            >
              <Eraser className="w-5 h-5" />
            </button>

            {/* Deshacer */}
            <button
              onClick={handleUndo}
              className="p-2.5 rounded-[20px] bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white active:scale-90 cursor-pointer zentry-spring-press border border-transparent hover:border-white/30"
              title="Deshacer"
            >
              <Undo2 className="w-5 h-5" />
            </button>

            {/* Limpiar */}
            <button
              onClick={handleClear}
              className="p-2.5 rounded-[20px] bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white active:scale-90 cursor-pointer zentry-spring-press border border-transparent hover:border-white/30"
              title="Limpiar Lienzo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ÁREA DE DIBUJO DUAL (DRAW CANVAS + PREVIEW OVERLAY)       */}
        {/* ========================================================= */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-1 w-full relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/80 touch-none bg-white cursor-crosshair"
        >
          {/* Canvas Principal */}
          <canvas ref={drawCanvasRef} className="w-full h-full block absolute inset-0 z-10" />

          {/* Canvas Overlay de Previsualización */}
          <canvas ref={overlayCanvasRef} className="w-full h-full block absolute inset-0 z-20 pointer-events-none" />
        </div>

        {/* ========================================================= */}
        {/* BARRA INFERIOR: PALETA DE COLORES, ROMBO IA Y GUARDAR    */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/25 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[30px] border border-white/40 dark:border-white/15 shadow-xl">
          {/* Paleta de Colores */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(5);
                  setSelectedColor(c);
                  if (toolMode === 'eraser') setToolMode('brush');
                }}
                style={{ backgroundColor: c }}
                className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 transition-transform cursor-pointer ${
                  selectedColor === c && toolMode !== 'eraser'
                    ? 'scale-120 border-white ring-4 ring-pink-400 shadow-xl'
                    : 'border-white/80 dark:border-white/40'
                }`}
              />
            ))}
          </div>

          {/* Botonera de Acción: Rombo IA Zentry + Guardar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* BOTÓN INTELIGENCIA ARTIFICIAL (ROMBO ZENTRY) */}
            <button
              onClick={handleAiGiveLife}
              disabled={isTransformingAi}
              className="w-13 h-13 md:w-15 md:h-15 rounded-[22px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press relative group disabled:opacity-50"
              title="¡Dar Vida Mágica con Zentry AI!"
            >
              {isTransformingAi ? (
                <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
              ) : (
                <>
                  <ZentryLogoIcon className="w-7 h-7 group-hover:scale-115 transition-transform" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-1 -right-1 animate-ping" />
                </>
              )}
            </button>

            {/* BOTÓN GUARDAR / DESCARGAR PNG */}
            <button
              onClick={handleSave}
              className="w-13 h-13 md:w-15 md:h-15 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center text-2xl shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press"
              title="Guardar Dibujo"
            >
              💾
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: DIBUJO CON VIDA MÁGICA AI                          */}
        {/* ========================================================= */}
        {aiResult && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
            onClick={() => setAiResult(null)}
          >
            <div
              className="relative max-w-sm w-full rounded-[36px] p-4 bg-[#120E24]/95 border border-purple-400/60 shadow-2xl flex flex-col items-center gap-2.5 animate-spring-in text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con Título y Badge de Categoría */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ZentryLogoIcon className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm font-black text-white truncate">{aiResult.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => {
                    const badge = getCategoryBadge(aiResult.category);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <button
                    onClick={() => setAiResult(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced 3D Pixar Image */}
              <div className="relative w-full aspect-square rounded-[26px] overflow-hidden border-2 border-purple-400/40 shadow-inner bg-black">
                <img
                  src={aiResult.enhancedImageUrl}
                  alt={aiResult.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Trazos e Interpretación */}
              {aiResult.strokesDescription && (
                <div className="text-[11px] text-purple-200 font-bold px-2 line-clamp-2">
                  🎨 {aiResult.strokesDescription}
                </div>
              )}

              {/* Voice Feedback Text */}
              <p className="text-xs font-bold text-white leading-relaxed px-1">
                {aiResult.speechFeedback}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={() => {
                    sounds.playTap();
                    voiceService.speakFeedback(aiResult.speechFeedback);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer zentry-spring-press border border-white/20"
                >
                  <Volume2 className="w-4 h-4 text-purple-300" />
                  <span>Escuchar</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    confetti({ particleCount: 90, spread: 80 });
                    setAiResult(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer zentry-spring-press shadow-lg"
                >
                  <span>¡Me Encanta! ⭐</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};

export default ZentryFreeCanvasScreen;
