import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2,
  Trash2,
  Volume2,
  Eraser,
  RefreshCw,
  Paintbrush,
  X,
  Sparkles,
  Check,
  Shapes,
  Circle,
  Square,
  Star,
  Triangle,
  Heart,
  Diamond,
  Flower2,
  Rocket,
  Download,
  Palette,
  Mountain,
  User,
  Box,
  CheckCircle2,
  LucideIcon
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

export type ShapeType =
  | 'circle'
  | 'rectangle'
  | 'star'
  | 'triangle'
  | 'heart'
  | 'diamond'
  | 'flower'
  | 'rocket';

const GEOMETRIC_SHAPES: Array<{ id: ShapeType; label: string; Icon: LucideIcon }> = [
  { id: 'circle', label: 'Círculo', Icon: Circle },
  { id: 'rectangle', label: 'Rectángulo', Icon: Square },
  { id: 'star', label: 'Estrella', Icon: Star },
  { id: 'triangle', label: 'Triángulo', Icon: Triangle },
  { id: 'heart', label: 'Corazón', Icon: Heart },
  { id: 'diamond', label: 'Rombo', Icon: Diamond },
  { id: 'flower', label: 'Flor', Icon: Flower2 },
  { id: 'rocket', label: 'Cohete', Icon: Rocket }
];

const BRUSH_SIZES = [
  { id: 'fine', size: 6, dotSize: 8, label: 'Fino' },
  { id: 'medium', size: 14, dotSize: 14, label: 'Medio' },
  { id: 'thick', size: 26, dotSize: 22, label: 'Grueso' },
  { id: 'jumbo', size: 44, dotSize: 30, label: 'Jumbo' }
];

const COLOR_PALETTE = [
  { id: 'pink', color: '#EC4899' },
  { id: 'purple', color: '#A855F7' },
  { id: 'indigo', color: '#6366F1' },
  { id: 'blue', color: '#3B82F6' },
  { id: 'cyan', color: '#06B6D4' },
  { id: 'green', color: '#10B981' },
  { id: 'yellow', color: '#EAB308' },
  { id: 'orange', color: '#F97316' },
  { id: 'red', color: '#EF4444' },
  { id: 'white', color: '#FFFFFF' },
  { id: 'black', color: '#1E293B' }
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
  // Referencias Canvas y Contenedor
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados de Herramientas
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [selectedColor, setSelectedColor] = useState<string>('#EC4899');
  const [brushSize, setBrushSize] = useState<number>(14);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');

  // Puntos de trazo para suavizado Bézier continuo
  const isDrawingRef = useRef(false);
  const strokePointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const rainbowHueRef = useRef(0);

  // Historial Deshacer (snapshots ImageData)
  const [history, setHistory] = useState<ImageData[]>([]);

  // Estado IA Mágica
  const [isTransformingAi, setIsTransformingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiLifeResult | null>(null);

  // --------------------------------------------------
  // INICIALIZACIÓN Y CONFIGURACIÓN HIGH-DPI DE CANVAS
  // --------------------------------------------------
  const initCanvases = useCallback(() => {
    const container = containerRef.current;
    const drawCanvas = drawCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !drawCanvas || !overlayCanvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const prevCtx = drawCanvas.getContext('2d');
    let prevData: ImageData | null = null;
    if (prevCtx && drawCanvas.width > 0 && drawCanvas.height > 0) {
      try {
        prevData = prevCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
      } catch {}
    }

    drawCanvas.width = Math.round(rect.width * dpr);
    drawCanvas.height = Math.round(rect.height * dpr);
    overlayCanvas.width = Math.round(rect.width * dpr);
    overlayCanvas.height = Math.round(rect.height * dpr);

    const drawCtx = drawCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (drawCtx) {
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';

      if (prevData) {
        drawCtx.putImageData(prevData, 0, 0);
      } else {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        const initialSnap = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
        setHistory([initialSnap]);
      }
    }

    if (overlayCtx) {
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushSnapshot();
  };

  // --------------------------------------------------
  // CONVERSIÓN DE COORDENADAS HIGH-DPI
  // --------------------------------------------------
  const getCanvasPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = drawCanvasRef.current;
    if (!container || !canvas) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
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
    strokeWidthScaled: number
  ) => {
    const minX = Math.min(startX, currentX);
    const minY = Math.min(startY, currentY);
    const width = Math.max(Math.abs(currentX - startX), 24);
    const height = Math.max(Math.abs(currentY - startY), 24);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const radius = Math.max(width, height) / 2;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidthScaled;
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
        const r = Math.min(20, width / 4, height / 4);
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
        ctx.bezierCurveTo(
          centerX + 12 * s,
          centerY - 20 * s,
          centerX + 26 * s,
          centerY + 2 * s,
          centerX,
          centerY + 22 * s
        );
        ctx.bezierCurveTo(
          centerX - 26 * s,
          centerY + 2 * s,
          centerX - 12 * s,
          centerY - 20 * s,
          centerX,
          centerY - 6 * s
        );
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
        ctx.moveTo(centerX, minY);
        ctx.quadraticCurveTo(
          minX + width,
          centerY,
          centerX + width * 0.3,
          minY + height * 0.85
        );
        ctx.lineTo(centerX - width * 0.3, minY + height * 0.85);
        ctx.quadraticCurveTo(minX, centerY, centerX, minY);
        ctx.fill();

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
  // GESTIÓN DE PUNTERO: TRAZO ULTRA-SUAVE BÉZIER
  // --------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getCanvasPos(e);
    isDrawingRef.current = true;
    strokePointsRef.current = [pos];

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        if (oCtx) {
          oCtx.clearRect(0, 0, overlay.width, overlay.height);
          drawVectorShape(
            oCtx,
            selectedShape,
            pos.x,
            pos.y,
            pos.x + 80 * dpr,
            pos.y + 80 * dpr,
            selectedColor,
            strokeWidthScaled
          );
        }
      }
      return;
    }

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

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidthScaled / 2, 0, Math.PI * 2);
    ctx.fillStyle = drawColor;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || strokePointsRef.current.length === 0) return;
    const currentPos = getCanvasPos(e);
    const startPos = strokePointsRef.current[0];
    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape') {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const oCtx = overlay.getContext('2d');
      if (!oCtx) return;

      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      drawVectorShape(
        oCtx,
        selectedShape,
        startPos.x,
        startPos.y,
        currentPos.x,
        currentPos.y,
        selectedColor,
        strokeWidthScaled
      );
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    strokePointsRef.current.push(currentPos);
    const pts = strokePointsRef.current;

    if (toolMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? '#FFFFFF' : selectedColor;
    }

    ctx.lineWidth = strokeWidthScaled;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else if (pts.length > 2) {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const prevP = pts[pts.length - 3] || p1;

      const mid1X = (prevP.x + p1.x) / 2;
      const mid1Y = (prevP.y + p1.y) / 2;
      const mid2X = (p1.x + p2.x) / 2;
      const mid2Y = (p1.y + p2.y) / 2;

      ctx.beginPath();
      ctx.moveTo(mid1X, mid1Y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const endPos = getCanvasPos(e);
    const startPos = strokePointsRef.current[0];
    const dpr = window.devicePixelRatio || 1;
    const strokeWidthScaled = (toolMode === 'eraser' ? brushSize * 2 : brushSize) * dpr;

    if (toolMode === 'shape' && startPos) {
      const canvas = drawCanvasRef.current;
      const overlay = overlayCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawVectorShape(
            ctx,
            selectedShape,
            startPos.x,
            startPos.y,
            endPos.x,
            endPos.y,
            selectedColor,
            strokeWidthScaled
          );
        }
      }
      if (overlay) {
        const oCtx = overlay.getContext('2d');
        if (oCtx) oCtx.clearRect(0, 0, overlay.width, overlay.height);
      }
      sounds.playSuccess();
      sounds.vibrate(10);
    }

    strokePointsRef.current = [];
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

      const encodedPrompt = encodeURIComponent(
        `${parsed.enhancedPrompt}, 3D pixar style, masterpiece, cute, vibrant, 8k resolution, ray tracing`
      );
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

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
        return {
          label: 'Paisaje',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          Icon: Mountain
        };
      case 'character':
        return {
          label: 'Personaje',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          Icon: User
        };
      case 'object':
        return {
          label: 'Objeto',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          Icon: Box
        };
      default:
        return {
          label: 'Magia',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          Icon: Sparkles
        };
    }
  };

  const ActiveShapeIcon = GEOMETRIC_SHAPES.find((s) => s.id === selectedShape)?.Icon || Shapes;

  return (
    <ZentrySubPageScaffold title="" kicker="" onBack={onBack} isDark={isDark}>
      <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-between overflow-hidden gap-2 select-none relative">
        
        {/* ========================================================= */}
        {/* 1. BARRA SUPERIOR INTEGRADA: HERRAMIENTAS Y ACCIONES      */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-2 p-2 bg-white/30 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[28px] border border-white/40 dark:border-white/15 shadow-xl">
          
          {/* Fila 1: Modos de Herramientas y Acciones (100% SVG Icons) */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            {/* GRUPO MODOS: Pincel, Arcoíris, Formas, Goma */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Pincel Normal */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('brush');
                }}
                className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-black border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'brush'
                    ? 'bg-pink-500 text-white scale-105 shadow-md border-white ring-2 ring-pink-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Pincel"
              >
                <Paintbrush className="w-4 h-4" />
                <span className="hidden sm:inline">Pincel</span>
              </button>

              {/* Pincel Arcoíris (SVG Palette / Sparkles) */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('rainbow');
                }}
                className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-black border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'rainbow'
                    ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-slate-950 scale-105 shadow-md border-white ring-2 ring-yellow-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Pincel Arcoíris"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Arcoíris</span>
              </button>

              {/* Formas Geométricas (SVG Shapes) */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('shape');
                }}
                className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-black border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'shape'
                    ? 'bg-amber-400 text-slate-950 scale-105 shadow-md border-white ring-2 ring-amber-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Formas Geométricas"
              >
                <ActiveShapeIcon className="w-4 h-4" />
                <span>Formas</span>
              </button>

              {/* Goma de Borrar */}
              <button
                onClick={() => {
                  sounds.playTap();
                  sounds.vibrate(6);
                  setToolMode('eraser');
                }}
                className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-black border-2 transition-all cursor-pointer zentry-spring-press ${
                  toolMode === 'eraser'
                    ? 'bg-purple-600 text-white scale-105 shadow-md border-white ring-2 ring-purple-300'
                    : 'bg-white/80 dark:bg-white/10 border-transparent text-slate-700 dark:text-white'
                }`}
                title="Borrador"
              >
                <Eraser className="w-4 h-4" />
                <span className="hidden sm:inline">Borrar</span>
              </button>
            </div>

            {/* ACCIONES: Deshacer y Limpiar (SVG) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleUndo}
                className="p-2 rounded-2xl bg-white/80 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-white active:scale-90 cursor-pointer zentry-spring-press border border-transparent shadow-sm"
                title="Deshacer"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleClear}
                className="p-2 rounded-2xl bg-white/80 dark:bg-white/10 text-rose-500 hover:bg-rose-50 active:scale-90 cursor-pointer zentry-spring-press border border-transparent shadow-sm"
                title="Limpiar Lienzo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fila 2 Contextual: DOCK DE FORMAS SVG O SELECTOR DE TAMAÑOS */}
          <div className="w-full pt-1 border-t border-white/15 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {toolMode === 'shape' ? (
              /* DOCK DE 8 FORMAS GEOMÉTRICAS CON ICONOS SVG ESTÁNDAR */
              <div className="flex items-center gap-1.5 w-full justify-around sm:justify-start">
                <span className="text-[10px] font-black uppercase text-amber-500 dark:text-amber-300 tracking-wider shrink-0 mr-1">
                  Elegir Forma:
                </span>
                {GEOMETRIC_SHAPES.map((s) => {
                  const isSelected = selectedShape === s.id;
                  const ShapeIcon = s.Icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        sounds.playTap();
                        sounds.vibrate(6);
                        setSelectedShape(s.id);
                      }}
                      className={`py-1.5 px-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 zentry-spring-press ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 scale-108 shadow-md font-black ring-2 ring-white'
                          : 'bg-white/40 dark:bg-white/10 hover:bg-white/70 text-slate-800 dark:text-slate-200'
                      }`}
                      title={s.label}
                    >
                      <ShapeIcon className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-[11px] font-bold hidden md:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* SELECTOR DE 4 TAMAÑOS DE PINCEL CIRCULARES */
              <div className="flex items-center gap-3 w-full justify-center sm:justify-start">
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-300 tracking-wider shrink-0 mr-1">
                  Grosor:
                </span>
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
                          ? 'bg-indigo-600 border-2 border-white ring-2 ring-indigo-400 shadow-lg scale-115'
                          : 'bg-white/60 dark:bg-white/15 hover:bg-white/90'
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
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ÁREA DE DIBUJO DUAL FLUIDA Y TOTALMENTE RESPONSIVE     */}
        {/* ========================================================= */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-1 min-h-[300px] w-full relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/80 dark:border-slate-800 touch-none bg-white cursor-crosshair"
        >
          {/* Canvas Principal */}
          <canvas ref={drawCanvasRef} className="w-full h-full block absolute inset-0 z-10" />

          {/* Canvas Overlay de Previsualización */}
          <canvas
            ref={overlayCanvasRef}
            className="w-full h-full block absolute inset-0 z-20 pointer-events-none"
          />
        </div>

        {/* ========================================================= */}
        {/* 3. BARRA INFERIOR: PALETA ESPACIOSA, ROMBO IA Y GUARDAR   */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-white/30 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[28px] border border-white/40 dark:border-white/15 shadow-xl">
          {/* Paleta de Colores con espaciado amplio y sin compresión */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {COLOR_PALETTE.map((c) => {
              const isSelected = selectedColor === c.color && toolMode !== 'eraser';
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    sounds.playTap();
                    sounds.vibrate(5);
                    setSelectedColor(c.color);
                    if (toolMode === 'eraser') setToolMode('brush');
                  }}
                  style={{ backgroundColor: c.color }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 border-2 transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'scale-118 border-white ring-4 ring-pink-500 shadow-xl'
                      : 'border-white/80 dark:border-white/40 hover:scale-105'
                  }`}
                  title={`Color ${c.id}`}
                >
                  {isSelected && (
                    <Check
                      className={`w-4 h-4 ${
                        c.color === '#FFFFFF' || c.color === '#EAB308'
                          ? 'text-slate-900'
                          : 'text-white'
                      } stroke-[3]`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Acciones Principales: Rombo IA Zentry + Guardar SVG */}
          <div className="flex items-center gap-2 shrink-0 pl-1 border-l border-white/20">
            {/* BOTÓN INTELIGENCIA ARTIFICIAL (ROMBO ZENTRY) */}
            <button
              onClick={handleAiGiveLife}
              disabled={isTransformingAi}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press relative group disabled:opacity-50"
              title="¡Dar Vida Mágica con Zentry AI!"
            >
              {isTransformingAi ? (
                <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
              ) : (
                <>
                  <ZentryLogoIcon className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-112 transition-transform" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute -top-1 -right-1 animate-ping" />
                </>
              )}
            </button>

            {/* BOTÓN GUARDAR / DESCARGAR PNG CON ICONO SVG */}
            <button
              onClick={handleSave}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-90 cursor-pointer zentry-spring-press"
              title="Guardar Dibujo"
            >
              <Download className="w-6 h-6 text-white stroke-[2.5]" />
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
              {/* Header con Título y Badge de Categoría con Icono SVG */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ZentryLogoIcon className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm font-black text-white truncate">{aiResult.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => {
                    const badge = getCategoryBadge(aiResult.category);
                    const BadgeIcon = badge.Icon;
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
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
                <div className="text-[11px] text-purple-200 font-bold px-2 line-clamp-2 flex items-center justify-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>{aiResult.strokesDescription}</span>
                </div>
              )}

              {/* Voice Feedback Text */}
              <p className="text-xs font-bold text-white leading-relaxed px-1">
                {aiResult.speechFeedback}
              </p>

              {/* Actions con Iconos SVG */}
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
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>¡Me Encanta!</span>
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
